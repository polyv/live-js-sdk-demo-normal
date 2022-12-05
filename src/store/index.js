import Vue from 'vue';
import Vuex from 'vuex';
import config from './config';
import webview from './webview';
import * as PolyvUtil from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 方便组件内共享 isMobile
    isMobile: PolyvUtil.isMobile(),
  },
  modules: {
    config,
    webview
  }
});
