<template>
  <div name="mobile-questionnaire">
    <entrance-icon v-if="entranceVisible"
                   :name="entrance.name"
                   :icon="entrance.icon"
                   :open="handleClickEntranceIcon" />
    <modal title="问卷"
           :visible="isShowQuestionnaire"
           :close-on-click-modal="false"
           @close="onSetQuestionnaireVisible(false)">
      <!-- 问卷组件主体 -->
      <questionnaire :questionnaire-sdk="questionnaireSdk"
                     :delayTime="1000"
                     @status-changed="onStatusChanged"
                     @to-show="onSetQuestionnaireVisible(true)"
                     @to-hide="onSetQuestionnaireVisible(false)"
                     @success-submit="onSubmitSuccess" />
    </modal>
  </div>
</template>

<script>
import { Questionnaire as QuestionnaireSDK } from '@polyv/interactions-receive-sdk';
import Questionnaire from '@polyv/interactions-receive-sdk-ui-default/lib/MobileQuestionnarie';
import EntranceIcon from '../EntranceIcon.vue';

export default {
  components: {
    Questionnaire,
    EntranceIcon,
  },

  data() {
    return {
      entranceVisible: false,
      entrance: {
        name: '问卷',
        icon: require('@/assets/ir-imgs/icon-questionnaire.png'),
      },
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
    this.questionnaireSdk.on(
      this.questionnaireSdk.events.STOP_QUESTIONNAIRE,
      this.onStopQuestion
    );
  },

  beforeDestroy() {
    this.questionnaireSdk.off(
      this.questionnaireSdk.events.STOP_QUESTIONNAIRE,
      this.onStopQuestion
    );
    this.questionnaireSdk.destroy();
    this.questionnaireSdk = null;
  },

  methods: {
    handleClickEntranceIcon() {
      this.onSetQuestionnaireVisible(true);
    },

    onSetQuestionnaireVisible(visible) {
      this.isShowQuestionnaire = visible;
      if (!visible) {
        this.status = '';
      }

      if (visible && (!this.status || this.status === 'isShowQuestion')) {
        this.entranceVisible = true;
      }
    },

    onStatusChanged(status) {
      this.status = status;
    },

    onSubmitSuccess() {
      this.entranceVisible = false;
    },

    onStopQuestion() {
      this.entranceVisible = false;
    },
  },
};
</script>
