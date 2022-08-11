<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'app',
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
</style>
