import { db } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getSettingsRoute(r: Router) {
    r.get('/settings', async (ctx: Context, next: Next) => {
        let res: Record<string, any> = {};
        try {
            res = db.readSettings();
            //console.log("M", mi);
        } catch (e) {
            const err = `error reading settings ${e}`;
            console.error(err);
            ctx.body = err;
            ctx.status = 500;
            return
        }
        ctx.body = res;
        ctx.status = 200;
    })
}

export {
    getSettingsRoute,
}