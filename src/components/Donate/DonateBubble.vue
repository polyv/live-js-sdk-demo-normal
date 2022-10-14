<template>
  <div class="c-donate-bubble"
       v-show="isShowBubble">
    <div id="svga-player-container"
         :class="{
        'svga-player-container':true,
        'mobile': isMobile
      }"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import SVGA from 'svgaplayerweb';

import { plvChatMessageHub, PlvChatMessageHubEvents } from '@/sdk/chat';
import { getSvgaUrl } from './svga-util';

/**
 * 打赏动效组件
 */
export default {
  data() {
    return {
      isShowBubble: false,
    };
  },

  mounted() {
    plvChatMessageHub.on(
      PlvChatMessageHubEvents.DONATE_CALLBACK,
      this.handleReward
    );
  },

  beforeDestroy() {
    plvChatMessageHub.off(
      PlvChatMessageHubEvents.DONATE_CALLBACK,
      this.handleReward
    );
  },

  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },

  methods: {
    handleReward(evt) {
      const data = evt.data;
      const gimg = data.content.gimg;
      const svgaUrl = getSvgaUrl(gimg);
      if (svgaUrl) {
        this.isShowBubble = true;

        const player = new SVGA.Player('#svga-player-container');
        // player.loops = 1;
        const parser = new SVGA.Parser('#svga-player-container');

        parser.load(
          svgaUrl,
          (videoItem) => {
            player.setVideoItem(videoItem);
            player.startAnimation();
          },
          (err) => {
            console.error('svgaUrlError', err);
            this.isShowBubble = false;
          }
        );

        player.onFinished(() => {
          this.isShowBubble = false;
        });
      }
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
