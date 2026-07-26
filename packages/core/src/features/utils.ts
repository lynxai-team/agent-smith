import { readFile } from 'fs/promises';
import path from "path";
//import terminalImage from 'terminal-image';

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

async function imgs2base64(args: any, prompt: string, isVerbose: boolean) {
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