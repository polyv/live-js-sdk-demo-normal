<template>
  <section class="mobile-rtc-panel">
    <div class="rtc-list">
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

export default {
  name: 'mobile-rtc-panel',
  data() {
    return {
      localRtcDetail: null,
      rtcList: [],
      rtc: null,
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
      const { rtc, toolkit } = this;
      switch (type) {
        case 'applyAndStop':
          if (rtc.rtcConnected) {
            rtc.leaveChannel(false);
          } else if (rtc.applyStatus) {
            this.cancelApply();
            rtc.cancelJoinChannel();
            toolkit.cancel();
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
        case 'switch':
          this.switchFacingModeHandle();
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
    bindRTCEvent() {
      const plive = PolyvLive.getInstance();
      const rtc = plive.getRTCInstance();

      // 讲师-开启连麦
      rtc.on('OPEN_MICROPHONE', () => {
        if (!plive.checkSystemRequirements()) {
          this.$dialog.alert({ message: '讲师开始连麦，但是当前设备不支持' });
          return;
        }
        console.warn('讲师开启连麦');
        this.rtc = rtc;
        this.toolkit = Toolkit(this.toolkitHandle, (type) => {
          const lang = {
            apply: '申请连线',
            calling: '请求中...',
          };
          return lang[type];
        });
        this.toolkit.show();
      });

      // 讲师-关闭连麦
      rtc.on('CLOSE_MICROPHONE', () => {
        console.warn('讲师关闭连麦');
        this.resetComponentState();
      });

      // 本地流流初始化成功
      rtc.on('INIT_LOCAL_STREAM_READY', (evt) => {
        console.warn('INIT_LOCAL_STREAM_READY', evt);
        this.localRtcDetail = evt;
        const $localVideo = this.$refs['rtc-box-local-video'];
        evt.init({
          element: $localVideo,
          playCallBack: (err) => {
            console.error('INIT_LOCAL_STREAM_READY', err);
          },
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

      rtc.on('LEAVE_CHANNEL_SUCCESS', (evt) => {
        this.resetComponentState();
      });
    },

    resetComponentState() {
      this.localRtcDetail = null;
      this.rtcList = [];

      this.toolkit.hide();
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
    background-color: bisque;
    // &.rtc-box-local.only-one {
    //   max-width: 100%;
    // }
    &.rtc-box-other {
      pointer-events: none;
    }
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
</style>
