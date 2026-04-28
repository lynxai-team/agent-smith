import { db } from '@agent-smith/core';
import type Router from '@koa/router';
import type { Next, Context } from 'koa';

function getTaskSettingsCmd(r: Router) {
    r.get('/tasks/settings', async (ctx: Context, next: Next) => {
        const ts = db.getTaskSettings();
        ctx.body = ts;
        ctx.status = 200;
    })
}

function updateTaskSettingsCmd(r: Router) {
    r.post('/tasks/settings/update', async (ctx: Context, next: Next) => {
        const data = ctx.request.body as Record<string, any>;
        //console.log("DATA", data);
        const name = data.name;
        const settings = data.settings;
        const ts = db.upsertTaskSettings(name, settings);
        db.getTaskSettings(true);
        ctx.body = ts;
        ctx.status = 200;
    })
}

export {
    getTaskSettingsCmd,
    updateTaskSettingsCmd,
}