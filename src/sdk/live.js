import PubSub from 'jraiser/pubsub/1.2/pubsub';
import { Notify } from 'vant';

import { TIME_STAMP } from '@/const';
import * as PolyvUtil from '@/utils';

import $store from '@/store';
import { usePlayerAction } from '@/hooks/usePlayerAction';

/** 用于创建直播 JS-SDK 的类 */
const PolyvLiveSdk = window.PolyvLiveSdk;

/** 直播消息总线 */
export const plvLiveMessageHub = new PubSub();
/** 直播消息总线-事件列表 */
export const PlvLiveMessageHubEvents = {
  /** 渠道数据初始化 */
  CHANNEL_DATA_INIT: 'channelDataInit',
  /** 播放器初始化 */
  PLAYER_INIT: 'playerInit',
  /** 移动端播放器精彩看点按钮点击事件 */
  MOBILE_PLAYER_HIGHLIGHTS_BTN_CLICKED: 'mobilePlayerHighlightsBtnClicked',
  /** 播放器时间更新 */
  PLAYER_TIME_UPDATE: 'playerTimeUpdate',
  /** 点赞互动 */
  INTERACTIVE_LIKE: 'interactiveLike',
  /** 修改昵称 */
  SET_NICK_NAME: 'setNickName',
  /** 销毁 */
  DESTROY: 'destroy',
  /** 视频流状态转换 */
  STREAM_UPDATE: 'streamConvertToLive'
};

/**
 * 对 PolyvLiveSdk 进行二次封装
 * @see {@link https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api 直播 JS-SDK API文档}
 */
export default class PolyvLive {
  /** 用于存放单个 PolyvLive 实例 */
  static _instance = null;

  /**
   * 采用单例模式来实例化 PolyvLive
   * @param {Object} { config: store 中的 config, apiToken: 互动需要用到的 token }
   * @param {Object} { socket: 聊天室 SDK 实例中的 socket 数据 }
   * @param {Object} { controllerEl: 控制栏区域，playerEl: 讲师区域，pptEl: 文档播放器区域 }
   * @returns {PolyvLive} PolyvLive 实例
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
   * 获取 PolyvLive 实例
   * @returns {PolyvLive} PolyvLive 实例
   * */
  static getInstance() {
    if (!PolyvLive._instance) {
      throw new Error('PolyvLive 未实例化');
    }
    return PolyvLive._instance;
  }

  /**
   * 构造函数
   * @param {Object} { config: store 中的 config, apiToken: 互动需要用到的 token }
   * @param {Object} { socket: 聊天室 SDK 实例中的 socket 对象 }
   * @param {Object} { controllerEl: 控制栏区域，playerEl: 讲师区域，pptEl: 文档播放器区域 }
   * @returns {PolyvLive}
   */
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
   * {@link https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_sdk 初始化直播JS-SDK}
   */
  createLiveSdk() {
    const { config } = this;

    // ！！！不要在前端生成sign，此处仅供参考
    const sign = PolyvUtil.getSign(config.appSecret, {
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
      param4: config.param4, // 统计参数param4
      param5: config.param5, // 统计参数param5
    });
  }

  /**
   * 监听直播JS-SDK的事件
   * @see {@link https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=事件列表 事件列表}
   */
  bindSdkEventListener() {
    // 监听频道信息并初始化播放器
    this.liveSdk.on(PolyvLiveSdk.EVENTS.CHANNEL_DATA_INIT, (event, data) => {
      $store.commit('base/setChannelDetail', data);
      $store.commit('base/setLiveStatus', data.status === 'Y' ? 'live' : 'unknown');

      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.CHANNEL_DATA_INIT, { channelData: data });
      this.createLiveSdkPlayer(data);
      this.bindPlayerLowLatencyEvent();
    }
    );

