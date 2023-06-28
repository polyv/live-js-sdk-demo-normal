import { geFeedBackSdk } from './feed-back';
import PubSub from 'jraiser/pubsub/1.2/pubsub';

export const FeedBackMessageHub = new PubSub();
export const FeedBackMessageHubEvents = {
  /** 举报反馈展示 */
  FEED_BACK_VISIBLE: 'FEED_BACK_VISIBLE'
};

export default {
  data() {
    return {
      // 举报反馈/投诉 SDK 实例
      feedBackSdk: geFeedBackSdk(),
      // 是否展示举报反馈/投诉
      isShowFeedBack: false,
    };
  },

  computed: {
    feedBackTitle() {
      return '举报反馈'; // 投诉
    }
  },

  created() {
    this.bindEvts();
  },

  beforeDestroy() {
    this.destroy();
    this.unbindEvts();
  },

  methods: {
    bindEvts() {
      FeedBackMessageHub.on(FeedBackMessageHubEvents.FEED_BACK_VISIBLE, this.onShowFeedBack);
    },
    unbindEvts() {
      FeedBackMessageHub.off(FeedBackMessageHubEvents.FEED_BACK_VISIBLE, this.onShowFeedBack);
    },
    onSetFeedBackVisible(isShowFeedBack) {
      this.isShowFeedBack = isShowFeedBack;
    },
    onShowFeedBack() {
      this.onSetFeedBackVisible(true);
    },
    onCloseModal() {
      this.onSetFeedBackVisible(false);
    },
    destroy() {
      this.feedBackSdk && this.feedBackSdk.destroy();
      this.feedBackSdk = null;
    },
  },
};
