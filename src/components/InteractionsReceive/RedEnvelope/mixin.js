import PubSub from 'jraiser/pubsub/1.2/pubsub';
import { plvChatMessageHub, PlvChatMessageHubEvents } from '@/sdk/chat';
import { RedEnvelope } from '@polyv/interactions-receive-sdk';

export const RedEnvelopeMessageHub = new PubSub();
export const RedEnvelopeMessageHubEvents = {
  /** 积分记录展示 */
  POINT_RECORD_SHOW: 'point-record-show'
};

export default {
  props: {
    lang: {
      type: String,
      default: 'zh_CN',
    },
    // 非微信环境下的跳转链接
    watchUrl: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      // 红包 SDK 实例
      redEnvelopeSdk: null,
      // 入口（即聊天区域红包）数据
      redEnvelopeEntranceData: [],
      // 红包弹窗数据
      redEnvelopeData: null,
      // 是否展示挂件
      showPendant: false,
      // 红包倒计时数据
      redEnvelopeDelayData: null,
      // 获取延迟红包请求标志位
      getNewestRequestEnd: true,
    };
  },

  created() {
    this.redEnvelopeSdk = new RedEnvelope();
  },

  mounted() {
    // 是否有延时红包
    this.getNewest();
    /**
     * 监听红包消息点击事件
     * 注意，聊天信息中的红包信息才是真实的入口
     * */
    plvChatMessageHub.on(PlvChatMessageHubEvents.REDPACKET_CLICK, (data) => {
      console.info('redEnvelopeData', data);
      this.redEnvelopeData = data;
    });
  },

  beforeDestroy() {
    this.redEnvelopeSdk?.destroy();
    this.redEnvelopeSdk = null;
  },

  methods: {
    // 是否有延时红包
    async getNewest() {
      this.getNewestRequestEnd = false;
      const result = await this.redEnvelopeSdk.getNewest();
      // 测试用的Mock 数据
      // const result = {
      //   code: 200,
      //   message: '',
      //   error: null,
      //   status: 'success',
      //   data: {
      //     redpackId: '97aa6d129b7e4c6991542fdcd5e73777',
      //     redCacheId: '061d0694',
      //     greeting: '恭喜发财，大吉大利',
      //     avatar: '//liveimages.videocc.net/uploaded/images/2019/07/fef0esbefi.jpg',
      //     nickname: '讲师',
      //     timeEnabled: 'Y',
      //     serverTime: 1651116297000,
      //     sendTime: 1651116307000,
      //     redpackType: 'OFFICIAL_NORMAL',
      //   }
      // };
      const { code, data } = result;
      const delayTime = data ? Math.round((data.sendTime - data.serverTime) / 1000) : 0;
      if (code === 200 && data && data.timeEnabled === 'Y' && delayTime > 0) {
        this.redEnvelopeDelayData = {
          ...data,
          pic: data.avatar,
          type: data.redpackType,
          delayTime
        };
        this.showPendant = true;
      }
      this.getNewestRequestEnd = true;
    },
    handlePendantCountDownEnd() {
      this.showPendant = false;
    },
    handleCloseRedEnvelope() {
      this.redEnvelopeData = null;
    },
  },
};
