<!-- @file PC 端音量设置 -->
<template>
  <div class="c-pc-player-control__volume-setting">
    <div class="c-pc-player-control__volume-setting__content">
      <div class="c-pc-player-control__button"
           :class="{
          'c-pc-player-control__button--volume-setting': !isVolumeMute,
          'c-pc-player-control__button--volume-mute': isVolumeMute,
        }"
           @click="onClickVolumeButton"></div>

      <div class="c-pc-player-control__volume-setting__panel">
        <div class="c-pc-player-control__volume-setting__panel__percent">{{ volumeText }}</div>
        <div class="c-pc-player-control__volume-setting__panel__slider-bar">
          <slider-bar direction="vertical"
                      :min="0"
                      :max="1"
                      :value="currentVolume"
                      @drag-change="onVolumeChange" />
        </div>
      </div>
    </div>

    <div v-if="muteTipsVisible && isVolumeMute"
         class="c-pc-player-control__tips c-pc-player-control__tips--volume">
      是否允许浏览器播放声音？
      <span class="c-pc-player-control__tips__highlight"
            @click="onClickVolumeTips">
        播放声音
      </span>
      <i class="c-pc-player-control__tips__close"
         @click="closeMuteTips"></i>
    </div>
  </div>
</template>

<script>
import { computed, unref, defineComponent } from 'vue-demi';
import { useSimpleVisible } from '@/hooks/useSimpleVisible';
import SliderBar from '@/components/Base/SliderBar';
import { numberToFixed } from '@/utils';
import $store from '@/store';
import PolyvLive from '@/sdk/live';

export default defineComponent({
  setup() {
    const currentVolume = computed(() => {
      return $store.state.player.volume;
    });

    function toChangeVolume(volume) {
      const liveSdk = PolyvLive.getInstance().liveSdk;
      liveSdk.player.setVolume(volume);
      $store.commit('player/updatePlayerInfo', { volume });
    }

    const volumeText = computed(() => {
      return `${numberToFixed(unref(currentVolume) * 100, 0)}%`;
    });

    /** 当前是否处于静音状态 */
    const isVolumeMute = computed(() => {
      return unref(currentVolume) === 0;
    });

    function onVolumeChange(volume) {
      toChangeVolume(volume);
    }

    let recordVolume;

    /** 设为静音 */
    function toMuteVolume() {
      recordVolume = unref(currentVolume);
      toChangeVolume(0);
    }

    /** 取消静音 */
    function toCancelMuteVolume() {
      const volume = recordVolume || 0.5;
      toChangeVolume(volume);
    }

    function onClickVolumeButton() {
      if (unref(isVolumeMute)) {
        toCancelMuteVolume();
      } else {
        toMuteVolume();
      }
    }

    const { visible: muteTipsVisible, close: closeMuteTips } = useSimpleVisible(
      true
    );

    function onClickVolumeTips() {
      toCancelMuteVolume();
      closeMuteTips();
    }

    return {
      currentVolume,
      onVolumeChange,

      volumeText,
      onClickVolumeButton,

      muteTipsVisible,
      onClickVolumeTips,

      isVolumeMute,
      closeMuteTips
    };
  },
  components: {
    SliderBar
  },
});

</script>

<style lang="scss">
$--player-control-button-size: 48px !default;
$--player-control-panel-bg: rgba(0, 0, 0, 0.65) !default;

.c-pc-player-control__volume-setting__content {
  position: relative;
}
.c-pc-player-control__button--volume-setting {
  background-image: url(./imgs/pc-player-ui-sound.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-sound-hover.png);
  }
}

.c-pc-player-control__button--volume-mute {
  background-image: url(./imgs/pc-player-ui-sound-mute.png);
  &:hover {
    background-image: url(./imgs/pc-player-ui-sound-mute-hover.png);
  }
}

.c-pc-player-control__volume-setting__panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  z-index: 10;
  width: 62px;
  height: 182px;
  pointer-events: none;
  background: $--player-control-panel-bg;
  border-radius: 2px;
  opacity: 0;
  transition: 0.3s;
  transform: translateX(-50%);
}
.c-pc-player-control__volume-setting__panel__percent {
  position: absolute;
  top: 16px;
  width: 100%;
  font-size: 14px;
  color: #fff;
  text-align: center;
  user-select: none;
}
.c-pc-player-control__volume-setting__panel__slider-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  height: 120px;
  transform: translateX(-50%);
}
.c-pc-player-control__volume-setting__content:hover {
  .c-pc-player-control__button--volume-setting {
    background-image: url(./imgs/pc-player-ui-sound-hover.png);
  }
  .c-pc-player-control__button--volume-mute {
    background-image: url(./imgs/pc-player-ui-sound-mute-hover.png);
  }
  .c-pc-player-control__volume-setting__panel {
    pointer-events: initial;
    opacity: 1;
  }
}

.c-pc-player-control__tips-wrap {
  position: absolute;
  bottom: $--player-control-button-size + 24;
  left: 8px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
}

.c-pc-player-control__tips {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 18px 0 24px;
  margin-bottom: 8px;
  font-size: 16px;
  font-style: normal;
  line-height: 48px;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  pointer-events: initial;
  background-color: $--player-control-panel-bg;
  border-radius: 24px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.c-pc-player-control__tips__close {
  display: flex;
  margin-left: 8px;
  color: #a8a8a8;
  width: 10px;
  height: 10px;
  background-image: url(./imgs/icon-close-gray.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px;
  cursor: pointer;
}

.c-pc-player-control__tips--volume {
  position: absolute;
  right: 0;
  bottom: 100%;
  transform: translateY(-8px);
  span {
    cursor: pointer;
  }
}
</style>
