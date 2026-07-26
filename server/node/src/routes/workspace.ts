import { db } from '@agent-smith/core';
import type { Workspace } from '@agent-smith/types';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getWorkspaceRoute(r: Router) {
    r.get('/workspace', async (ctx: Context, next: Next) => {
        let ws: Array<Workspace>;
        try {
            ws = db.readWorkspaces();
            //console.log("M", mi);
        } catch (e) {
            const err = `error reading the workspaces ${e}`;
            console.error(err);
            ctx.body = err;
            ctx.status = 500;
            return
        }
        ctx.body = ws;
        ctx.status = 200;
    })
}

function upsertWorkspaceRoute(r: Router) {
    r.post('/workspace', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as Workspace;
        try {
            db.upsertWorkspace(payload);
            ctx.status = 204;
        } catch (e) {
            const err = `error writing workspace file path into db:\n ${e}`;
            console.error(err);
            ctx.body = err;
            ctx.status = 500;
        }
    })
}

function updateDefaultWorkspaceRoute(r: Router) {
    r.post('/workspace/update', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as Workspace;
        try {
            db.upsertSetting("workspace", payload.name);
            ctx.status = 204;
        } catch (e) {
            const err = `error updating default workspace:\n ${e}`;
            console.error(err);
            ctx.body = err;
            ctx.status = 500;
        }
    })
}

export {
    getWorkspaceRoute,
    upsertWorkspaceRoute,
    updateDefaultWorkspaceRoute,
}