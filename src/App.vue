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
