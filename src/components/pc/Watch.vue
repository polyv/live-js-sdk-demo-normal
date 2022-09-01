<template>
  <section>
    <div :class="{
      'plv-watch-pc':true,
      'plv-watch-pc--alone': isAloneChannelScene
    }">
      <!-- 主区域-三分屏文档播放器/主要视频播放器 -->
      <div class="plv-watch-pc__top"
           ref="plv-pc-top"
           id="plv-pc-top"
           :class="{
             'plv-watch-pc__top--fullscreen':playerCtrl.isFullScreen
           }">
        <div :class="{
          'plv-watch-pc__screen':true,
          'plv-watch-pc__screen-main':isPPTMainPosition,
          'plv-watch-pc__screen-sub':isPlayerMainPosition
        }">
          <div class="plv-watch-pc__screen__height">
            <div class="plv-watch-pc__screen__inner"
                 ref="plv-pc-main"
                 id="plv-pc-main"></div>
          </div>
        </div>

        <!-- 侧边栏-三分屏视频播放器 -->
        <div :class="{
          'plv-watch-pc__screen':true,
          'plv-watch-pc__screen-main':isPlayerMainPosition,
          'plv-watch-pc__screen-sub':isPPTMainPosition
        }">
          <div class="plv-watch-pc__screen__height">
            <div class="plv-watch-pc__screen__inner"
                 ref="plv-pc-side"
                 id="plv-pc-side"></div>
          </div>
        </div>

        <!-- 侧边栏-聊天室 -->
        <div class="plv-watch-pc__side">
          <div class="plv-watch-pc__chat plv-skin--dark"
               ref="plv-pc-chat"
               id="plv-pc-chat">
            <!-- renderIREntrance 和 renderLike 会渲染这一块区域 -->
            <pc-mini-tool />
          </div>
        </div>
      </div>

      <!-- 频道信息 -->
      <div class="plv-watch-pc__info">
        <img class="plv-watch-pc__info__logo"
             src="https://live.polyv.cn/assets/wimages/pc_images/logo.png" />
        <div class="plv-watch-pc__info__desc">
          <p class="plv-watch-pc__info__desc__name">
            {{ channelInfo.name }}
            <watch-status />
          </p>
          <span class="plv-watch-pc__info__desc__publisher-ico"></span>
          <span class="plv-watch-pc__info__desc__publisher">
            {{ channelInfo.publisher }}
          </span>
          <span class="plv-watch-pc__info__desc__view">
            {{ channelInfo.pageView + ' 次观看' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 菜单栏 -->
    <pc-menu />
  </section>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import LikeService from '@/components/common/Like';
import WatchStatus from '@/components/common/WatchStatus.vue';
import PcMenu from '@/components/pc/Menu.vue';
import PcMiniTool from '@/components/pc/MiniTool.vue';
import IREntranceService from '@/components/interactions-receive';

import { MainScreenMap, PlvChannelScene, PlvChatUserType } from '@/const';
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
  name: 'PC-Watch',
  /** 由父组件来保证数据存在 */
  props: {
    channelInfo: Object,
    chatInfo: Object,
    apiToken: String,
  },
  components: {
    PcMenu,
    WatchStatus,
    PcMiniTool,
  },
  data() {
    return {
      playerCtrl: {
        /** 是否全屏 */
        isFullScreen: false,
        /** 主视图位置，用于记录当前主屏幕是文档还是播放器 */
        mainPosition: MainScreenMap.ppt.value,
      },
    };
  },
  computed: {
    ...mapState({
      config: (state) => state.config,
    }),
    /** 是否为"活动拍摄"场景 */
    isAloneChannelScene() {
      return this.channelInfo.scene === PlvChannelScene.ALONE;
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
  mounted() {
    /** 直播场景 */
    const scene = this.channelInfo.scene || '';
    const controllerEl = this.$refs['plv-pc-top'];
    const chatContainer = this.$refs['plv-pc-chat'];
    const { playerEl, pptEl } = this.getPlayElByScene(scene);

    this.updateConfigChatByScene(scene);
    this.initSdk({
      controllerEl,
      chatContainer,
      playerEl,
      pptEl,
    });
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
      if (scene === PlvChannelScene.PPT) {
        this.updateConfigChat({
          userType: PlvChatUserType.SLICE,
        });
      }
    },
    /** 根据直播场景来获取相关的播放器元素 */
    getPlayElByScene(scene) {
      const mainPlayer = this.$refs['plv-pc-main'];
      const sidePlayer = this.$refs['plv-pc-side'];

      if (scene === PlvChannelScene.PPT) {
        return {
          pptEl: mainPlayer,
          playerEl: sidePlayer,
        };
      } else {
        return {
          pptEl: undefined,
          playerEl: mainPlayer,
        };
      }
    },
    /**
     * 初始化 SDK，注意不能更换 SDK 初始化顺序
     * */
    initSdk({ controllerEl, chatContainer, playerEl, pptEl }) {
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

      // 初始化-直播SDK
      PolyvLive.setInstance(
        { config: this.config, apiToken: this.apiToken },
        { socket: plvChat.socket },
        {
          controllerEl,
          playerEl,
          pptEl,
        }
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
        this.renderLike(data);
        this.bindPlayerControlEvents();
      });

      // 点赞互动
      plvLiveMessageHub.on(PlvLiveMessageHubEvents.INTERACTIVE_LIKE, () => {
        plvLive.liveSdk.sendLike(1);
      });

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
            alert('直播开始了，马上前往直播');
            this.$emit('reload');
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
    /**
     * 绑定-直播JS-SDK的 player 实例事件
     * @see {@link https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_api?id=%e5%ae%9e%e4%be%8b-player-%e5%af%b9%e8%b1%a1 实例-player-对象}
     * */
    bindPlayerControlEvents() {
      const plvLive = PolyvLive.getInstance();

      // 全屏切换
      plvLive.liveSdk.player.on('fullscreenChange', (isFullScreen) => {
        this.playerCtrl.isFullScreen = isFullScreen;
      });

      /** 切换主副屏播放器 */
      const _handleSwitchPlayer = (nextMainPosition) => {
        this.playerCtrl.mainPosition = nextMainPosition;
        this.$nextTick(() => {
          // ppt容器宽高修改，调用resize刷新ppt尺寸
          plvLive.liveSdk.player.resize();
          // 刷新弹幕显示区域尺寸
          plvLive.liveSdk.player.resizeBarrage();
        });
      };

      // 点击控制栏切换按钮触发
      plvLive.liveSdk.player.on('switchPlayer', () => {
        const nextMainPosition =
          MainScreenMap[this.playerCtrl.mainPosition].next;
        _handleSwitchPlayer(nextMainPosition);
      });
      plvLive.liveSdk.player.on('switchMainScreen', (nextMainPosition) => {
        _handleSwitchPlayer(nextMainPosition);
      });
    },
  },
};
</script>

<style lang="scss">
.plv-watch-pc {
  width: 100%;
  min-width: 1180px;
  padding: 0 4%;
  margin-top: 50px;
  background-color: #141518;
}

.plv-pc-menu__container {
  width: 100%;
  min-width: 1180px;
  padding: 0 4%;
  background: #fff;
}

.plv-watch-pc__top {
  position: relative;
}
.plv-watch-pc__top .pv-ppt-controller {
  width: 76.2%;
  z-index: 99;
}

/* 保持比例撑起高度 9:16=高:宽=56.25% */
.plv-watch-pc__screen__height {
  position: relative;
  height: 0;
  padding-top: 56.25%;
}
.plv-watch-pc__screen__inner {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

/* 主屏（左侧） */
.plv-watch-pc__screen-main {
  width: 76.2%;
}
/* 辅屏（右侧） */
.plv-watch-pc__screen-sub {
  position: absolute;
  left: 76.2%;
  right: 0;
  top: 0;
}

/* 侧栏聊天室 */
.plv-watch-pc__side {
  position: absolute;
  left: 76.2%;
  right: 0;
  top: 0;
  bottom: 0;
}
.plv-watch-pc__chat {
  position: absolute;
  left: 0;
  top: 0;
  padding-top: 56.25%;
  width: 100%;
  height: 100%;
}
/* 普通直播，没有辅屏 */
.plv-watch-pc--alone .plv-watch-pc__chat {
  padding-top: 0;
}

/* 聊天室样式覆写 */
.plv-watch-pc .plv-skin--dark .polyv-chat-room {
  background-color: #202127;
}
.plv-watch-pc .plv-skin--dark .polyv-cr-navbar {
  background-color: #3e3e4e;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-cr-navbar>li {
  color: #adadc0;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-cr-navbar>li.polyv-crn-active {
  color: #fff;
  border-bottom: 0;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-cr-navbar>li.polyv-crn-active>span:first-child {
  border-bottom: 3px solid #fff;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-cr-navbar>li>span:first-child {
  display: inline-block;
  line-height: 35px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-cr-navbar>li>span {
  display: inline-block;
  line-height: 35px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room>.polyv-cr-body {
  background-color: #202127;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-input {
  background-color: #3e3e4e;
}
.plv-watch-pc .plv-skin--dark .tab-chat-content::-webkit-scrollbar {
  width: 6px;
}
.plv-watch-pc .plv-skin--dark .tab-chat-content::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #46464f;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-msg-content {
  background: #2b2c35;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-emotion-wrap {
  background: #202127;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-emotion-wrap:after {
  border-color: #202127 transparent transparent;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-input textarea {
  background: #2e2e36;
  padding: 4px;
  color: #fff;
  margin-bottom: 5px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-btn-info {
  background: #2b2c35;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-input .polyv-icon-emotion {
  background: url('~@/assets/emotion.png');
  background-size: 18px 18px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-input .polyv-icon-flower {
  background: url('~@/assets/flower.png');
  background-size: 18px 18px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-input .polyv-icon-like {
  background: url('~@/assets/like.png');
  background-size: 18px 18px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-input .polyv-pc-only-teacher {
  color: #fff;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-input-top {
  padding-bottom: 5px;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room>.polyv-cr-body .polyv-set-nickname.show {
  background: #3e3e4e;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room>.polyv-cr-body .polyv-set-nickname input {
  background: #212121;
  border: 0;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room>.polyv-cr-body .polyv-set-nickname .polyv-btn {
  background: #3e3e4e;
  color: #888;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room>.polyv-cr-body .polyv-set-nickname .polyv-btn-info {
  background: #2b2c35;
  color: #fff;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-chat-list>.polyv-msg {
  color: #adadc0;
}
.plv-watch-pc .plv-skin--dark .polyv-chat-room .polyv-fr>span {
  color: #adadc0;
}

/* 全屏样式处理 */
.plv-watch-pc__top--fullscreen .plv-watch-pc__screen-main {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 88;
}
.plv-watch-pc__top--fullscreen .plv-watch-pc__screen-main .plv-watch-pc__screen__height {
  position: static;
}
.plv-watch-pc__top--fullscreen .plv-watch-pc__side {
  display: none;
}
.plv-watch-pc__top--fullscreen .plv-watch-pc__screen-sub {
  position: static;
}
.plv-watch-pc .plv-watch-pc__top--fullscreen .pv-ppt-controller {
  width: 100%;
}

/* 频道信息 */
.plv-watch-pc__info {
  padding: 30px 0;
  color: #fff;
  font-size: 0;
}
.plv-watch-pc__info__logo {
  width: 50px;
  height: 100%;
  margin-right: 10px;
}
.plv-watch-pc__info__desc {
  display: inline-block;
  vertical-align: top;
}
.plv-watch-pc__info__desc__name {
  margin-bottom: 8px;
  line-height: 24px;
  font-size: 18px;
}
.plv-watch-pc__info__desc__publisher-ico {
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  background: url('~@/assets/person.png') no-repeat;
  background-size: 18px 18px;
  margin-right: 4px;
}
.plv-watch-pc__info__desc__publisher,
.plv-watch-pc__info__desc__view {
  font-size: 14px;
  vertical-align: middle;
}
.plv-watch-pc__info__desc__publisher::after {
  content: '|';
  margin: 0 16px;
}

// /* 适配不同屏幕尺寸 */
// @media (min-width: 1366px) {
//   .plv-watch-pc {
//     width: 1247px;
//   }
//   .plv-pc-menu__container {
//     width: 1247px;
//   }
// }
// @media (min-width: 1440px) {
//   .plv-watch-pc {
//     width: 1350px;
//   }
//   .plv-pc-menu__container {
//     width: 1350px;
//   }
// }
// @media (min-width: 1600px) {
//   .plv-watch-pc {
//     width: 1430px;
//   }
//   .plv-pc-menu__container {
//     width: 1430px;
//   }
// }
// @media (min-width: 1920px) {
//   .plv-watch-pc {
//     width: 1680px;
//   }
//   .plv-pc-menu__container {
//     width: 1680px;
//   }
// }

/* IE 适配 */
.plv-watch-pc .ply-liveppt-container > object {
  width: 100%;
  height: 100%;
}
</style>
