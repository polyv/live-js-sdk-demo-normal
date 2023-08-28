<template>
  <section class="plv-watch-mobile-main">
    <div class="plv-watch-mobile" :class="[isRtc ? 'plv-watch-mobile--rtc' : null, `plv-watch-mobile-activeTab--${activeTab}`, playerCtrl.isFullScreen ? 'plv-watch-pc__top--fullscreen': null]">
      <div
        class="plv-watch-mobile__top"
        ref="mobileTop"
        :class="{
         'plv-watch-mobile__screen-main': isPlayerMainPosition,
         'plv-watch-mobile__screen-sub': isPPTMainPosition
      }">
        <!-- 播放器区域 -->
        <div class="plv-watch-mobile-player"
             ref="plv-mobile-player"
             :style="{top: panelBodyRectTop}"
             id="plv-mobile-player"></div>
        <!-- 用于展示 RTC 主讲的 DOM -->
        <div class="plv-watch-mobile-player"
             id="plv-mobile-master-rtc-player"
             style="display: none;"></div>

        <!-- webview 小窗播放器 UI --start-->
        <!-- 播放按钮 如果在观看页隐藏播放器控件的时候需要用到 -->
        <!-- <img
          data-player-click
          v-show="!isPlay && !isSmallWindow"
          class="c-player__button"
          src="./imgs/button-play.png"
          @click="playerClick" /> -->
        <WebViewUi v-if="isPlvWebview"
                   v-show="isSmallWindow"
                   class="c-player__webview-ui"
                   :playerButtonVisible="!isPlay"
                   @click-main="playerClick" />
        <!-- webview 小窗播放器 UI --end-->
      </div>
      <mobile-rtc-panel v-if="playerInited"
                        v-show="!isSmallWindow" />
      <!-- 聊天室区域，包含 PPT 文档播放器和直播介绍页 -->
      <div class="plv-watch-mobile-chatroom plv-skin--dark"
           :class="[isPPTMainPosition ? 'plv-watch-mobile__screen-main' : null,
            isPlayerMainPosition ? 'plv-watch-mobile__screen-sub': null]">
        <tab-nav v-if="playerInited"
                 v-model="activeTab"
                 :tabData="tabData"
                 :originTabTypes="originTabTypes"
                 class="tab-nav"/>
        <section v-show="isCustomAcitveTab()"
                 class="custom-tab-content-wrapper">
          <!-- 这一区域用来展示定制的 Tab 面板 -->
          <mobile-intro v-show="isShowMobileIntro"/>
          <mobile-product-list v-if="enableRenderIRComponent"
                               v-show="isShowProductList"
                               @change-switch="changeProductSwitch"/>
        </section>
        <section v-show="!isCustomAcitveTab()"
                 class="plv-mobile-origin-tab-content"
                 ref="plv-mobile-origin-tab-content">
          <!-- 这一块会渲染  polyv-chat-room -->
          <donate-entrance v-if="playerInited && isEnableDonate"
                           isMobile/>
          <mobile-donate-panel v-if="playerInited && isEnableDonate"
                               :donateConfig="donateConfig" />
          <mobile-red-envelope-point-record v-if="enableRenderIRComponent" />
          <!-- 举报反馈/投诉 入口 -->
          <mobile-feed-back-entrance v-if="isEnableFeedBack" />
        </section>
        <!-- 用于展示一些气泡消息/动画特效 -->
        <section class="bubble-wrapper">
          <product-bubble v-if="playerInited"/>
          <donate-bubble :enable="isActiveChatTab"
                         isMobile/>
        </section>

        <div v-show="activeTab === TabNavType.PPT" class="switch-player" @click="beforeHandleSetMainPosition">
        </div>
      </div>
    </div>
    <!-- 举报反馈/投诉 弹窗 -->
    <mobile-feed-back v-if="isEnableFeedBack" />
  </section>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import WatchMixin from '@/components/Watch/WatchMixin';