    // 监听流状态变化
    this.liveSdk.on(PolyvLiveSdk.EVENTS.STREAM_UPDATE, (event, status) => {
      $store.commit('base/setLiveStatus', status);

      // 非直播状态，需要移除时移打点支持，并重载播放器
      if (status !== 'live') {
        $store.commit('base/setChannelDetail', {
          ...$store.state.base.channelDetail,
          timeShiftModel: {}
        });
        this.liveSdk.reloadPlayer();
      }

      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.STREAM_UPDATE, { status });
    });

    // 监听修改状态
    this.liveSdk.on(PolyvLiveSdk.EVENTS.SET_NICK_STATUS, function(event, resp) {
      if (resp.status === 'success') {
        // 修改成功，需要页面记录设置的昵称以便下次进来用同样的昵称
        console.info(`修改昵称成功，新的昵称为：${resp.nick}`);
        plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.SET_NICK_NAME, { nick: resp.nick });
      } else {
        console.info(`修改昵称失败 ${resp.message}`);
      }
    });
  }

  /**
   * {@link https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=实例方法 创建播放器}
   */
  createLiveSdkPlayer(data) {
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
      fixedController: false,
      controllerEl: els.controllerEl,
      type: config.playerType,
      vid: config.vid,
      pptNavBottom: '80px',
      barrage: true, // 是否开启弹幕
      defaultBarrageStatus: true,
      autoplay: true, // 是否自动播放
      lowLatency: true, // 是否使用无延迟，设置为 true 后，SDK 内部会自行判断支不支持,
      lowLatencyConfig: {
        // 是否显示每个人的控制栏, 默认显示，如果没有视频或者关闭摄像头则还会显示
        controls: true,
        // 是否隐藏每个人的昵称, 默认显示
        hideNickname: false,
        /*
        * 默认按 http://wiki.igeeker.org/pages/viewpage.action?pageId=106267167 的主讲模式排版
        * 设置后非主讲按每个人宽 1/3, 宽高 16/9显示，在一行显示，鼠标或者左右滑切换,建议在小尺寸和移动端使用
        */
        drag: true
      },
      rtc: true, // 在非无延迟的频道里面设置后可进行连麦，sdk会加载连麦sdk并返回实例
      /**
       * 直播时移
       * @warn 如果需要在移动端全屏状态下使用时移和打点功能，需要额外传入 webPageFullScreen 和 fullScreenOrientation 选项
       * */
      timeShift: true,
      /** 直播打点，需要优先设置 timeShift */
      liveTimeAxisMark: true,
      /** 回放打点 */
      playbackTimeAxisMark: true,
    });

    this.bindPlayerEvents();
    plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.PLAYER_INIT, { data });
  }

  /**
   * 播放器-绑定播放器相关事件
   */
  bindPlayerEvents() {
    this.liveSdk.player.on('loadedmetadata', () => {
      const { getDurationTime } = usePlayerAction();

      const { volume } = this.liveSdk.player;

      $store.commit('player/updatePlayerInfo', {
        durationTime: getDurationTime(),
        volume,
      });
    });

    this.liveSdk.player.on('timeupdate', () => {
      const { getCurrentTime, getDurationTime } = usePlayerAction();

      const currentTime = getCurrentTime();
      const durationTime = getDurationTime();

      $store.commit('player/updatePlayerInfo', {
        currentTime,
        durationTime,
      });

      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.PLAYER_TIME_UPDATE, { currentTime, durationTime });
    });

    this.liveSdk.player.on('keyPointUpdate', ({ list }) => {
      $store.commit('player/setTimeAxisMarkList', list);
    });

    this.liveSdk.player.on('highlightsBtnClicked', () => {
      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.MOBILE_PLAYER_HIGHLIGHTS_BTN_CLICKED);
    });
  }

  /**
   * 播放器-绑定无延迟相关事件
   */
  bindPlayerLowLatencyEvent() {
    const player = this.liveSdk.player;
    const isEnableLowLatency = player.lowLatency;
    console.info('isEnableLowLatency', isEnableLowLatency);
    if (!isEnableLowLatency) return;

    player.on('networkQuality', function(stats) {
      if (stats.downlink === 3) {
        Notify('当前网络状态较差，建议切换网络观看');
      }
    });
  }

  /** 检查当前系统设备是否支持 rtc 连线 */
  checkSystemRequirements() {
    return PolyvLiveSdk.checkSystemRequirements();
  }

  getRTCInstance() {
    return this.liveSdk.player.rtcInstance;
  }

  /** 销毁钩子 */
  destroy() {
    // 直播JS-SDK销毁, 默认销毁时会断开socket的连接
    this.liveSdk.destroy();
    this.socket = null;

    // 需要销毁总线中监听的事件
    Object.values(PlvLiveMessageHubEvents).forEach((eventType) => {
      plvLiveMessageHub.off(eventType);
    });

    // 销毁单例
    PolyvLive._instance = null;
  }
}
