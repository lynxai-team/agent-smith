import type { AgentVariables } from "./agent.js";


interface FeatureSpec {
    id?: number;
    name: string;
    path: string;
    ext: FeatureExtension;
    variables?: AgentVariables | Record<string, any>;
    type?: string;
    category?: string;
}

interface Features {
    agent: Array<{ name: string, path: string, ext: AgentExtension }>;
    cmd: Array<{
        name: string, path: string, ext: CmdExtension,
        variables?: { name: string, options?: Array<Array<string> | string>, description: string }
    }>;
    action: Array<{ name: string, path: string, ext: ActionExtension }>;
    workflow: Array<{ name: string, path: string, ext: WorkflowExtension }>;
    adaptater: Array<{ name: string, path: string, ext: AdaptaterExtension }>;
    skill: Array<{ name: string, path: string, ext: SkillExtension, variables?: Record<string, any> }>;
}

interface UserCmdDef {
    name: string;
    description: string;
    run: (args: any, options: Record<string, any>) => Promise<any>;
    options?: Array<Array<string> | string>;
}

interface Settings {
    name: string;
    inputmode: InputMode;
    outputmode: OutputMode;
    runmode: RunMode;
    formatmode: FormatMode;
    ischatMode: boolean;
    isdebug: boolean;
    isverbose: boolean;
    promptfile: string;
}

interface DbModelDef {
    id?: number;
    name: string;
    shortname: string;
    data: Record<string, any>;
}

interface WorkflowStep {
    name: string;
    type: string;
}

interface McpServerSpec {
    command: string;
    arguments: string[];
    tools: string[];
}

interface McpServerTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, { type: string; description: string }>;
        required: string[];
    };
}

type InputMode = "manual" | "promptfile" | "clipboard";
type OutputMode = "txt" | "clipboard";
type RunMode = "cli" | "cmd";
type FormatMode = "text" | "markdown";

type FeatureType = "agent" | "action" | "cmd" | "workflow" | "adaptater" | "skill";
type ToolType = "agent" | "action" | "cmd" | "workflow";
type ActionExtension = "js" | "mjs" | "py" | "yml";
type AgentExtension = "yml";
type AdaptaterExtension = "js";
type WorkflowExtension = "yml";
type CmdExtension = "js";
type SkillExtension = "md";
type FeatureExtension = AgentExtension | AgentExtension | CmdExtension | ActionExtension | WorkflowExtension | SkillExtension;
type AliasType = "agent" | "action" | "workflow";

type FeatureExecutor<I = any, O = any> = (params: I, options: Record<string, any>) => Promise<O>;

export {
    ActionExtension, AdaptaterExtension, AliasType, CmdExtension, DbModelDef, FeatureExecutor, FeatureExtension, Features, FeatureSpec, FeatureType, FormatMode, InputMode, McpServerSpec,
    McpServerTool, OutputMode,
    RunMode, Settings, SkillExtension, AgentExtension, ToolType, UserCmdDef, WorkflowExtension, WorkflowStep
};
