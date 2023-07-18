export default {
  namespaced: true,

  state: {
    liveStatus: 'end'
  },

  mutations: {
    setLiveStatus(state, data) {
      state.liveStatus = data;
    }
  }
};
