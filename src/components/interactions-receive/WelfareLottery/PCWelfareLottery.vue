<template>
  <welfare-lottery :welfare-lottery-sdk="welfareLotterySdk"
                   :watch-url="watchUrl"
                   :lang="lang"
                   @entry-visible-changed="onEntryVisibleChanged"
                   @lotteryCallback="lotteryCallback" />
</template>

<script>
import { WelfareLottery as WelfareLotterySDK } from '@polyv/interactions-receive-sdk';
import WelfareLottery from '@polyv/interactions-receive-sdk-ui-default/lib/PcWelfareLottery';

export default {
  components: {
    WelfareLottery,
  },

  props: {
    lang: {
      type: String,
      default: 'zh_CN',
    },
    watchUrl: {
      typpe: String,
      require: true,
    },
  },

  data() {
    return {
      // 条件抽奖 SDK 实例
      welfareLotterySdk: null,
    };
  },

  mounted() {
    this.welfareLotterySdk = new WelfareLotterySDK();
  },

  beforeDestroy() {
    this.welfareLotterySdk?.destroy();
    this.welfareLotterySdk = null;
  },

  methods: {
    onEntryVisibleChanged(visible) {
      console.info('条件抽奖挂件是否显示:', visible);
    },
    lotteryCallback(data) {
      console.info('各按钮触发的回调:', data);
    },
  },
};
</script>
