import { db, fs } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getWorkflowsRoute(r: Router) {
    r.get('/workflows', async (ctx: Context, next: Next) => {
        const w = db.readFeaturesType("workflow");
        ctx.body = w;
        ctx.status = 200;
    })
}

function getWorkflowRoute(r: Router) {
    r.get('/workflow/:id', async (ctx: Context, next: Next) => {
        //console.log(ctx.params.id)
        const { found, workflow } = await fs.readWorkflow(ctx.params.id);
        if (!found) {
            ctx.body = "workflow not found";
            ctx.status = 400;
        } else {
            ctx.body = workflow;
            ctx.status = 200;
        }
    })
}

export {
    getWorkflowRoute,
    getWorkflowsRoute,
}