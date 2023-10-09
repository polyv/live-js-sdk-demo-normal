<template>
  <section class="tab-intro">
    <div class="tab-intro-info">
      <img class="tab-intro-info__logo"
           :src="channelData.coverImage" />
      <div class="tab-intro-info__inner">
        <p class="tab-intro-info__title">
          {{ channelData.name }}
        </p>
        <p class="tab-intro-info__time">
          {{ (channelData.startTime || '— —') +'|' + channelData.pageView + '次访问' }}
        </p>
        <watch-status isMobile />
        <span v-show="isShowLowLatencyIcon"
              class="tab-intro-info__low-latency"></span>
      </div>
    </div>
    <div class="tab-intro-author">
      <div class="tab-intro-author__publisher">
        <span class="tab-intro-author__publisher-ico"></span>
        <span>{{ channelData.publisher  }}</span>
      </div>
      <div class="tab-intro-author__like">
        <span class="tab-intro-author__like-ico"></span>
        <span id="intro-likes">{{ channelData.likes }}</span>
      </div>
    </div>
    <div class="tab-intro-desc"
         v-html="descContent">
    </div>
  </section>
</template>

<script>
import WatchStatus from './WatchStatus.vue';
import PolyvLive, {
  plvLiveMessageHub,
  PlvLiveMessageHubEvents,
} from '@/sdk/live';

export default {
  name: 'Mobile-Intro',
  components: { WatchStatus },
  data() {
    return {
      channelData: {
        pageView: 0,
      },
      descContent: '',
      isShowLowLatencyIcon: false,
    };
  },
  created() {
    // 播放器初始化
    plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, ({ data }) => {
      this.channelData = data;

      const desMenu = data.channelMenus.find((i) => i.menuType === 'desc');
      this.descContent = desMenu ? desMenu.content : '';

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
/* 移动端直播介绍 */
.tab-intro {
  overflow-y: auto;
}

.tab-intro .tab-intro-info {
  position: relative;
  padding: 16px;
  display: flex;
}
.tab-intro .tab-intro-info__logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}
.tab-intro-info__inner {
  position: relative;
  flex: 1;
}
.tab-intro-info__title {
  color: #fff;
  line-height: 20px;
  font-size: 16px;
}

.tab-intro .tab-intro-info__time {
  margin-top: 8px;
  color: #adadc0;
  line-height: 1;
  font-size: 12px;
}

.tab-intro .tab-intro-author {
  display: flex;
  padding: 10px 16px;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-size: 12px;
  color: #adadc0;
}

.tab-intro-author__publisher {
  flex: 1;
}

.tab-intro .tab-intro-author__publisher-ico {
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: bottom;
  background: url(~@/assets/chat-imgs/person.png) no-repeat;
  background-size: 16px 16px;
  margin-right: 2px;
}

.tab-intro .tab-intro-author__like-ico {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: text-top;
  background: url(~@/assets/chat-imgs/like.png) no-repeat;
  background-size: 14px 14px;
  margin-right: 2px;
}

.tab-intro .tab-intro-desc {
  padding: 20px 16px;
  color: #adadc0;
  white-space: pre-wrap;
  font-size: 16px;
}

.tab-intro .tab-intro-info__low-latency {
  float: right;

  margin-top: -3px;
  width: 58px;
  height: 18px;

  background-image: url(./imgs/low-latency-bg-mob.svg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
