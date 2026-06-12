import { nextTick } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { libName } from "./conf.js"
// @ts-ignore
import { default as autoRoutes } from '~pages'

const baseTitle = libName;

const routes: Array<RouteRecordRaw> = [
  ...autoRoutes,
  {
    path: '/:pathMatch(.*)*',
    component: () => import("./pages/404.vue"),
    meta: {
      title: "Page not found"
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.afterEach((to, from) => {
  if (from.name) {
    nextTick(() => {
      const mainBlock = document.getElementById("main") ?? window;
      mainBlock.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if ("id" in to.params) {
    let buf = new Array<string>();
    if ("category" in to.params) {
      buf.push(to.params.category.toString());
    }
    if ("id" in to.params) {
      buf.push(to.params.id.toString());
    }
    document.title = `${baseTitle} - ${buf.join("/")}`
  }
  else if (to.meta?.title) {
    document.title = `${baseTitle} - ${to.meta?.title}`
  }
});

export default router