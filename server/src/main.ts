import { runserver } from "./server/server.js";
import { baseRoutes } from "./routes/index.js";
import type Router from "@koa/router";

function runServer(routes?: ((r: Router) => void)[], staticDir?: string) {
    const r = routes ? [...baseRoutes, ...routes] : baseRoutes;
    runserver(r, staticDir)
}

export {
    runServer,
    baseRoutes,
}