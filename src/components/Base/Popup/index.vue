<template>
  <div ref="popup"
       v-show="visible"
       class="c-popup"
       :class="{ 'c-popup--fullscreen': fullScreen }">
    <transition name="fade"
                @after-enter="$emit('opened')">
      <div v-show="show"
           class="c-popup__bg"
           @click="handleModalClose"></div>
    </transition>
    <transition name="slide"
                @after-leave="afterLeave">
      <div ref="popupContent"
           v-show="show"
           class="c-popup-content"
           :style="popupContentStyle">
        <div ref="customHeader"
             class="c-popup__custom-header">
          <slot name="header"
                :popupMethods="{ handleClose, handleConfirm }"></slot>
        </div>
        <div v-if="showHeader"
             class="c-popup__header">
          <span v-if="closable"
                class="c-popup-btn c-popup-btn__close i-close-gray"
                @click="handleClose"></span>
          <span v-if="backable || hasBackBtn"
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
export default {
  props: {
    title: String,
    fullScreen: Boolean, // 满屏(如电话国际区号选择)
    fitLeftHeight: Boolean, // 占满除播放器以外高度
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
    hasBackBtn: {
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
  },

  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        this.show = newVal;
        this.$nextTick(() => {
          this.setHeight();
          this.setHeaderHeight();
        });
      },
    },
  },

  computed: {
    popupContentStyle() {
      let style = {
        height: this.height,
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

  data() {
    return {
      show: false,
      height: '',
      headerHeight: 50,
    };
  },

  mounted() {
    if (this.appendToBody) {
      document.body.appendChild(this.$el);
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
      this.show = false;
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

    // 限高，最高不遮盖播放器区域
    setHeight() {
      if (this.fullScreen) {
        this.height = '100%';
        return;
      }
      let ratio = 16 / 9;
      const popupEl = this.$refs.popup;
      const popupContentEl = this.$refs.popupContent;
      if (!this.defaultDpi) {
        ratio = 4 / 3;
      }
      const playerHeight = window.innerWidth / ratio;
      const maxHeight = popupEl.offsetHeight - playerHeight;
      // 高度遮盖播放器，或始终需要占满除播放器以外高度（横屏状态除外，横屏状态没有最大高度，可以遮挡播放器）
      const isPortrait = window.orientation === 180 || window.orientation === 0;
      if (isPortrait && (popupContentEl.offsetHeight > maxHeight || this.fitLeftHeight)) {
        this.height = `${popupEl.offsetHeight - playerHeight}px`;
      }
    },

    setHeaderHeight() {
      if (this.$slots.header) {
        const customHeaderEl = this.$refs.customHeader;
        this.headerHeight = `${customHeaderEl.offsetHeight || 50}px`;
      }
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
.c-popup--fullscreen {
  padding-top: 0;
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
}
.c-popup-btn__close {
  right: 0;
}
.c-popup-btn__back {
  left: 0;
  background-size: 30px 30px !important;
}
.c-popup-body {
  overflow: auto;

  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

</style>
