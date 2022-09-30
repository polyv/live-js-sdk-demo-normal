<script>
import { mapState } from 'vuex';

export default {
  name: 'Product-Entrance',
  components: {
    'pc-product': () => import('./PcProduct.vue'),
    'mobile-product': () => import('./MobileProduct.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
    }),
  },
  render() {
    return this.isMobile ? <mobile-product /> : <pc-product />;
  },
};
</script>
