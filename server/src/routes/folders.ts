import type Router from '@koa/router';
import type { Context, Next } from 'koa';
import { conf as c } from '@agent-smith/core';
import { getConfig } from '../utils.js';

function addFolderRoute(r: Router) {
    r.post('/folders/add', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as Array<string>;
        const { found, conf, path } = getConfig();
        if (!found) {
            throw new Error("no config file found")
        };
        if (!conf?.features) {
            conf.features = []
        }
        for (const p of payload) {
            conf.features.push(p)
        };
        console.log("Updating config file at", path);
        console.dir(conf, { depth: 3 });
        c.updateConfigFile(conf, path);
        console.log("Updating db features from config file");
        await c.updateConfCmd([path])
        ctx.status = 202;
    })
}

export {
    addFolderRoute,
}