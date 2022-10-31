<template>
  <push-card :lang="lang"
             :push-card-sdk="pushCardSdk"
             @open="handleOpen" />
</template>

<script>
import { PushCard as PushCardSdk } from '@polyv/interactions-receive-sdk';
import PushCard from '@polyv/interactions-receive-sdk-ui-default/lib/PushCard';

export default {
  components: {
    PushCard,
  },

  props: {
    lang: {
      type: String,
      default: 'zh_CN',
    },
  },

  data() {
    return {
      // 卡片推送 SDK 实例
      pushCardSdk: null,
    };
  },

  mounted() {
    this.pushCardSdk = new PushCardSdk();
  },

  beforeDestroy() {
    this.pushCardSdk?.destroy();
    this.pushCardSdk = null;
  },

  methods: {
    handleOpen(data) {
      // 点击卡片，回调相关数据
      // cardId: 卡片ID
      // link: 卡片链接
      // redirectType: 打开链接的方式，tab或iframe，默认为tab（即打开新的标签页），iframe为自定义类型，用户可根据实际业务情况进行展示
      // userInfo: 当前用户信息
      console.info('###卡片相关数据：', data);
    },
  },
};
</script>
