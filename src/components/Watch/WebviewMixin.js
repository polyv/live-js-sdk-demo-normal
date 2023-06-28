import { mapState } from 'vuex';
import { initWebviewBridge } from '@/utils/webview';// 创建桥接器
import WebviewPluginMixin from '@/plugins/webview';// webview mixin
import PolyvLive from '@/sdk/live';// 用到了播放器事件

const pageSmallWindowClass = 'p-watch--small-window';

export default {
  mixins: [WebviewPluginMixin],

  computed: {
    ...mapState({
      viewerInfo: state => state.config,
    }),
  },

  watch: {
    isSmallWindow() {
      if (this.isSmallWindow) {
        document.body.classList.add(pageSmallWindowClass);
      } else {
        document.body.classList.remove(pageSmallWindowClass);
      }
    },
  },

  async created() {
    if (this.isPlvWebview) {
      // 标准 plv webview 下，初始化 webview 桥接器并监听事件
      await initWebviewBridge();
      this.bindWebviewEvents();
      this.sendInitInfo();
      // window.addEventListener('resize', this.handlePageResize);
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  },

  beforeDestroy() {
    if (this.isPlvWebview) {
      this.unbindWebviewEvents();
      // window.removeEventListener('resize', this.handlePageResize);
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  },

  methods: {
    bindWebviewEvents() {
      this.webviewBridge?.on('changeToSmall', this.onChangeToSmall);
      this.webviewBridge?.on('changeToNormal', this.onChangeToNormal);
    },

    unbindWebviewEvents() {
      this.webviewBridge?.off('changeToSmall', this.onChangeToSmall);
      this.webviewBridge?.off('changeToNormal', this.onChangeToNormal);
    },

    /**
     * 传参给 webview。主要是 iOS 系统级小窗需要下列信息
     */
    sendInitInfo() {
      const detailData = this.channelInfo;
      const viewerInfo = this.viewerInfo;
      const marqueeName = viewerInfo.nickname || 'guest';

      this.webviewBridge?.sendData('getLiveUserInfo', {
        userId: detailData.userCategory.userId,
        channelId: detailData.channelId,
        customParam: {
          liveParam1: viewerInfo.userId || 'guest', // 用户id,
          liveParam2: marqueeName,
          liveParam3: '',
          liveParam4: viewerInfo.param4 || '',
          liveParam5: viewerInfo.param5 || '',
        }
      });
    },

    // 监听开启小窗
    onChangeToSmall(e = {}) {
      console.log('监听开启小窗changeToSmall');
      this.$store.commit('webview/updateWindowState', { isSmallWindow: true });
      if (e && e.isPIP) {
        // iOS 系统级小窗情况，暂停 web 播放，交由 iOS 原生播放
        this.pausePlay();
      }
    },

    // 监听回到正常模式
    onChangeToNormal(e) {
      console.log('监听回到正常模式changeToNormal');
      this.$store.commit('webview/updateWindowState', { isSmallWindow: false });
      if (e && e.isPIP) {
        // iOS 系统级小窗情况，恢复 web 播放
        this.resumePlay();
      }
    },

    // 处理小窗/正常模式切换后
    handlePageResize() {
      console.log('处理小窗/正常模式切换后');
    },

    // 处理发生跳转的情况
    async handleBeforeUnload() {
      if (this.isSmallWindow) {
        await this.waitForRecover();
      }
    },

    // 从小窗恢复常规样式
    waitForRecover() {
      this.webviewBridge?.sendData('changeToNormal');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 200);
      });
    },

    // 暂停播放
    pausePlay() {
      const plive = PolyvLive.getInstance();
      if (plive) plive.liveSdk.player.pause();
    },

    // 恢复播放
    resumePlay() {
      const plive = PolyvLive.getInstance();
      if (plive) plive.liveSdk.player.play();
    },
  },
};
