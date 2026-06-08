import type Router from '@koa/router';
import type { Context, Next } from 'koa';
import type { ChatCompletionHistoryTurn } from '@agent-smith/types';
import { useAgentExecutor } from '@agent-smith/core';

function applyTemplateRoute(r: Router) {
    r.post('/templates/apply', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as { messages: Array<ChatCompletionHistoryTurn>, modelName: string };
        const ex = await useAgentExecutor("infer", { prompt: "" }, {});
        try {
            const res = await ex.agent.lm.applyTemplate(payload.messages, payload.modelName);
            ctx.status = 200;
            ctx.body = res.prompt;
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = e.toString()
        }

    })
}

export {
    applyTemplateRoute,
}