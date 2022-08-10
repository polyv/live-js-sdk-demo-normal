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
  PPT: 'ppt',
  ALONE: 'alone',
};
