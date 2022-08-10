<template>
  <div class="plv-watch__likes">
    <span class="plv-watch__likes-icon"
          @click="debounceLikeCick">
    </span>
    <p class="plv-watch__likes-num">
      {{ likeNum }}
    </p>
  </div>
</template>

<script>
import * as PlvUtil from '@/utils';
import { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';

// TODO   pc-$('#tab-chat')  mobile-$('#intro-likes')
export default {
  name: 'Like',
  data() {
    return {
      debounceLikeCick: null,
      likeNum: '',
      isMobile: PlvUtil.isMobile(),
    };
  },
  created() {
    this.debounceLikeCick = PlvUtil.debounce(this.handleLikeClick, 1000);
  },
  methods: {
    setLikeNum(likeNum) {
      this.likeNum = likeNum;
    },
    handleLikeClick() {
      this.likeNum++;
      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.INTERACTIVE_LIKE);
    },
  },
};
</script>

<style lang="scss">
/* 点赞 */
.plv-watch__likes {
  position: absolute;
  text-align: center;
}

.plv-watch-pc .plv-watch__likes {
  /* pc端位置 */
  right: 30px;
  top: 20%;
  bottom: auto;
}
#tab-chat .plv-watch__likes {
  /* 移动端位置 */
  right: 16px;
  bottom: 120px;
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
