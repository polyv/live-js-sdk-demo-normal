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
import { debounce } from '@/utils';
import { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';

export default {
  name: 'Like',
  data() {
    return {
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
      plvLiveMessageHub.trigger(PlvLiveMessageHubEvents.INTERACTIVE_LIKE, {
        curLikeNum: this.likeNum,
      });
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

#tab-chat .plv-watch__likes {
  right: 16px;
  bottom: 132px;
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
