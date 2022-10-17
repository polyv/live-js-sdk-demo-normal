<template>
  <div class="plv-mobile-envelope">
    <!-- 红包弹窗 -->
    <section ref="red-envelope-wrapper"
             class="red-envelope-wrapper">
      <red-envelope-comp :red-envelope-sdk="redEnvelopeSdk"
                         :red-envelope-data="redEnvelopeData"
                         :open-id="openId"
                         :with-draw-enabled="true"
                         :lang="lang"
                         :redirect-url="watchUrl"
                         :customImgConfig="customImgConfig"
                         @close="handleCloseRedEnvelope"
                         @statusChange="handleStatusChange"
                         @click-withdraw="handleClickWidthdraw"
                         @click-point-record="handleClickPoint" />
    </section>
    <!-- 红包挂件内容,挂件只展示倒计时和提示，点击不弹窗 -->
    <red-envelope-pendant v-if="showPendant"
                          :lang="lang"
                          :type="redEnvelopeDelayData.type || redEnvelopeDelayData.redpackType"
                          :time="redEnvelopeDelayData.delayTime"
                          @end="handlePendantCountDownEnd" />
    <!-- 红包雨，需要在微信环境下才能正常使用 -->
    <mobile-redpack-rain :lang="lang"
                         :custom-img-config="customImgConfig" />
  </div>
</template>

<script>
import RedEnvelopeComp from '@polyv/interactions-receive-sdk-ui-default/lib/MobileRedEnvelope';
import RedEnvelopePendant from '@polyv/interactions-receive-sdk-ui-default/lib/RedEnvelopePendant';
import MobileRedpackRain from './RedpackRain/MobileRedpackRain.vue';
import mixin, {
  RedEnvelopeMessageHub,
  RedEnvelopeMessageHubEvents,
} from './mixin';

export default {
  components: {
    RedEnvelopeComp,
    RedEnvelopePendant,
    MobileRedpackRain,
  },
  mixins: [mixin],
  data() {
    return {
      customImgConfig: {},
      // 微信 openId
      openId: '',
    };
  },
  mounted() {
    this.customMountEl();
  },
  methods: {
    customMountEl() {
      document.body.appendChild(this.$refs['red-envelope-wrapper']);
    },
    handleStatusChange(redpackId, status) {
      console.info('handleStatusChange', redpackId, status);
    },
    /** 提现按钮点击 */
    handleClickWidthdraw() {
      console.info('handleClickWidthdraw');
      this.$dialog.alert({
        title: '提现弹窗',
        message: '当前只是示例，需要自行处理提现',
      });
    },
    /** 积分明细按钮点击 */
    handleClickPoint() {
      console.info('handleClickPointRecord');
      RedEnvelopeMessageHub.trigger(
        RedEnvelopeMessageHubEvents.POINT_RECORD_SHOW
      );
    },
  },
};
</script>
<style lang="scss">
.plv-iar-red-envelope__pendant {
  margin: 0 auto;
}
</style>
