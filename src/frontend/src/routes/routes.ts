export const routes = [
  {
    path: '/',
    redirect: { path: '/home' },
    component: () => import('@/layout/app/index.vue'),
    children: [
      {
        name: 'home',
        path: 'home',
        component: () => import('@/pages/home/home.vue'),
        meta: {
          title: 'Welcome',
        },
      },
      {
        name: 'txt2img',
        path: 'txt2img',
        component: () => import('@/pages/txt2img/txt2img.vue'),
        meta: {
          title: 'Text To Image',
        },
      },
      {
        name: 'img2img',
        path: 'img2img',
        component: () => import('@/pages/img2img/img2img.vue'),
        meta: {
          title: 'Image To Image',
        },
      },
    ],
  },

  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/not-found/not-found.vue'),
  },
];
