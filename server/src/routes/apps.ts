import { conf } from "@agent-smith/core";
import type Router from "@koa/router";
import type { Context, Next } from "koa";
import fs, { existsSync } from "node:fs";
import path from "node:path";
import yaml from "yaml";

function getOrCreateAppConfigFile(appName: string): Record<string, any> {
    const { confDir } = conf.getConfigPath("agent-smith/" + appName, "config.db");
    if (!fs.existsSync(confDir)) {
        fs.mkdirSync(confDir)
    }
    const fp = path.join(confDir, "config.yml");
    let fc = "";
    if (!existsSync(fp)) {
        fs.writeFileSync(fp, "");
        return {}
    } else {
        fc = fs.readFileSync(fp, { encoding: "utf-8" });
        return yaml.parse(fc);
    }
}

function updateAppConfigFile(appName: string, content: Record<string, any>) {
    const { confDir } = conf.getConfigPath("agent-smith/" + appName, "config.db");
    const fp = path.join(confDir, "config.yml");
    const txt = yaml.stringify(content)
    fs.writeFileSync(fp, txt, { encoding: "utf-8" });
}

function getOrCreateAppConfigFileRoute(r: Router) {
    r.get('/app/:name/conf', async (ctx: Context, next: Next) => {
        ctx.body = getOrCreateAppConfigFile(ctx.params.name);
        ctx.status = 200;
    })
}

function updateAppConfigFileRoute(r: Router) {
    r.post('/app/:name/update', async (ctx: Context, next: Next) => {
        const payload = ctx.request.body as Array<string>;
        updateAppConfigFile(ctx.params.name, payload);
        ctx.status = 200;
    })
}

export {
    getOrCreateAppConfigFileRoute,
    updateAppConfigFileRoute,
}