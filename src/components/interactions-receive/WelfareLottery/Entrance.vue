<script>
import { mapState } from 'vuex';

export default {
  name: 'WelfareLottery-Entrance',
  components: {
    'pc-welfare-lottery': () => import('./PCWelfareLottery.vue'),
    'mobile-welfare-lottery': () => import('./MobileWelfareLottery.vue'),
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
    inviteUrl() {
      // 邀请链接，用于抽奖条件为邀请海报类型时的邀请入口，目前只有移动端(微信)支持邀请链接
      // 需要自行传入，此处仅作示例
      return `https://live.polyv.cn/invite-poster/poster-generate.html?entryType=new&channelId=${this.config.channelId}`;
    },
  },
  render() {
    return this.isMobile ? (
      <mobile-welfare-lottery
        watchUrl={this.watchUrl}
        inviteUrl={this.inviteUrl}
      />
    ) : (
      <pc-welfare-lottery watchUrl={this.watchUrl} />
    );
  },
};
</script>
