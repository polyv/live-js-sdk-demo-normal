import { onMounted, onUnmounted, ref } from 'vue-demi';

/**
 * 悬浮可见处理
 * @hook
 */
export const useHoverVisible = (hookOptions = {}) => {
  const { autoHover = true, timeout = 3000 } = hookOptions;

  const hoverItemVisible = ref(false);

  function showHoverItem() {
    hoverItemVisible.value = true;
    setHoverItemHideTimer();
  }

  function hideHoverItem() {
    hoverItemVisible.value = false;
  }

  let closeTimer;

  function setHoverItemHideTimer() {
    clearHoverItemHideTimer();
    closeTimer = window.setTimeout(() => {
      hideHoverItem();
    }, timeout);
  }

  function clearHoverItemHideTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function forceShowHoverItem() {
    clearHoverItemHideTimer();
    hoverItemVisible.value = true;
  }

  onMounted(() => {
    if (autoHover) {
      showHoverItem();
    }
  });

  onUnmounted(() => {
    clearHoverItemHideTimer();
  });

  return {
    hoverItemVisible,
    showHoverItem,
    forceShowHoverItem,
    hideHoverItem: setHoverItemHideTimer
  };
};
