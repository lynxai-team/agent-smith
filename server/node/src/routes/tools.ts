import type Router from '@koa/router';
import type { Next, Context } from 'koa';
import { db } from '@agent-smith/core';
import type { ToolDefSpec, ToolType } from "@agent-smith/types";

function getToolsRoute(r: Router) {
    r.post('/tools', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as Array<string>;
        const tools = new Array<{ def: ToolDefSpec, type: ToolType }>();
        let nf = false;
        for (const tn of payload) {
            const { found, tool, type } = db.readTool(tn);
            if (!found) {
                ctx.status = 400;
                ctx.body = `Tool ${tn} not found`;
                nf = true;
                break;
            };
            const ts: ToolDefSpec = {
                name: tool.name,
                description: tool.description,
                arguments: tool.arguments,
            }
            tools.push({ def: ts, type: type })
        }
        if (!nf) {
            ctx.body = tools;
            ctx.status = 200;
        }
    })
}

export {
    getToolsRoute,
}