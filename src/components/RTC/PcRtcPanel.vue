<template>
  <section class="pc-rtc-panel">
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

    <button class="setting-btn"
            @click="handleSetting"
            v-if="buttonCtrl.settingBtnVisible">
      设备检测
    </button>

    <div class="rtc-btn-group">
      <button class="btn btn-apply"
              v-if="buttonCtrl.appalyBtnVisible"
              @click="handleApply">
        <i class="btn__icon"></i>
        <span class="btn__text">申请连线</span>
      </button>
      <button class="btn btn-cancel"
              v-if="buttonCtrl.cancelBtnVisible"
              @click="handleCancel">
        <i class="btn__icon"></i>
        <span class="btn__text">取消申请</span>
      </button>
      <button class="btn btn-stop"
              v-if="buttonCtrl.stopBtnVisible"
              @click="handleStop">
        <i class="btn__icon"></i>
        <span class="btn__text">结束连线</span>
      </button>
    </div>
  </section>
</template>

<script>
import PolyvLive from '@/sdk/live';

export default {
  name: 'pc-rtc-panel',
  data() {
    return {
      localRtcDetail: null,
      rtcList: [],
      buttonCtrl: {
        settingBtnVisible: true,
        appalyBtnVisible: true,
        cancelBtnVisible: false,
        stopBtnVisible: false,
      },
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
    // 打开设备调试
    handleSetting() {
      const plive = PolyvLive.getInstance();
      const rtc = plive.getRTCInstance();
      rtc && rtc.openDeviceSetting();
    },
    // 申请连麦
    handleApply() {
      const plive = PolyvLive.getInstance();
      const rtc = plive.getRTCInstance();
      rtc && rtc.joinChannel();
      this.buttonCtrl = {
        appalyBtnVisible: false,
        settingBtnVisible: true,
        cancelBtnVisible: true,
        stopBtnVisible: false,
      };
    },
    // 取消申请连麦
    handleCancel() {
      const plive = PolyvLive.getInstance();
      const rtc = plive.getRTCInstance();
      rtc.cancelJoinChannel();
      this.buttonCtrl = {
        settingBtnVisible: true,
        appalyBtnVisible: true,
        cancelBtnVisible: false,
        stopBtnVisible: false,
      };
    },
    // 挂断连麦
    handleStop() {
      const plive = PolyvLive.getInstance();
      const rtc = plive.getRTCInstance();
      rtc && rtc.leaveChannel();
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
        this.$emit('open');
      });

      // 讲师-关闭连麦
      rtc.on('CLOSE_MICROPHONE', () => {
        console.warn('讲师关闭连麦');
        this.$emit('close');
        this.resetComponentState();
      });

      // 本地流流初始化成功
      rtc.on('INIT_LOCAL_STREAM_READY', (evt) => {
        this.localRtcDetail = evt;
        const $localVideo = this.$refs['rtc-box-local-video'];
        // 准备推流，设置推流参数
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
        this.buttonCtrl = {
          settingBtnVisible: false,
          appalyBtnVisible: false,
          cancelBtnVisible: false,
          stopBtnVisible: true,
        };
      });

      // 挂断/结束连线/被讲师下麦，重置状态
      rtc.on('LEAVE_CHANNEL_SUCCESS', (evt) => {
        this.resetComponentState();
      });

      // 监听频道中其他流并且订阅，注意，无延迟场景下该事件不会触发，由sdk内部处理
      rtc.on('USER_STREAM_ADDED', (evt) => {
        function sub(evt, $video) {
          evt.subscribe({
            element: $video,
            playConfig: {
              fit: 'contain',
            },
          });
        }

        console.warn(evt.nick, evt.streamId, '加入');
        if (!evt.master) {
          this.rtcList.push(evt);
          this.$nextTick(() => {
            const $video = this.$refs[`rtc-box-other-video-${evt.streamId}`][0];
            sub(evt, $video);
          });
        } else {
          const $video = document.getElementById('playerRTC');
          sub(evt, $video);
        }
      });
      rtc.on('USER_STREAM_SUBSCRIBED', (evt) => {
        console.warn('订阅成功', evt.streamId);
      });

      // 切换主讲，注意，无延迟场景下该事件不会触发，由sdk内部处理
      rtc.on('SWITCH_MASTER', (evt) => {
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
            element: document.getElementById('playerRTC'),
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

      // 有用户离开，删除相应节点，注意，无延迟场景下该事件不会触发，有sdk内部处理
      rtc.on('USER_PEER_LEAVE', (evt) => {
        console.warn('USER_PEER_LEAVE', evt.streamId);
        this.rtcList = this.rtcList.filter(
          (rtcItem) => rtcItem.streamId !== evt.streamId
        );
      });
    },
    resetComponentState() {
      this.localRtcDetail = null;
      this.rtcList = [];
      this.buttonCtrl = {
        settingBtnVisible: true,
        appalyBtnVisible: true,
        cancelBtnVisible: false,
        stopBtnVisible: false,
      };
    },
  },
};
</script>

<style lang="scss">
@mixin scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #46464F;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
    box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
  }
}

.pc-rtc-panel {
  position: relative;
  height: 100%;
  background: #202127;
  overflow: hidden;
}

$rtxBtnGroupHeight: 42px;

.rtc-list {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: $rtxBtnGroupHeight;
  overflow-y: auto;
  overflow-x: hidden;
  @include scrollbar();

  .rtc-box {
    position: relative;
    display: inline-block;
    max-width: 50%;
    flex: 1;
    background-color: bisque;
    &.rtc-box-local.only-one {
      max-width: 100%;
    }
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

.setting-btn {
  position: absolute;
  left: 50%;
  bottom: $rtxBtnGroupHeight + 10;
  transform: translateX(-50%);

  padding: 0 16px;
  height: 32px;
  font-size: 14px;
  border-radius: 18px;
  background: #3e3e4e;
  color: #e4e4e4;
  cursor: pointer;
}

.rtc-btn-group {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: $rtxBtnGroupHeight;
  background: #3e3e4e;
  .btn {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    background: #3e3e4e;
    cursor: pointer;
    .btn__icon {
      display: inline-block;
      width: 24px;
      height: 24px;
    }
    .btn__text {
      font-size: 14px;
      margin-left: 8px;
      color: #fff;
    }
  }

  $btn-status: (
    'apply' #fff url(./imgs/btn-icon-default.png),
    'cancel' #FF5B5B url(./imgs/btn-icon-hangup.png),
    'stop' #FF5B5B url(./imgs/btn-icon-hangup.png),
  );

  @each $status, $textColor, $bg in $btn-status {
    .btn-#{$status} {
      .btn__icon {
        background-image: $bg;
        background-size: 100% 100%;
      }
      .btn__text { color: $textColor; }
    }
  }
}
</style>