import WebviewMixin from '@/components/Watch/WebviewMixin';
import TabNav from '@/components/TabNav/TabNav.vue';
import MobileIntro from '@/components/Intro/MobileIntro.vue';
import LikeService from '@/components/Like';
import IREntranceService from '@/components/InteractionsReceive';
import MobileFeedBackEntrance from '@/components/InteractionsReceive/FeedBack/MobileFeedBackEntrance.vue';
import MobileFeedBack from '@/components/InteractionsReceive/FeedBack/MobileFeedBack.vue';
import ProductBubble from '@/components/InteractionsReceive/Product/ProductBubble.vue';
import DonateBubble from '@/components/Donate/DonateBubble.vue';
import MobileRedEnvelopePointRecord
  from '@/components/InteractionsReceive/RedEnvelope/MobileRedEnvelopePointRecord.vue';
import MobileRtcPanel from '@/components/RTC/MobileRtcPanel.vue';

import { getDefaultConfigChat, PlvChannelScene, PlvChatUserType, TabNavType } from '@/const';
import PolyvChat, { plvChatMessageHub, PlvChatMessageHubEvents } from '@/sdk/chat';
import PolyvLive, { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';
import PolyvInteractionsReceive, { plvIRMessageHub, PlvIRMessageHubEvents } from '@/sdk/interactions-receive';

const irEntranceService = new IREntranceService();
const likeService = new LikeService();

export default {
  name: 'Mobile-Watch',
  mixins: [WatchMixin, WebviewMixin],
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
    MobileRedEnvelopePointRecord,
    MobileFeedBackEntrance,
    MobileFeedBack,
    MobileRtcPanel,
    WebViewUi: () => import('@/components/WebViewUi')
  },
  data() {
    const chatConfig = getDefaultConfigChat();

    return {
      /** 聊天室 SDK 中的 Tab 类型，文档这一块比较特殊，需要手动 concat 一下 */
      originTabTypes: chatConfig.tabData
        .map((i) => i.type)
        .concat([TabNavType.PPT]),
      playerInited: false,
      enableRenderIRComponent: false,
      TabNavType,
    };
  },
  computed: {
    ...mapState({
      config: (state) => state.config,
      isPlay: (state) => state.webview.isPlay,
    }),
    isAloneChannelScene() {
      return this.channelInfo.scene === PlvChannelScene.ALONE;
    },
    isShowMobileIntro() {
      return this.activeTab === TabNavType.INTRO;
    },
    /** 是否启用举报反馈/投诉 */
    isEnableFeedBack() {
      return this.enableRenderIRComponent && this.watchFeedbackEnabled;
    },
    panelBodyRectTop() {
      const clientHeight = this.$refs.mobileTop?.offsetHeight;
      return this.isPlayerMainPosition ? (clientHeight + clientHeight / 2) + 'px' : null;
    },
    isRtc() {
      return this.channelInfo.pureRtcEnabled === 'Y';
    }
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
      updateWebviewPlayState: 'webview/updatePlayState',
    }),
    /** 点击小窗中间播放图标 */
    playerClick() {
      // 如果是播放状态，就回到直播页面，否则就认定是暂停状态，就执行自动播放
      if (this.isSmallWindow && this.isPlay) {
        this.webviewBridge?.sendData('changeToNormal');
      } else {
        this.resumePlay();
      }
    },
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
          if (data.user.userId === this.config.userId) {
            const nick = data.user.nick;
            this.updateConfigNickname(nick);
          }
        }
      );
    },
    /** 绑定-直播消息总线事件 */
    bindLiveEvents() {
      const plvLive = PolyvLive.getInstance();

      // 渠道初始化
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.CHANNEL_DATA_INIT,
        ({ channelData }) => {
          const plvIR = PolyvInteractionsReceive.getInstance();
          // 更新 sessionId
          plvIR.updateOriginChannelData(channelData);
        }
      );

      // 播放器初始化
      plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, ({ data }) => {
        this.playerInited = true;
        this.renderLike(data);
        this.bindPlayerControlEvents();
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
          if (status === 'stop') return;

          if (status === 'live') {
            this.$toast({
              type: 'loading',
              message: '直播开始了，马上前往直播',
              onClose: () => {
                this.$emit('reload');
              },
            });
          } else { // 其他状态也须重置状态，如回放
            this.$emit('reload');
          }
        }
      );
    },
    bindPlayerControlEvents() {
      const plvLive = PolyvLive.getInstance();
      // 恢复播放
      plvLive.liveSdk.player.on('playing', () => {
        this.updateWebviewPlayState(true);
      });

      // 暂停播放
      plvLive.liveSdk.player.on('pause', () => {
        this.updateWebviewPlayState(false);
      });
      // 全屏切换
      plvLive.liveSdk.player.on('s2j_onNormalScreen', (isFullScreen) => {
        console.log('s2j_onNormalScreen');
        this.playerCtrl.isFullScreen = isFullScreen;
      });
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
    beforeHandleSetMainPosition() {
      const tabItem = this.tabData.find(item => item.type === TabNavType.PPT);
      this.handleSetMainPosition();
      tabItem.name = this.isPlayerMainPosition ? '视频' : 'PPT';
    }
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

#plv-mobile-master-rtc-player {
  z-index: 9999;
}

