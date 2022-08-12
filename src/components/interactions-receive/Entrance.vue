<template>
  <div class="interactions-receive-entrance">
    <AnnouncementEntrance />
    <LotteryEntrance />
    <CheckInEntrance />
  </div>
</template>

<script>
import AnnouncementEntrance from '@/components/interactions-receive/Announcement';
import LotteryEntrance from '@/components/interactions-receive/Lottery';
import CheckInEntrance from '@/components/interactions-receive/CheckIn';

export default {
  components: {
    AnnouncementEntrance,
    LotteryEntrance,
    CheckInEntrance,
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
