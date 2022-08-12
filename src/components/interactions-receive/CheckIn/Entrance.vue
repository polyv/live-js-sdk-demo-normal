<script>
import { mapState } from 'vuex';

export default {
  name: 'CheckIn-Entrance',
  components: {
    'pc-check-in': () => import('./PCCheckIn.vue'),
    'mobile-check-in': () => import('./MobileCheckIn.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-check-in /> : <pc-check-in />;
  },
};
</script>
