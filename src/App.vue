<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { parse } from 'jraiser/querystring/1.1/querystring';

export default {
  name: 'App',
  computed: {
    ...mapGetters({
      isNeedLogin: 'config/isNeedLogin',
    }),
  },
  created() {
    if (!this.isNeedLogin) {
      this.$router.push({ path: '/watch' });
    } else {
      this.redirectPage();
    }
  },
  methods: {
    ...mapMutations({
      setConfigBasicInfo: 'config/setBasicInfo',
    }),
    redirectPage() {
      // 支持通过 url 参数获取数据，如果参数足够，就能直接跳转进到观看页
      const queryParams = parse(window.location.search && window.location.search.slice(1)) || {};
      if (
        queryParams.appId &&
        queryParams.appSecret &&
        queryParams.channelId &&
        ((queryParams.playbackMode && queryParams.vid) || !queryParams.playbackMode)
      ) {
        this.setConfigBasicInfo({
          channelId: queryParams.channelId,
          appId: queryParams.appId,
          appSecret: queryParams.appSecret,
          playbackMode: Boolean(queryParams.playbackMode),
          vid: queryParams.vid || '',
        });
        this.$router.push({
          path: '/watch',
          query: queryParams
        });
      } else {
        this.$router.push({ path: '/login' });
      }
    }
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
p {
  margin: 0;
  padding: 0;
}

body {
  background-color: #141518;
  font-size: 14px;
}

button,
input[type='button'],
input[type='reset'],
input[type='submit'] {
  -webkit-appearance: none;
  border: none;
}

.polyv-chat-room .tab-chat-content {
  padding-bottom: 34px;
}
html,
body,
#app,
.g-moblie-page-container,
.plv-watch-mobile-main {
  width: 100%;
  height: 100%;
}
</style>
