import Vue from 'vue';
import Vuex from 'vuex';
import config from './config';
import * as PolyvUtil from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isMobile: PolyvUtil.isMobile(),
  },
  modules: {
    config
  }
});
