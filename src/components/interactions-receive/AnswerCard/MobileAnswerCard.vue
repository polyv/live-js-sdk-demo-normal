<template>
  <div name="mobile-answer-card">
    <entrance-icon v-if="entranceVisible"
                   :name="entrance.name"
                   :icon="entrance.icon"
                   :open="handleClickEntranceIcon" />
    <!-- 普通答题 -->
    <modal :title="answerCardTitle"
           :visible="isShowAnswerCard"
           :close-on-click-modal="false"
           :closable="true"
           @close="onSetAnswerCardVisible(false)">
      <answer-card :answer-card-sdk="answerCardSdk"
                   :delayTime="1000"
                   @to-show="onSetAnswerCardVisible(true)"
                   @to-hide="onSetAnswerCardVisible(false)"
                   @status-changed="onStatusChanged"
                   @success-submit="onSuccessSubmit" />
    </modal>
    <!-- 快速问答 -->
    <modal :title="quickAnswerCardTitle"
           :visible="isShowQuickAnswerCard"
           :close-on-click-modal="false"
           :closable="false">
      <quick-answer-card :height="100"
                         :delayTime="1000"
                         :answer-card-sdk="answerCardSdk"
                         @to-show="(question)=>onSetQuickAnswerCardVisible(true,question)"
                         @to-hide="(question)=>onSetQuickAnswerCardVisible(false,question)"
                         @success-submit="onSuccessSubmit" />
    </modal>
  </div>
</template>

<script>
import { AnswerCard as AnswerCardSDK } from '@polyv/interactions-receive-sdk';
import AnswerCard from '@polyv/interactions-receive-sdk-ui-default/lib/MobileAnswerCard';
import QuickAnswerCard from '@polyv/interactions-receive-sdk-ui-default/lib/MobileQuickAnswer';
import EntranceIcon from '../EntranceIcon.vue';

export default {
  components: {
    AnswerCard,
    QuickAnswerCard,
    EntranceIcon,
  },

  data() {
    return {
      entranceVisible: false,
      entrance: {
        name: '答题卡',
        icon: require('@/assets/ir-imgs/icon-answerCard.png'),
      },
      // 是否为快速问答
      isQuickAnswer: false,
      // 答题卡SDK实例
      answerCardSdk: null,
      // 是否显示普通答题卡
      isShowAnswerCard: false,
      // 普通答题外部弹窗（容器）标题
      answerCardTitle: '',
      // 是否显示快速问答
      isShowQuickAnswerCard: false,
      // 快速问答外部弹窗（容器）标题
      quickAnswerCardTitle: '',
    };
  },

  created() {
    this.answerCardSdk = new AnswerCardSDK();
    this.answerCardSdk.on(
      this.answerCardSdk.events.STOP_TEST_QUESTION,
      this.onStopTestQuestion
    );
  },

  beforeDestroy() {
    this.answerCardSdk.off(
      this.answerCardSdk.events.STOP_TEST_QUESTION,
      this.onStopTestQuestion
    );
    this.answerCardSdk.destroy();
    this.answerCardSdk = null;
  },

  methods: {
    handleClickEntranceIcon() {
      this.isQuickAnswer
        ? this.onSetQuickAnswerCardVisible(true)
        : this.onSetAnswerCardVisible(true);
    },

    onSetAnswerCardVisible(visible) {
      this.isQuickAnswer = false;
      this.isShowAnswerCard = visible;
    },

    onSetQuickAnswerCardVisible(visible, question) {
      this.isQuickAnswer = true;
      this.isShowQuickAnswerCard = visible;
      if (visible) {
        this.entranceVisible = visible;
      }

      if (question) {
        if (question.type === this.answerCardSdk.questionTypes.CheckBox) {
          this.quickAnswerCardTitle = '【多选】';
        } else {
          this.quickAnswerCardTitle = '【单选】';
        }
      }
    },

    onStatusChanged(status) {
      if (status === 'isShowResult' || status === 'isShowAnswer') {
        this.entranceVisible = false;
        this.answerCardTitle = this.answerCardSdk.curSubmittedAnswer
          ? '答题结果'
          : '未作答';
      } else {
        this.entranceVisible = true;
        this.answerCardTitle = '答题卡';
      }
    },

    onSuccessSubmit() {
      this.entranceVisible = false;
    },

    onStopTestQuestion() {
      this.entranceVisible = false;
    },
  },
};
</script>

<style lang="scss">
.plv-iar-quick-answer-default__options {
  top: 30%;
}
.plv-iar-quick-answer-default__btn, .plv-iar-quick-answer-default__close-btn {
  top: 70%;
}
</style>
