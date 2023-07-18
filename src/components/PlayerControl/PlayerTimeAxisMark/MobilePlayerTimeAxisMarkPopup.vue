<!-- @file 移动端横屏时间轴标记-精彩看点业务弹窗组件 -->

<template>
  <popup class="c-mobile-player-time-axis-mark-popup"
         fit-left-height
         update-on-resize
         append-to-body
         title="精彩看点"
         :visible="timeAxisMarkPopupVisible"
         @close="setTimeAxisMarkPopupVisible(false)">
    <div class="c-mobile-player-time-axis-mark-popup__content">
      <div v-for="markPoint in timeAxisMarkList"
           :key="markPoint.id"
           class="c-mobile-player-time-axis-mark-popup__content-item"
           @click="toSeekByTimeAxisMark(markPoint)">
        <img class="c-mobile-player-time-axis-mark-popup__content-item__img"
             :src="markPoint.markMessage.previewUrl" />
        <div class="c-mobile-player-time-axis-mark-popup__content-item__desc">
          <div class="c-mobile-player-time-axis-mark-popup__content-item__desc__title g-multiline"
               :title="markPoint.markMessage.title">
            {{ markPoint.markMessage.title }}
          </div>
          <span class="c-mobile-player-time-axis-mark-popup__content-item__desc__time">{{
            formatTime(markPoint.markTime)
          }}</span>
        </div>
      </div>
      <p v-if="timeAxisMarkList.length === 0"
         class="c-mobile-player-time-axis-mark-popup__content-empty">
        暂无
      </p>
    </div>
  </popup>
</template>

<script>
import { ref, defineComponent } from 'vue-demi';
import { formatTime } from '@/utils';
import Popup from '@/components/Base/Popup';

import { useTimeAxisMarkHook } from './use-time-axis-mark';

export default defineComponent({
  setup() {
    const timeAxisMarkPopupVisible = ref(true);

    function setTimeAxisMarkPopupVisible(bool) {
      timeAxisMarkPopupVisible.value = bool;
    }

    window.setTimeAxisMarkPopupVisible = setTimeAxisMarkPopupVisible;

    const { timeAxisMarkList, toSeekByTimeAxisMark } = useTimeAxisMarkHook();

    return {
      timeAxisMarkPopupVisible,
      setTimeAxisMarkPopupVisible,

      timeAxisMarkList,
      toSeekByTimeAxisMark
    };
  },
  components: {
    Popup
  },
  methods: {
    formatTime
  },
});

</script>

<style lang="scss">
.c-mobile-player-time-axis-mark-popup__content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.c-mobile-player-time-axis-mark-popup__content-item {
  display: flex;
  margin-bottom: 18px;
  color: #333;
  &:last-child {
    margin-bottom: 0;
  }
}

.c-mobile-player-time-axis-mark-popup__content-item__img {
  width: 134px;
  height: 76px;
  margin-right: 8px;
  background: #000;
  border-radius: 4px;
}

.c-mobile-player-time-axis-mark-popup__content-item__desc {
  overflow: hidden;
}
.c-mobile-player-time-axis-mark-popup__content-item__desc__title {
  margin-bottom: 2px;
  font-size: 14px;
  font-weight: bold;
  line-height: 22px;
}

.c-mobile-player-time-axis-mark-popup__content-item__desc__time {
  font-size: 12px;
  line-height: 1;
  opacity: 0.6;
}

.c-mobile-player-time-axis-mark-popup__content-empty {
  line-height: 100px;
  color: #000;
  text-align: center;
}
</style>
