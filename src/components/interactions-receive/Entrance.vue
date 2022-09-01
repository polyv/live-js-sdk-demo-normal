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
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
};
</script>

<style lang="scss">
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

  &__mobile {
    padding-left: 8px;
  }
}

.aside-right-wrapper {
  position: absolute;
  right: 16px;
  bottom: 90px;

  &__mobile {
    bottom: 172px;
  }
}

.push-card-entrance, .welfare-lottery-entrance {
  margin-top: 8px;
}
</style>
