import { ynToBool } from '@/utils';
import PubSub from 'jraiser/pubsub/1.2/pubsub';

export const DonateMessageHub = new PubSub();
export const DonateMessageHubEvents = {
  PANEL_VISIBLE_TOGGLE: 'panel-visible-toggle',
  PANEL_CLOSE: 'panel-close',
  /** 发送打赏消息 */
  SEND_REWARD_MSG: 'send-reward-msg'
};

/** 打赏-礼物打赏-支付方式 */
const GiftDonatePayWayType = {
  /** 现金支付 */
  CASH: 'CASH',
  /** 积分支付 */
  POINT: 'POINT'
};

/** 打赏类型 */
const DonateType = {
  /** 现金 */
  CASH: 'cash',
  /** 礼物 */
  GIFT: 'gift'
};

/**
 * 说明
 * 打赏有两种类型：现金打赏，礼物打赏。
 * 但是"礼物打赏"还分两种支付方式--现金支付和积分支付
 */
export default {
  props: {
    donateConfig: {
      type: Object,
      default: () => {}
    },
  },

  data() {
    return {
      GiftDonatePayWayType,
      DonateType,

      donateCashEnabled: false, // 开启现金打赏
      donateGiftEnabled: false, // 开启礼物打赏
      cashDonate: {
        cashs: [], // 固定金额现金打赏数组
        cashMin: 0.01, // 现金打赏最低金额
      },
      giftDonate: {
        payWay: GiftDonatePayWayType.CASH,
        pointUnit: '', // 积分支付单位
        cashPays: [], // 现金支付礼物列表
        pointPays: [] // 积分支付礼物列表
      },
      // 现金打赏和礼物打赏共用的字段
      selectedDonate: null, // 已选中的打赏方式, pc 悬浮时设置, 移动端点击时设置
      selectedDonateType: '', // gift, point, cash
      // 现金打赏相关字段
      selectedCash: null, // 现金打赏已选金额
      donateCash: 0, // 已输入的自定义现金额度
      // 礼物打赏相关字段
      userPoints: 0, // 礼物打赏-积分支付，我的剩余积分
      selectedGiftNum: 1, // 积分打赏已选数量
      giftNums: [1, 5, 10, 66, 88, 666], // 积分打赏数量类别
    };
  },

  computed: {
    /** 是否为礼物打赏-现金支付 */
    isGiftCashPayWay() {
      return this.donateGiftEnabled && this.giftDonate.payWay === GiftDonatePayWayType.CASH;
    },

    /** 是否为礼物打赏-积分支付 */
    isGiftPonitPayWay() {
      return this.donateGiftEnabled &&
      this.giftDonate.payWay === GiftDonatePayWayType.POINT;
    },

    /** 礼物列表 */
    giftList() {
      if (this.isGiftCashPayWay) return this.giftDonate.cashPays;
      if (this.isGiftPonitPayWay) return this.giftDonate.pointPays;
      return [];
    }
  },

  watch: {
    donateConfig: {
      immediate: true,
      handler(donateConfig = {}) {
        this.donateCashEnabled = ynToBool(donateConfig.donateCashEnabled);
        this.donateGiftEnabled = ynToBool(donateConfig.donateGiftEnabled);
        this.giftDonate = donateConfig.giftDonate;
        this.cashDonate = donateConfig.cashDonate;
      },
    },

    selectedCash(newVal) {
      if (newVal) {
        this.donateCash = newVal;
      }
    },

    // 限制 donateCash 为数字
    donateCash(newVal) {
      if (newVal !== this.selectedCash) {
        this.selectedCash = null;
      }

      if (typeof newVal === 'number') return;

      let val = newVal && newVal.replace(/[^0-9.]/g, '');
      if (val.indexOf('.') !== val.lastIndexOf('.')) {
        val =
          val.substring(0, val.lastIndexOf('.')) +
          val.substring(val.lastIndexOf('.') + 1);
      }
      this.donateCash = val;
    },
  },

  mounted() {
    if (this.isGiftPonitPayWay) {
      this.getUserGiftPoints();
    }
  },

  methods: {
    /** 获取用户可用的积分 */
    async getUserGiftPoints() {
      try {
        // TODO 获取真实的积分数
        this.userPoints = 100;
      } catch (e) {
        this.$dialog.alert({
          message: '获取积分失败',
        });
      }
    },

    /**
     * 现金打赏设置对应的价格
     * @param {null|number} price
     * @returns {string}
     */
    convertCashPriceText(price) {
      if (!price) return '免费';
      return `￥${price}`;
    },

    /**
     * 礼物打赏-设置对应的价格
     * @param {null|number} price
     * @returns {string}
     */
    convertGiftPriceText(price) {
      if (!price) return '免费';

      if (this.isGiftCashPayWay) return `￥${price}`;

      if (this.isGiftPonitPayWay) {
        return `${price} ${this.giftDonate.pointUnit}`;
      }

      return String(price);
    },

    /** 现金打赏-设置随机金额 */
    setRandomCash() {
      this.donateCash = (Math.random() * 10).toFixed(2);
    },

    /** 处理"礼物打赏-积分支付" */
    async handleGiftPointPayDonate() {
      // TODO 请求积分打赏接口来设置用户积分
      console.info('handleGiftPointPayDonate', {
        selectedDonate: this.selectedDonate,
        selectedGiftNum: this.selectedGiftNum
      });
      this.userPoints = 100;
      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      this.handleSendRewardMsg({
        donateType: 'good',
        content: this.selectedDonate.name,
        goodImage: this.selectedDonate.img,
        goodNum: this.selectedGiftNum,
      });
      this.resetSelectedDonateInfo();
    },

    /**
     * 发送打赏消息
     * 注意此处打赏不涉及到真实处理逻辑，仅进行消息通知
     * */
    handleSendRewardMsg(data) {
      DonateMessageHub.trigger(DonateMessageHubEvents.SEND_REWARD_MSG, { data });
    },

    resetSelectedDonateInfo() {
      this.selectedDonateType = '';
      this.selectedDonate = null;
      this.selectedGiftNum = 1;
    },
  },
};
