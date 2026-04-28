import { conf, state } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';
import fs from "node:fs";
import { getConfig } from '../utils.js';

function getStateRoute(r: Router) {
    r.get('/state', async (ctx: Context, next: Next) => {
        //console.log('STATE URL --> ' + ctx.request.url);
        //console.log("STATE ROUTE");
        const { confDir, dbPath } = conf.getConfigPath("agent-smith", "config.db");
        //console.log("conf paths", confDir, dbPath);
        if (!fs.existsSync(dbPath)) {
            ctx.body = "no db found at " + dbPath;
            ctx.status = 202;
        } else {
            await state.init();
            const { found, conf } = getConfig()
            if (!found) {
                ctx.body = "can not find config path in db";
                ctx.status = 400;
            } else {
                ctx.body = conf;
                ctx.status = 200;
            }
        }
        //console.log("STATE", ctx.status)
        //return next()
    })
}

export {
    getStateRoute,
}