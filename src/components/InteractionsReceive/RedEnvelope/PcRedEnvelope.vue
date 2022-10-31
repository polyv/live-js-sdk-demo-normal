<template>
  <div class="plv-pc-envelope">
    <!-- 红包弹窗 -->
    <section ref="red-envelope-wrapper"
             class="red-envelope-wrapper">
      <red-envelope-comp :red-envelope-sdk="
             redEnvelopeSdk"
                         :redEnvelopeData="redEnvelopeData"
                         :lang="lang"
                         :redirect-url="watchUrl"
                         @close="handleCloseRedEnvelope" />
    </section>
    <!-- 红包挂件，挂件只展示倒计时和提示，点击不弹窗 -->
    <red-envelope-pendant v-if="showPendant"
                          :lang="lang"
                          :type="redEnvelopeDelayData.type"
                          :time="redEnvelopeDelayData.delayTime"
                          @end="handlePendantCountDownEnd" />
    <!-- 红包雨，PC 上只会显示弹窗引流到移动端 -->
    <pc-redpack-rain :lang="lang" />
  </div>
</template>

<script>
/** 注意。红包入口来自“聊天列表红包消息组件内容” */

import RedEnvelopeComp from '@polyv/interactions-receive-sdk-ui-default/lib/PcRedEnvelope';
import RedEnvelopePendant from '@polyv/interactions-receive-sdk-ui-default/lib/RedEnvelopePendant';
import PcRedpackRain from './RedpackRain/PcRedpackRain.vue';
import mixin from './mixin';

export default {
  mixins: [mixin],
  components: {
    RedEnvelopeComp,
    RedEnvelopePendant,
    PcRedpackRain,
  },
  mounted() {
    this.customMountEl();
  },
  methods: {
    customMountEl() {
      document.body.appendChild(this.$refs['red-envelope-wrapper']);
    },
  },
};
</script>
<style lang="scss">
.plv-iar-red-envelope__pendant {
  margin: 0 auto;
}
</style>
