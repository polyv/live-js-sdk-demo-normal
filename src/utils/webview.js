/**
 * webview 桥接器相关逻辑
 */
import { WebViewBridge } from '@polyv/web-view-bridge';

export let webviewBridge = null;

export async function initWebviewBridge() {
  if (webviewBridge) { return; }
  try {
    webviewBridge = new WebViewBridge({
      autoJsonParseByReceive: true
    });
    await webviewBridge.connectWebViewBridge();
  } catch (e) {
    console.warn('桥接器连接失败', e);
  }
}
