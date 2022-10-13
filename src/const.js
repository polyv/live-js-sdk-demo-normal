/**
 * @file 相关常量
 */

/** 时间戳 */
export const TIME_STAMP = +new Date();

/** 用户 id。应设为用户系统中的用户 id，本 demo 生成方式仅供演示 */
export const USER_ID = new Date().getTime().toString() + (10000 + parseInt(Math.random() * 90000));

/** 聊天室用户类型 */
export const PlvChatUserType = {
  /** 普通直播默认值 */
  STUDENT: 'student',
  /** 三分屏直播需要设置的值 */
  SLICE: 'slice'
};

/** 直播场景 */
export const PlvChannelScene = {
  /** 三分屏 */
  PPT: 'ppt',
  /** 活动拍摄 */
  ALONE: 'alone',
};

/** 主副屏切换映射表 */
export const MainScreenMap = {
  player: {
    value: 'player',
    next: 'ppt',
  },
  ppt: {
    value: 'ppt',
    next: 'player'
  }
};

/** Tab 类型 */
export const TabNavType = {
  /** 聊天 */
  CHAT: 'chat',
  /** 提问 */
  ASK: 'ask',
  /** 文档 */
  PPT: 'ppt',
  /** 直播介绍 */
  INTRO: 'intro',
  /** 商品库/边买边看 */
  PRODUCT: 'porduct',
  /** 连线/连麦 */
  RTC: 'rtc'
};

/**
 * 获取默认聊天配置
 */
export const getDefaultConfigChat = () => {
  return {
    userType: PlvChatUserType.STUDENT,
    /** @see {@link https://help.polyv.net/index.html#/live/js/chat_js_sdk_api?id=自定义菜单栏 自定义菜单栏 } */
    tabData: [
      {
        name: '聊天', // 菜单栏名称
        type: TabNavType.CHAT // 菜单栏类型, 有3个已有的内置类型(chat, user-list, ask),详情请参考文档
      },
      {
        name: '提问',
        type: TabNavType.ASK
      }
    ]
  };
};
