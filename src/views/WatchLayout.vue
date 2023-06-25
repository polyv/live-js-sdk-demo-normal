<template>
  <section v-if="visible"
           class="g-moblie-page-container">
    <component :is="componentTagName"
               :channelInfo="channelInfo"
               :chatInfo="chatInfo"
               :apiToken="apiToken"
               :productEnable="productEnable"
               :donateConfig="donateConfig"
               :watchFeedbackEnabled="watchFeedbackEnabled"
               @change-switch="handleChangeSwitch"
               @reload="reloadWatchPage" />
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { TIME_STAMP } from '@/const';

import PolyvApi from '@/utils/api';
import * as PolyvUtil from '@/utils';
import {
  DonateMessageHub,
  DonateMessageHubEvents,
} from '@/components/Donate/DonateMixin';

export default {
  name: 'Watch-Layout',
  components: {
    PcWatch: () => import('@/components/Watch/PcWatch.vue'),
    MobileWatch: () => import('@/components/Watch/MobileWatch.vue'),
  },
  data() {
    return {
      visible: false,
      channelInfo: {},
      channelDetail: {},
      chatInfo: {},
      apiToken: '',
      productEnable: false,
      donateConfig: {},
    };
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
      config: (state) => state.config,
      isPlvWebview: (state) => state.webview.isPlvWebview,
    }),
    componentTagName() {
      return this.isMobile ? 'MobileWatch' : 'PcWatch';
    },
    watchFeedbackEnabled() {
      return PolyvUtil.ynToBool(this.channelDetail.watchFeedbackEnabled || 'N');
    }
  },
  created() {
    this.init();
    this.bindEventBus();
  },
  methods: {
    ...mapMutations({
      resetConfigChat: 'config/resetChat',
      updateWebviewPlayState: 'webview/updatePlayState',
    }),
    /** 重新渲染观看页 */
    async reloadWatchPage() {
      this.visible = false;
      this.resetConfigChat();
      await this.init();
    },
    handleChangeSwitch(data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    },
    bindEventBus() {
      DonateMessageHub.on(
        DonateMessageHubEvents.SEND_REWARD_MSG,
        ({ data }) => {
          this.sendRewardMsg(data);
        }
      );
    },
    /** 初始化观看页需要的数据 */
    async init() {
      try {
        if (this.isPlvWebview) {
          // 将小窗里面用到的播放状态数据初始化
          this.updateWebviewPlayState(false);
        }
        // 获取频道信息
        this.channelInfo = await this.getChannelInfo();
        // 获取频道详情
        this.channelDetail = await this.getChannelDetail();
        // 获取聊天室信息
        this.chatInfo = await this.getChatInfo();
        // SDK设置接口token, 用于一些互动的功能接口的请求,如点赞
        this.apiToken = await this.getApiToken();
        // 获取是否开启“商品库开关”
        this.productEnable = await this.getProductEnable();
        // 获取”打赏“配置
        this.donateConfig = await this.getDonateConfig();

        this.visible = true;
      } catch (error) {
        console.error('接口请求失败！', error.message);
        this.$dialog.alert({
          message: '接口请求失败！' + error.message,
        });
      }
    },
    async getChannelInfo() {
      const channelInfoParams = {
        appId: this.config.appId,
        timestamp: TIME_STAMP,
        channelId: this.config.channelId,
      };

      // ！！！不要在前端生成sign，此处仅供参考
      channelInfoParams.sign = PolyvUtil.getSign(
        this.config.appSecret,
        channelInfoParams
      );

      return await PolyvApi.getChannelInfo(channelInfoParams);
    },
    async getChannelDetail() {
      const channelDetailParams = {
        appId: this.config.appId,
        timestamp: TIME_STAMP,
        channelId: this.config.channelId,
      };

      // ！！！不要在前端生成sign，此处仅供参考
      channelDetailParams.sign = PolyvUtil.getSign(
        this.config.appSecret,
        channelDetailParams
      );

      return await PolyvApi.getChannelDetail(channelDetailParams);
    },
    async getChatInfo() {
      // 聊天室JS-SDK加载需要先请求校验码
      const chatApiParam = {
        appId: this.config.appId,
        timestamp: TIME_STAMP,
        channelId: this.config.channelId,
        userId: this.config.userId,
        role: this.config.role,
      };

      // ！！！不要在前端生成sign，此处仅供参考
      chatApiParam.sign = PolyvUtil.getSign(
        this.config.appSecret,
        chatApiParam
      );

      return await PolyvApi.getChatToken(chatApiParam);
    },
    async getApiToken() {
      const apiTokenParams = {
        appId: this.config.appId,
        timestamp: TIME_STAMP,
        channelId: this.config.channelId,
        viewerId: this.config.userId,
        nickName: this.config.nickname,
      };

      // ！！！不要在前端生成sign，此处仅供参考
      apiTokenParams.sign = PolyvUtil.getSign(
        this.config.appSecret,
        apiTokenParams
      );

      return await PolyvApi.getApiToken(apiTokenParams);
    },
    async getProductEnable() {
      const params = {
        appId: this.config.appId,
        timestamp: TIME_STAMP,
        channelId: this.config.channelId,
      };

      // ！！！不要在前端生成sign，此处仅供参考
      params.sign = PolyvUtil.getSign(this.config.appSecret, params);

      const enabled = await PolyvApi.getProductEnable(params);
      return PolyvUtil.ynToBool(enabled);
    },
    async getDonateConfig() {
      const params = {
        appId: this.config.appId,
        timestamp: TIME_STAMP,
        channelId: this.config.channelId,
      };

      // ！！！不要在前端生成sign，此处仅供参考
      params.sign = PolyvUtil.getSign(this.config.appSecret, params);

      return await PolyvApi.getDonateConfig(params);
    },
    async sendRewardMsg(donateData) {
      try {
        const params = {
          appId: this.config.appId,
          timestamp: TIME_STAMP,
          channelId: this.config.channelId,
          viewerId: this.config.userId,
          nickname: this.config.nickname,
          avatar: this.config.avatar,
          ...donateData,
        };

        // ！！！不要在前端生成sign，此处仅供参考
        params.sign = PolyvUtil.getSign(this.config.appSecret, params);

        await PolyvApi.sendRewardMsg(params);
      } catch (error) {
        console.error('接口请求失败！', error.message);
        this.$dialog.alert({
          message: '接口请求失败！' + error.message,
        });
      }
    },
  },
};
</script>
