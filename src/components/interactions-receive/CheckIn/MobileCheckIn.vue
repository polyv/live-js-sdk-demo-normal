<template>
  <modal title="签到"
         :visible="isShowCheckIn"
         :close-on-click-modal="false"
         :closable="false">
    <!-- 签到组件主体 -->
    <check-in :check-in-sdk="checkInSdk"
              @to-show="onSetCheckInVisible(true)"
              @to-hide="onSetCheckInVisible(false)" />
  </modal>
</template>

<script>
import { CheckIn as CheckInSDK } from '@polyv/interactions-receive-sdk';
import CheckIn from '@polyv/interactions-receive-sdk-ui-default/lib/MobileCheckIn';

export default {
  components: {
    CheckIn,
  },

  data() {
    return {
      // 签到SDK实例
      checkInSdk: null,
      // 是否显示签到
      isShowCheckIn: false,
    };
  },

  created() {
    this.checkInSdk = new CheckInSDK();
  },

  beforeDestroy() {
    this.checkInSdk?.destroy();
    this.checkInSdk = null;
  },

  methods: {
    onSetCheckInVisible(visible) {
      this.isShowCheckIn = visible;
    },
  },
};
</script>

<style lang="scss">
.plv-iar-check-in-default__content__mobile {
  margin-bottom: 20px;
}
</style>
