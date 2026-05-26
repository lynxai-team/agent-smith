import { backend } from '@agent-smith/core';
import { db } from '@agent-smith/core';
import type { ModelInfo, SamplingPreset } from '@agent-smith/types';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getModelsRoute(r: Router) {
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

function getModelsPresetsRoute(r: Router) {
    r.get('/models/presets', async (ctx: Context, next: Next) => {
        let mp = new Array<SamplingPreset>();
        try {
            mp = db.readSamplingPresets()
            //console.log("M", mi);
        } catch (e) {
            ctx.body = "error reading the models presets";
            ctx.status = 502;
            return
        }
        ctx.body = mp;
        ctx.status = 200;
    })
}

function upsertModelPresetRoute(r: Router) {
    r.post('/models/preset/update', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as SamplingPreset;
        try {
            db.upsertSamplingPreset(payload);
            ctx.status = 204;
        } catch (e) {
            const err = `error updating model preset:\n ${e}`;
            console.error(err);
            ctx.body = err;
            ctx.status = 500;
        }
    })
}

function delModelPresetRoute(r: Router) {
    r.del('/models/preset/delete/:name', async (ctx: Context, next: Next) => {
        const name = ctx.params?.name;
        if (!name) {
            ctx.body = "provide a name to delete model preset";
            ctx.status = 400
        } else {
            const w = db.deleteSamplingPreset(name);
            ctx.body = w;
            ctx.status = 200;
        }
    })
}

export {
    getModelsRoute,
    getModelsPresetsRoute,
    upsertModelPresetRoute,
    delModelPresetRoute,
}