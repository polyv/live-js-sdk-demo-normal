import { TIME_STAMP } from '@/const';
import * as PlvUtils from '@/utils';
import PubSub from 'jraiser/pubsub/1.2/pubsub';

const PolyvLiveSdk = window.PolyvLiveSdk; // 直播JS-SDK

/** 直播消息总线 */
export const plvLiveMessageHub = new PubSub();
export const PlvLiveMessageHubEvents = {
  PLAYER_INIT: 'playerInit',
  INTERACTIVE_LIKE: 'interactiveLike',
  DESTROY: 'destroy',
  /** 流状态转换 */
  STREAM_UPDATE: 'streamConvertToLive'
};

export default class PolyvLive {
  static _instance = null;

  /**
   * 采用单例模式来实例化
   * @returns {PolyvLive}
   * */
  static setInstance(...args) {
    if (!PolyvLive._instance) {
      PolyvLive._instance = new PolyvLive(...args);
    } else {
      console.warn('只允许实例化一次，当前返回上一个实例');
    }
    return PolyvLive._instance;
  }

  /**
   * 获取实例
   * @returns {PolyvLive}
   * */
  static getInstance() {
    if (!PolyvLive._instance) {
      throw new Error('PolyvLive 未实例化');
    }
    return PolyvLive._instance;
  }

  constructor({ config, apiToken }, { socket }, { controllerEl, playerEl, pptEl }) {
    if (PolyvLive._instance) {
      console.warn('只允许实例化一次，当前返回上一个实例');
      return PolyvLive._instance;
    }

    this.config = config;
    this.socket = socket;
    this.els = {
      controllerEl,
      playerEl,
      pptEl
    };

    this.liveSdk = this.createLiveSdk();
    this.liveSdk.setApiToken(apiToken);
    this.bindSdkEventListener();

    plvLiveMessageHub.on(PlvLiveMessageHubEvents.DESTROY, () => { this.destroy(); });
  }

  /**
   * 发送弹幕,封装了一下弹幕的方法
   */
  sendBarrage(text, color) {
    const barrageColor = color || '#000'; // 弹幕默认颜色 #000
    if (this.liveSdk && this.liveSdk.player) {
      this.liveSdk.player.sendBarrage(text, barrageColor);
    }
  }

  /**
   * 初始化直播JS-SDK
   * 文档： https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_sdk
   */
  createLiveSdk() {
    const { config } = this;

    // ！！！不要在前端生成sign，此处仅供参考
    const sign = PlvUtils.getSign(config.appSecret, {
      appId: config.appId,
      channelId: config.channelId,
      timestamp: TIME_STAMP
    });

    return new PolyvLiveSdk({
      channelId: config.channelId,
      sign: sign,
      timestamp: TIME_STAMP,
      appId: config.appId,
      socket: this.socket, // 注：同时接入直播JS-SDK和聊天室JS-SDK需要设置该值， socket对象需要在聊天室初始化后才能拿到。
      user: {
        userId: config.userId,
        userName: config.nickname,
        pic: config.avatar
      },
      param4: '播放器自定义统计参数4',
      param5: '播放器自定义统计参数5'
    });
  }

  /**
   * 监听直播JS-SDK的事件
   * 事件列表: https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=事件列表
   */
  bindSdkEventListener() {
    // 监听频道信息并初始化播放器
    this.liveSdk.on(PolyvLiveSdk.EVENTS.CHANNEL_DATA_INIT, (...args) => {
      this.createLiveSdkPlayer(...args);
    }
    );
    // 监听流状态变化
    this.liveSdk.on(PolyvLiveSdk.EVENTS.STREAM_UPDATE, (event, status) => {
      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.STREAM_UPDATE, { status });
    });
  }

  /**
   * 创建播放器
   * 文档: https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=实例方法
   */
  createLiveSdkPlayer(event, data) {
    function _getEnableEl(el) {
      return typeof el === 'string' ? el : `#${el.id}`;
    }

    const { els, config, liveSdk } = this;

    liveSdk.setupPlayer({
      el: _getEnableEl(els.playerEl),
      pptEl: typeof els.pptEl === 'undefined' ? els.pptEl : _getEnableEl(els.pptEl),
      // TODO 文档上说可以传 DOM，但实际上只能传 id 或者 class 让内部库去 querySelector
      // el: els.playerEl,
      // pptEl: els.pptEl,
      pptPlaceholder: true,
      switchPlayer: true,
      controllerPosition: 'ppt',
      fixedController: true,
      controllerEl: els.controllerEl,
      type: config.playerType,
      vid: config.vid,
      pptNavBottom: '80px',
      barrage: true, // 是否开启弹幕
      defaultBarrageStatus: true,
      autoplay: false
    });

    plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.PLAYER_INIT, data);
  }

  destroy() {
    // 直播JS-SDK销毁, 默认销毁时会断开socket的连接
    this.liveSdk.destroy();
    this.socket = null;

    Object.values(PlvLiveMessageHubEvents).forEach((eventType) => {
      plvLiveMessageHub.off(eventType);
    });
    PolyvLive._instance = null;
  }
}
