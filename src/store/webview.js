/**
 * webview 模块
 */
import { isWebView } from '@polyv/web-view-bridge/dist/is-webview';

export default {
  namespaced: true,

  state: {
    // 是否基于保利威 webview 协议嵌入的观看页，Boolean值
    isPlvWebview: isWebView(),

    // 小窗是否开启
    isSmallWindow: false,

    // 是否播放中，适用于小窗
    isPlay: false,
  },

  mutations: {
    // 更新小窗状态
    updateWindowState(state, { isSmallWindow }) {
      state.isSmallWindow = isSmallWindow;
    },
    // 更新播放状态
    updatePlayState(state, v) {
      state.isPlay = v;
    },
  }
};
