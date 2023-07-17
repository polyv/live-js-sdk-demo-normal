<!-- @file 进度条组件 -->
<template>
  <div class="c-slide-bar"
       :class="{
      'c-slide-bar--horizontal': direction === 'horizontal',
      'c-slide-bar--vertical': direction === 'vertical',
      'c-slide-bar--zoom': hoverToZoom,
    }"
       @mouseover="setSliderBarHover(true)"
       @mouseout="setSliderBarHover(false)"
       @mousedown.stop
       @mouseup.stop
       @touchstart.stop>
    <div ref="containerRef"
         class="c-slide-bar__container"
         :class="{
        'c-slide-bar__container--dragging': isDragging,
      }"
         :style="containerStyle"
         @mousedown="onMouseDown"
         @mousemove="onTrackMouseMove"
         @mouseup="onMouseUp"
         @touchstart="onMouseDown"
         @touchcancel="onMouseUp"
         @touchend="onMouseUp">
      <!-- 插槽-tooltip -->
      <div v-if="tooltips"
           class="c-slide-bar__tips"
           :style="{
          left: `${trackHoverX}px`,
        }">
        <div class="c-slide-bar__tips__content">
          <slot name="tooltips"
                :content="trackHoverValue">{{
            trackHoverValue
          }}</slot>
        </div>
      </div>
      <!-- 轨道外层 -->
      <div class="c-slide-bar__wrap-track"
           :style="wrapTrackStyle">
        <!-- 轨道内层 -->
        <div class="c-slide-bar__inner-track"
             :style="innerTrackStyle"></div>
      </div>
      <!-- 轨道点 -->
      <div class="c-slide-bar__dot"
           :style="sliderDotStyle"></div>
      <!-- 插槽-标记点 -->
      <slot name="markPoint"
            :slider-bar-hover="sliderBarHover"
            :slider-bar-container="containerRef"></slot>
    </div>
  </div>
</template>

<script lang="js">
import { defineComponent } from 'vue-demi';
import { sliderBarProps, useSliderBar } from './use-slider-bar';

export default defineComponent({
  props: sliderBarProps(),
  setup(props, ctx) {
    return useSliderBar({
      props,
      emit: ctx.emit
    });
  },
  beforeDestoryed() {
    this.removeListenWindowEvent();
  }
}

);
</script>

<style lang="scss">
.c-slide-bar {
  cursor: pointer;
}
.c-slide-bar__container {
  position: relative;
}

.c-slide-bar__tips {
  position: absolute;
  top: 4px;
  display: none;
  width: 1px;
  height: 1px;
  pointer-events: none;
}
.c-slide-bar__tips__content {
  position: absolute;
  bottom: 0;
  left: 50%;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 32px;
  color: #fff;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 2px;
  transform: translateX(-50%);
}

.c-slide-bar__wrap-track {
  position: absolute;
  top: 50%;
  left: 50%;
  overflow: hidden;
  transform: translate(-50%, -50%);
}

.c-slide-bar__inner-track {
  position: absolute;
}

.c-slide-bar__dot {
  position: absolute;
  background: #fff;
  border-radius: 50%;
}

.c-slide-bar--horizontal {
  width: 100%;
  .c-slide-bar__wrap-track {
    width: 100%;
  }
  .c-slide-bar__inner-track {
    left: 0;
    height: 100%;
  }
  .c-slide-bar__dot {
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.c-slide-bar--vertical {
  height: 100%;
  .c-slide-bar__container {
    height: 100%;
  }
  .c-slide-bar__wrap-track {
    height: 100%;
  }
  .c-slide-bar__inner-track {
    bottom: 0;
    width: 100%;
  }
  .c-slide-bar__dot {
    left: 50%;
    transform: translate(-50%, 50%);
  }
}

.c-slide-bar--zoom {
  .c-slide-bar__container--dragging,
  .c-slide-bar__container:hover {
    .c-slide-bar__wrap-track {
      zoom: 2.5;
    }
    .c-slide-bar__dot {
      zoom: 1.4;
    }
  }
}
.c-slide-bar__container--dragging,
.c-slide-bar__container:hover {
  .c-slide-bar__tips {
    display: block;
  }
}
</style>
