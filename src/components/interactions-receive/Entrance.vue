<template>
  <div class="interactions-receive-entrance">
    <AnnouncementEntrance />
    <LotteryEntrance />
    <CheckInEntrance />
    <AnswerCardEntrance />
  </div>
</template>

<script>
import AnnouncementEntrance from '@/components/interactions-receive/Announcement';
import LotteryEntrance from '@/components/interactions-receive/Lottery';
import CheckInEntrance from '@/components/interactions-receive/CheckIn';
import AnswerCardEntrance from '@/components/interactions-receive/AnswerCard';

export default {
  components: {
    AnnouncementEntrance,
    LotteryEntrance,
    CheckInEntrance,
    AnswerCardEntrance,
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
