import Vue from 'vue';
import Vuex from 'vuex';
import config from './config';
import * as PlvUtil from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isMobile: PlvUtil.isMobile(),
  },
  modules: {
    config
  }
});
