import { db } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getSkillssRoute(r: Router) {
    r.get('/skills', async (ctx: Context, next: Next) => {
        const w = db.readFeaturesType("skill");
        ctx.body = w;
        ctx.status = 200;
    })
}

export {
    getSkillssRoute,
}