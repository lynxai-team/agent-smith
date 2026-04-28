import { backend } from '@agent-smith/core';
import { ModelInfo } from '@agent-smith/types';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getModelsCmd(r: Router) {
    r.get('/models', async (ctx: Context, next: Next) => {
        let mi = new Array<ModelInfo>();
        try {
            mi = await backend.value?.modelsInfo() ?? [];
            //console.log("M", mi);
        } catch (e) {
            ctx.body = "error reading the models";
            ctx.status = 502;
            return
        }
        ctx.body = mi;
        ctx.status = 200;
    })
}

export {
    getModelsCmd,
}