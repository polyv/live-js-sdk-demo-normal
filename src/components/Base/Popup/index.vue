<template>
  <div ref="popup"
       v-show="visible"
       class="c-popup"
       :class="{
      'c-popup--fullscreen': fullScreen,
      'c-popup--portrait': isPortraitScreenMode && !forceHorizontalScreen,
       'c-popup--portrait__horizontal__force': isPortraitScreenMode && forceHorizontalScreen,
      'c-popup--landscape': isLandscapeScreenMode,
    }"
       :style="{ zIndex: noMaskLayer ? 11 : 10001 }">
    <transition name="fade"
                @after-enter="$emit('opened')">
      <div v-show="innerVisible"
           class="c-popup__bg"
           @click="handleModalClose"></div>
    </transition>
    <transition name="slide"
                @after-leave="afterLeave">
      <div ref="popupContent"
           v-show="innerVisible"
           class="c-popup-content"
           :class=" [
          isLandscapeScreenMode || forceHorizontalScreen ? 'c-popup-content--landscape_' + landscapePosition : ''
        ]"
           :style="popupContentStyle">
        <div ref="customHeader"
             class="c-popup__custom-header">
          <slot name="header"
                :popupMethods="{ handleClose, handleConfirm }"></slot>
        </div>
        <div v-if="showHeader"
             class="c-popup__header">
          <span v-if="closable"
                class="c-popup-btn c-popup-btn__close i-close-modal"
                @click="handleClose"></span>
          <span v-if="backable"
                class="c-popup-btn c-popup-btn__back i-back-modal"
                @click="handleBack"></span>
          <h2>{{ title }}</h2>
        </div>
        <div class="c-popup-body"
             :style="bodyStyle">
          <slot></slot>
        </div>
        <div class="c-popup-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
/** 根据旋转角度，判断当前屏幕是否竖屏 */
export const isPortraitScreen = () => {
  return window.orientation === 180 || window.orientation === 0;
};

/** 根据旋转角度，判断当前屏幕是否横屏 */
export const isLandscapeScreen = () => {
  return window.orientation === 90 || window.orientation === -90;
};

/** 屏幕旋转模式 */
export const SCREEN_ORIENTATION_MODE = {
  /** 屏幕横屏 */
  Landscape: 'landscape',
  /** 屏幕竖屏 */
  Portrait: 'portrait',
};

/** 屏幕横屏时位置枚举 */
const LANDSCAPE_POSITION = {
  Right: 'right',
  Center: 'center',
  Left: 'left'
};

export default {
  props: {
    showHeight: Boolean,
    title: String,
    /** 全屏处理，目前对屏幕横屏的处理就是按全屏模式处理的，所以该 prop 主要对屏幕竖屏生效 */
    fullScreen: {
      type: Boolean,
      default: false
    },
    /** 占满除播放器以外高度，屏幕竖屏下生效 */
    fitLeftHeight: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    closable: {
      type: Boolean,
      default: true,
    },
    backable: {
      type: Boolean,
      default: false,
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
    contentStyle: {
      type: Object,
    },
    bodyStyle: {
      type: Object,
    },
    defaultDpi: {
      type: Boolean,
      default: true,
    },
    // 窗口尺寸变化时是否重设样式
    updateOnResize: {
      type: Boolean,
      default: false,
    },
    noMaskLayer: {
      type: Boolean
    },
    heightAuto: Boolean,
    /** 屏幕横屏下的弹窗位置 */
    landscapePosition: {
      type: String,
      default: LANDSCAPE_POSITION.Right
    },
    /** 屏幕竖屏的情况下强制旋转成横屏 */
    forceHorizontalScreen: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      /** 屏幕旋转模式 */
      screenOrientationMode: SCREEN_ORIENTATION_MODE.Portrait,
      innerVisible: false,
      popupContentHeight: '',
      headerHeight: 50,
      originHeight: 0,
    };
  },

  computed: {
    isPortraitScreenMode() {
      return this.screenOrientationMode === SCREEN_ORIENTATION_MODE.Portrait;
    },
    isLandscapeScreenMode() {
      return this.screenOrientationMode === SCREEN_ORIENTATION_MODE.Landscape;
    },
    popupContentStyle() {
      let style = {
        height: this.heightAuto ? 'auto' : this.popupContentHeight,
        paddingTop: this.headerHeight,
      };

      // 如果存在自定义header，则不设置圆角
      if (!this.showHeader) {
        style.borderRadius = 'unset';
      }
      style = Object.assign({}, style, this.contentStyle);
      return style;
    },
  },

  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        this.innerVisible = newVal;
        this.updateHeight();
      },
    },

    popupContentHeight() {
      this.$nextTick(() => {
        this.$emit('height-changed', this.popupContentHeight);
      });
    },
  },

  mounted() {
    this.originHeight = document.documentElement.clientHeight || document.body.clientHeight;

    if (this.appendToBody) {
      document.body.appendChild(this.$el);
    }
    if (this.updateOnResize) {
      window.addEventListener('resize', this.handlePageResize);
    }
  },

  beforeDestroy() {
    if (this.updateOnResize) {
      window.removeEventListener('resize', this.handlePageResize);
    }
  },

  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },

  methods: {
    handleModalClose() {
      this.closeOnClickModal && this.handleClose();
    },

    handleClose() {
      this.innerVisible = false;
      this.$emit('inner-close');
    },

    handleBack() {
      this.$emit('back');
    },

    handleConfirm() {
      this.$emit('confirm');
      this.handleClose();
    },

    afterLeave() {
      this.$emit('close');
    },

    /** 设置屏幕旋转模式 */
    setScreenOrientationMode() {
      if (isPortraitScreen()) {
        this.screenOrientationMode = SCREEN_ORIENTATION_MODE.Portrait;
      }
      if (isLandscapeScreen()) {
        this.screenOrientationMode = SCREEN_ORIENTATION_MODE.Landscape;
      }
    },

    // 限高，最高不遮盖播放器区域
    // 在安卓手机上，软键盘弹起会导致页面高度变化，如果当前页面高度小于初始高度，popper高度按初始高度计算
    setHeight() {
      this.setScreenOrientationMode();

      // 全屏状态不参与高度计算
      // 屏幕横屏状态实际时播放器横向全屏状态，所以也不参与高度计算
      if (this.fullScreen || isLandscapeScreen() || this.forceHorizontalScreen) {
        this.popupContentHeight = '100%';
        return;
      }

      const popupEl = this.$refs.popup;
      const popupContentEl = this.$refs.popupContent;
      if (!popupEl) { return; }

      const currentPageHeight = document.documentElement.clientHeight || document.body.clientHeight;
      const isCompressed = currentPageHeight < this.originHeight;

      const ratio = this.defaultDpi ? 16 / 9 : 4 / 3;
      const playerHeight = window.innerWidth / ratio;

      // 高度遮盖播放器，或始终需要占满除播放器以外高度（横屏状态除外，横屏状态没有最大高度，可以遮挡播放器）
      const maxHeight = isCompressed ? this.originHeight - playerHeight : popupEl.offsetHeight - playerHeight;

      // 处理屏幕竖屏时弹窗的高度
      if (isPortraitScreen() && (popupContentEl.offsetHeight > maxHeight || this.fitLeftHeight)) {
        this.popupContentHeight = `${isCompressed ? this.originHeight - playerHeight : popupEl.offsetHeight - playerHeight}px`;
      }
    },

    setHeaderHeight() {
      const customHeaderEl = this.$refs.customHeader;
      if (!customHeaderEl) { return; }
      if (this.$slots.header) {
        this.headerHeight = `${customHeaderEl.offsetHeight || 50}px`;
      }
    },

    updateHeight() {
      this.popupContentHeight = '';
      this.$nextTick(() => {
        this.setHeight();
        this.setHeaderHeight();
      });
    },

    // 若浏览器窗口尺寸变化(多窗口、webview 小窗恢复、软键盘弹出)，在弹窗可见情况下，重新调整窗口尺寸
    handlePageResize() {
      if (!this.visible) { return; }
      const isFocusInput = document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLInputElement;
      // 软键盘弹出导致窗口变化
      if (isFocusInput && window.innerHeight < screen.availHeight) {
        return;
      }
      // 微信、部分浏览器下需延迟 才能获取到当前是竖屏还是横屏
      setTimeout(() => {
        this.updateHeight();
      }, 400);
    },
  },
};
</script>

