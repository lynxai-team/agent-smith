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

function createAwaiter<T>() {
  let resolveFn: (value: T) => void;
  let rejectFn: (reason?: any) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  return {
    promise,
    resolve: resolveFn!,
    reject: rejectFn!
  };
}

function runserver(routes?: ((r: Router) => void)[], staticDir?: string) {
  const router = useRouter(routes);
  const sendTokensInterval = 100;

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
            msg: "provide a payload",
          }
          ctx.websocket.send(JSON.stringify(rsm));
          return
        }
        await state.init();
        if (msg.feature == "task") {
          msg.options.onThinkingToken = (t: string) => {
            const rsm: WsRawServerMsg = {
              type: "thinkingtoken",
              msg: t,
            }
            ctx.websocket.send(JSON.stringify(rsm));
            process.stdout.write(`\x1b[2m${t}\x1b[0m`);
          };
          msg.options.onToken = (t: string) => {
            const rsm2: WsRawServerMsg = {
              type: "token",
              msg: t,
            }
            ctx.websocket.send(JSON.stringify(rsm2));
            process.stdout.write(t);
          };
          msg.options.onStartThinking = () => {
            const rsm: WsRawServerMsg = {
              type: "thinkingstart",
              msg: "",
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onEndThinking = () => {
            const rsm: WsRawServerMsg = {
              type: "thinkingend",
              msg: "",
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onTurnEnd = (ht: Record<string, any>) => {
            const rsm: WsRawServerMsg = {
              type: "turnend",
              msg: JSON.stringify(ht),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onAssistant = (txt: string) => {
            const rsm: WsRawServerMsg = {
              type: "assistant",
              msg: txt,
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onThink = (txt: string) => {
            const rsm: WsRawServerMsg = {
              type: "think",
              msg: txt,
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          try {
            //console.log("SRVTASK OPTS", msg.options);
            const res = await executeTask(msg.command, msg.payload, msg.options);
            //console.dir(res, { depth: 3 });
            let r: HistoryTurn = { assistant: res.text };
            const rsm: WsRawServerMsg = {
              type: "finalresult",
              msg: JSON.stringify(r),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          } catch (e) {
            const rsm: WsRawServerMsg = {
              type: "error",
              msg: `${e}`,
            }
            ctx.websocket.send(JSON.stringify(rsm));
          }
        } else if (msg.feature == "agent") {
          msg.options.onThinkingToken = (t: string) => {
            const rsm: WsRawServerMsg = {
              type: "thinkingtoken",
              msg: t,
            }
            ctx.websocket.send(JSON.stringify(rsm));
            process.stdout.write(`\x1b[2m${t}\x1b[0m`);
          };
          msg.options.onToken = (t: string) => {
            const rsm2: WsRawServerMsg = {
              type: "token",
              msg: t,
            }
            ctx.websocket.send(JSON.stringify(rsm2));
            process.stdout.write(t);
          };
          msg.options.onStartThinking = () => {
            const rsm: WsRawServerMsg = {
              type: "thinkingstart",
              msg: "",
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onEndThinking = () => {
            const rsm: WsRawServerMsg = {
              type: "thinkingend",
              msg: "",
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onToolCallInProgress = (tcs: Array<any>) => {
            const rsm: WsRawServerMsg = {
              type: "toolcallinprogress",
              msg: JSON.stringify(tcs),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onToolsTurnStart = (tcs: Record<string, any>) => {
            const rsm: WsRawServerMsg = {
              type: "toolsturnstart",
              msg: JSON.stringify(tcs),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onToolsTurnEnd = (tr: Record<string, any>) => {
            const rsm: WsRawServerMsg = {
              type: "toolsturnend",
              msg: JSON.stringify(tr),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onTurnEnd = (ht: Record<string, any>) => {
            const rsm: WsRawServerMsg = {
              type: "turnend",
              msg: JSON.stringify(ht),
            }
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onAssistant = (txt: string) => {
            const rsm: WsRawServerMsg = {
              type: "assistant",
              msg: txt,
            }
            //console.log("SRV ON ASSISTANT", txt);
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onThink = (txt: string) => {
            const rsm: WsRawServerMsg = {
              type: "think",
              msg: txt,
            }
            //console.log("SRV ON THINK", txt);
            ctx.websocket.send(JSON.stringify(rsm));
          };
          msg.options.onToolCall = (tc: Record<string, any>) => {
            if (!tc?.id) {
              tc.id = crypto.randomUUID()
            }
            const rsm: WsRawServerMsg = {
              type: "toolcall",
              msg: JSON.stringify(tc),
            }
            ctx.websocket.send(JSON.stringify(rsm));
            console.log("\n⚒️ ", color.bold(msg.command), "=>", `${color.yellowBright(tc.name)}`, tc.arguments);
          };
          msg.options.onToolCallEnd = (tc: any, tr: any) => {
            let toolResData: any;
            if (typeof tr == 'object') {
              if (tr?.text) {
                // comes from an inference task
                toolResData = tr.text
              } else {
                toolResData = JSON.stringify(tr)
              }
            } else {
              toolResData = tr.toString();
            }
            const rsm: WsRawServerMsg = {
              type: "toolcallend",
              msg: `${JSON.stringify(tc)}<|xtool_call_id|>` + toolResData,
            };
            //console.log("TOOL CALL END", toolResData);
            ctx.websocket.send(JSON.stringify(rsm));
          }
          msg.options.confirmToolUsage = async (tc: Record<string, any>) => {
            if (!tc?.id) {
              tc.id = crypto.randomUUID()
            }
            const rsm: WsRawServerMsg = {
              type: "toolcallconfirm",
              msg: JSON.stringify(tc),
            }
            const { promise, resolve } = createAwaiter<boolean>();
            confirmToolCalls[tc.id] = resolve;
            ctx.websocket.send(JSON.stringify(rsm));
            const res = await promise;
            return res
          }
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
            const res = await executeTask(msg.command, msg.payload, msg.options);
            //setTimeout(() => {
            //clearInterval(it);
            //}, sendTokensInterval);
            const ht = JSON.stringify(res);
            //console.log("FINAL MSG", ht)
            const rsm: WsRawServerMsg = {
              type: "finalresult",
              msg: ht,
            }
            ctx.websocket.send(JSON.stringify(rsm));
          } catch (e) {
            const rsm: WsRawServerMsg = {
              type: "error",
              msg: `${e}`
            }
            ctx.websocket.send(JSON.stringify(rsm));
          }
        } else if (msg.feature == "workflow") {
          try {
            const res = await executeWorkflow(msg.command, msg.payload, msg.options);
            const rsm: WsRawServerMsg = {
              type: "finalresult",
              msg: res,
            }
            ctx.websocket.send(JSON.stringify(rsm));
          } catch (e) {
            const rsm: WsRawServerMsg = {
              type: "error",
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

  app.use(router.routes()).use(router.allowedMethods());

  // 404 middleware - runs after router
  app.use((ctx) => {
    if (!ctx.matched || ctx.matched.length === 0) {
      ctx.status = 404;
      //console.log("404 ROUTE", ctx);
      ctx.body = {
        error: 'Not Found',
        path: ctx.path
      };
    }
  });

  app.listen(5184, () => {
    console.log('Please open url localhost:5184 in a browser');
  });
}

export { runserver }
