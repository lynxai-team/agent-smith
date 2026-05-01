import { conf } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Context, Next } from 'koa';
import { getConfig } from '../utils.js';

function getConfRoute(r: Router) {
    r.get('/conf', async (ctx: Context, next: Next) => {
        const { found, conf } = getConfig()
        if (!found) {
            ctx.body = "can not find config path in db";
            ctx.status = 400;
        } else {
            ctx.body = conf;
            ctx.status = 200;
        }
    })
}

function createConfRoute(r: Router) {
    r.get('/conf/create', async (ctx: Context, next: Next) => {
        let cfp: string | null = null;
        try {
            cfp = conf.createConfigFile();
        } catch (e) {
            console.error("500", e);
            ctx.body = e;
            ctx.status = 500;
        }
        if (cfp) {
            ctx.body = cfp;
            ctx.status = 201;
            await conf.updateConfCmd([cfp]);
        }
    })
}

export {
    createConfRoute, getConfRoute
};
