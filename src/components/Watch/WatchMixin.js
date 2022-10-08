import { getDefaultConfigChat, TabNavType } from '@/const';

export default {
  /** 由父组件来保证数据存在 */
  props: {
    channelInfo: Object,
    chatInfo: Object,
    apiToken: String,
    productEnable: Boolean,
  },
  data() {
    const chatConfig = getDefaultConfigChat();
    return {
      activeTab: 'chat',
      originTabTypes: chatConfig.tabData.map((i) => i.type),
      tabData: [...chatConfig.tabData],
    };
  },
  computed: {
    isShowProductList() {
      return this.activeTab === TabNavType.PRODUCT && this.productEnable;
    },
  },
  watch: {
    productEnable: {
      handler(enabled) {
        const item = {
          name: '边看边买',
          type: TabNavType.PRODUCT,
        };
        if (enabled) {
          this.tabData.push(item);
        } else {
          this.tabData = this.tabData.filter((i) => i.type !== TabNavType.PRODUCT);
        }
      },
      immediate: true,
    },
  },
  methods: {
    isCustomAcitveTab() {
      return !this.originTabTypes.includes(this.activeTab);
    },
    changeProductSwitch(enabled) {
      this.$emit('change-switch', { productEnable: enabled });
    },
  },
};
