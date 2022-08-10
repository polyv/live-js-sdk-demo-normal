<template>
  <section v-if="visible">
    <mobile-watch v-if="isMobile"
                  :channelInfo="channelInfo"
                  :chatInfo="chatInfo"
                  :apiToken="apiToken" />
    <pc-watch v-else
              :channelInfo="channelInfo"
              :chatInfo="chatInfo"
              :apiToken="apiToken" />
  </section>
</template>

<script>
import { mapState } from 'vuex';
import * as PlvUtil from '@/utils';
import { TIME_STAMP } from '@/const';

export default {
  name: 'Watch-Layout',
  components: {
    PcWatch: () => import('@/components/pc/Watch.vue'),
    MobileWatch: () => import('@/components/mobile/Watch.vue'),
  },
  data() {
    return {
      visible: false,
      channelInfo: {},
      chatInfo: {},
      apiToken: '',
    };
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
      config: (state) => state.config,
    }),
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      try {
        // 获取频道信息
        this.channelInfo = await this.getChannelInfo();
        // 获取聊天室信息
        this.chatInfo = await this.getChatInfo();
        // SDK设置接口token, 用于一些互动的功能接口的请求,如点赞.
        this.apiToken = await this.getApiToken();

        this.visible = true;
      } catch (error) {
        alert('接口请求失败！');
      }
    },
    getChannelInfo() {
      return new Promise((resolve) => {
        const channelInfoParams = {
          appId: this.config.appId,
          timestamp: TIME_STAMP,
          channelId: this.config.channelId,
        };

        // ！！！不要在前端生成sign，此处仅供参考
        channelInfoParams.sign = PlvUtil.getSign(
          this.config.appSecret,
          channelInfoParams
        );
        PlvUtil.getChannelInfo(channelInfoParams, (channelInfo) => {
          resolve(channelInfo);
        });
      });
    },
    getChatInfo() {
      return new Promise((resolve) => {
        // 聊天室JS-SDK加载需要先请求校验码
        const chatApiParam = {
          appId: this.config.appId,
          timestamp: TIME_STAMP,
          channelId: this.config.channelId,
          userId: this.config.userId,
          role: this.config.role,
        };

        // ！！！不要在前端生成sign，此处仅供参考
        chatApiParam.sign = PlvUtil.getSign(
          this.config.appSecret,
          chatApiParam
        );

        PlvUtil.getChatToken(chatApiParam, (chatInfo) => {
          resolve(chatInfo);
        });
      });
    },
    getApiToken() {
      return new Promise((resolve) => {
        const apiTokenParams = {
          appId: this.config.appId,
          timestamp: TIME_STAMP,
          channelId: this.config.channelId,
          viewerId: this.config.userId,
        };

        // ！！！不要在前端生成sign，此处仅供参考
        apiTokenParams.sign = PlvUtil.getSign(
          this.config.appSecret,
          apiTokenParams
        );

        PlvUtil.getApiToken(apiTokenParams, (data) => {
          resolve(data.token);
        });
      });
    },
  },
};
</script>