<style lang="scss">
@import './animation.css';
@import './icon.css';

.c-popup {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10001;
  box-sizing: border-box;
  padding-top: 56.25%;
  width: 100%;
  height: 100%;
}

.c-popup--portrait {
  .c-popup-content {
    transform: rotate(0deg);
    // transition: all .3s ease;
  }
}

.c-popup--portrait__horizontal__force {
  bottom: 0 !important;
  left: 0;
  width: 100vh;
  height: 100%;
  transform: rotate(90deg);
  .c-popup-content {
    left: unset;
    right: 0;
    bottom: 0;

    width: 100vw !important;
    height: 100vw !important;
    transform: rotate(0deg);

    &--landscape_left {
      left: 0 !important;
    }

    &--landscape_center {
      left: 0 !important;
      margin: auto;
    }
  }
}

.c-popup--landscape {
  // 屏幕横屏时，默认 popup 展示在屏幕右边
  .c-popup-content {
    top: 0 !important;
    bottom: 0 !important;
    right: 0 !important;
    left: unset !important;

    width: 100vh !important;
    transform: rotate(0deg);

    &--landscape_left {
      left: 0 !important;
    }

    &--landscape_center {
      left: 0 !important;
      margin: auto;
    }
  }
}

.c-popup--fullscreen {
  padding-top: 0;
  z-index: 10002;
}

.c-popup__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background: rgba(0, 0, 0, .6);
}
.c-popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  border-radius: 8px 8px 0 0;
  padding-top: 50px;
  width: 100%;
  /* 避免弹窗主体内容过高，溢出到屏幕顶部外。 */
  max-height: 100vh;

  background-color: #fff;
}
.c-popup__header {
  position: absolute;
  top: 0;

  border-bottom: 1px solid #ededef;
  width: 100%;
  height: 50px;
}
.c-popup__header h2 {
  font-size: 16px;
  font-weight: 400;
  line-height: 50px;
  text-align: center;
  color: #333;
  padding: 0;
  margin: 0;
}
.c-popup__custom-header {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
}
.c-popup-btn {
  display: block;

  position: absolute;
  top: 0;

  width: 50px;
  height: 50px;

  background-repeat: no-repeat;
  background-position: center;
  background-size: 28px;
}
.c-popup-btn__close {
  right: 0;
  background-size: 14px;
}
.c-popup-btn__back {
  left: 0;
}
.c-popup-body {
  overflow: auto;

  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

@media screen and (min-aspect-ratio: 4/3) {
  .c-popup {
    padding-top: 0;
  }
}
</style>
