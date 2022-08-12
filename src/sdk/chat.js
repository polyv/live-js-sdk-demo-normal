import PubSub from 'jraiser/pubsub/1.2/pubsub';

const PolyvChatRoom = window.PolyvChatRoom; // 聊天室JS-SDK

/** 聊天室消息总线 */
export const plvChatMessageHub = new PubSub();
export const PlvChatMessageHubEvents = {
  ROOM_MESSAGE: 'roomMessage',
  DESTROY: 'destroy'
};

export default class PolyvChat {
  static _instance = null;

  /**
   * 采用单例模式来实例化
   * @returns {PolyvChat}
   * */
  static setInstance(...args) {
    if (!PolyvChat._instance) {
      PolyvChat._instance = new PolyvChat(...args);
    } else {
      console.warn('只允许实例化一次，当前返回上一个实例');
    }
    return PolyvChat._instance;
  }

  /**
   * 获取实例
   * @returns {PolyvChat}
   * */
  static getInstance() {
    if (!PolyvChat._instance) {
      throw new Error('PolyvChat 未实例化');
    }
    return PolyvChat._instance;
  }

  constructor({ config, chatInfo }, { chatContainer }) {
    if (PolyvChat._instance) {
      console.warn('只允许实例化一次，当前返回上一个实例');
      return PolyvChat._instance;
    }

    const chatroom = this.createChatRoom({ config, chatInfo }, { chatContainer });
    this.chatroom = chatroom;
    this.socket = chatroom.chat.socket;

    plvChatMessageHub.on(PlvChatMessageHubEvents.DESTROY, () => { this.destroy(); });
  }

  /**
   * 初始化聊天室
   * 聊天室参数的设置可以参考文档 https://help.polyv.net/index.html#/live/js/chat_js_sdk_api
   */
  createChatRoom({ config, chatInfo }, { chatContainer }) {
    return new PolyvChatRoom({
      roomId: config.channelId,
      userId: config.userId,
      pic: config.avatar,
      accountId: '',
      // nick: config.nickname, // 固定昵称
      enableSetNickname: true, // 开启设置昵称功能
      userType: config.chat.userType, // 用户类型, 默认为student，三分屏场景下学员需设置为slice,
      width: '100%',
      height: '100%',
      version: '2.0',
      role: 'viewer', // 角色, 用于获取授权和连麦token http://api.polyv.net/live/v3/channel/common/get-chat-token
      token: chatInfo.token, // 授权校验码
      mediaChannelKey: chatInfo.mediaChannelKey, // 连麦token, 注， 目前聊天室JS-SDK还不支持连麦
      container: chatContainer,
      enableWelcome: true, // 是否开启欢迎语，默认为true
      enableFlower: true, // 是否开启送花功能，默认为true
      enableOnlyTeacher: true, // 是否开启只看讲师功能，默认为true
      tabData: config.chat.tabData,
      enableLike: false,
      roomMessage: (data) => {
        // data为聊天室socket消息，当有聊天室消息时会触发此方法
        const event = data.EVENT;
        if (event === 'sendMessage' || event === 'SPEAK') {
          plvChatMessageHub.trigger(PlvChatMessageHubEvents.ROOM_MESSAGE, {
            data: data.content
          });
        }
      },
      customChatColor: {
        selfBgColor: '#2b2c35',
        selfColor: '#fff',
        otherBgColor: '#2b2c35',
        otherColor: '#fff',
        specialBgColor: '#2b2c35',
        specialColor: '#fff'
      }
    });

  }

  destroy() {
    this.chatroom = null;
    this.socket = null;

    Object.values(PlvChatMessageHubEvents).forEach(eventType => {
      plvChatMessageHub.off(eventType);
    });
    PolyvChat._instance = null;
  }
}
