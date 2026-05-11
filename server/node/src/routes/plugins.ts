import type Router from '@koa/router';
import type { Context, Next } from 'koa';
import { utils, conf as c, state } from '@agent-smith/core';
import { getConfig } from '../utils.js';

function installPluginRoute(r: Router) {
    r.post('/plugins/install', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as Array<string>;
        //console.log("P", payload);
        for (const p of payload) {
            console.log("Installing", p, "plugin");
            const res = await utils.execute("npm", ["i", "-g", p]);
            console.log(p, res)
        }
        await state.init();
        const { found, conf, path } = getConfig();
        if (!found) {
            throw new Error("no config file found")
        };
        if (!conf?.plugins) {
            conf.plugins = []
        }
        for (const p of payload) {
            conf.plugins?.push(p)
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
    installPluginRoute,
}