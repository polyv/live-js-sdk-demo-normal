/** Babel 兼容方案 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/plugins/vant';

import Modal from '@/components/Base/Modal';

// 确保 vue-demi 正常安装
import { install } from 'vue-demi';
install();

// 全局注册模态框
Vue.component('modal', Modal);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
