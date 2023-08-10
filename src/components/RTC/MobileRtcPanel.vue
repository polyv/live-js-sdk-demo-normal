<template>
  <section class="mobile-rtc-panel">
    <div :class="{
      'rtc-list': true,
      'rtc-list--audio': microPhoneType === 'audio'
    }">
      <div :class="{'rtc-box':true,'rtc-box-local':true,'only-one': isOnlyOneRTCBox}"
           v-show="localRtcDetail">
        <div class="rtc-box-video"
             ref="rtc-box-local-video">
        </div>
      </div>
      <div class="rtc-box rtc-box-other"
           v-for="rtcItem in rtcList"
           :key="rtcItem.streamId">
        <div class="rtc-box-video"
             :ref="'rtc-box-other-video-'+rtcItem.streamId">
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import PolyvLive from '@/sdk/live';
import Toolkit from './MobileRTCPlayerToolkit';

/** 单例处理 */
let _existToolKit = null;

export default {
  name: 'Mobile-RTC-Panel',
  data() {
    return {
      /** 主播是否开启连麦 */
      enableRemoteConnect: false,
      microPhoneType: 'video',
      localRtcDetail: null,
      rtcList: [],
      toolkit: null,
    };
  },
  computed: {
    isOnlyOneRTCBox() {
      return this.rtcList.length === 0;
    },
  },
  created() {
    this.initRTC();
  },
  methods: {
    toolkitHandle(type) {
      const plive = PolyvLive.getInstance();
      const rtc = plive.getRTCInstance();
      const { toolkit } = this;

      switch (type) {
        case 'applyAndStop':
          if (rtc.rtcConnected) {
            rtc.leaveChannel(false);
          } else if (rtc.applyStatus) {
            toolkit.cancel();
            rtc.cancelJoinChannel();
          } else {
            rtc.joinChannel();
            toolkit.apply();
          }
          break;
        case 'camera':
          rtc.toggleDevice('video');
          break;
        case 'mic':
          rtc.toggleDevice('audio');
          break;
        case 'sliderOn':
          toolkit.sliderOn();
          break;
        case 'sliderOff':
          toolkit.sliderOff();
          break;
        default:
          break;
      }
    },
    initRTC() {
      const plive = PolyvLive.getInstance();
      const player = plive.liveSdk.player;

      // rtc 初始化回调
      player.on('rtcInitialized', () => {
        this.bindRTCEvent();
      });
    },
    /**
     * {@link https://help.polyv.net/index.html#/live/js/live_js_sdk/live_video_chat 连麦接入}
     */
    bindRTCEvent() {
      const plive = PolyvLive.getInstance();
      const player = plive.liveSdk.player;
      const rtc = plive.getRTCInstance();
      const $masterVideo = document.querySelector(
        '#plv-mobile-master-rtc-player'
      );

      // 主播-开启连麦
      rtc.on('OPEN_MICROPHONE', (evt) => {
        if (!plive.checkSystemRequirements()) {
          this.$dialog.alert({ message: '主播开始连麦，但是当前设备不支持' });
          return;
        }
        console.warn('主播开启连麦');
        this.enableRemoteConnect = true;
        this.microPhoneType = evt.type; // video/audio (视频/音频通话)
        if (!_existToolKit) {
          _existToolKit = Toolkit(this.toolkitHandle, (type) => {
            const lang = {
              apply: '申请连线',
              calling: '请求中...',
            };
            return lang[type];
          });
        }
        this.toolkit = _existToolKit;
        this.toolkit.show();
      });

      // 主播-关闭连麦
      rtc.on('CLOSE_MICROPHONE', () => {
        console.warn('主播关闭连麦');
        this.enableRemoteConnect = false;
        this.resetComponentState();
        // 如果是接通状态下，关闭连麦后，rtc 会触发 LEAVE_CHANNEL_SUCCESS 钩子
      });

      // 本地流流初始化成功
      rtc.on('INIT_LOCAL_STREAM_READY', (evt) => {
        // 非无延迟连麦时会走 CDN 混流，这里隐藏原本的播放器，并暂停，在 USER_STREAM_ADDED 中订阅 master 流展示再另外的 DOM 容器中
        if (!player.lowLatency) {
          player.pause();
        }

        this.localRtcDetail = evt;
        const $localVideo = this.$refs['rtc-box-local-video'];
        evt.init({
          element: $localVideo,
          playConfig: {
            fit: 'contain',
          },
        });
      });
      // 推流成功
      rtc.on('PUBLIC_STREAM_SUCCESS', () => {
        console.warn('PUBLIC_STREAM_SUCCESS');
        this.toolkit.success('video');
      });

      // 挂断/结束连线/被主播下麦/主播结束连麦，重置状态
      rtc.on('LEAVE_CHANNEL_SUCCESS', (evt) => {
        console.warn(evt);
        player.play();
        $masterVideo.style.setProperty('display', 'none');
        this.resetComponentState();
        if (this.enableRemoteConnect) {
          this.toolkit.show();
        }
      });

      // 监听频道中其他流并且订阅
      // 注意，无延迟场景下该事件不会触发，由sdk内部处理
      rtc.on('USER_STREAM_ADDED', (evt) => {
        function sub(evt, $video) {
          evt.subscribe({
            element: $video,
            playConfig: {
              fit: 'contain',
            },
          });
        }

        console.warn('USER_STREAM_ADDED', evt.nick, evt.streamId, evt.master);
        if (!evt.master) {
          this.rtcList.push(evt);
          this.$nextTick(() => {
            const $video = this.$refs[`rtc-box-other-video-${evt.streamId}`][0];
            sub(evt, $video);
          });
        } else {
          $masterVideo.style.setProperty('display', 'block');
          sub(evt, $masterVideo);
        }
      });
      rtc.on('USER_STREAM_SUBSCRIBED', (evt) => {
        console.warn('订阅成功', evt.streamId);
      });

      // 切换主讲
      // 注意，无延迟场景下该事件不会触发，由sdk内部处理
      rtc.on('SWITCH_MASTER', (evt) => {
        console.warn('切换主讲');
        const currentUser = evt.currentUser;
        const previousUser = evt.previousUser;

        // 上一个主讲，只在离开的情况为空
        const previousElement = previousUser.element;
        // 当前需要设置的主讲
        const currentElement = currentUser.element;

        rtc.remove(currentUser.streamId);

        // 上一个是因为离开才切换的
        if (previousUser.leave) {
          // 设置到主讲位置
          rtc.play(currentUser.streamId, {
            element: document.getElementById('plv-mobile-master-rtc-player'),
          });

          // 上一个主讲已经离开，不需要原来的位置了，删掉元素
          const pn = currentElement.parentNode;
          pn && pn.removeChild(currentElement);
        } else {
          // 设置到上一个主讲位置
          rtc.remove(previousUser.streamId);
          rtc.play(currentUser.streamId, {
            element: previousElement,
          });

          // 不是因为离开才切换的需要重新播放上一个主讲的流到新的位置
          rtc.play(previousUser.streamId, {
            element: currentElement,
          });
        }
      });

      // 有用户离开，删除相应节点
      // 注意，无延迟场景下该事件不会触发，有sdk内部处理
      rtc.on('USER_PEER_LEAVE', (evt) => {
        console.warn('USER_PEER_LEAVE', evt.streamId);
        this.rtcList = this.rtcList.filter(
          (rtcItem) => rtcItem.streamId !== evt.streamId
        );
      });

      // 处理声音对应的开闭钩子
      rtc.on('LOCAL_MUTE_AUDIO', (evt) => {
        this.toolkit.toggleMic(true);
      });
      rtc.on('LOCAL_UNMUTE_AUDIO', (evt) => {
        this.toolkit.toggleMic(false);
      });
      // 处理摄像头对应的开闭钩子
      rtc.on('LOCAL_MUTE_VIDEO', (evt) => {
        this.toolkit.toggleCamera(true);
      });
      rtc.on('LOCAL_UNMUTE_VIDEO', (evt) => {
        this.toolkit.toggleCamera(false);
      });

      // 收到主讲邀请连麦信息
      rtc.on('INVITE_TO_MICROPHONE', () => {
        rtc.openInviting();
      });
    },

    resetComponentState() {
      this.localRtcDetail = null;
      this.rtcList = [];

      this.toolkit && this.toolkit.hide();
      this.rtc = null;
    },
  },
};
</script>

<style lang="scss">
.pc-rtc-panel {
  position: relative;
  height: 100%;
  background: #202127;
  overflow: hidden;
}

.rtc-list {
  display: flex;
  overflow-y: hidden;
  overflow-x: auto;

  .rtc-box {
    position: relative;
    display: inline-block;
    max-width: 33%;
    flex: 1;
    background-color: #202127;
    border: 1px solid #3e3e4e;
    // &.rtc-box-local.only-one {
    //   max-width: 100%;
    // }
    pointer-events: none;
  }
  .rtc-box:before {
    content: '';
    padding-top: 56.25%;
    display: block;
  }
  .rtc-box-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.rtc-list--audio {
  .rtc-box {
    &::after {
      content: '音频连麦中';
      position: absolute;
      top: 0;
      color: #fff;
      font-size: 14px;
      height: 100%;
      width: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .rtc-box-local {
    &::after {
      content: '(我)音频连麦中';
    }
  }
}

</style>
