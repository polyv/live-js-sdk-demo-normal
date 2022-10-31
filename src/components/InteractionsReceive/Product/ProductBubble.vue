<template>
  <div class="plv-product-bubble">
    <div class="c-product-bubble">
      <product-bubble v-if="productSdk"
                      :product-sdk="productSdk"
                      :lang="lang"
                      :getLinkParams="getLinkParams"
                      @click-buy="handleClickBuy" />
    </div>
  </div>
</template>

<script>
import { Product } from '@polyv/interactions-receive-sdk';
import ProductBubble from '@polyv/interactions-receive-sdk-ui-default/lib/ProductBubble';

/** 用于展示推送商品的气泡消息 */
export default {
  components: {
    ProductBubble,
  },

  props: {
    lang: {
      type: String,
      default: 'zh_CN',
    },
  },

  data() {
    return {
      // 商品库 SDK 实例
      productSdk: null,
    };
  },

  created() {
    this.productSdk = new Product();
  },

  beforeDestroy() {
    this.productSdk?.destroy();
    this.productSdk = null;
  },

  methods: {
    getLinkParams() {
      // 跳转路径上携带参数如： ***.com?customParams1=自定义参数
      // return {
      //   customParams1: '自定义参数'
      // }
      return {};
    },
    handleClickBuy(data) {
      // TODO 用户统计点击商品
      console.info('handleBrowseProduct', data);
    },
  },
};
</script>

<style lang="scss" scoped>
.plv-product-bubble {
  position: relative;
  height: 100%;
}
.c-product-bubble {
  position: absolute;
  top: 16px;
  padding-left: 8px;
  z-index: 35;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.c-product-bubble--mobile {
  top: 60px;
}
</style>
