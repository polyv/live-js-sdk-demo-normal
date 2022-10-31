<template>
  <div :class="{
    'plv-watch__likes-wrapper': true,
    'plv-watch__likes-wrapper__mobile': isMobile,
  }">
    <div :class="{
      'plv-watch__likes': true,
      'plv-watch__likes__mobile': isMobile,
    }">
      <span class="plv-watch__likes-icon"
            @click="debounceLikeCick">
      </span>
      <p class="plv-watch__likes-num">
        {{ likeNum }}
      </p>
    </div>
  </div>
</template>

<script>
import { debounce, isMobile } from '@/utils';
import { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';

export default {
  name: 'Like',
  data() {
    return {
      isMobile: isMobile(),
      debounceLikeCick: null,
      likeNum: '',
    };
  },
  created() {
    this.debounceLikeCick = debounce(this.handleLikeClick, 1000);
  },
  methods: {
    setData(data) {
      this.likeNum = data.likeNum;
    },
    handleLikeClick() {
      this.likeNum++;
      // 点赞互动
      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.INTERACTIVE_LIKE, {
        curLikeNum: this.likeNum,
      });
    },
  },
};
</script>

<style lang="scss">
.plv-watch__likes-wrapper {
  position: relative;
  top: 0;
  width: 100%;
  height: 0;
  /* 需要大于播放器控制条的 z-inedx */
  z-index: 2001;
  &__mobile {
    z-index: 0;
  }
}

/* 点赞 */
.plv-watch__likes {
  position: absolute;
  text-align: center;
  right: 16px;
  bottom: 8px;

  &__mobile {
    bottom: 85px;
  }
}

.plv-watch__likes-icon {
  display: inline-block;
  width: 40px;
  height: 40px;
  background: url('~@/assets/btn-like.png');
  background-size: cover;
  cursor: pointer;
}
.plv-watch__likes-num {
  color: #adadc0;
  font-size: 14px;
  opacity: 0.8;
}
</style>
