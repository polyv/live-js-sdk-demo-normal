import { formatTime } from '@/utils';

export default {
  namespaced: true,
  state: {
    currentTime: 0,
    durationTime: 0,
    volume: 0,
  },
  getters: {
    currentTimeText(state) {
      return formatTime(state.currentTime);
    },
    durationTimeText(state) {
      return formatTime(state.durationTime);
    }
  },
  mutations: {
    updatePlayerInfo(state, data) {
      for (const key in data) {
        state[key] = data[key];
      }
    }
  }
};
