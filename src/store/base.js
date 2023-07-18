import { ynToBool } from '@/utils';

export default {
  namespaced: true,

  state: {
    liveStatus: 'end',
    channelDetail: {},
  },

  getters: {
    watchFeedbackEnabled(state) {
      return ynToBool(state.channelDetail.watchFeedbackEnabled || 'N');
    }
  },

  mutations: {
    setLiveStatus(state, data) {
      state.liveStatus = data;
    },
    setChannelDetail(state, data) {
      state.channelDetail = data;
    }
  }
};
