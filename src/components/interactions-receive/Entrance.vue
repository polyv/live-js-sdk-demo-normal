<template>
  <div class="interactions-receive-entrance">
    <AnnouncementEntrance />
    <LotteryEntrance />
  </div>
</template>

<script>
import AnnouncementEntrance from '@/components/interactions-receive/Announcement';
import LotteryEntrance from '@/components/interactions-receive/Lottery';

export default {
  components: {
    AnnouncementEntrance,
    LotteryEntrance,
  },
};
</script>

<style lang="scss">
.interactions-receive-entrance {
  position: relative;
  /* 需要大于播放器控制条的 z-inedx */
  z-index: 2001;
}
</style>
