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
                         @close="handleCloseRedEnvelope"
                         @statusChange="handleStatusChange"
                         @click-withdraw="handleClickWidthdraw"
                         @click-point-record="handleClickPoint" />、
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
import mixin from './mixin';

export default {
  components: {
    RedEnvelopeComp,
    RedEnvelopePendant,
    MobileRedpackRain,
  },
  mixins: [mixin],
  data() {
    return {
      customImgConfig: {
        // 消息封面图
        // eslint-disable-next-line sonarjs/no-duplicate-string
        normalEntranceImg: 'https://s0.2mdn.net/simgad/5769778541448121689',
        passwordEntranceImg: 'https://s0.2mdn.net/simgad/5769778541448121689',
        rainEntranceImg: 'https://s0.2mdn.net/simgad/5769778541448121689',

        // 挂件图
        normalPendantImg: 'https://s0.2mdn.net/simgad/5769778541448121689',
        passwordPendantImg: 'https://s0.2mdn.net/simgad/5769778541448121689',
        rainPendantImg: 'https://s0.2mdn.net/simgad/5769778541448121689',

        // 普通红包和口令红包-弹出封面图
        redpackCoverImg: 'https://s0.2mdn.net/simgad/5769778541448121689',

        // 红包雨-弹出层顶部背景图
        rainModalTopBgImg: 'https://s0.2mdn.net/simgad/5769778541448121689',
        // 红包雨-弹出层右侧挂件图
        rainModalRightPendantImg:
          'https://liveimages.videocc.net/uploaded/images/2022/08/gcgnw0prx5.png',

        // 红包雨开始倒计时图
        redpackBeginingBgImg: 'https://s0.2mdn.net/simgad/5769778541448121689',

        // 红包雨动画-底部背景图
        rainThemeBottomBgImg:
          'https://liveimages.videocc.net/uploaded/images/2022/08/gcgnw53p23.png',
        // 红包雨动画-飘落图 (随机选择数组图片)
        rainThemeBollImgArray: [
          'https://liveimages.videocc.net/uploaded/images/2022/08/gcgnw0prx5.png',
        ],
      },
      // 微信 openId
      openId: '',
    };
  },
  mounted() {
    document.body.appendChild(this.$refs['red-envelope-wrapper']);
  },
  methods: {
    handleStatusChange(redpackId, status) {
      console.info('handleStatusChange', redpackId, status);
    },
    handleClickWidthdraw() {
      console.info('handleClickWidthdraw');
    },
    handleClickPoint() {
      console.info('handleClickPointRecord');
    },
  },
};
</script>
<style lang="scss">
.plv-iar-red-envelope__pendant {
  margin: 0 auto;
}
</style>
