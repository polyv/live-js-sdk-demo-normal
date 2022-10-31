<!-- PC 端红包雨 demo -->
<template>
  <div class="plv-pc-redpack-rain"
       ref="plv-pc-redpack-rain">
    <redpack-rain-comp ref="redpackRain"
                       :redpack-rain="redpackRainSdk"
                       :lang="lang" />
  </div>
</template>

<script>
import { RedpackRain } from '@polyv/interactions-receive-sdk';
import RedpackRainComp from '@polyv/interactions-receive-sdk-ui-default/lib/PcRedpackRain';

export default {
  components: {
    RedpackRainComp,
  },

  props: {
    lang: {
      type: String,
      default: 'zh_CN',
    },
  },

  data() {
    return {
      redpackRainSdk: null,
    };
  },

  created() {
    // window.openRedpackRain = this.openRedpackRain;
    this.redpackRainSdk = new RedpackRain();
  },

  mounted() {
    this.customMountEl();
  },

  beforeDestroy() {
    this.redpackRainSdk?.destroy();
    this.redpackRainSdk = null;
  },

  methods: {
    customMountEl() {
      document.body.appendChild(this.$refs['plv-pc-redpack-rain']);
    },
    // 用于测试的方法
    openRedpackRain() {
      const data = {
        EVENT: 'REDPAPER',
        content: '恭喜发财，大吉大利',
        msgSource: 'redpaper',
        msgType: 'REDPAPER',
        number: 1,
        redCacheId: '02e589e6',
        redpackId: 'a61385233c43445cb0c634ac1c05382f',
        timestamp: 1665397876880,
        totalAmount: 0.98,
        type: 'score_rain',
        user: {
          nick: '讲师7272',
          pic: '//s1.videocc.net/default-img/avatar/teacher.png',
        },
      };
      this.$refs.redpackRain.showRedpackRain(data);
    },
  },
};
</script>
