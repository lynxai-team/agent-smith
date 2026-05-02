import * as fs from 'fs';
import * as path from 'path';
import type { TaskDef } from '@agent-smith/types';

function _replaceFilePlaceholders(text: string, baseDir: string = ""): string {
    const fileRegex = /\{file:(.*?)\}/g;
    // The replace function is called for each match
    const resultText = text.replace(fileRegex, (match, filePath) => {
        if (!baseDir) {
            if (!path.isAbsolute(filePath)) {
                throw new Error(`Can not replace relative file placeholder ${filePath} without a baseDir set. Use absolute paths or set a baseDir in options`)
            }
        }

        // Resolve the absolute path relative to the baseDir (or current working directory)
        const fullPath = path.resolve(baseDir, filePath);
        try {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            return fileContent;
        } catch (error) {
            const msg = `Error reading file placeholder at ${fullPath}: ${error}`;
            throw new Error(msg)
        }
    });
    return resultText;
}

function applyFilePlaceholders(def: TaskDef, baseDir?: string): TaskDef {
    def.prompt = _replaceFilePlaceholders(def.prompt, baseDir);
    if (def.template) {
        if (def.template?.system) {
            def.template.system = _replaceFilePlaceholders(def.template.system, baseDir)
        }
        if (def.template?.afterSystem) {
            def.template.afterSystem = _replaceFilePlaceholders(def.template.afterSystem, baseDir)
        }
    }
    return def
}

export { applyFilePlaceholders }