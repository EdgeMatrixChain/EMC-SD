import { nextTick } from 'vue';
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/app';

export const loadingBarApiRef: any = {};

export default function createAppRouter(routes: any) {
  console.info(`create app router base url is ${__PUBLIC_PATH__}`);

  const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes,
  });

  router.beforeEach(function (to, from, next) {
    if (!from || to.path !== from.path) {
      if (loadingBarApiRef.value) {
        loadingBarApiRef.value.start();
      }
    }
    const title = to.meta.title ? to.meta.title : 'Edge Matrix SD';
    useUserStore().setTitle(`${title}`);
    next();
  });

  router.afterEach(function (to, from) {
    if (!from || to.path !== from.path) {
      if (loadingBarApiRef.value) {
        loadingBarApiRef.value.finish();
      }
      if (to.hash && to.hash !== from.hash) {
        nextTick(() => {
          const el = document.querySelector(to.hash);
          if (el) el.scrollIntoView();
        });
      }
    }
  });

  return router;
}
