<template>
  <section class="plv-watch-mobile-main">
    <div class="plv-watch-mobile">
      <div class="plv-watch-mobile__top">
        <!-- 播放器区域 -->
        <div class="plv-watch-mobile-player"
             ref="plv-mobile-player"
             id="plv-mobile-player"></div>
      </div>
      <mobile-rtc-panel v-if="playerInited" />
      <!-- 聊天室区域，包含 PPT 文档播放器和直播介绍页 -->
      <div class="plv-watch-mobile-chatroom plv-skin--dark">
        <tab-nav v-if="playerInited"
                 v-model="activeTab"
                 :tabData="tabData"
                 :originTabTypes="originTabTypes"
                 class="tab-nav" />
        <section v-show="isCustomAcitveTab()"
                 class="custom-tab-content-wrapper">
          <mobile-intro v-show="isShowMobileIntro" />
          <mobile-product-list v-if="enableRenderIRComponent"
                               v-show="isShowProductList"
                               @change-switch="changeProductSwitch" />
        </section>
        <section v-show="!isCustomAcitveTab()"
                 class="plv-mobile-origin-tab-content"
                 ref="plv-mobile-origin-tab-content">
          <donate-entrance v-if="playerInited && isEnableDonate" />
          <mobile-donate-panel v-if="playerInited && isEnableDonate"
                               :donateConfig="donateConfig" />
          <mobile-point-record v-if="enableRenderIRComponent" />
        </section>

        <section class="bubble-wrapper">
          <product-bubble v-if="playerInited" />
          <donate-bubble />
        </section>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import WatchMixin from '@/components/Watch/WatchMixin';
import TabNav from '@/components/TabNav/TabNav.vue';
import MobileIntro from '@/components/Intro/MobileIntro.vue';
import LikeService from '@/components/Like';
import IREntranceService from '@/components/InteractionsReceive';
import ProductBubble from '@/components/InteractionsReceive/Product/ProductBubble.vue';
import DonateBubble from '@/components/Donate/DonateBubble.vue';
import MobilePointRecord from '@/components/InteractionsReceive/RedEnvelope/MobilePointRecord';
import MobileRtcPanel from '@/components/RTC/MobileRtcPanel.vue';

import {
  getDefaultConfigChat,
  PlvChannelScene,
  PlvChatUserType,
  TabNavType,
} from '@/const';
import PolyvChat, {
  plvChatMessageHub,
  PlvChatMessageHubEvents,
} from '@/sdk/chat';
import PolyvLive, {
  plvLiveMessageHub,
  PlvLiveMessageHubEvents,
} from '@/sdk/live';
import PolyvInteractionsReceive, {
  plvIRMessageHub,
  PlvIRMessageHubEvents,
} from '@/sdk/interactions-receive';

const irEntranceService = new IREntranceService();
const likeService = new LikeService();

