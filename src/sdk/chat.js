import PubSub from 'jraiser/pubsub/1.2/pubsub';

/** 用于创建聊天室 JS-SDK 的类 */
const PolyvChatRoom = window.PolyvChatRoom; // 聊天室JS-SDK

/** 聊天室消息总线 */
export const plvChatMessageHub = new PubSub();
/** 聊天室消息总线-事件列表 */
export const PlvChatMessageHubEvents = {
  /** 聊天室消息变化 */
  ROOM_MESSAGE: 'roomMessage',
  /** 销毁 */
  DESTROY: 'destroy'
};

/**
 * 对 PolyvChatRoom 进行二次封装
 * @see {@link https://help.polyv.net/index.html#/live/js/chat_js_sdk_api 聊天室 JS-SDK API文档}
 */
export default class PolyvChat {
  /** 用于存放单个 PolyvChat 实例 */
  static _instance = null;

  /**
   * 采用单例模式来实例化 PolyvChat
   * @param {Object} { config: store 中的 config, chatInfo: 聊天室需要的授权信息}
   * @param {Object} { chatContainer: 用于嵌入默认聊天室样式的 DOM }
   * @returns {PolyvChat} PolyvChat 实例
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
   * 获取 PolyvChat 实例
   * @returns {PolyvChat} PolyvChat 实例
   * */
  static getInstance() {
    if (!PolyvChat._instance) {
      throw new Error('PolyvChat 未实例化');
    }
    return PolyvChat._instance;
  }

  /**
   * 构造函数
   * @param {Object} { config: store 中的 config, chatInfo: 聊天室需要的授权信息}
   * @param {Object} { chatContainer: 用于嵌入默认聊天室样式的 DOM }
   * @returns {PolyvChat} PolyvChat 实例
   */
  constructor({ config, chatInfo }, { chatContainer }) {
    if (PolyvChat._instance) {
      console.warn('只允许实例化一次，当前返回上一个实例');
      return PolyvChat._instance;
    }

    const chatroom = this.createChatRoom({ config, chatInfo }, { chatContainer });
    this.chatroom = chatroom;
    this.socket = chatroom.chat.socket;

    plvChatMessageHub.on(PlvChatMessageHubEvents.DESTROY, () => {
      this.destroy();
    });
  }

  /**
   * {@link https://help.polyv.net/index.html#/live/js/chat_js_sdk_api 初始化聊天室}
   */
  createChatRoom({ config, chatInfo }, { chatContainer }) {
    return new PolyvChatRoom({
      roomId: config.channelId,
      userId: config.userId,
      pic: config.avatar,
      accountId: '',
      // nick: config.nickname, // 固定昵称
      enableSetNickname: true, // 开启设置昵称功能
      userType: config.chat.userType,
      width: '100%',
      height: '100%',
      version: '2.0',
      role: config.role, // 角色
      token: chatInfo.token, // 授权校验码
      mediaChannelKey: chatInfo.mediaChannelKey, // 连麦token, 注， 目前聊天室JS-SDK还不支持连麦
      container: chatContainer,
      enableWelcome: true, // 是否开启欢迎语，默认为true
      enableFlower: false, // 是否开启送花功能，默认为true
      enableOnlyTeacher: true, // 是否开启只看讲师功能，默认为true
      tabData: config.chat.tabData,
      enableLike: false,
      showUserList: false,
      roomMessage: (data) => {
        // data为聊天室 socket 消息，当有聊天室消息时会触发此方法
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

  /** 销毁钩子 */
  destroy() {
    this.chatroom = null;
    this.socket = null;

    // 需要销毁总线中监听的事件
    Object.values(PlvChatMessageHubEvents).forEach(eventType => {
      plvChatMessageHub.off(eventType);
    });

    // 销毁单例
    PolyvChat._instance = null;
  }
}
