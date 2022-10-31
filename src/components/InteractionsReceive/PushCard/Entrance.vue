<script>
import { mapState } from 'vuex';

export default {
  name: 'PushCard-Entrance',
  components: {
    'pc-push-card': () => import('./PCPushCard.vue'),
    'mobile-push-card': () => import('./MobilePushCard.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-push-card /> : <pc-push-card />;
  },
};
</script>
