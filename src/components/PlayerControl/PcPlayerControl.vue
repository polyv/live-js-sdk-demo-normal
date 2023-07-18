<!-- PC 端播放器自定义控制栏 -->

<template>
  <div class="c-pc-player-control">
    <div class="c-pc-player-control__main">
      <div class="c-pc-player-control__content">
        <!-- 进度条 -->
        <pc-player-progress-bar v-if="progressBarVisible"
                                class="c-pc-player-control__progress" />

        <!-- 左侧按钮 -->
        <div class="c-pc-player-control__content__left">
          <!-- 暂停播放按钮 -->
          <div class="c-pc-player-control__button"
               :class="{
              'c-pc-player-control__button--pause': playStatus === PlayStatus.Playing,
              'c-pc-player-control__button--play': playStatus === PlayStatus.Pause,
            }"
               @click="toTogglePlay"></div>

          <!-- 直播时移时间进度 -->
          <div v-if="supportLiveTimeShift"
               class="c-pc-player-control__time">
            {{ currentTimeText }}
          </div>

          <!-- 回放时间进度 -->
          <div v-if="playbackTimeVisible"
               class="c-pc-player-control__time">
            {{ currentTimeText }} / {{ durationTimeText }}
          </div>

          <!-- 直播时移 -->
          <div v-if="timeShiftReturnLiveButtonVisible"
               class="c-pc-player-control__time-shift-container">
            <button class="c-pc-player-control__time-shift-container__button">
              <i class="c-pc-player-control__time-shift-container__button__return-live-icon"></i>
              返回直播
            </button>
          </div>

          <!-- 精彩看点 -->
          <pc-player-time-axis-mark-container v-if="supportTimeAxisMark && progressBarVisible"
                                              class="c-pc-player-control__time-axis-mark-container" />
        </div>

        <!-- 右侧按钮 -->
        <div class="c-pc-player-control__content__right">
          <pc-player-volume-setting />

          <!-- 全屏按钮 -->
          <div class="c-pc-player-control__button"
               :class="{
              'c-pc-player-control__button--fullscreen': !isFullscreen,
              'c-pc-player-control__button--fullscreen-cancel': isFullscreen,
            }"
               @click="toggleFullscreen"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PolyvLive from '@/sdk/live';
import { mapGetters, mapState } from 'vuex';

import PcPlayerProgressBar from './PcPlayerProgressBar.vue';
import PcPlayerTimeAxisMarkContainer from './PlayerTimeAxisMark/PcPlayerTimeAxisMarkContainer.vue';
import PcPlayerVolumeSetting from './PlayerVolumeSetting/PcPlayerVolumeSetting.vue';

const PlayStatus = {
  Playing: 'playing',
  Pause: 'pause'
};

export default {
  props: {
    /** 全屏选择器 */
    fullscreenSelector: {
      type: String
    }
  },
  components: {
    PcPlayerProgressBar,
    PcPlayerTimeAxisMarkContainer,
    PcPlayerVolumeSetting,
  },
  data() {
    return {
      PlayStatus,
      playStatus: PlayStatus.Pause,
      supportLiveTimeShift: false,
      supportTimeAxisMark: true,
      isFullscreen: false,
    };
  },
  computed: {
    ...mapState({
      liveStatus: state => state.base.liveStatus,
      currentTime: state => state.player.currentTime,
      durationTime: state => state.player.durationTime,
    }),
    ...mapGetters('player', [
      'currentTimeText',
      'durationTimeText',
    ]),
    progressBarVisible() {
      return this.durationTime !== 0;
    },
    timeShiftReturnLiveButtonVisible() {
      if (this.liveStatus !== 'live') return false;

      return this.currentTime !== this.durationTime && this.durationTime !== 0;
    },
    playbackTimeVisible() {
      return this.liveStatus !== 'live' && this.durationTime !== 0;
    }
  },
  mounted() {
    this.bindPlayStatusEvent();
  },
  methods: {
    //  ------------- 播放状态 -------------
    bindPlayStatusEvent() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk.player.on('playing', () => {
        this.playStatus = PlayStatus.Playing;
      });
      plive.liveSdk.player.on('pause', () => {
        this.playStatus = PlayStatus.Pause;
      });
    },
    toPlay() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk.player.play();
    },
    toPause() {
      const plive = PolyvLive.getInstance();
      plive.liveSdk.player.pause();
    },
    toTogglePlay() {
      if (this.playStatus === PlayStatus.Pause) {
        this.toPlay();
      } else {
        this.toPause();
      }
    },
    //  ------------- 全屏 -------------
    toggleFullscreen() {
      const plive = PolyvLive.getInstance();
      const player = plive.liveSdk.player;
      if (this.isFullscreen) {
        this.isFullscreen = false;
        player.fullScreen.exit();
      } else {
        this.isFullscreen = true;
        const $el = document.querySelector(this.fullscreenSelector);
        player.fullScreen.request($el);
      }

    }
  },
};
</script>

