
<script>
import { mapState } from 'vuex';

export default {
  name: 'Announcement-Entrance',
  components: {
    'pc-announcement': () => import('./PCAnnouncement.vue'),
    'mobile-announcement': () => import('./MobileAnnouncement.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-announcement /> : <pc-announcement />;
  },
};
</script>
