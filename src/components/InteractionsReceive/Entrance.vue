<template>
  <div :class="{
    'interactions-receive-entrance': true,
    'interactions-receive-entrance__mobile': isMobile,
  }">
    <!-- 公告 -->
    <AnnouncementEntrance />
    <section :class="{
      'bottom-wrapper': true,
      'bottom-wrapper__mobile': isMobile,
    }">
      <!-- 抽奖 -->
      <LotteryEntrance />
      <!-- 签到 -->
      <CheckInEntrance />
      <!-- 答题卡 -->
      <AnswerCardEntrance />
      <!-- 问卷 -->
      <QuestionnaireEntrance />
    </section>
    <section :class="{
      'aside-right-wrapper': true,
      'aside-right-wrapper__mobile': isMobile,
    }">
      <!-- 卡片推送 -->
      <PushCardEntrance class="push-card-entrance" />
      <!-- 条件抽奖 -->
      <WelfareLotteryEntrance class="welfare-lottery-entrance" />
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import AnnouncementEntrance from './Announcement';
import LotteryEntrance from './Lottery';
import CheckInEntrance from './CheckIn';
import AnswerCardEntrance from './AnswerCard';
import QuestionnaireEntrance from './Questionnaire';
import PushCardEntrance from './PushCard';
import WelfareLotteryEntrance from './WelfareLottery';

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
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
};
</script>

<style lang="scss">
.plv-iar-pendant {
  padding-top: 40px !important;
}
.interactions-receive-entrance {
  position: relative;
  top: 0;
  width: 100%;
  height: 0;
  /* 需要大于播放器控制条的 z-inedx */
  z-index: 2001;
  &__mobile {
    z-index: 0;
  }
}
/* 需要大于播放器控制条的 z-inedx */
.plv-iar-modal, .plv-iar-push-card {
  z-index: 2001;
}
</style>
<style lang="scss" scoped>
.bottom-wrapper {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 4px 0 4px 8px;
  background: #202127;

  max-width: 80%;
  overflow-x: auto;

  &__mobile {
    max-width: 100%;
    padding: 0 8px;
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #46464f;
  }
}

.aside-right-wrapper {
  position: absolute;
  right: 16px;
  bottom: 75px;

  &__mobile {
    bottom: 156px;
  }
}

.push-card-entrance, .welfare-lottery-entrance {
  margin-top: 8px;
}
</style>
