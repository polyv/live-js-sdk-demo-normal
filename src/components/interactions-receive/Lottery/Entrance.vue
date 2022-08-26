<script>
import { mapState } from 'vuex';

export default {
  name: 'Lottery-Entrance',
  components: {
    'pc-lottery': () => import('./PCLottery.vue'),
    'mobile-lottery': () => import('./MobileLottery.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-lottery /> : <pc-lottery />;
  },
};
</script>
