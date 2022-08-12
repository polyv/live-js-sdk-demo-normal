import { updateConfig as updateInteractionsReceiveConfig } from '@polyv/interactions-receive-sdk';

import { TIME_STAMP } from '@/const';
import PolyvApi from '@/utils/api';
import * as PolyvUtil from '@/utils';

export default class PolyvInteractionsReceive {
  static _instance = null;

  /**
   * 采用单例模式来实例化
   * @returns {PolyvInteractionsReceive}
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
   * 获取实例
   * @returns {PolyvInteractionsReceive}
   * */
  static getInstance() {
    if (!PolyvInteractionsReceive._instance) {
      throw new Error('PolyvInteractionsReceive 未实例化');
    }
    return PolyvInteractionsReceive._instance;
  }

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
  }

  async _getViewerApiToken(config) {
    const apiTokenParams = {
      appId: config.appId,
      timestamp: TIME_STAMP,
      channelId: config.channelId,
      viewerId: config.userId,
    };

    // ！！！不要在前端生成sign，此处仅供参考
    apiTokenParams.sign = PolyvUtil.getSign(
      config.appSecret,
      apiTokenParams
    );

    return await PolyvApi.getApiToken(apiTokenParams);
  }

  updateNickName(nick) {
    updateInteractionsReceiveConfig({
      userInfo: {
        nick
      }
    });
  }
}