export default {
  name: 'Mobile-Watch',
  mixins: [WatchMixin],
  components: {
    TabNav,
    MobileIntro,
    ProductBubble,
    MobileProductList: () =>
      import('@/components/InteractionsReceive/Product/MobileProductList.vue'),
    DonateEntrance: () => import('@/components/Donate/DonateEntrance.vue'),
    MobileDonatePanel: () =>
      import('@/components/Donate/MobileDonatePanel.vue'),
    DonateBubble,
    MobilePointRecord,
    MobileRtcPanel,
  },
  data() {
    const chatConfig = getDefaultConfigChat();

    return {
      originTabTypes: chatConfig.tabData
        .map((i) => i.type)
        .concat(TabNavType.PPT),
      playerInited: false,
      enableRenderIRComponent: false,
    };
  },
  computed: {
    ...mapState({
      config: (state) => state.config,
    }),
    isAloneChannelScene() {
      return this.channelInfo.scene === PlvChannelScene.ALONE;
    },
    isShowMobileIntro() {
      return this.activeTab === TabNavType.INTRO;
    },
  },
  mounted() {
    const scene = this.channelInfo.scene || '';
    const chatContainer = this.$refs['plv-mobile-origin-tab-content'];
    const { playerEl, pptEl } = this.getPlayElByScene(scene);

    this.updateConfigChatByScene(scene);
    this.initSdk({
      chatContainer,
      playerEl,
      pptEl,
    });
    this.handlePolyfillByScene(scene);
  },
  beforeDestroy() {
    plvChatMessageHub.trigger(PlvChatMessageHubEvents.DESTROY);
    plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.DESTROY);
    plvIRMessageHub.trigger(PlvIRMessageHubEvents.DESTROY);

    irEntranceService.destroy();
    likeService.destroy();
  },
  methods: {
    ...mapMutations({
      updateConfigChat: 'config/updateChat',
      updateConfigNickname: 'config/updateNickname',
    }),
    /** 根据直播场景更新聊天室配置 */
    updateConfigChatByScene(scene) {
      let userType = PlvChatUserType.STUDENT;
      const needBeforeInsertedTabData = [
        {
          name: '直播介绍',
          type: TabNavType.INTRO,
        },
      ];

      if (scene === PlvChannelScene.PPT) {
        userType = PlvChatUserType.SLICE;
        needBeforeInsertedTabData.unshift({
          name: '文档',
          type: TabNavType.PPT,
        });
        this.activeTab = TabNavType.PPT;
      } else {
        this.activeTab = TabNavType.INTRO;
      }

      const defaultTabData = getDefaultConfigChat().tabData;

      this.updateConfigChat({
        userType,
        tabData: [...needBeforeInsertedTabData, ...defaultTabData],
      });
      this.tabData = [...needBeforeInsertedTabData, ...this.tabData];
    },
    /** 根据直播场景来获取相关的播放器元素 */
    getPlayElByScene(scene) {
      const playerEl = this.$refs['plv-mobile-player'];
      if (scene === PlvChannelScene.PPT) {
        return {
          pptEl: '#tab-ppt', // ppt 文档播放器需要渲染在聊天室 tab content 中
          playerEl,
        };
      } else {
        return {
          pptEl: undefined,
          playerEl,
        };
      }
    },
    /**
     * 移动端三分屏直播场景兼容处理，切换到文档tab时需要调用一下resize
     */
    handlePolyfillByScene(scene) {
      if (scene === PlvChannelScene.PPT) {
        const plvLive = PolyvLive.getInstance();
        const $tabPPT = document.querySelector('li[data-type=ppt]');

        $tabPPT &&
          $tabPPT.addEventListener('click', () => {
            setTimeout(() => {
              plvLive.liveSdk.player.resize();
            }, 0);
          });
      }
    },
    /**
     * 初始化 SDK，注意不能更换 SDK 初始化顺序
     * */
    initSdk({ chatContainer, playerEl, pptEl }) {
      // 初始化-聊天室SDK
      const plvChat = PolyvChat.setInstance(
        {
          config: this.config,
          chatInfo: this.chatInfo,
        },
        { chatContainer }
      );

      // 渲染 IR 入口组件
      this.renderIREntrance();
      // 初始化-互动SDK
      PolyvInteractionsReceive.setInstance(
        {
          config: this.config,
          channelData: this.channelInfo,
          apiToken: this.apiToken,
        },
        {
          socket: plvChat.socket,
        }
      );

      // 渲染商品库组件
      this.enableRenderIRComponent = true;

      // 初始化-直播SDK
      PolyvLive.setInstance(
        { config: this.config, apiToken: this.apiToken },
        { socket: plvChat.socket },
        { playerEl, pptEl }
      );

      // 绑定 SDK 事件
      this.bindChatEvents();
      this.bindLiveEvents();
    },
    /** 绑定-聊天室消息总线事件 */
    bindChatEvents() {
      const plvLive = PolyvLive.getInstance();

      // 聊天室消息变化
      plvChatMessageHub.on(PlvChatMessageHubEvents.ROOM_MESSAGE, ({ data }) => {
        plvLive.sendBarrage(data);
      });

      // 登录回调
      plvChatMessageHub.on(
        PlvChatMessageHubEvents.LOGIN_CALLBACK,
        ({ data }) => {
          const nick = data.user.nick;
          this.updateConfigNickname(nick);
        }
      );
    },
    /** 绑定-直播消息总线事件 */
    bindLiveEvents() {
      const plvLive = PolyvLive.getInstance();

      // 渠道初始化
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.CHANNEL_DATA_INIT,
        (channelData) => {
          const plvIR = PolyvInteractionsReceive.getInstance();
          // 更新 sessionId
          plvIR.updateOriginChannelData(channelData);
        }
      );

      // 播放器初始化
      plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, (data) => {
        this.playerInited = true;
        this.renderLike(data);
      });

      // 点赞互动
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.INTERACTIVE_LIKE,
        ({ curLikeNum }) => {
          plvLive.liveSdk.sendLike(1);
          const $introLike = document.getElementById('intro-likes');
          $introLike.innerText = curLikeNum;
        }
      );

      // 修改昵称
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.SET_NICK_NAME,
        ({ nick }) => {
          const plvIR = PolyvInteractionsReceive.getInstance();
          plvIR.updateNickName(nick);
          this.updateConfigNickname(nick);
        }
      );

      // 监听流状态变化
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.STREAM_UPDATE,
        ({ status }) => {
          if (status === 'live') {
            this.$toast({
              type: 'loading',
              message: '直播开始了，马上前往直播',
              onClose: () => {
                this.$emit('reload');
              },
            });
          }
        }
      );
    },
    /** 渲染互动功能入口组件 */
    renderIREntrance() {
      const { $el } = irEntranceService.getIREntrance();
      const $tabChat = document.getElementById('tab-chat');
      $tabChat.appendChild($el);
    },
    /** 渲染点赞按钮 */
    renderLike(data) {
      const { $el, instance } = likeService.getLikeComponent();
      instance.setData({ likeNum: data.likes });
      const $tabChat = document.getElementById('tab-chat');
      $tabChat.appendChild($el);
    },
  },
};
</script>