.plv-watch-mobile-chatroom {
  flex: 1;
  overflow: hidden;
}

.plv-watch-mobile-chatroom {
  position: relative;
}
.plv-watch-pc__top--fullscreen {
  .switch-player {
    display: none;
  }
}
.plv-watch-mobile--rtc {
  // RTC频道下，隐藏切换主副屏按钮
  .switch-player {
    display: none !important;
  }
}
.switch-player {
  position: absolute;
  right: 18px;
  background: url(data:image/png;base64,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) no-repeat;
  background-size: 40px;
  width: 40px;
  height: 40px;
  animation-name: g-k-fade-in;
  animation-duration: 0.35s;
  top: 80px;
  z-index: 20;
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

.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-cr-navbar > li.polyv-crn-active {
  color: #fff;
  border: 0;
}

.plv-watch-mobile .plv-skin--dark li.polyv-crn-active > span {
  display: inline-block;
  line-height: 35px;
  border-bottom: 2px solid #fff;
}

.plv-watch-mobile .plv-skin--dark .polyv-chat-room > .polyv-cr-body {
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

.plv-watch-mobile .plv-skin--dark .polyv-chat-room .polyv-chat-list > .polyv-msg {
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

.plv-watch-mobile .plv-skin--dark .polyv-chat-room > .polyv-cr-body .polyv-set-nickname.show {
  background: #3e3e4e;
}

.plv-watch-mobile .plv-skin--dark .polyv-chat-room > .polyv-cr-body .polyv-set-nickname input {
  background: #212121;
  border: 0;
}

.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-set-nickname > div > button {
  color: #fff;
}

.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-chat-input-more {
  background: #3e3e4e;
}

.plv-watch-mobile .plv-skin--dark .mobile-wrap .polyv-more-control-list > li > span {
  color: #fff;
}

.plv-watch-mobile .polyv-chat-room .polyv-other-msg.polyv-redpack-result-msg {
  display: inline-block;
  width: 100%;
}

.plv-chatroom__more-content__pop-ups {
  /* 需要大于播放器控制条的 z-inedx */
  z-index: 2002;
}

.p-watch--small-window {
  .plv-watch-mobile__top {
    padding-top: 0;
    height: 100%;
    z-index: 99998;
  }

  .c-player__button {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    margin-top: -40px;
    margin-left: -40px;
    z-index: 999;
  }

  .c-player__webview-ui {
    z-index: 99999;
  }

  .plwrap > div,
  .pv-player-rtc-controls,
  video::-webkit-media-controls-enclosure {
    display: none !important;
  }

  .plwrap > .plv-live-loading,
  .plwrap > .plvideo {
    display: block !important;
  }
}
.plv-watch-mobile__screen-main {
  .plv-watch-mobile-player {
    top: 100%;
    margin-top: 38px;
    z-index: 15;
    display: none;
  }
}
.plv-watch-mobile__screen-sub {
  .tab-ppt {
    .pv-ppt-layout {
      position: fixed !important;
      top: 0;
      z-index: 10;
      height: 56.25vw !important;
    }
  }
}
.plv-watch-mobile-activeTab--ppt {
  .plv-watch-mobile-player {
    display: block;
  }
}
</style>
