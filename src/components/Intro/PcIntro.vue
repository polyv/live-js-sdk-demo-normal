<template>
  <div class="plv-watch-pc__intro">
    <img class="plv-watch-pc__intro__logo"
         src="https://live.polyv.cn/assets/wimages/pc_images/logo.png" />
    <div class="plv-watch-pc__intro__desc">
      <p class="plv-watch-pc__intro__desc__name">
        {{ channelData.name }}
        <watch-status />
        <span class="plv-watch-pc__intro__low-latency"
              v-show="isShowLowLatencyIcon"></span>
      </p>
      <span class="plv-watch-pc__intro__desc__publisher-ico"></span>
      <span class="plv-watch-pc__intro__desc__publisher">
        {{ channelData.publisher }}
      </span>
      <span class="plv-watch-pc__intro__desc__view">
        {{ channelData.pageView + ' 次观看' }}
      </span>
    </div>
    <div class="plv-watch-pc__intro__right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
import PolyvLive, {
  plvLiveMessageHub,
  PlvLiveMessageHubEvents,
} from '@/sdk/live';
import WatchStatus from './WatchStatus.vue';

export default {
  name: 'PC-Intro',
  components: { WatchStatus },
  data() {
    return {
      channelData: {
        pageView: 0,
      },
      isShowLowLatencyIcon: false,
    };
  },
  created() {
    // 播放器初始化
    plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, ({ data }) => {
      this.channelData = data;

      const plive = PolyvLive.getInstance();
      const isLiveStatus = data.status === 'Y';
      const isEnableLowLatency = plive.liveSdk.player.lowLatency;
      this.isShowLowLatencyIcon = isLiveStatus && isEnableLowLatency;
    });

    // 监听流状态变化
    plvLiveMessageHub.on(
      PlvLiveMessageHubEvents.STREAM_UPDATE,
      ({ status }) => {
        if (status !== 'live') {
          this.isShowLowLatencyIcon = false;
        }
      }
    );
  },
};
</script>

<style lang="scss">
/* 频道信息 */
.plv-watch-pc__intro {
  position: relative;
  padding: 30px 0;
  color: #fff;
  font-size: 0;
}
.plv-watch-pc__intro__logo {
  width: 50px;
  height: 100%;
  margin-right: 10px;
}
.plv-watch-pc__intro__desc {
  display: inline-block;
  vertical-align: top;
}
.plv-watch-pc__intro__desc__name {
  margin-bottom: 8px;
  line-height: 24px;
  font-size: 18px;
}
.plv-watch-pc__intro__desc__publisher-ico {
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  background: url('~@/assets/chat-imgs/person.png') no-repeat;
  background-size: 18px 18px;
  margin-right: 4px;
}
.plv-watch-pc__intro__desc__publisher,
.plv-watch-pc__intro__desc__view {
  font-size: 14px;
  vertical-align: middle;
}
.plv-watch-pc__intro__desc__publisher::after {
  content: '|';
  margin: 0 16px;
}

.plv-watch-pc__intro__low-latency {
  float: right;
  position: relative;
  top: -2px;
  width: 68px;
  height: 22px;
  background-image: url(./imgs/low-latency-bg.svg);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  margin-left: 13px;
}

.plv-watch-pc__intro__right {
  position: absolute;
  right: 0;
  bottom: 30px;
  font-size: 14px;
}
</style>