<style lang="scss">
.plv-watch-mobile {
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  font-size: 12px;
}

.plv-watch-mobile__top {
  padding-top: 56.25%;
  height: 0;
  position: relative;
}

.plv-watch-mobile-player {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.plv-watch-mobile-chatroom {
  flex: 1;
  overflow: hidden;
}

.plv-watch-mobile-chatroom {
  position: relative;
}
.plv-watch-mobile-chatroom .tab-nav {
  position: absolute;
  width: 100%;
  z-index: 1;
}
.plv-watch-mobile-chatroom .custom-tab-content-wrapper {
  position: relative;
  padding-top: 38px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.plv-watch-mobile-chatroom .plv-mobile-origin-tab-content {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.plv-watch-mobile-chatroom .bubble-wrapper {
  position: absolute;
  top: 38px;
  left: 0;
  width: 100%;
}

/* 移动端聊天室SDK样式覆写 */
.plv-watch-mobile .polyv-chat-room .polyv-cr-head {
  display: none;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room {
  background: #202127;
}
.plv-watch-mobile .plv-skin--dark .polyv-cr-head {
  background: #3e3e4e;
}
.plv-watch-mobile .plv-skin--dark .polyv-cr-navbar {
  color: #fff;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-cr-navbar>li.polyv-crn-active {
  color: #fff;
  border: 0;
}
.plv-watch-mobile .plv-skin--dark li.polyv-crn-active>span {
  display: inline-block;
  line-height: 35px;
  border-bottom: 2px solid #fff;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room>.polyv-cr-body {
  background: #202127;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-input {
  background: #202127;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-chat-input input {
  color: #e4e4e4;
  background: #2b2c35;
  border: 0;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-mobile-send {
  color: #fff;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-emotion-wrap {
  background: #202127;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-emotion-wrap:after {
  border-color: #202127 transparent transparent;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-chat-list>.polyv-msg {
  color: #adadc0;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-msg-content {
  background: #2b2c35;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-chat-input .polyv-icon-emotion {
  background: url('~@/assets/chat-imgs/emotion.png');
  background-size: 20px 20px;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-chat-input .polyv-icon-flower {
  background: url('~@/assets/chat-imgs/flower.png');
  background-size: 20px 20px;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-chat-input .polyv-icon-more {
  background: url('~@/assets/chat-imgs/more.png');
  background-size: 20px 20px;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-show-more .polyv-icon-more {
  background: url('~@/assets/chat-imgs/show-more.png');
  background-size: 20px 20px;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room>.polyv-cr-body .polyv-set-nickname.show {
  background: #3e3e4e;
}
.plv-watch-mobile .plv-skin--dark .polyv-chat-room>.polyv-cr-body .polyv-set-nickname input {
  background: #212121;
  border: 0;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-set-nickname>div>button {
  color: #fff;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-chat-input-more {
  background: #3e3e4e;
}
.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-more-control-list>li>span {
  color: #fff;
}

.plv-chatroom__more-content__pop-ups {
  /* 需要大于播放器控制条的 z-inedx */
  z-index: 2002;
}
</style>
