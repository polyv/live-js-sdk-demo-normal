<template>
  <div class="plv-product-list">
    <product-list v-if="productSdk"
                  :product-sdk="productSdk"
                  :lang="lang"
                  @browse-product="handleBrowseProduct"
                  @click-buy="handleClickBuy" />
  </div>
</template>

<script>
import { Product } from '@polyv/interactions-receive-sdk';
import ProductList from '@polyv/interactions-receive-sdk-ui-default/lib/MobileProduct';
import { ynToBool } from '@/utils';

export default {
  components: {
    ProductList,
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
    this.productSdk.on(this.productSdk.events.PRODUCT_MESSAGE, (msg) => {
      const ProductMessageStatus = this.productSdk.ProductMessageStatus;
      const status = `${msg.status}`;
      if (status === ProductMessageStatus.ProductSwitch) {
        this.$emit('change-switch', ynToBool(msg.content.enabled));
      }
    });
  },

  beforeDestroy() {
    this.productSdk?.destroy();
    this.productSdk = null;
  },

  methods: {
    handleBrowseProduct(data) {
      // TODO 用于统计用户数据
      console.info('handleBrowseProduct', data);
    },
    handleClickBuy(data) {
      // TODO 用户统计点击商品
      console.info('handleBrowseProduct', data);
    },
  },
};
</script>

<style lang="scss" scoped>
.plv-product-list {
  position: relative;
  height: 100%;
}
</style>
