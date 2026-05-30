import Router from '@koa/router';
import type { Context, Next } from 'koa';

const useRouter = (
  apiRoutes: Array<(r: Router) => void> = [],
) => {
  const apiRouter = new Router({ prefix: '/api' });
  const router = new Router();

  apiRoutes.forEach((f) => f(apiRouter));

  router.get('/ping', async (ctx: Context, next: Next) => {
    ctx.body = { ok: true };
    ctx.status = 200;
    await next();
  });

  //console.log("Routes", router.stack.map(i => i.path));
  //console.log("Apiroutes", apiRouter.stack.map(i => i.path));
  return { baseRouter: router, apiRouter }
}

export { useRouter }