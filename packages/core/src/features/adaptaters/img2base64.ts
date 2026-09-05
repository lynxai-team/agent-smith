import { parsePath } from "../../utils/path.js";
import { imgs2base64 } from "../utils.js";

async function action(args: any, options: any) {
    //console.log("ARGS", args);
    //console.log("OPTS", options);
    const isVerbose = options?.debug || options?.verbose;
    if (!args?.path) {
        throw new Error("Provide an image path");
    }
    if (!args?.prompt) {
        throw new Error("Provide a prompt");
    }
    const p = parsePath(args, options);
    if (!p.ok) {
        return { prompt: p.msg }
    }
    const { inferParams, prompt } = await imgs2base64([p.msg], args.prompt, isVerbose);
    options.params = { ...options.params, ...inferParams };
    console.log("IP", options.params)
    return { prompt: prompt };
}

export { action };
