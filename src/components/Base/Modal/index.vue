<template>
  <transition name="modal-fade"
              @after-enter="afterEnter"
              @after-leave="afterLeave">
    <div v-show="visible"
         class="c-modal g-mask"
         @click.self="handleWrapperClick">
      <div v-if="!custom"
           ref="modal"
           class="c-modal__content"
           :style="modalStyle">
        <div class="c-modal__header">
          <span>{{ title }}</span>
          <i v-if="closable"
             class="c-modal__close"
             @click="handleClose"></i>
        </div>
        <div class="c-modal__body">
          <slot></slot>
        </div>
        <div class="c-modal__footer">
          <slot name="footer"></slot>
        </div>
      </div>

      <div v-else
           class="c-modal-custom"
           :style="modalStyle">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
/**
 * 模态框组件，可自行实现
 */
export default {
  name: 'modal',

  props: {
    appendToBody: {
      type: Boolean,
      default: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    custom: {
      type: Boolean,
      default: false,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    modalStyle: {
      type: Object,
    },
    maskClass: {
      type: [Object, Array],
    },
    title: {
      type: String,
    },
    size: {
      type: String,
    },
    closable: {
      type: Boolean,
      default: true,
    },
    bodyLocked: {
      type: Boolean,
      default: true,
    },
    mountEl: {
      type: String,
    },
  },

  data() {
    return {
      closed: false,
      height: 456,
      width: 560,
    };
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.closed = false;
        this.$emit('open');
        if (this.mountEl) {
          const mountElNode = document.querySelector(this.mountEl);
          mountElNode && mountElNode.appendChild(this.$el);
        } else if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }

        // 禁止滚动穿透
        if (this.visible && this.bodyLocked) {
          document.body.classList.add('g-body-locked');
        }
      } else {
        if (!this.closed) this.$emit('close');
        if (this.bodyLocked) {
          document.body.classList.remove('g-body-locked');
        }
      }
    },
    mountEl(newVal) {
      if (!newVal) {
        if (this.$el && this.$el.parentNode) {
          this.$el.parentNode.removeChild(this.$el);
        }
        document.body.appendChild(this.$el);
      }
    },
  },

  mounted() {
    if (this.visible && this.appendToBody) {
      document.body.appendChild(this.$el);
    }
  },

  destroyed() {
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    if (this.bodyLocked) {
      document.body.classList.remove('g-body-locked');
    }
  },

  methods: {
    hide(cancel) {
      if (cancel) {
        return;
      }
      this.$emit('update:visible', false);
      this.$emit('close');
      this.closed = true;
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) {
        return;
      }
      this.handleClose();
    },
    handleClose() {
      this.hide();
    },
    afterEnter() {
      this.$emit('opened');
    },
    afterLeave() {
      this.$emit('closed');
    },
  },
};
</script>

<style lang="scss" scoped>
/* 半透明遮罩层 */
.g-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
}

.c-modal-custom {
  position: relative;

  margin: 0 auto 50px;
  width: 80%;
  max-width: 420px;
}

.c-modal__content {
  position: absolute;
  top: 50%;
  left: 50%;

  box-sizing: border-box;
  padding-top: 48px;
  width: 80%;
  max-width: 560px;

  font-size: 16px;

  color: #263238;
  background-color: #fff;

  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  border: 1px solid #eceff1;
  transform: translate(-50%, -50%);
}

.c-modal__header {
  position: absolute;
  top: 0;

  box-sizing: border-box;
  border-radius: 4px 4px 0 0;
  padding: 0 16px;
  width: 100%;

  font-size: 18px;
  font-weight: bold;
  line-height: 48px;

  color: #333;

  box-shadow: 0 1px 0 0 rgba(0, 0, 0, .1);
}

.c-modal__close {
  display: inline-block;

  position: absolute;
  top: 0;
  right: 0;

  width: 48px;
  height: 48px;

  cursor: pointer;
  background: url('./icon-close-gray.png') no-repeat center center;
}

.c-modal__body {
  height: 100%;
}

.modal-fade-enter-active {
  animation: modal-fade .3s;
}

.modal-fade-leave-active {
  animation: modal-fade .3s reverse;
}

@keyframes modal-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

</style>
