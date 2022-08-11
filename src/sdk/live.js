import { TIME_STAMP } from '@/const';
import * as PlvUtils from '@/utils';
import PubSub from 'jraiser/pubsub/1.2/pubsub';

const $ = window.$;
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

const PlayerControlHandler = {
  // 全屏/退出全屏回调
  handleFullscreenChange(isFullScreen, fullScreenElement) {
    if (isFullScreen) {
      $(fullScreenElement).addClass('plv-watch-pc__top--fullscreen');
    } else {
      $(fullScreenElement).removeClass('plv-watch-pc__top--fullscreen');
    }
  },
  // 控制栏切换按钮的点击处理函数，仅适用PC端
  handleSwitchPlayer() {
    const switchPosition = this.mainPosition === 'ppt' ? 'player' : 'ppt';
    PlayerControlHandler.switchPlayer.call(this, switchPosition);
  },
  // 切换主副屏，如需兼容ie，建议通过css的方式去切换位置，dom操作可能导致播放器异常
  switchPlayer(nextMainPosition) {
    const pcScreens = $('.plv-watch-pc__screen').removeClass(
      'plv-watch-pc__screen-main plv-watch-pc__screen-sub'
    );

    switch (nextMainPosition) {
      case 'player':
        pcScreens.eq(0).addClass('plv-watch-pc__screen-sub');
        pcScreens.eq(1).addClass('plv-watch-pc__screen-main');
        break;

      case 'ppt':
        pcScreens.eq(0).addClass('plv-watch-pc__screen-main');
        pcScreens.eq(1).addClass('plv-watch-pc__screen-sub');
        break;
    }

    this.mainPosition = nextMainPosition;
    // ppt容器宽高修改，调用resize刷新ppt尺寸
    this.liveSdk.player.resize();
    // 刷新弹幕显示区域尺寸
    this.liveSdk.player.resizeBarrage();
  }
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

    /** 主视图位置，用于记录当前主屏幕是文档还是播放器 */
    this.mainPosition = 'ppt';

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

    // 渲染点赞按钮
    // 渲染直播状态小控件
    plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.PLAYER_INIT, data);

    // 监听直播JS-SDK的播放器事件，请参考实例 player 对象的事件
    this.liveSdk.player.on('fullscreenChange', PlayerControlHandler.handleFullscreenChange.bind(this)
    );
    // 点击控制栏切换按钮触发
    this.liveSdk.player.on('switchPlayer', PlayerControlHandler.handleSwitchPlayer.bind(this));
    this.liveSdk.player.on('switchMainScreen', PlayerControlHandler.switchPlayer.bind(this));
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
