<template>
  <div :class="statusClass"
       id="plv-watch__status"></div>
</template>

<script>
import { mapState } from 'vuex';
import { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';

export default {
  name: 'watch-status',
  data() {
    return {
      statusClass: '',
    };
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  created() {
    plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, (data) => {
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
.plv-watch-mobile #plv-watch__status {
  position: absolute;
  top: 0;
  right: 0;
}

.plv-watch-mobile #plv-watch__status::after {
  border-radius: 2px;
  font-size: 12px;
  padding: 4px;
  border: 1px solid;
  line-height: 1;
}

.plv-watch-pc #plv-watch__status {
  display: inline-block;
  margin-left: 10px;
}
.plv-watch-pc #plv-watch__status::after {
  border-radius: 2px;
  font-size: 12px;
  padding: 0 4px;
  border: 1px solid;
  line-height: 1;
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

.plv-watch__status--live::after {
  color: #f06e6e;
  border-color: #f06e6e;
  content: '进行中';
}
</style>
