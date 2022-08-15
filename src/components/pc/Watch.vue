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
import getLikeComponent from '@/components/common/Like';
import WatchStatus from '@/components/common/WatchStatus.vue';
import PcMenu from '@/components/pc/Menu.vue';
import PcMiniTool from '@/components/pc/MiniTool.vue';
import { getIREntrance } from '@/components/interactions-receive';

import { MainScreenMap, PlvChannelScene, PlvChatUserType } from '@/const';
import PolyvChat, {
  plvChatMessageHub,
  PlvChatMessageHubEvents,
} from '@/sdk/chat';
import PolyvLive, {
  plvLiveMessageHub,
  PlvLiveMessageHubEvents,
} from '@/sdk/live';
import PolyvInteractionsReceive from '@/sdk/interactions-receive';

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
    isAloneChannelScene() {
      return this.channelInfo.scene === PlvChannelScene.ALONE;
    },
    isPlayerMainPosition() {
      return this.playerCtrl.mainPosition === MainScreenMap.player.value;
    },
    isPPTMainPosition() {
      return this.playerCtrl.mainPosition === MainScreenMap.ppt.value;
    },
  },
  mounted() {
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
  },
  methods: {
    ...mapMutations({
      updateConfigChat: 'config/updateChat',
    }),
    updateConfigChatByScene(scene) {
      const userType =
        scene === PlvChannelScene.PPT
          ? PlvChatUserType.SLICE
          : PlvChatUserType.STUDENT;
      this.updateConfigChat({
        userType,
      });
    },
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
    initSdk({ controllerEl, chatContainer, playerEl, pptEl }) {
      const plvChat = PolyvChat.setInstance(
        {
          config: this.config,
          chatInfo: this.chatInfo,
        },
        { chatContainer }
      );
      PolyvLive.setInstance(
        { config: this.config, apiToken: this.apiToken },
        { socket: plvChat.socket },
        {
          controllerEl,
          playerEl,
          pptEl,
        }
      );

      this.bindChatEvents();
      this.bindLiveEvents();
    },
    bindChatEvents() {
      const plvLive = PolyvLive.getInstance();

      plvChatMessageHub.on(PlvChatMessageHubEvents.ROOM_MESSAGE, ({ data }) => {
        plvLive.sendBarrage(data);
      });
    },
    bindLiveEvents() {
      const plvLive = PolyvLive.getInstance();

      // 渠道初始化
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.CHANNEL_DATA_INIT,
        (channelData) => {
          // 初始化互动 SDK
          PolyvInteractionsReceive.setInstance(
            {
              config: this.config,
              channelData,
              apiToken: this.apiToken,
            },
            {
              socket: plvLive.socket,
            }
          );
          this.renderIREntrance();
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

      // // 修改昵称
      plvLiveMessageHub.on(
        PlvLiveMessageHubEvents.SET_NICK_NAME,
        ({ nick }) => {
          const plvIR = PolyvInteractionsReceive.getInstance();
          plvIR.updateNickName(nick);
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
    /**
     * 渲染互动功能入口
     */
    renderIREntrance() {
      const { $el } = getIREntrance();
      const $tabChat = document.getElementById('tab-chat');
      $tabChat.appendChild($el);
    },
    renderLike(data) {
      const { $el, instance } = getLikeComponent();
      instance.setData({ likeNum: data.likes });
      const $tabChat = document.getElementById('tab-chat');
      $tabChat.appendChild($el);
    },
    bindPlayerControlEvents() {
      const plvLive = PolyvLive.getInstance();

      // 监听直播JS-SDK的播放器事件，请参考实例 player 对象的事件
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
  width: 92%;
  min-width: 1180px;
  margin: auto;
  padding-top: 50px;
  background-color: #141518;
}

.plv-pc-menu__container {
  width: 92%;
  min-width: 1180px;
  margin: auto;
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
