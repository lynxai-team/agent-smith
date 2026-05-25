import { db, state } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getAgentSettingsCmd(r: Router) {
    r.get('/agentsettings', async (ctx: Context, next: Next) => {
        const ts = state.getAgentSettings(true);
        ctx.body = ts;
        ctx.status = 200;
    })
}

function updateAgentSettingsCmd(r: Router) {
    r.post('/agentsettings/update', async (ctx: Context, next: Next) => {
        const data = ctx.request.body as Record<string, any>;
        //console.log("DATA", data);
        const name = data.name;
        const settings = data.settings;
        const ts = db.upsertAgentSettings(name, settings);
        ctx.body = ts;
        ctx.status = 200;
    })
}

export {
    getAgentSettingsCmd,
    updateAgentSettingsCmd,
}