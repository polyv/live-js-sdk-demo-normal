<script>
import { mapState } from 'vuex';

export default {
  name: 'Questionnaire-Entrance',
  components: {
    'pc-questionnaire': () => import('./PCQuestionnaire.vue'),
    'mobile-questionnaire': () => import('./MobileQuestionnaire.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-questionnaire /> : <pc-questionnaire />;
  },
};
</script>
