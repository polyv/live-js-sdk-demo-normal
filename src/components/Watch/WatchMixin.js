import { getDefaultConfigChat, TabNavType } from '@/const';
import { ynToBool } from '@/utils';
import { mapGetters } from 'vuex';

export default {
  /** 由父组件来保证数据存在 */
  props: {
    channelInfo: Object,
    chatInfo: Object,
    apiToken: String,
    productEnable: Boolean,
    donateConfig: Object,
  },
  data() {
    const chatConfig = getDefaultConfigChat();
    return {
      activeTab: TabNavType.CHAT,
      /** 聊天室 SDK 中的 Tab 类型 */
      originTabTypes: chatConfig.tabData.map((i) => i.type),
      tabData: [...chatConfig.tabData],
    };
  },
  computed: {
    ...mapGetters('base', [
      'watchFeedbackEnabled'
    ]),
    /** 当前 Tab 是否为 "聊天" Tab */
    isActiveChatTab() {
      return this.activeTab === TabNavType.CHAT;
    },
    /** 是否展示商品库列表 */
    isShowProductList() {
      return this.activeTab === TabNavType.PRODUCT && this.productEnable;
    },
    /** 是否启用打赏功能 */
    isEnableDonate() {
      return ynToBool(this.donateConfig.donateCashEnabled) || ynToBool(this.donateConfig.donateGiftEnabled);
    }
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
    /** 判断是否需要展示定制面板的 Tab 类型 */
    isCustomAcitveTab() {
      return !this.originTabTypes.includes(this.activeTab);
    },
    changeProductSwitch(enabled) {
      this.$emit('change-switch', { productEnable: enabled });
    },
  },
};
