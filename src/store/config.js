import { PlvChatUserType, USER_ID } from '@/const';

export default {
  namespaced: true,

  state: {
    channelId: '', // 频道号
    appId: '', // 直播后台AppID(应用ID)
    appSecret: '', // ！！！不建议 appSecret 暴露在前端中

    // 以下三个值应设置为用户系统中的对应值，本 demo 生成方式仅供演示
    nickname: '观众' + USER_ID, // 昵称, 可以设置为用户系统中的用户昵称
    avatar: 'https://livestatic.videocc.net/assets/wimages/missing_face.png', // 聊天室头像, 可以设置为用户系统中的用户头像
    userId: 'polyv' + USER_ID, // 设置用户id, 可以设置为用户系统里的用户 id

    role: 'viewer', // 角色, 用于获取授权和连麦token http://api.polyv.net/live/v3/channel/common/get-chat-token
    chat: {
      userType: PlvChatUserType.STUDENT,
      // 在 preRender 函数中，移动端会添加 ppt 的 tab。自定义菜单栏文档: https://help.polyv.net/index.html#/live/js/chat_js_sdk_api?id=自定义菜单栏
      tabData: [
        {
          name: '聊天', // 菜单栏名称
          type: 'chat' // 菜单栏类型, 有3个已有的内置类型(chat, user-list, ask),详情请参考文档
        },
        {
          name: '提问',
          type: 'ask'
        }
      ]
    },

    playerType: 'auto', // 播放器播放类型， 默认auto
    vid: '' // 回放id, 用于回放模式时设置对应的回放
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
    },
    updateChat(config, data) {
      config.chat = {
        ...config.chat,
        ...data,
      };
    }
  },
};
