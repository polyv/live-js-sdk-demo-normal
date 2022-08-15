<template>
  <div class="interactions-receive-entrance">
    <!-- 公告 -->
    <AnnouncementEntrance />
    <!-- 抽奖 -->
    <LotteryEntrance />
    <!-- 签到 -->
    <CheckInEntrance />
    <!-- 答题卡 -->
    <AnswerCardEntrance />
    <!-- 问卷 -->
    <QuestionnaireEntrance />
    <!-- 卡片推送 -->
    <PushCardEntrance />
    <!-- 条件抽奖 -->
    <WelfareLotteryEntrance />
  </div>
</template>

<script>
import AnnouncementEntrance from '@/components/interactions-receive/Announcement';
import LotteryEntrance from '@/components/interactions-receive/Lottery';
import CheckInEntrance from '@/components/interactions-receive/CheckIn';
import AnswerCardEntrance from '@/components/interactions-receive/AnswerCard';
import QuestionnaireEntrance from '@/components/interactions-receive/Questionnaire';
import PushCardEntrance from '@/components/interactions-receive/PushCard';
import WelfareLotteryEntrance from '@/components/interactions-receive/WelfareLottery';

export default {
  components: {
    AnnouncementEntrance,
    LotteryEntrance,
    CheckInEntrance,
    AnswerCardEntrance,
    QuestionnaireEntrance,
    PushCardEntrance,
    WelfareLotteryEntrance,
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
