<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapGetters({
      isNeedLogin: 'config/isNeedLogin',
    }),
  },
  created() {
    if (this.isNeedLogin) {
      this.$router.push({ path: '/login' });
    } else {
      this.$router.push({ path: '/watch' });
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
