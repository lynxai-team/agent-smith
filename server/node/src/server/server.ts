#!/usr/bin/env node
import { default as color } from "ansi-colors";
import Koa, { type Next, type Context } from 'koa';
import { Router } from "@koa/router";
import bodyParser from "koa-bodyparser";
import cors from '@koa/cors';
import { useRouter } from './router.js';
import websockify from 'koa-websocket';
import route from 'koa-route';
import serve from "koa-static";
import { executeTask, executeWorkflow, state } from '@agent-smith/core';
import type { WsClientMsg, WsRawServerMsg, HistoryTurn } from '@agent-smith/types';
import path from "node:path";
import { buildCallbacks } from "../callbacks.js";
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

function runserver(routes?: ((r: Router) => void)[], staticDir?: string) {
  //state.init();
  const router = useRouter(routes);

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
        if (msg.feature == "task") {
          buildCallbacks(msg, ctx, false, confirmToolCalls);
          try {
            //console.log("SRVTASK OPTS", msg.options);
            const res = await executeTask(msg.command, msg.payload, msg.options);
            //console.dir(res, { depth: 3 });
            let r: HistoryTurn = { assistant: res.text };
            const rsm: WsRawServerMsg = {
              type: "finalresult",
              from: "server",
              msg: JSON.stringify(r),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          } catch (e) {
            const rsm: WsRawServerMsg = {
              type: "error",
              from: "server",
              msg: `${e}`,
            }
            ctx.websocket.send(JSON.stringify(rsm));
          }
        }
        // ---------- agent -------------
        else if (msg.feature == "agent") {
          buildCallbacks(msg, ctx, true, confirmToolCalls);
          msg.options.isAgent = true;
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
            //console.log("AGENT SRV EXEC", msg);
            const res = await executeTask(msg.command, msg.payload, msg.options);
            //setTimeout(() => {
            //clearInterval(it);
            //}, sendTokensInterval);
            const ht = JSON.stringify(res);
            //console.log("FINAL MSG", ht)
            const rsm: WsRawServerMsg = {
              type: "finalresult",
              from: "server",
              msg: ht,
            }
            ctx.websocket.send(JSON.stringify(rsm));
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
            const rsm: WsRawServerMsg = {
              type: "finalresult",
              from: "server",
              msg: res,
            }
            ctx.websocket.send(JSON.stringify(rsm));
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

  // 404 middleware - runs after router
  app.use((ctx) => {
    if (!ctx.matched || ctx.matched.length === 0) {
      ctx.redirect('/')
      ctx.status = 301

      /*ctx.status = 404;
      //console.log("404 ROUTE", ctx);
      ctx.body = {
        error: 'Not Found',
        path: ctx.path
      };*/
    }
  });

  app.listen(5184, () => {
    console.log('Please open url http://localhost:5184 in a browser');
  });
}

export { runserver }
