import { runserver } from "./server/server.js";
import { baseRoutes } from "./routes/index.js";
import type Router from "@koa/router";

function runServer(routes?: ((r: Router) => void)[], staticDir?: string, port = 5184) {
    const r = routes ? [...baseRoutes, ...routes] : baseRoutes;
    runserver(r, staticDir, port)
}

export {
    runServer,
    baseRoutes,
}