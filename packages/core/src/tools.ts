import YAML from 'yaml';
import * as fs from 'fs';
import type { ToolSpec, FeatureExtension, AgentVariableDef, AgentOptionalVariableDef } from '@agent-smith/types';
import { readYmlFile } from './utils/sys/read_yml_file.js';


function _extractToolDoc(filePath: string, startComment: string, endComment: string): { found: boolean, doc: string } {
    try {
        //console.log("TD", filePath);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const startMarker = startComment + '\n# tool';
        //console.log("TD 2", fileContent.startsWith(startMarker));
        if (!fileContent.startsWith(startMarker)) {
            //console.log("TD ERR", fileContent)
            return { found: false, doc: "" };
        }
        const endMarker = endComment;
        const startIndex = fileContent.indexOf(startMarker) + startMarker.length;
        const endIndex = fileContent.indexOf(endMarker, startIndex);
        if (endIndex === -1) {
            throw new Error(`Markers not found in the file: ${filePath}`);
        }
        const extractedContent = fileContent.substring(startIndex, endIndex).trim();
        //console.log("TD 3", fileContent.substring(startIndex, endIndex).trim());
        //console.log("TD 4", extractedContent);
        return { found: true, doc: extractedContent };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('ENOENT')) {
                throw new Error(`File not found: ${filePath}`);
            } else {
                throw new Error(`Error processing the file: ${filePath}. ${error.message}`);
            }
        } else {
            throw new Error(`An unexpected error occurred: ${error}`);
        }
    }
}

function _extractPyToolDoc(filePath: string): { found: boolean, doc: string } {
    return _extractToolDoc(filePath, '"""', '"""')
}

function _extractJsToolDoc(filePath: string): { found: boolean, doc: string } {
    return _extractToolDoc(filePath, '/*', '*/')
}

function _extractYamlToolDoc(filePath: string, name: string): { found: boolean, tspec: ToolSpec } {
    const { data, found } = readYmlFile(filePath);
    //console.log("_extractYamlToolDoc from", name, data?.tool);
    if (!found) {
        return { found: false, tspec: {} as ToolSpec }
    }
    if (!data?.tool) {
        return { found: false, tspec: {} as ToolSpec }
    }
    data.tool.name = name;
    return { found: true, tspec: data.tool as ToolSpec }
}

function _parseToolDoc(rawTxt: string, name: string): ToolSpec {
    try {
        const res = YAML.parse(rawTxt) as Record<string, any>;
        res["name"] = name;
        //console.log("PARSE TOOL DOC", res);
        return res as ToolSpec
    } catch (e) {
        throw new Error(`Error parsing tool ${name}: ${e} \nData:\n${rawTxt}\n`)
    }
}

function _parseAgentVariables(data: Record<string, any>): {
    required: Record<string, AgentVariableDef>, optional: Record<string, AgentOptionalVariableDef>
} {
    const res: {
        required: Record<string, AgentVariableDef>, optional: Record<string, AgentOptionalVariableDef>
    } = { required: {}, optional: {} };
    if (data?.variables) {
        if (data.variables?.required) {
            res.required = data.variables.required
        }
        if (data.variables?.optional) {
            res.optional = data.variables.optional
        }
    }
    return res
}

function extractAgentToolDocAndVariables(
    name: string, ext: FeatureExtension, dirPath: string
): {
    toolDoc: string,
    variables: {
        required: Record<string, AgentVariableDef>,
        optional: Record<string, AgentOptionalVariableDef>
    },
    type: string | null,
    category: string | null
} {
    const fp = dirPath + "/" + name + "." + ext;
    const { data, found } = readYmlFile(fp);
    const res: {
        toolDoc: string,
        variables: {
            required: Record<string, AgentVariableDef>,
            optional: Record<string, AgentOptionalVariableDef>
        },
        type: string | null,
        category: string | null
    } = { variables: { required: {}, optional: {} }, toolDoc: "", type: null, category: null };
    // tools
    let tspec: ToolSpec;
    if (!found) {
        throw new Error(`extractAgentToolDocAndVariables: file ${fp} not found`)
    }
    if (data?.tool) {
        data.tool.name = name;
        tspec = data.tool as ToolSpec;
        res.toolDoc = JSON.stringify(tspec, null, "  ");
    }
    // variables
    const { required, optional } = _parseAgentVariables(data);
    res.variables.required = required;
    res.variables.optional = optional;
    // type
    if (data?.type) {
        res.type = data.type
    }
    // category
    if (data?.category) {
        res.category = data.category
    }
    return res
}

function extractToolDoc(name: string, ext: FeatureExtension, dirPath: string): { found: boolean, toolDoc: string } {
    let spec: string;
    let found = false;
    let doc: string = "";
    let docts: ToolSpec | null = null
    switch (ext) {
        case "py":
            let res = _extractPyToolDoc(dirPath + "/" + name + "." + ext);
            found = res.found;
            doc = res.doc;
            break;
        case "js":
            let res2 = _extractJsToolDoc(dirPath + "/" + name + "." + ext);
            found = res2.found;
            doc = res2.doc;
            break;
        case "yml":
            let res3 = _extractYamlToolDoc(dirPath + "/" + name + "." + ext, name);
            found = res3.found;
            docts = res3.tspec;
            break;
        default:
            return { found: false, toolDoc: "" }
        //throw new Error(`Unknown tool doc feature type`)        
    }
    if (found) {
        let ts: ToolSpec;
        if (docts) {
            ts = docts
        } else {
            ts = _parseToolDoc(doc, name);
        }
        spec = JSON.stringify(ts, null, "  ");
        //console.log("PARSE TOOL", name, spec);
    } else {
        return { found: false, toolDoc: "" }
    }
    return { found: true, toolDoc: spec }
}

export {
    extractToolDoc,
    extractAgentToolDocAndVariables,
}