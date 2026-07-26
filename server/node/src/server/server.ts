#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { executeAgent, executeWorkflow } from '@agent-smith/core';
import type { WsClientMsg, WsRawServerMsg } from '@agent-smith/types';
import cors from '@koa/cors';
import { Router } from "@koa/router";
import Koa, { type Context, type Next } from 'koa';
import bodyParser from "koa-bodyparser";
import route from 'koa-route';
import serve from "koa-static";
import websockify from 'koa-websocket';
import { buildCallbacks } from "../callbacks.js";
import { useRouter } from './router.js';
/* import { argv } from 'process';

let env = "production";

if (argv.length > 2) {
  for (const arg of argv.slice(2, argv.length)) {
    if (arg == "-d") {
      env = "dev"
    }
  }
}*/

const logger = async (ctx: Context, next: Next) => {
  const start = Date.now();
  //console.log('LOGGER BEFORE URL --> ' + ctx.request.url);
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${duration}ms`);
  //console.log('LOGGER AFTER URL --> ' + ctx.request.url);
};

const app = websockify(new Koa());

app.use(bodyParser());
app.use(cors({
  credentials: true
}));

app.ws.use((ctx: Context, next: Next) => {
  return next();
});

function runserver(routes?: ((r: Router) => void)[], staticDir: string | null = null, port = 5184) {
  //state.init();
  const router = useRouter(routes);
  //console.log(router.apiRouter.stack.map(i => i.path));
  //console.log(router.baseRouter.stack.map(i => i.path));

  const confirmToolCalls: Record<string, (value: boolean) => void> = {};

  app.ws.use(route.all('/ws', function(ctx) {
    //ctx.websocket.send('Hello World');
    let abort = new AbortController();
    ctx.websocket.on('message', async function(message: string) {
      const msg = JSON.parse(message) as WsClientMsg;
      if (!msg?.options) {
        msg.options = {}
      }
      msg.options.nocli = true;
      //console.log("ABO", abort);
      msg.options.abort = abort;
      //console.log(msg)
      if (msg.type == "system") {
        if (msg.command == "stop") {
          //console.log("STOP CMD");
          abort.abort("stopped");
          abort = new AbortController();
          return
        } else if (msg.command == "confirmtool") {
          if (!(msg.payload.id in confirmToolCalls)) {
            const rsm: WsRawServerMsg = {
              type: "error",
              from: "server",
              msg: `can not confirm tool call: unknown tool id ${msg.payload.id}`,
            }
            ctx.websocket.send(JSON.stringify(rsm));
            return
          }
          if (msg.payload.confirm == true) {
            confirmToolCalls[msg.payload.id](true);
          } else {
            confirmToolCalls[msg.payload.id](false);
          }
          delete confirmToolCalls[msg.payload.id];
        }
        else {
          console.error(`unknown system command ${msg.payload}`)
        }
      } else {
        if (!msg?.payload) {
          const rsm: WsRawServerMsg = {
            type: "error",
            from: "server",
            msg: "provide a payload",
          }
          ctx.websocket.send(JSON.stringify(rsm));
          return
        }
        // ---------- task -------------
        if (msg.feature == "agent") {
          buildCallbacks(msg, ctx, confirmToolCalls);
          try {
            //let buf = "";            
            /*const it = setInterval(() => {
              if (buf == "") { return };
              const rsm: WsRawServerMsg = {
                type: "token",
                msg: buf,
              }
              ctx.websocket.send(JSON.stringify(rsm));
              buf = "";
            }, sendTokensInterval);*/
            //console.log("AGENT SRV EXEC H", msg.options.history);
            //console.log("AGENT SRV EXEC P", msg.payload);
            await executeAgent(msg.command, msg.payload, msg.options);
            //setTimeout(() => {
            //clearInterval(it);
            //}, sendTokensInterval);
            //console.log("FINAL MSG", ht)
            /*const rsm: WsRawServerMsg = {
              type: "finalresult",
              from: "server",
              msg: JSON.stringify(res),
            }
            ctx.websocket.send(JSON.stringify(rsm));*/
          } catch (e) {
            const rsm: WsRawServerMsg = {
              type: "error",
              from: "server",
              msg: `${e}`
            }
            ctx.websocket.send(JSON.stringify(rsm));
          }
        } else if (msg.feature == "workflow") {
          try {
            const res = await executeWorkflow(msg.command, msg.payload, msg.options);
            /*const rsm: WsRawServerMsg = {
              type: "finalresult",
              from: "server",
              msg: res,
            }
            ctx.websocket.send(JSON.stringify(rsm));*/
          } catch (e) {
            const rsm: WsRawServerMsg = {
              type: "error",
              from: "server",
              msg: `${e}`
            }
            ctx.websocket.send(JSON.stringify(rsm));
          }
        }
        /*else if (msg.type == "cmd") {
          await init();
          msg.options.onToken = (t: string) => {
            process.stdout.write(t);
            ctx.websocket.send(t);
          };
          await executeCmd(msg.name, msg.payload, msg.options);
        }*/
        else {
          const rsm: WsRawServerMsg = {
            type: "error",
            from: "server",
            msg: "command type " + msg.feature + " not supported"
          }
          ctx.websocket.send(JSON.stringify(rsm));
        }
      }
      abort = new AbortController();
    });
  }));

  if (staticDir) {
    app.use(serve(staticDir));
  }

  app.use(logger);

  const { baseRouter, apiRouter } = router;
  app
    .use(baseRouter.routes()).use(baseRouter.allowedMethods())
    .use(apiRouter.routes()).use(apiRouter.allowedMethods());

  // SPA 404 handler - serve index.html for unmatched non-API routes
  app.use(async (ctx) => {
    if (!ctx.matched || ctx.matched.length === 0) {
      if (!ctx.path.startsWith('/api/')) {
        if (staticDir) {
          ctx.status = 200;
          ctx.type = 'html';
          ctx.body = fs.createReadStream(path.join(staticDir, 'index.html'));
        } else {
          ctx.status = 404;
          ctx.body = { error: 'Not Found', path: ctx.path };
        }
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Not Found', path: ctx.path };
      }
    }
  });

  app.listen(port, () => {
    console.log(`Please open url http://localhost:${port} in a browser`);
  });
}

export { runserver };

