import * as PolyvUtil from '@/utils';
import { numberToFixed, getEventPosition } from './utils';
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue-demi';

export const sliderBarDirections = ['horizontal', 'vertical'];

export const sliderBarProps = () => ({
  /** 绑定值 */
  value: {
    type: Number,
    default: 0
  },
  /** hover 时放大滑块 */
  hoverToZoom: {
    type: Boolean,
    default: false,
  },
  /** 热区范围 */
  hotAreaSize: {
    type: Number,
    default: 28,
  },
  /** 滑块轨道粗细 */
  sliderTrackSize: {
    type: Number,
    default: 6,
  },
  /** 隐藏轨道圆角 */
  sliderTrackRadiusHide: {
    type: Boolean,
    default: false,
  },
  /** 外层轨道颜色 */
  wrapSliderTrackColor: {
    type: String,
    default: 'rgba(255, 255, 255, .8)',
  },
  /** 内层轨道颜色 */
  innerSliderTrackColor: {
    type: String,
    default: '#3082FE',
  },
  /** 滑块原点大小 */
  sliderDotSize: {
    type: Number,
    default: 14,
  },
  /** 滑块方向 */
  direction: {
    type: String,
    default: sliderBarDirections[0]
  },
  /** 最小值 */
  min: {
    type: Number,
    default: 0,
  },
  /** 最大值 */
  max: {
    type: Number,
    default: 100,
  },
  /** 显示提示 */
  tooltips: {
    type: Boolean,
    default: false,
  },
});

export const useSliderBar = options => {
  const { props, emit } = options;

  /** 当前的进度值 */
  const currentValue = ref(0);
  /** 当前是否正在拖拽中 */
  const isDragging = ref(false);

  watch(
    () => props.value,
    () => (currentValue.value = props.value),
    {
      immediate: true
    }
  );
  watch(
    () => unref(currentValue),
    () => {
      if (unref(currentValue) !== props.value) {
        emit('input', unref(currentValue));
        emit('change', unref(currentValue));
      }
    }
  );

  /** 热区样式 */
  const containerStyle = computed(() => {
    const styles = {};

    switch (props.direction) {
      case 'horizontal':
        styles.height = `${props.hotAreaSize}px`;
        break;
      case 'vertical':
        styles.width = `${props.hotAreaSize}px`;
        break;
    }

    return styles;
  });

  /** 外层轨道样式 */
  const wrapTrackStyle = computed(() => {
    const styles = {
      background: props.wrapSliderTrackColor,
      borderRadius: `${props.sliderTrackSize}px`
    };

    if (props.sliderTrackRadiusHide) {
      styles.borderRadius = 0;
    }

    switch (props.direction) {
      case 'horizontal':
        styles.height = `${props.sliderTrackSize}px`;
        break;
      case 'vertical':
        styles.width = `${props.sliderTrackSize}px`;
        break;
    }

    return styles;
  });

  /** 内部轨道的长度百分比 */
  const innerTrackLengthPercent = computed(() => {
    const percentNum =
      (100 * (unref(currentValue) - props.min)) / (props.max - props.min);
    return `${percentNum > 100 ? 100 : percentNum}%`;
  });

  /** 内部轨道样式 */
  const innerTrackStyle = computed(() => {
    const styles = {
      background: props.innerSliderTrackColor
    };

    switch (props.direction) {
      case 'horizontal':
        styles.width = unref(innerTrackLengthPercent);
        break;
      case 'vertical':
        styles.height = unref(innerTrackLengthPercent);
        break;
    }

    return styles;
  });

  /** 点样式 */
  const sliderDotStyle = computed(() => {
    const styles = {
      width: `${props.sliderDotSize}px`,
      height: `${props.sliderDotSize}px`
    };

    switch (props.direction) {
      case 'horizontal':
        styles.left = unref(innerTrackLengthPercent);
        break;
      case 'vertical':
        styles.bottom = unref(innerTrackLengthPercent);
        break;
    }

    return styles;
  });

  const containerRef = ref();

  function listenWindowEvent() {
    removeListenWindowEvent();
    if (PolyvUtil.isMobile()) {
      window.addEventListener('touchmove', onMouseMove);
      window.addEventListener('touchend', onMouseUp);
      window.addEventListener('touchcancel', onMouseUp);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  }

  function removeListenWindowEvent() {
    if (PolyvUtil.isMobile()) {
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('touchcancel', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  }

  const sliderBarHover = ref(false);

  function setSliderBarHover(isHover) {
    sliderBarHover.value = isHover;
  }

  function onMouseDown(event) {
    const eventPosition = getEventPosition(event);
    let clientNumber = eventPosition.clientX;
    if (props.direction === 'vertical') {
      clientNumber = eventPosition.clientY;
    }
    computedValue(clientNumber);
    isDragging.value = true;
    listenWindowEvent();
  }

  function onMouseMove(event) {
    const eventPosition = getEventPosition(event);
    let clientNumber = eventPosition.clientX;
    if (props.direction === 'vertical') {
      clientNumber = eventPosition.clientY;
    }
    computedValue(clientNumber);

    onTrackMouseMove(event);
  }

  function onMouseUp() {
    isDragging.value = false;
    removeListenWindowEvent();
  }

  const trackHoverX = ref(0);
  const trackHoverValue = ref(0);

  function onTrackMouseMove(event) {
    const containerElem = unref(containerRef);
    if (!containerElem) {
      return;
    }
    const bound = containerElem.getBoundingClientRect();
    const eventPosition = getEventPosition(event);
    const hoverX = eventPosition.clientX - bound.left;
    trackHoverX.value = hoverX >= 0 ? hoverX : 0;
    const hoverValue = computedValue(eventPosition.clientX, false);
    if (typeof hoverValue !== 'undefined' && hoverValue >= 0) {
      trackHoverValue.value = hoverValue;
    }
  }

  function computedValue(clientNumber, setValue = true) {
    const containerElem = unref(containerRef);
    if (!containerElem) {
      return;
    }
    const bound = containerElem.getBoundingClientRect();
    const totalLength =
      props.direction === 'vertical' ? bound.height : bound.width;
    const startPoint =
      props.direction === 'vertical' ? bound.bottom : bound.left;
    let pointLength = clientNumber - startPoint;
    if (props.direction === 'vertical' && pointLength > 0) {
      return;
    }
    if (props.direction === 'horizontal' && pointLength < 0) {
      pointLength = 0;
    }

    pointLength = Math.abs(pointLength);

    let percent = pointLength / totalLength;
    if (percent > 1) {
      percent = 1;
    } else if (percent < 0) {
      percent = 0;
    }
    const newValue = numberToFixed(
      props.min + (props.max - props.min) * percent
    );
    if (setValue && newValue !== unref(currentValue)) {
      currentValue.value = newValue;
      emit('drag-change', newValue);
    }

    return newValue;
  }

  onBeforeUnmount(() => {
    removeListenWindowEvent();
  });

  return {
    currentValue,
    isDragging,
    containerRef,
    sliderBarHover,
    sliderDotStyle,
    containerStyle,
    wrapTrackStyle,
    innerTrackStyle,
    setSliderBarHover,
    onMouseDown,
    onMouseUp,
    trackHoverX,
    trackHoverValue,
    onTrackMouseMove,
    removeListenWindowEvent
  };
};
