import { computed } from 'vue-demi';
import $store from '@/store';
import { usePlayerAction } from '@/hooks/usePlayerAction';

/** 简单深拷贝 */
function cloneDeep(obj) {
  if (obj instanceof Object) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
}

export const useTimeAxisMarkHook = (hookOptions) => {
  const { getContainerWidth = () => 0 } = hookOptions || {};

  const timeAxisMarkList = computed(() => {
    return $store.state.player.timeAxisMarkList;
  });

  const mergeTimeAxisMarkList = computed(() => {
    return getMergeTimeAxisMarkList(
      $store.state.player.timeAxisMarkList,
      __getComputedContainerWidth()
    );
  });

  let __containerWidth = 0;

  function __getComputedContainerWidth() {
    const propContainerWidth = getContainerWidth();
    if (propContainerWidth !== 0) {
      __containerWidth = propContainerWidth;
    }
    return __containerWidth;
  }

  /**
   * 获取标记点第一个详情数据
   */
  function getFirstMarkPointDetail(markPoint) {
    if (!markPoint || markPoint.details.length === 0) {
      throw new Error('获取标记点第一个详情数据失败');
    }

    return markPoint.details[0];
  }

  const { toSeekVideo } = usePlayerAction();

  function toSeekByTimeAxisMark(timeAxisMark) {
    toSeekVideo(timeAxisMark.markTime);
  }

  return {
    timeAxisMarkList,
    mergeTimeAxisMarkList,

    getFirstMarkPointDetail,
    toSeekByTimeAxisMark,
  };
};

/**
 * 将相近的点位合并到一起
 * @desc 纯工具函数
 */
function getMergeTimeAxisMarkList(timeAxisMarkList, width, interval = 16) {
  if (!timeAxisMarkList) return [];
  if (width === 0) return [];

  const result = [];
  let prevLeft = 0;

  cloneDeep(timeAxisMarkList).forEach((timeAxisMark) => {
    const prevData = result[result.length - 1];

    if (!prevData) {
      result.push({
        id: timeAxisMark.id,
        details: [timeAxisMark],
      });
      prevLeft = width * timeAxisMark.percents;
      return;
    }

    const currentLeft = width * timeAxisMark.percents;
    if (currentLeft - prevLeft < interval) {
      prevData.id = prevData.id + timeAxisMark.id;
      prevData.details.push(timeAxisMark);
    } else {
      result.push({
        id: timeAxisMark.id,
        details: [timeAxisMark],
      });
      prevLeft = currentLeft;
    }
  });

  return result;
}
