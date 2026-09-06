/*
# tool
name: load-image
description: load the tokens of an image file in the context window
arguments:
    path:
        description: the absolute path of the image file
        required: true
parallelCalls: false
*/
import { parsePath } from "../../utils/path.js";
import { imgs2base64 } from "../utils.js";

async function action(args: any, options: any) {
    //console.log("ARGS", args);
    //console.log("OPTS", options);
    const isVerbose = options?.debug || options?.verbose;
    if (!args?.path) {
        throw new Error("Provide an image path");
    }
    const p = parsePath(args, options);
    if (!p.ok) {
        return { prompt: p.msg }
    }
    const { inferParams } = await imgs2base64([p.msg], "", isVerbose);
    const res = {
        imagesData: [{ data: inferParams.images[0], path: args.path }]
    };
    return res
}

export { action };
