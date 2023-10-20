import { getDefaultConfigChat, MainScreenMap, TabNavType } from '@/const';
import { ynToBool } from '@/utils';
import PolyvLive from '@/sdk/live';

export default {
  /** 由父组件来保证数据存在 */
  props: {
    channelInfo: Object,
    chatInfo: Object,
    apiToken: String,
    productEnable: Boolean,
    donateConfig: Object,
    watchFeedbackEnabled: Boolean,
  },
  data() {
    const chatConfig = getDefaultConfigChat();
    return {
      activeTab: TabNavType.CHAT,
      /** 聊天室 SDK 中的 Tab 类型 */
      originTabTypes: chatConfig.tabData.map((i) => i.type),
      tabData: [...chatConfig.tabData],
      playerCtrl: {
        /** 是否全屏 */
        isFullScreen: false,
        /** 主视图位置，用于记录当前主屏幕是文档还是播放器 */
        mainPosition: MainScreenMap.ppt.value,
      },
    };
  },
  computed: {
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
    },
    /** 是否使用播放器作为主屏 */
    isPlayerMainPosition() {
      return this.playerCtrl.mainPosition === MainScreenMap.player.value;
    },
    /** 是否使用 PPT 文档播放器作为主屏 */
    isPPTMainPosition() {
      return this.playerCtrl.mainPosition === MainScreenMap.ppt.value;
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
    /** 判断是否需要展示定制面板的 Tab 类型 */
    isCustomAcitveTab() {
      return !this.originTabTypes.includes(this.activeTab);
    },
    changeProductSwitch(enabled) {
      this.$emit('change-switch', { productEnable: enabled });
    },
    handleSetMainPosition() {
      const nextMainPosition =
        MainScreenMap[this.playerCtrl.mainPosition].next;
      this.handleSwitchPlayer(nextMainPosition);
    },
    handleSwitchPlayer(nextMainPosition) {
      const plvLive = PolyvLive.getInstance();
      this.playerCtrl.mainPosition = nextMainPosition;
      setTimeout(() => {
        // ppt容器宽高修改，调用resize刷新ppt尺寸
        plvLive.liveSdk.player.resize();
        // 刷新弹幕显示区域尺寸
        plvLive.liveSdk.player.resizeBarrage();
      });
    }
  },
};
