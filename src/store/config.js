export default {
  namespaced: true,

  state: {
    channelId: '',
    appId: '',
    appSecret: '',
    playerType: 'auto',
    vid: '',
  },

  getters: {
    /**
     * 没有配置config内的channelId, appId, appSecret时, 需要通过登录页获得参数从而加载观看页
     * */
    isNeedLogin(config) {
      return !config.channelId || !config.appId || !config.appSecret;
    }
  },

  mutations: {
    setBasicInfo(config, data) {
      config.appId = data.appId;
      config.appSecret = data.appSecret;
      config.channelId = data.channelId;

      // 设置回放模式后的参数设置
      if (data.playbackMode) {
        config.playerType = 'vod';
        config.vid = data.vid;
      }
    }
  },
};
