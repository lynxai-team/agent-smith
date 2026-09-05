import { readFile } from 'fs/promises';
import path from "path";
//import terminalImage from 'terminal-image';

function parsePath(args: any, options: Record<string, any>) {
    // check required args
    const location = options?.variables?.workspace;
    if (!location) {
        return { ok: false, msg: "[Error]: missing the workspace parameter" };
    }
    if (!args?.path) {
        return { ok: false, msg: "[Error]: provide a file path argument" };
    }
    if (!args.path.startsWith("/workspace")) {
        return { ok: false, msg: "[Error]: the file path must be absolute and start with /workspace" };
    }
    let requestedPath = args.path;
    let ok = false;
    let fp;
    //console.log("PPA", args);
    //console.log("PPO", options);
    // check for workspace
    if (options?.variables?.workspace) {
        fp = requestedPath.replace("/workspace", location);
        ok = true;
    }
    if (!ok) {
        return { ok: false, msg: "[Error]: unauthorized file path" };
    }
    return { ok: true, msg: fp };
}

async function getImageBuffer(imagePath: string) {
    try {
        // Read the file asynchronously and get a Buffer
        const buffer = await readFile(imagePath);
        //console.log('Image Buffer:', buffer);
        return buffer;
    } catch (error) {
        console.error('Error reading the image file:', error);
    }
}

async function img2base64(img: string, isVerbose: boolean) {
    /*if (isVerbose) {
        console.log(await terminalImage.file(img, { width: '50%', height: '50%' }));
    }*/
    let ip = img;
    if (!path.isAbsolute(img)) {
        ip = path.join(process.cwd(), img);
    }
    let data = await getImageBuffer(ip);
    const txt = data!.toString('base64');
    return txt;
}

async function imgs2base64(args: any, prompt?: string, isVerbose = false) {
    const _prompt = prompt || "";
    const imgData = [];
    const imgs = [];
    let i = 0;
    for (const arg of args) {
        let txt;
        try {
            txt = await img2base64(arg, isVerbose);
            imgData.push(txt);
        } catch (e) {
            throw new Error(`image conversion: ${e}`);
        }
        imgs.push(` [img-${i}]`);
        ++i;
    }
    const im = imgs.join("");
    const pr = im + _prompt;
    return { inferParams: { images: imgData }, prompt: pr };
}

export {
    img2base64,
    imgs2base64,
};