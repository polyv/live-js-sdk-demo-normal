<template>
  <div name="mobile-checkin">
    <entrance-icon v-if="entranceVisible"
                   :name="entrance.name"
                   :icon="entrance.icon"
                   :open="handleClickEntranceIcon" />
    <modal title="签到"
           :visible="isShowCheckIn"
           :close-on-click-modal="false"
           @close="onSetCheckInVisible(false)">
      <!-- 签到组件主体 -->
      <check-in :check-in-sdk="checkInSdk"
                @to-show="onSetCheckInVisible(true)"
                @to-hide="onSetCheckInVisible(false)" />
    </modal>
  </div>
</template>

<script>
import { CheckIn as CheckInSDK } from '@polyv/interactions-receive-sdk';
import CheckIn from '@polyv/interactions-receive-sdk-ui-default/lib/MobileCheckIn';
import EntranceIcon from '../EntranceIcon.vue';

export default {
  components: {
    CheckIn,
    EntranceIcon,
  },

  data() {
    return {
      entranceVisible: false,
      entrance: {
        name: '签到',
        icon: require('@/assets/ir-imgs/icon-sign.png'),
      },
      // 签到SDK实例
      checkInSdk: null,
      // 是否显示签到
      isShowCheckIn: false,
    };
  },

  created() {
    this.checkInSdk = new CheckInSDK();
    this.checkInSdk.on(
      this.checkInSdk.events.SIGN_IN_SUCCESS,
      this.setEntranceVisible
    );
    this.checkInSdk.on(
      this.checkInSdk.events.SIGN_IN_FINISH,
      this.setEntranceVisible
    );
    this.checkInSdk.on(
      this.checkInSdk.events.STOP_SIGN_IN,
      this.setEntranceVisible
    );
  },

  beforeDestroy() {
    this.checkInSdk.off(
      this.checkInSdk.events.SIGN_IN_SUCCESS,
      this.setEntranceVisible
    );
    this.checkInSdk.off(
      this.checkInSdk.events.SIGN_IN_FINISH,
      this.setEntranceVisible
    );
    this.checkInSdk.off(
      this.checkInSdk.events.STOP_SIGN_IN,
      this.setEntranceVisible
    );

    this.checkInSdk?.destroy();
    this.checkInSdk = null;
  },

  methods: {
    setEntranceVisible(visible = false) {
      this.entranceVisible = visible;
    },

    handleClickEntranceIcon() {
      this.onSetCheckInVisible(true);
    },

    onSetCheckInVisible(visible) {
      this.isShowCheckIn = visible;
      if (visible) {
        this.entranceVisible = visible;
      }
    },
  },
};
</script>

<style lang="scss">
.plv-iar-check-in-default__content__mobile {
  margin-bottom: 20px;
}
</style>
