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
    },
    supportTimeAxisMark(state) {
      const { liveStatus, channelDetail } = state;
      const timeShiftModel = channelDetail.timeShiftModel || {};

      if (liveStatus === 'live') {
        return ynToBool(timeShiftModel.timeShiftEnabled || 'N') && ynToBool(timeShiftModel.liveTimeAxisMarkEnabled || 'N');
      }

      return ynToBool(timeShiftModel.playbackTimeAxisMarkEnabled || 'N');
    },
    supportLiveTimeShift(state) {
      const { liveStatus, channelDetail } = state;
      const timeShiftModel = channelDetail.timeShiftModel || {};

      if (liveStatus === 'live') {
        return ynToBool(timeShiftModel.timeShiftEnabled || 'N');
      }

      return false;
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
