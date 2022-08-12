<script>
import { mapState } from 'vuex';

export default {
  name: 'AnswerCard-Entrance',
  components: {
    'pc-answer-card': () => import('./PCAnswerCard.vue'),
    'mobile-answer-card': () => import('./MobileAnswerCard.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-answer-card /> : <pc-answer-card />;
  },
};
</script>
