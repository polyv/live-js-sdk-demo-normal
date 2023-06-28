<template>
  <li ref="mobile-feedback-entrance"
      @click="handleClickFeedBack">
    <span class="polyv-input-more-icon mobile-feedback-entrance-icon"
          data-status="false"></span>
    <span>举报反馈</span>
  </li>
</template>

<script>
import { FeedBackMessageHub, FeedBackMessageHubEvents } from './mixin';

export default {
  name: 'Mobile-FeedBackEntrance',
  mounted() {
    this.customMountEl();
  },
  methods: {
    customMountEl() {
      const $morePanel = document.querySelector('.polyv-more-control-list');
      const $li = this.$refs['mobile-feedback-entrance'];
      $morePanel.appendChild($li);
    },
    handleClickFeedBack() {
      FeedBackMessageHub.trigger(FeedBackMessageHubEvents.FEED_BACK_VISIBLE, true);
    }
  },
};
</script>

<style lang="scss" scoped>
.mobile-feedback-entrance-icon {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  background-image: url('./imgs/icon-menu-feed-back.png');
}
</style>
