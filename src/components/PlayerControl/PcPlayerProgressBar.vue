<template>
  <div class="c-pc-player-progress-bar">
    <slider-bar wrap-slider-track-color="rgba(255, 255, 255, 0.3)"
                :slider-track-size="4"
                slider-track-radius-hide
                hover-to-zoom
                :max="durationTime"
                :value="currentTime"
                tooltips
                @drag-change="toSeekVideo">
      <template #tooltips="{ content }">
        {{ formatTime(content) }}
      </template>
      <template #markPoint="{ sliderBarHover, sliderBarContainer }">
        <pc-player-time-axis-mark-point v-if="sliderBarContainer"
                                        :force-hover="sliderBarHover"
                                        :container-el="sliderBarContainer"
                                        @mark-point-hover="updateSlideBarTooltipVisible"
                                        @mark-point-update="toSeekByTimeAxisMark" />
      </template>
    </slider-bar>
  </div>
</template>

<script>
import { ref, defineComponent } from 'vue-demi';
import { mapState } from 'vuex';
import { formatTime } from '@/utils';
import PolyvLive from '@/sdk/live';

import SliderBar from '@/components/Base/SliderBar';
import PcPlayerTimeAxisMarkPoint from './PlayerTimeAxisMark/PcPlayerTimeAxisMarkPointList.vue';
import { useTimeAxisMarkHook } from './PlayerTimeAxisMark/use-time-axis-mark';

export default defineComponent({
  setup() {
    const { toSeekByTimeAxisMark } = useTimeAxisMarkHook();

    const slideBarTooltipVisible = ref(false);

    function updateSlideBarTooltipVisible(isMarkPointHover) {
      slideBarTooltipVisible.value = !isMarkPointHover;
    }

    return {
      toSeekByTimeAxisMark,

      slideBarTooltipVisible,
      updateSlideBarTooltipVisible
    };
  },
  components: {
    SliderBar,
    PcPlayerTimeAxisMarkPoint
  },
  computed: {
    ...mapState({
      currentTime: state => state.player.currentTime,
      durationTime: state => state.player.durationTime
    })
  },
  methods: {
    formatTime,
    toSeekVideo(time) {
      const liveSdk = PolyvLive.getInstance().liveSdk;
      liveSdk.player.seek(time);
    }
  },
});
</script>

<style lang="scss">
.c-pc-player-progress-bar {
  width: 100%;
  height: 100%;
}
</style>
