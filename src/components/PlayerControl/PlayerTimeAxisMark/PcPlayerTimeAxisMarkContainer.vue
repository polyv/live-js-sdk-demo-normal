<!-- @file 播放器时间轴标记-精彩看点业务组件 -->

<template>
  <div ref="container"
       class="c-pc-player-time-axis-mark-container">
    <!-- 按钮 -->
    <button class="c-pc-player-time-axis-mark-container__button"
            @mouseover="handleButtonMouseOver"
            @mouseleave="handleButtonMouseLeave">
      <i class="c-pc-player-time-axis-mark-container__button__icon"></i>
      精彩看点
    </button>
    <!-- 悬浮面板 -->
    <transition name="fade">
      <div ref="panel"
           v-show="timeAxisMarkPopperVisible"
           class="c-pc-player-time-axis-mark-container__panel"
           @mouseover="handlePanelMouseOver"
           @mouseleave="handlePanelMouseLeave">
        <div v-for="markPoint in timeAxisMarkList"
             :key="markPoint.id"
             class="c-pc-player-time-axis-mark-container__panel-item"
             @click="toSeekByTimeAxisMark(markPoint)">
          <img class="c-pc-player-time-axis-mark-container__panel-item__img"
               :src="markPoint.markMessage.previewUrl" />
          <div class="c-pc-player-time-axis-mark-container__panel-item__desc">
            <div class="c-pc-player-time-axis-mark-container__panel-item__desc__title g-singleline"
                 :title="markPoint.markMessage.title">
              {{ markPoint.markMessage.title }}
            </div>
            <span class="c-pc-player-time-axis-mark-container__panel-item__desc__time">
              {{ formatTime(markPoint.markTime) }}
            </span>
          </div>
        </div>
        <p v-if="timeAxisMarkList.length === 0"
           class="c-pc-player-time-axis-mark-container__panel-empty">
          暂无
        </p>
      </div>
    </transition>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue-demi';
import { formatTime } from '@/utils';

import { useTimeAxisMarkHook } from './use-time-axis-mark';

export default defineComponent({
  setup() {
    const { timeAxisMarkList, toSeekByTimeAxisMark } = useTimeAxisMarkHook();

    const timeAxisMarkPopperVisible = ref(false);

    function setTimeAxisMarkPopperVisible(bool) {
      timeAxisMarkPopperVisible.value = bool;
    }

    return {
      timeAxisMarkList,
      toSeekByTimeAxisMark,

      timeAxisMarkPopperVisible,
      setTimeAxisMarkPopperVisible
    };
  },
  data() {
    return {
      hoverInPanel: false
    };
  },
  methods: {
    formatTime,
    handleButtonMouseOver() {
      this.setTimeAxisMarkPopperVisible(true);
    },
    handleButtonMouseLeave() {
      setTimeout(() => {
        if (!this.hoverInPanel) {
          this.setTimeAxisMarkPopperVisible(false);
        }
      }, 300);
    },
    handlePanelMouseOver() {
      this.hoverInPanel = true;
      this.setTimeAxisMarkPopperVisible(true);
    },
    handlePanelMouseLeave() {
      this.hoverInPanel = false;
      this.setTimeAxisMarkPopperVisible(false);
    }
  },
});
</script>

<style lang="scss">
$--player-control-button-size: 48px !default;

.c-pc-player-time-axis-mark-container {
  display: inline-flex;
  align-items: center;
}

.c-pc-player-time-axis-mark-container__button {
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
.c-pc-player-time-axis-mark-container__button__icon {
  width: 10px;
  vertical-align: top;
  display: inline-block;
  margin-right: 2px;
  background-size: 100% auto;
  background-position: center center;
  background-repeat: no-repeat;
  height: 24px;
  background-image: url(./imgs/icon-highlight.png);
}

.c-pc-player-time-axis-mark-container__panel {
  position: absolute;
  bottom: $--player-control-button-size;

  width: 280px;
  max-height: 336px;
  padding: 16px;
  overflow: auto;
  pointer-events: all;
  cursor: pointer;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.85);

  &::-webkit-scrollbar {
    width: 6px;
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(170, 173, 199, .2);
    border-radius: 2px;
  }

  &:hover {
    opacity: 1;
    pointer-events: all;
  }
}

.c-pc-player-time-axis-mark-container__panel-item {
  display: flex;
  margin-bottom: 18px;
  color: #fff;
  &:last-child {
    margin-bottom: 0;
  }
}

.c-pc-player-time-axis-mark-container__panel-item__img {
  width: 84px;
  height: 48px;
  margin-right: 8px;
  background: #000;
  border-radius: 2px;
}

.c-pc-player-time-axis-mark-container__panel-item__desc {
  overflow: hidden;
}
.c-pc-player-time-axis-mark-container__panel-item__desc__title {
  margin-bottom: 2px;
  font-size: 12px;
  font-weight: bold;
  line-height: 22px;
}

.c-pc-player-time-axis-mark-container__panel-item__desc__time {
  font-size: 12px;
  line-height: 1;
  opacity: 0.6;
}

.c-pc-player-time-axis-mark-container__panel-empty {
  color: #fff;
}
</style>
