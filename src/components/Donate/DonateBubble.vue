<template>
  <div class="c-donate-bubble"
       v-show="isAniming && enable">
    <div id="c-donate-bubble-svga-player"
         :class="{
        'svga-player-container':true,
        'mobile': isMobile
      }"></div>
  </div>
</template>

<script>
import SVGA from 'svgaplayerweb';

import { plvChatMessageHub, PlvChatMessageHubEvents } from '@/sdk/chat';
import { getSvgaUrl } from './svga-util';

/** 记录加载的promise，避免重复加载 */
const loadSvgasPromise = {};

/**
 * 打赏动效组件
 */
export default {
  props: {
    enable: {
      type: Boolean,
      default: true,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      parser: null, // svga加载器
      player: null, // 动画播放器
      donateQueue: [], // 播放队列
      isAniming: false, // 动画是否这种播放中
    };
  },

  watch: {
    isAniming() {
      // 一次动画结束，队列存在待播放动画则出队一个动画并播放
      if (!this.isAniming && this.donateQueue.length) {
        const url = this.donateQueue.shift();
        this.createAnim(url);
      }
    },
  },

  mounted() {
    this.initDonateAnimation();
    this.createPlayer();
    plvChatMessageHub.on(
      PlvChatMessageHubEvents.DONATE_CALLBACK,
      this.handleRewardSocket
    );
  },

  beforeDestroy() {
    plvChatMessageHub.off(
      PlvChatMessageHubEvents.DONATE_CALLBACK,
      this.handleRewardSocket
    );
  },

  methods: {
    /** 初始化 */
    initDonateAnimation() {
      this.clearAnimation();
      this.parser = null;
      this.player = null;
      this.donateQueue = [];
      this.isAniming = false;
    },

    /** 创建动画播放器 */
    createPlayer() {
      this.parser = new SVGA.Parser('#c-donate-bubble-svga-player');
      this.player = new SVGA.Player('#c-donate-bubble-svga-player');
    },

    /** 处理打赏socket消息 */
    handleRewardSocket(evt) {
      const data = evt.data;
      const gimg = data.content.gimg;
      const svgaUrl = getSvgaUrl(gimg);
      if (svgaUrl) {
        this.pushQueue(svgaUrl);
      }
    },

    // 向动画队列入队一个动画
    pushQueue(currentSvga) {
      const oldLength = this.donateQueue.length;
      this.donateQueue.push(currentSvga);
      if (!this.isAniming && !oldLength) {
        const url = this.donateQueue.shift();
        this.createAnim(url);
      }
    },

    // 加载svga文件
    loadSvgaFile(url) {
      if (!loadSvgasPromise[url]) {
        loadSvgasPromise[url] = new Promise((resolve, reject) => {
          try {
            this.parser.load(url, (videoItem) => {
              resolve(videoItem);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
      return loadSvgasPromise[url];
    },

    // 销毁动画
    clearAnimation() {
      try {
        if (this.player) {
          this.player.clear();
          this.player.clearDynamicObjects();
        }
      } catch (e) {
        console.warn('清除动画失败');
      }
    },

    // 创建动画
    createAnim(url) {
      this.$nextTick(async () => {
        this.clearAnimation();

        try {
          this.isAniming = true;
          const videoItem = await this.loadSvgaFile(url);
          // 设置循环次数
          this.player.loops = 1;
          // 设置播放器文件
          this.player.setVideoItem(videoItem);
          // 开始播放动画
          this.player.startAnimation();
          // 侦听播放结束，播放下一个动画
          this.player.onFinished(() => {
            this.isAniming = false;
          });
        } catch (e) {
          this.isAniming = false;
        }
      });
    },
  },
};
</script>

<style lang="scss">
.c-donate-bubble {
  position: relative;
  /* 需要大于播放器控制条和互动功能的 z-inedx */
  z-index: 2002;
  .svga-player-container {
    max-height: 280px;
    &.mobile {
      max-height: 60vh;
    }
  }
}
</style>
