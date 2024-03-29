import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    /** 观看页 */
    path: '/watch',
    name: 'Watch',
    component: () => import('./views/WatchLayout.vue')
  },
  {
    /** 登录页 */
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue')
  }
];

const router = new VueRouter({
  mode: process.env.VUE_APP_BUILD_MODE === 'STATIC' ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
