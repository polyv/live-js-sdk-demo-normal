import request from './request';
import qs from 'querystring';

export default class PolyvApi {
  /**
   * 获得频道基础信息
   * https://help.polyv.net/index.html#/live/api/channel/operate/get_channel_detail_setting
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getChannelInfo(params) {
    const res = await request.get('/channel/basic/get', {
      params
    });
    return res.data;

  }

  /**
   * 获得聊天室的校验token
   * https://help.polyv.net/index.html#/live/api/channel/operate/get_chat_token
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getChatToken(params) {
    const res = await request.get('/channel/common/get-chat-token', {
      params
    });
    return res.data;
  }

  /**
   * 获取观众观看调用接口token, 部分SDK的接口会用到这个token
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getApiToken(params) {
    const payload = qs.stringify(params);
    const res = await request.post('/channel/watch/get-api-token', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }
    );
    return res.data.token;
  }

}
