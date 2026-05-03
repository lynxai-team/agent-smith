import { spawn } from "child_process";
import { platform } from "os";

async function execute(
    command: string,
    args: Array<string> = [],
    {
        onStdout = (data: any): void => { },
        onStderr = (data: any): void => { },
        onError = (data: any): void => { },
        stream = false,
    } = {
            onStderr: (data) => console.log("stderr:", data),
            onError: (err) => { if (err) throw err },
        },
): Promise<string> {
    let buffer = new Array<string>();
    //console.log("Cmd args:", args)
    const useShell = platform() === 'win32';
    const child = spawn(command, args, { shell: useShell });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data: any) => {
        buffer.push(data);
        onStdout(data)
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data: any) => onStderr(data));
    child.on("error", (data: any) => onError(data));
    let finish: (value: unknown) => void;
    let end = new Promise((r) => finish = r);
    child.on('close', () => finish(true));
    await end
    if (!stream) {
        return buffer.join("\n")
    } else {
        return buffer.join("")
    }
}

function runShellCmd(
    command: string,
    args: Array<string> = [],
    {
        onStdout = (data: any): void => { },
        onStderr = (data: any): void => { },
        onError = (data: any): void => { },
        onFinished = (): void => { },
    } = {
            onStdout: (data) => console.log("stdout:", data),
            onStderr: (data) => console.log("stderr:", data),
            onError: (err) => { if (err) throw err },
            onFinished: (): void => { },
        },
): () => boolean {
    const useShell = platform() === 'win32';
    var child = spawn(command, args, { shell: useShell });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data: any) => onStdout(data));
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data: any) => onStderr(data));
    child.on("error", (data: any) => onError(data));
    child.on('close', () => onFinished());
    return () => child.kill()
}

export { execute, runShellCmd }
