<template>
  <div :class="{
        'plv-watch__status':true,
        [statusClass]:true,
        'mobile':isMobile
      }"></div>
</template>

<script>
import { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';

export default {
  name: 'Watch-Status',
  props: {
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      statusClass: '',
    };
  },
  created() {
    // 播放器初始化
    plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, ({ data }) => {
      const status = data.status === 'Y' ? 'live' : 'end';
      const statusClass = 'plv-watch__status--' + status;
      this.statusClass = statusClass;
    });

    // 监听流状态变化
    plvLiveMessageHub.on(
      PlvLiveMessageHubEvents.STREAM_UPDATE,
      ({ status }) => {
        const statusClass = 'plv-watch__status--' + status;
        this.statusClass = statusClass;
      }
    );
  },
};
</script>

<style lang="scss">
/* 直播状态 */
.plv-watch__status {
  display: inline-block;
  margin-left: 10px;
  &::after {
    border-radius: 2px;
    font-size: 12px;
    padding: 0 4px;
    border: 1px solid;
    line-height: 1;
  }
  &.mobile {
    position: absolute;
    top: 0;
    right: 0;
  }
  &::after {
    border-radius: 2px;
    font-size: 12px;
    padding: 4px;
    border: 1px solid;
    line-height: 1;
  }
}

.plv-watch__status--end::after {
  border-color: hsla(0, 0%, 100%, 0.6);
  color: hsla(0, 0%, 100%, 0.6);
  content: '暂无直播';
}

.plv-watch__status--playback::after {
  color: #78a7ed;
  border-color: #78a7ed;
  content: '回放中';
}

.plv-watch__status--stop::after {
  color: #f06e6e;
  border-color: #f06e6e;
  content: '暂停直播';
}

.plv-watch__status--live::after {
  color: #f06e6e;
  border-color: #f06e6e;
  content: '直播中';
}
</style>
