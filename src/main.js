import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import Modal from '@/components/common/Modal.vue';

Vue.config.productionTip = false;
Vue.component('modal', Modal);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
