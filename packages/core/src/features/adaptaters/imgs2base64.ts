import { imgs2base64 } from "../utils.js";

async function action(args: any, options: any) {
    const isVerbose = options?.debug || options?.verbose;
    if (args.length < 2) {
        throw new Error("Provide an image path and a prompt");
    }
    const pr = args.pop();
    const { inferParams, prompt } = await imgs2base64(args, pr, isVerbose);
    options.params = { ...options.params, ...inferParams };
    const res = prompt;
    return res;
}

export { action };
