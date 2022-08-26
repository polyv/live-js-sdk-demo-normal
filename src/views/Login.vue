<template>
  <form class="plv-config"
        @submit.prevent="handleLogin">
    <p class="plv-config__title">直播JS-SDK Demo</p>
    <div class="plv-config__content">
      <input v-model="channelId"
             class="plv-config__input"
             placeholder="请输入频道号"
             name="plv-channel-id" />
      <input v-model="appId"
             class="plv-config__input"
             placeholder="请输入appId"
             name="plv-app-id" />
      <input v-model="appSecret"
             class="plv-config__input"
             placeholder="请输入appSecret"
             name="plv-app-secret" />
      <input v-show="playbackMode"
             v-model="vid"
             class="plv-config__input"
             placeholder="请输入回放vid"
             name="plv-playback-vid" />
      <div class="plv-config__checkbox">
        <input v-model="playbackMode"
               class="plv-config__checkbox__input"
               type="checkbox" />
        <label for="plabackMode">纯回放模式</label>
      </div>
      <button type="submit"
              class="plv-config__button">打开观看页</button>
    </div>
  </form>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      channelId: '', // 频道号
      appId: '', // 直播后台AppID(应用ID)
      appSecret: '', // ！！！不建议 appSecret 暴露在前端中
      playbackMode: false, // 是否纯回放模式
      vid: '', // 回放 vid
    };
  },
  methods: {
    ...mapMutations({
      setConfigBasicInfo: 'config/setBasicInfo',
    }),
    handleLogin() {
      if (
        this.appId &&
        this.appSecret &&
        this.channelId &&
        ((this.playbackMode && this.vid) || !this.playbackMode)
      ) {
        this.setConfigBasicInfo({
          channelId: this.channelId,
          appId: this.appId,
          appSecret: this.appSecret,
          playbackMode: this.playbackMode,
          vid: this.vid,
        });
        this.$router.push({ path: '/watch' });
      } else {
        alert('请检查参数!');
      }
    },
  },
};
</script>

<style lang="scss">
.plv-config {
  position: fixed;
  width: 300px;
  height: 430px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20px;
  margin: auto;
  text-align: center;
  background: #fff;
  border-radius: 2px;
}

.plv-config__title {
  font-size: 18px;
  font-weight: 400;
  margin-top: 20px;
}

.plv-config__content {
  margin-top: 40px;
}

.plv-config__input {
  position: relative;
  margin: 0 auto;
  margin-bottom: 20px;
  padding: 0 5px;
  width: 220px;
  height: 38px;
  line-height: 38px;
  border: 1px solid #bfbfbf;
  border-radius: 3px;
}

.plv-config__checkbox {
  text-align: left;
  font-size: 13px;
}

.plv-config__checkbox__input {
  margin-left: 20px;
  vertical-align: top;
}

.plv-config__button {
  margin-top: 7px;
  width: 220px;
  line-height: 38px;
  background: #222791;
  color: #fff;
  border-radius: 3px;
  outline: none;
  border: none;
}
</style>
