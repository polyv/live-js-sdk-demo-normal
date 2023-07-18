import Vue from 'vue';
import Vuex from 'vuex';
import base from './base';
import config from './config';
import webview from './webview';
import player from './player';
import * as PolyvUtil from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 方便组件内共享 isMobile
    isMobile: PolyvUtil.isMobile(),
  },
  modules: {
    base,
    config,
    webview,
    player
  }
});
