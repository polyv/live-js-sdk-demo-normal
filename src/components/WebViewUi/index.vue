<template>
  <!-- webview 小窗后 UI -->
  <div class="c-player-ui__webview">
    <div class="c-player-ui__webview__header">
      <button class="c-player-ui__webview__back-btn"
              @click="onClickWebviewBack"></button>
      <button class="c-player-ui__webview__close-btn"
              @click="onClickWebviewClose"></button>
    </div>
    <div class="c-player-ui__webview__main"
         @click="onClickMain">
      <div v-show="playerButtonVisible"
           class="c-player-ui__webview__btn__play"></div>
    </div>
  </div>
</template>

<script>
import WebviewPluginMixin from '@/plugins/webview';

export default {
  mixins: [WebviewPluginMixin],

  props: {
    playerButtonVisible: {
      type: Boolean,
    }
  },

  methods: {
    onClickWebviewBack() {
      this.webviewBridge && this.webviewBridge.sendData('changeToNormal');
    },

    onClickWebviewClose() {
      this.webviewBridge && this.webviewBridge.sendData('closeWindow');
    },

    onClickMain() {
      this.$emit('click-main');
    },
  },
};
</script>

  <style lang="scss">
  .c-player-ui__webview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .c-player-ui__webview__header {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 24px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .c-player-ui__webview__back-btn,
  .c-player-ui__webview__close-btn {
    width: 24px;
    height: 24px;
    background-color: transparent;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
  }
  .c-player-ui__webview__back-btn {
    background-image: url('./imgs/back-btn.png');
  }
  .c-player-ui__webview__close-btn {
    background-image: url('./imgs/close-btn.png');
  }

  .c-player-ui__webview__main {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .c-player-ui__webview__btn__play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    background-size: cover;
    background-position: center;
    background-image: url('./imgs/play-btn.png');
  }
  </style>
