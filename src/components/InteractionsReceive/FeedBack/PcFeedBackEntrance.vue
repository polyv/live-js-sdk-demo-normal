<template>
  <div class="pc-feedback-entrance"
       @click="handleClickFeedBack">
    <i class="pc-feedback-entrance-icon"></i>
    <span>举报反馈</span>
  </div>
</template>

<script>
import { FeedBackMessageHub, FeedBackMessageHubEvents } from './mixin';

export default {
  name: 'PC-FeedBackEntrance',
  methods: {
    handleClickFeedBack() {
      FeedBackMessageHub.trigger(FeedBackMessageHubEvents.FEED_BACK_VISIBLE, true);
    }
  },
};
</script>

<style lang="scss" scoped>
.pc-feedback-entrance {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.pc-feedback-entrance-icon {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  background-image: url('./imgs/icon-feed.png');
}
</style>
