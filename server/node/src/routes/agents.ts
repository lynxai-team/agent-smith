import { db, fs } from '@agent-smith/core';
import type { FeatureSpec } from '@agent-smith/types';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';
import { excludedTaskTypes } from '../utils.js';

function getAgentsRoute(r: Router) {
    r.get('/agents', async (ctx: Context, next: Next) => {
        const agents = db.readFeaturesType("agent");
        let ag: Record<string, FeatureSpec> = {};
        for (const [name, feat] of Object.entries(agents)) {
            if (feat?.type) {
                if (!excludedTaskTypes.includes(feat.type)) {
                    ag[name] = feat;
                }
            } else {
                ag[name] = feat;
            }
        }
        ctx.body = ag;
        ctx.status = 200;
        //console.log("AGENTS", ctx.status);
        //await next()
    })
}

function getAgentRoute(r: Router) {
    r.get('/agent/:id', async (ctx: Context, next: Next) => {
        //console.log(ctx.params.id)
        const taskSpec = fs.openTaskSpec(ctx.params.id, true);
        ctx.body = taskSpec.taskFileSpec;
        ctx.status = 200;
        //await next()
    })
}

export {
    getAgentRoute,
    getAgentsRoute,
}