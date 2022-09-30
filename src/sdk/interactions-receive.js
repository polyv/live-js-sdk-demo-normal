import { updateConfig as updateInteractionsReceiveConfig } from '@polyv/interactions-receive-sdk';
import PubSub from 'jraiser/pubsub/1.2/pubsub';

import { TIME_STAMP } from '@/const';
import PolyvApi from '@/utils/api';
import * as PolyvUtil from '@/utils';

/** 互动 SDK 消息总线 */
export const plvIRMessageHub = new PubSub();
/** 互动 SDK 消息总线-事件列表 */
export const PlvIRMessageHubEvents = {
  /** 销毁 */
  DESTROY: 'destroy'
};

/**
 * 对 PolyvIRSDK 的二次封装
 * @see {@link https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/sdk/overview 互动功能接收端 SDK-概述}
 */
export default class PolyvInteractionsReceive {
  /** 用于存放单个 PolyvInteractionsReceive 实例 */
  static _instance = null;

  /**
   * 采用单例模式来实例化 PolyvInteractionsReceive
   * @param {Object} { config: store 中的 config, apiToken: 互动需要用到的 token，channelData: 直播 SDK 渠道数据初始化后得到的数据 }
   * @param {Object} { socket: 直播 SDK 实例 /聊天室 SDK 实例中的 socket 对象 }
   * @returns {PolyvInteractionsReceive} PolyvInteractionsReceive 实例
   * */
  static setInstance(...args) {
    if (!PolyvInteractionsReceive._instance) {
      PolyvInteractionsReceive._instance = new PolyvInteractionsReceive(...args);
    } else {
      console.warn('只允许实例化一次，当前返回上一个实例');
    }
    return PolyvInteractionsReceive._instance;
  }

  /**
   * 获取 PolyvInteractionsReceive 实例
   * @returns {PolyvInteractionsReceive} PolyvInteractionsReceive 实例
   * */
  static getInstance() {
    if (!PolyvInteractionsReceive._instance) {
      throw new Error('PolyvInteractionsReceive 未实例化');
    }
    return PolyvInteractionsReceive._instance;
  }

  /**
   * 构造函数
   * @param {Object} { config: store 中的 config, apiToken: 互动需要用到的 token，channelData: 直播 SDK 渠道数据初始化后得到的数据 }
   * @param {Object} { socket: 直播 SDK 实例 /聊天室 SDK 实例中的 socket 对象 }
   */
  constructor({ config, apiToken, channelData }, { socket }) {
    updateInteractionsReceiveConfig({
      channelInfo: {
        channelId: channelData.channelId,
        roomId: channelData.roomId,
        sessionId: channelData.sessionId
      },
      userInfo: {
        nick: config.nickname,
        pic: config.avatar,
        userId: config.userId,
      },
      socket,
      viewerApiToken: apiToken,
      getViewerApiToken: async (cb) => {
        const viewerApiToken = await this._getViewerApiToken(config);
        cb({ viewerApiToken });
      }
    });

    plvIRMessageHub.on(PlvIRMessageHubEvents.DESTROY, () => {
      this.destroy();
    });
  }

  /**
   * 频道 token 异步更新函数，需回调 viewerApiToken 数据
   * */
  async _getViewerApiToken(config) {
    const apiTokenParams = {
      appId: config.appId,
      timestamp: TIME_STAMP,
      channelId: config.channelId,
      viewerId: config.userId,
      nickName: this.config.nickname,
    };

    // ！！！不要在前端生成sign，此处仅供参考
    apiTokenParams.sign = PolyvUtil.getSign(
      config.appSecret,
      apiTokenParams
    );

    return await PolyvApi.getApiToken(apiTokenParams);
  }

  /**
   * 更新互动 SDK 中的昵称信息
   * @param {string} nick
   */
  updateNickName(nick) {
    updateInteractionsReceiveConfig({
      userInfo: {
        nick
      }
    });
  }

  /**
   * 更新互动 SDK 配置的 channelInfo 数据
   * @param {*} channelData
   */
  updateOriginChannelData(channelData) {
    updateInteractionsReceiveConfig({
      channelInfo: {
        channelId: channelData.channelId,
        roomId: channelData.roomId,
        sessionId: channelData.sessionId
      },
    });
  }

  /** 销毁钩子 */
  destroy() {
    // 需要销毁总线中监听的事件
    Object.values(PlvIRMessageHubEvents).forEach((eventType) => {
      plvIRMessageHub.off(eventType);
    });

    PolyvInteractionsReceive._instance = null;
  }
}
