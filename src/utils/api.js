import request from '@/plugins/request';
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
    const res = await request.get('/v3/channel/basic/get', {
      params
    });

    const sessionList = await this.getSessionList(params);
    const latestedSessionId = Array.isArray(sessionList) && sessionList.length > 0 ? sessionList[0].sessionId : undefined;

    return {
      ...res.data,
      sessionId: latestedSessionId
    };
  }

  /** 获取频道详情 */
  static async getChannelDetail(params) {
    const res = await request.get('/v3/applet/sdk/get-channel-token-detail', {
      params
    });

    return {
      ...res.data,
    };
  }

  /**
   * 查询频道场次信息
   * @see {@link https://help.polyv.net/index.html#/live/api/channel/session/session_list 文档-查询频道场次信息}
   */
  static async getSessionList(params) {
    const res = await request.get('/v3/channel/session/data/list', {
      params
    });
    return res.data.contents;
  }

  /**
   * 获得聊天室的校验token
   * @see {@link https://help.polyv.net/index.html#/live/api/channel/operate/get_chat_token 文档-授权和连麦token}
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getChatToken(params) {
    const res = await request.get('/v3/channel/common/get-chat-token', {
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
    const res = await request.post('/v3/channel/watch/get-api-token', payload, {
      // 这里设置 Header 头是为了处理 POST 跨域
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }
    );
    return res.data.token;
  }

  /**
   * 查询频道商品库开关状态
   * @see {@link https://help.polyv.net/index.html#/live/api/channel/operate/get_channel_product_enabled 文档-查询频道商品库开关状态}
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getProductEnable(params) {
    const res = await request.get('/v3/channel/product/get-enabled', {
      params
    });
    return res.data.enabled;
  }

  /**
   * 查询频道打赏设置
   * @see {@link https://help.polyv.net/index.html#/live/api/v4/channel/donate/get 文档-查询频道打赏设置(新版)}
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async getDonateConfig(params) {
    const res = await request.get('/v4/channel/donate/get', {
      params
    });
    return res.data;
  }

  /**
   * 发送打赏消息
   * @see {@link https://help.polyv.net/index.html#/live/api/live_interaction/send_reward_msg 文档-发送打赏消息}
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   */
  static async sendRewardMsg(params) {
    const payload = qs.stringify(params);
    const res = await request.post('/v3/channel/chat/send-reward-msg', payload, {
      // 这里设置 Header 头是为了处理 POST 跨域
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }
    );
    return res.data;
  }

}
