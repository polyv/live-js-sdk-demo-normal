<script>
import { mapState } from 'vuex';

export default {
  name: 'RedEnvelope-Entrance',
  components: {
    'pc-redEnvelope': () => import('./PcRedEnvelope.vue'),
    'mobile-redEnvelope': () => import('./MobileRedEnvelope.vue'),
  },
  computed: {
    ...mapState({
      isMobile: (state) => state.isMobile,
      config: (state) => state.config,
    }),
    watchUrl() {
      // 观看地址url，用于扫码进入到观看地址，复制观看链接等功能，需要自行传入，此处仅作示例
      return `https://live.polyv.cn/watch/${this.config.channelId}`;
    },
  },
  render() {
    return this.isMobile ? (
      <mobile-redEnvelope watchUrl={this.watchUrl} />
    ) : (
      <pc-redEnvelope watchUrl={this.watchUrl} />
    );
  },
};
</script>
