<template>
  <div class="interactions-receive-entrance">
    <AnnouncementEntrance />
    <LotteryEntrance />
    <CheckInEntrance />
    <AnswerCardEntrance />
    <QuestionnaireEntrance />
    <PushCardEntrance />
  </div>
</template>

<script>
import AnnouncementEntrance from '@/components/interactions-receive/Announcement';
import LotteryEntrance from '@/components/interactions-receive/Lottery';
import CheckInEntrance from '@/components/interactions-receive/CheckIn';
import AnswerCardEntrance from '@/components/interactions-receive/AnswerCard';
import QuestionnaireEntrance from '@/components/interactions-receive/Questionnaire';
import PushCardEntrance from '@/components/interactions-receive/PushCard';

export default {
  components: {
    AnnouncementEntrance,
    LotteryEntrance,
    CheckInEntrance,
    AnswerCardEntrance,
    QuestionnaireEntrance,
    PushCardEntrance,
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
