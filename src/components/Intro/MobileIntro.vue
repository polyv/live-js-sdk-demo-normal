<template>
  <section v-if="channelData">
    <div class="tab-intro-info">
      <img class="tab-intro-info__logo"
           :src="channelData.coverImage" />
      <div class="tab-intro-info__inner">
        <p class="tab-intro-info__title">
          {{ channelData.name }}
        </p>
        <p class="tab-intro-info__time">
          {{ (channelData.startTime || '— —') +'|' + channelData.pageView + '次观看' }}
        </p>
        <watch-status />
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
import WatchStatus from '@/components/WatchStatus/WatchStatus.vue';

export default {
  components: { WatchStatus },
  name: 'Mobile-Intro',
  props: {
    channelData: {
      type: [Object, null],
      default: null,
    },
    descContent: {
      type: String,
      default: '',
    },
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

.tab-intro .tab-intro-info__status::after {
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 2px;
  font-size: 12px;
  padding: 4px;
  border: 1px solid;
  line-height: 1;
}

.tab-intro .tab-intro-info__status--nolive::after {
  border-color: hsla(0, 0%, 100%, .6);
  color: hsla(0, 0%, 100%, .6);
  content: '暂无直播';
}

.tab-intro .tab-intro-info__status--playback::after {
  color: #78a7ed;
  border-color: #78a7ed;
  content: '回放中';
}

.tab-intro .tab-intro-info__status--live::after {
  color: #f06e6e;
  border-color: #f06e6e;
  content: '进行中';
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
  background: url(~@/assets/person.png) no-repeat;
  background-size: 16px 16px;
  margin-right: 2px;
}

.tab-intro .tab-intro-author__like-ico {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: text-top;
  background: url(~@/assets/like.png) no-repeat;
  background-size: 14px 14px;
  margin-right: 2px;
}

.tab-intro .tab-intro-desc {
  padding: 20px 16px;
  color: #adadc0;
  white-space: pre-wrap;
  font-size: 16px;
}
</style>
