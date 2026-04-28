import { db, state } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Context, Next } from 'koa';

function getBackendsRoute(r: Router) {
    r.get('/backends', async (ctx: Context, next: Next) => {
        const backends = db.readBackends();
        ctx.body = backends;
        ctx.status = 200;
    })
}

function setBackendRoute(r: Router) {
    r.get('/backend/:name', async (ctx: Context, next: Next) => {
        const name = ctx.params.name;
        console.log("Loading backend", name);
        const ok = await state.setBackend(name, true);
        if (!ok) {
            ctx.status = 400;
            ctx.body = "backend not found"
        } else {
            ctx.body = ok;
            ctx.status = 200;
        }
    })
}

export {
    getBackendsRoute,
    setBackendRoute,
}