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
    <PushCardEntrance class="push-card-entrance" />
    <!-- 条件抽奖 -->
    <WelfareLotteryEntrance class="welfare-lottery-entrance" />
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
  position: absolute;
  right: 16px;
  bottom: 220px;
  z-index: 2;
}
/* 需要大于播放器控制条的 z-inedx */
.plv-iar-modal, .plv-iar-push-card {
  z-index: 2001;
}
</style>
<style lang="scss" scoped>
.push-card-entrance, .welfare-lottery-entrance {
  margin-top: 8px;
}
</style>
