/**
 * webview 相关 mixin
 */

import { webviewBridge } from '@/utils/webview';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      isSmallWindow: state => state.webview.isSmallWindow,
      isPlvWebview: state => state.webview.isPlvWebview,
      isPlay: state => state.webview.isPlay
    }),
    // 异步初始化，不确保必定有值，使用时务必进行判断或使用可选链访问
    webviewBridge() {
      return webviewBridge;
    },
  },

  methods: {
    /** 获取桥接器 */
    getPlvWebviewBridge() {
      return this.webviewBridge;
    },
    // 开启小窗
    sendProductToWebview(item) {
      console.log('isPlvWebview', this.isPlvWebview);
      if (this.isPlvWebview && !this.isSmallWindow) {
        console.log('发送开启小窗事件');
        const { mobileLink, wxMiniprogramOriginalId, wxMiniprogramLink, mobileAppLink, link } = item;
        const data = {
          mobileLink,
          wxMiniprogramOriginalId,
          wxMiniprogramLink,
          mobileAppLink
        };
        const webviewData = {
          width: 160,
          height: 90,
          newPage: true,
          link,
          data
        };
        this.webviewBridge.sendData('clickProduct', webviewData);
      } else {
        window.open(item.link, '_blank');
      }
    }
  }
};
