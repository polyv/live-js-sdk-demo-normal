import { onMounted, ref } from 'vue-demi';
import $store from '@/store';
import PolyvLive from '@/sdk/live';
import { usePlayerAction } from '@/hooks/usePlayerAction';

/** 简单深拷贝 */
function cloneDeep(obj) {
  if (obj instanceof Object) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
}

export const useTimeAxisMarkHook = (hookOptions) => {
  const {
    getContainerWidth = () => 0,
    /** 是否自动监听播放器同步事件 */
    autoListenPlayerSyncEvent = true
  } = hookOptions || {};

  const timeAxisMarkList = ref([]);

  const mergeTimeAxisMarkList = ref([]);

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

  function syncTimeAxisMarkInfo(params) {
    const _timeAxisMarkList = convertToTimeAxisMarkList(
      cloneDeep(params.timeAxisMarkList),
      $store.state.player.durationTime,
      false
    );
    timeAxisMarkList.value = _timeAxisMarkList;
    mergeTimeAxisMarkList.value = getMergeTimeAxisMarkList(
      _timeAxisMarkList,
      __getComputedContainerWidth()
    );
  }

  const { toSeekVideo, getDurationTime } = usePlayerAction();

  function toSeekByTimeAxisMark(timeAxisMark) {
    const durationTime = getDurationTime();
    toSeekVideo(durationTime * timeAxisMark.percents);
  }

  if (autoListenPlayerSyncEvent) {
    onMounted(() => {
      const liveSdk = PolyvLive.getInstance().liveSdk;
      liveSdk.player.on('keyPointUpdate', ({ list }) => {
        console.warn('list', list);
        syncTimeAxisMarkInfo({
          timeAxisMarkList: list
        });
      });
    });

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

/**
 * 转换数据成时间轴标记信息
 * @desc 纯工具函数
 */
export function convertToTimeAxisMarkInfo(item, duration) {
  const percents = Number(item.markTime) / duration;
  return {
    ...item,
    percents,
    markTime: Number(item.markTime)
  };
}

/**
 * 转换数据成时间轴标记列表
 * @desc 纯工具函数
 */
export function convertToTimeAxisMarkList(data, duration, autoSort = true) {
  const result = cloneDeep(data).map(item =>
    convertToTimeAxisMarkInfo(item, duration)
  );

  if (autoSort) {
    result.sort((a, b) => a.markTime - b.markTime);
  }

  return result;
}
