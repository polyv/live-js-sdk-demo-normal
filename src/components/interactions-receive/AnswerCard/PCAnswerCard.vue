<template>
  <div>
    <!-- 普通答题 -->
    <modal :title="answerCardTitle"
           :visible="isShowAnswerCard"
           :close-on-click-modal="false"
           @close="onSetAnswerCardVisible(false)">
      <answer-card :answer-card-sdk="answerCardSdk"
                   :delayTime="1000"
                   @to-show="onSetAnswerCardVisible(true)"
                   @to-hide="onSetAnswerCardVisible(false)"
                   @status-changed="onStatusChanged" />
    </modal>
    <!-- 快速问答 -->
    <modal :title="quickAnswerCardTitle"
           :visible="isShowQuickAnswerCard"
           :close-on-click-modal="false"
           @close="onSetQuickAnswerCardVisible(false)">
      <quick-answer-card :answer-card-sdk="answerCardSdk"
                         :delayTime="1000"
                         @to-show="(question)=>onSetQuickAnswerCardVisible(true,question)"
                         @to-hide="(question)=>onSetQuickAnswerCardVisible(false,question)" />
    </modal>
  </div>
</template>

<script>
import { AnswerCard as AnswerCardSDK } from '@polyv/interactions-receive-sdk';
import AnswerCard from '@polyv/interactions-receive-sdk-ui-default/lib/PcAnswerCard';
import QuickAnswerCard from '@polyv/interactions-receive-sdk-ui-default/lib/PcQuickAnswer';

export default {
  components: {
    AnswerCard,
    QuickAnswerCard,
  },

  data() {
    return {
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
  },

  beforeDestroy() {
    this.answerCardSdk?.destroy();
    this.answerCardSdk = null;
  },

  methods: {
    onSetAnswerCardVisible(visible) {
      this.isShowAnswerCard = visible;
    },

    onSetQuickAnswerCardVisible(visible, question) {
      this.isShowQuickAnswerCard = visible;
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
        this.answerCardTitle = this.answerCardSdk.curSubmittedAnswer
          ? '答题结果'
          : '未作答';
      } else {
        this.answerCardTitle = '答题卡';
      }
    },
  },
};
</script>
