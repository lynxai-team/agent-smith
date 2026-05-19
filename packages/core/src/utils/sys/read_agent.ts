import { default as fs } from "fs";
import { default as path } from "path";

function readAgent(taskpath: string): { found: boolean, ymlAgent: string } {
    if (!fs.existsSync(taskpath)) {
        return { ymlAgent: "", found: false }
    }
    const data = fs.readFileSync(taskpath, 'utf8');
    return { ymlAgent: data, found: true }
}

function readAgentsDir(dir: string): Array<string> {
    const tasks = new Array<string>();
    fs.readdirSync(dir).forEach((filename) => {
        const filepath = path.join(dir, filename);
        const isDir = fs.statSync(filepath).isDirectory();
        if (!isDir) {
            if (filename.endsWith(".yml")) {
                tasks.push(filename)
            }
        }
    });
    return tasks
}

export {
    readAgent,
    readAgentsDir,
}