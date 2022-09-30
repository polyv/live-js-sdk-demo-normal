import request from '@/plugin/request';
import qs from 'qs';

/**
 * {@link https://help.polyv.net/index.html#/live/api/ 直播服务端 API}
 */
export default class PolyvApi {
  /**
   * 获得频道基础信息
   * @see {@link https://help.polyv.net/index.html#/live/api/channel/operate/get_channel_detail_setting 文档-查询频道信息}
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
   * @see {@link https://help.polyv.net/index.html#/live/api/channel/operate/get_chat_token 文档-授权和连麦token}
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getChatToken(params) {
    const res = await request.get('/channel/common/get-chat-token', {
      params
    });
    return res.data;
  }

  /**
   * 获取观众观看调用接口token, 用于一些互动的功能接口的请求,如点赞.
   * @see {@link https://help.polyv.net/index.html#/live/api/channel/operate/get_api_token 文档-获取观众观看调用接口token}
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getApiToken(params) {
    const payload = qs.stringify(params);
    const res = await request.post('/channel/watch/get-api-token', payload, {
      // 这里设置 Header 头是为了处理 POST 跨域
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }
    );
    return res.data.token;
  }

}
