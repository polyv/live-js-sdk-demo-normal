import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import Modal from '@/components/common/Modal.vue';

// 全局注册模态框
Vue.component('modal', Modal);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
