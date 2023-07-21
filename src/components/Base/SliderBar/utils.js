/**
 * 保留小数位
 * @param number
 * @param accuracy 精度，选传，默认为 2
 */
export function numberToFixed(number, accuracy = 2) {
  return Number(number.toFixed(accuracy));
}

/**
 * 获取事件对象中的坐标
 * @param event 事件对象
 */
export function getEventPosition(event) {
  if (event instanceof MouseEvent) {
    return {
      clientX: event.clientX,
      clientY: event.clientY
    };
  }

  const touch =
    event.touches[0] || event.changedTouches[0] || event.targetTouches[0];
  const touchX = touch.pageX;
  const touchY = touch.pageY;

  return {
    clientX: touchX,
    clientY: touchY
  };
}
