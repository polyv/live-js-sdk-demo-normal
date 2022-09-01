<template>
  <modal title="问卷"
         :visible="isShowQuestionnaire"
         :close-on-click-modal="false"
         @close="onSetQuestionnaireVisible(false)">
    <!-- 问卷组件主体 -->
    <questionnaire :questionnaire-sdk="questionnaireSdk"
                   :delayTime="1000"
                   @status-changed="onStatusChanged"
                   @to-show="onSetQuestionnaireVisible(true)"
                   @to-hide="onSetQuestionnaireVisible(false)" />
  </modal>
</template>

<script>
import { Questionnaire as QuestionnaireSDK } from '@polyv/interactions-receive-sdk';
import Questionnaire from '@polyv/interactions-receive-sdk-ui-default/lib/MobileQuestionnarie';

const AllStatus = {
  isShowQuestion: 'isShowQuestion',
  isShowResult: 'isShowResult',
  isShowAnswer: 'isShowAnswer',
};

export default {
  components: {
    Questionnaire,
  },

  data() {
    return {
      // 问卷SDK实例
      questionnaireSdk: null,
      // 是否显示问卷
      isShowQuestionnaire: false,
      // 问卷状态
      status: '',
    };
  },

  created() {
    this.questionnaireSdk = new QuestionnaireSDK();
  },

  beforeDestroy() {
    this.questionnaireSdk?.destroy();
    this.questionnaireSdk = null;
  },

  methods: {
    onSetQuestionnaireVisible(visible) {
      this.isShowQuestionnaire = visible;
    },
    onStatusChanged(status) {
      this.status = status;
    },
  },
};
</script>
