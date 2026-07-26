#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import { runserver } from './server/server.js';
import { baseRoutes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const dirpath = path.resolve(path.dirname(__filename), "../");

async function main() {
    //console.log(dirpath, process.env.NODE_ENV);
    let staticPath: string | undefined = undefined;
    if (process.env.NODE_ENV != "development") {
        staticPath = dirpath
    }
    //console.log("B", baseRoutes);
    runserver(baseRoutes, staticPath);
}

(async () => {
    await main();
})();