<style lang="scss">
$--player-control-button-size: 48px !default;
$--player-control-button-icon-size: 24px !default;
$--color-white: #fff;

// 控制栏布局

.c-pc-player-control {
  position: relative;
  width: 100%;
  height: 100%;
  color: $--color-white;
}

.c-pc-player-control__main {
  position: relative;
  z-index: 10;
  height: 100%;
  pointer-events: none;
  user-select: none;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
}

.c-pc-player-control__content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  pointer-events: initial;
}

.c-pc-player-control__progress {
  position: absolute;
  top: -16px;
  left: 0;
}

.c-pc-player-control__content__left {
  position: absolute;
  bottom: 0;
  left: 8px;
  display: flex;
  height: 100%;
}
.c-pc-player-control__content__right {
  position: absolute;
  right: 8px;
  bottom: 0;
  display: flex;
  height: 100%;
}

// 控制栏按钮

.c-pc-player-control__button {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: $--player-control-button-size;
  height: $--player-control-button-size;
  font-size: $--player-control-button-icon-size;
  cursor: pointer;
  background-repeat: no-repeat;
  background-position: center;
  background-size: $--player-control-button-icon-size $--player-control-button-icon-size;
}

.c-pc-player-control__button--play {
  background-image: url(./imgs/pc-player-ui-play.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-play-hover.png);
  }
}

.c-pc-player-control__button--pause {
  background-image: url(./imgs/pc-player-ui-pause.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-pause-hover.png);
  }
}

.c-pc-player-control__button--fullscreen {
  background-image: url(./imgs/pc-player-ui-fullscreen.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-fullscreen-hover.png);
  }
}
.c-pc-player-control__button--fullscreen-cancel {
  background-image: url(./imgs/pc-player-ui-fullscreen-cancel.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-fullscreen-cancel-hover.png);
  }
}

// 控制栏时间轴

.c-pc-player-control__time {
  height: $--player-control-button-size;
  margin-left: 12px;
  font-size: 14px;
  line-height: $--player-control-button-size;
  color: $--color-white;
}

.c-pc-player-control__time-shift-container {
  display: inline-flex;
  align-items: center;
  height: $--player-control-button-size;
  margin-left: 12px;
}

.c-pc-player-control__time-shift-container__button {
  padding: 0 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  font-size: 12px;
  height: 24px;
  min-width: 60px;
  border-radius: 12px;
  line-height: 24px;
  cursor: pointer;
}

.c-pc-player-control__time-shift-container__button__return-live-icon {
  width: 10px;
  vertical-align: top;
  display: inline-block;
  margin-right: 2px;
  background-size: 100% auto;
  background-position: center center;
  background-repeat: no-repeat;
  height: 24px;
  background-image: url(./imgs/icon-return-live.png);
}

.c-pc-player-control__time-axis-mark-container {
  height: $--player-control-button-size;
  margin-left: 12px;
}
</style>
