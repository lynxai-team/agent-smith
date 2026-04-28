import { db, fs } from '@agent-smith/core';
import type { FeatureSpec } from '@agent-smith/types';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';
import { excludedTaskTypes } from '../utils.js';

function getTasksRoute(r: Router) {
    r.get('/tasks', async (ctx: Context, next: Next) => {
        const tasks = db.readFeaturesType("task");
        let ts: Record<string, FeatureSpec> = {};
        for (const [name, feat] of Object.entries(tasks)) {
            if (feat?.type) {
                if (!excludedTaskTypes.includes(feat.type)) {
                    ts[name] = feat;
                }
            } else {
                ts[name] = feat;
            }
        }
        ctx.body = ts;
        ctx.status = 200;
    })
}

function getTaskRoute(r: Router) {
    r.get('/task/:id', async (ctx: Context, next: Next) => {
        //console.log(ctx.params.id)
        const taskSpec = fs.openTaskSpec(ctx.params.id);
        ctx.body = taskSpec.taskFileSpec;
        ctx.status = 200;
    })
}
function saveTasksRoute(r: Router) {
    r.post('/save', async (ctx: Context, next: Next) => {
        //const payload = ctx.request.body;

        ctx.body = "ok";
        ctx.status = 200;
    })
}


export {
    getTasksRoute,
    getTaskRoute,
}