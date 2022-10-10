import { ynToBool } from '@/utils';
import PubSub from 'jraiser/pubsub/1.2/pubsub';

export const DonateMessageHub = new PubSub();
export const DonateMessageHubEvents = {
  PANEL_VISIBLE_TOGGLE: 'panel-visible-toggle',
  PANEL_CLOSE: 'panel-close',
};

export default {
  props: {
    donateSetting: {
      type: Object,
      default: () => {
        return {
          globalSettingEnabled: 'N',
          donateCashEnabled: 'N',
          donateGoodEnabled: 'N',
          donateTips: '打赏',
          cashMin: 0.01,
          donatePointEnabled: 'Y',
          pointUnit: '点',
          cashes: [0.88, 6.66, 8.88, 18.88, 66.6, 88.8],
          goods: [
            {
              goodName: '鲜花',
              goodImg: '//s1.videocc.net/default-img/donate/flower.png',
              goodPrice: 0,
              goodEnabled: 'Y',
            },
            {
              goodName: '咖啡',
              goodImg: '//s1.videocc.net/default-img/donate/coffee.png',
              goodPrice: 5,
              goodEnabled: 'Y',
            },
            {
              goodName: '点赞',
              goodImg: '//s1.videocc.net/default-img/donate/like.png',
              goodPrice: 10,
              goodEnabled: 'Y',
            },
            {
              goodName: '掌声',
              goodImg: '//s1.videocc.net/default-img/donate/handclap.png',
              goodPrice: 15,
              goodEnabled: 'Y',
            },
            {
              goodName: '666',
              goodImg: '//s1.videocc.net/default-img/donate/666.png',
              goodPrice: 20,
              goodEnabled: 'Y',
            },
            {
              goodName: '小星星',
              goodImg: '//s1.videocc.net/default-img/donate/star.png',
              goodPrice: 25,
              goodEnabled: 'Y',
            },
            {
              goodName: '钻石',
              goodImg: '//s1.videocc.net/default-img/donate/diamond.png',
              goodPrice: 30,
              goodEnabled: 'Y',
            },
            {
              goodName: '烟火',
              goodImg: '//s1.videocc.net/default-img/donate/fireworks.png',
              goodPrice: 35,
              goodEnabled: 'Y',
            },
            {
              goodName: '金蛋',
              goodImg: '//s1.videocc.net/default-img/donate/golden-egg.png',
              goodPrice: 40,
              goodEnabled: 'Y',
            },
            {
              goodName: '奖杯',
              goodImg: '//s1.videocc.net/default-img/donate/cup.png',
              goodPrice: 45,
              goodEnabled: 'Y',
            },
            {
              goodName: '跑车',
              goodImg: '//s1.videocc.net/default-img/donate/car.png',
              goodPrice: 50,
              goodEnabled: 'Y',
            },
            {
              goodName: '皇冠',
              goodImg: '//s1.videocc.net/default-img/donate/crown.png',
              goodPrice: 60,
              goodEnabled: 'Y',
            },
            {
              goodName: '别墅',
              goodImg: '//s1.videocc.net/default-img/donate/house.png',
              goodPrice: 65,
              goodEnabled: 'Y',
            },
            {
              goodName: '游艇',
              goodImg: '//s1.videocc.net/default-img/donate/yacht.png',
              goodPrice: 70,
              goodEnabled: 'Y',
            },
            {
              goodName: '飞机',
              goodImg: '//s1.videocc.net/default-img/donate/plane.png',
              goodPrice: 88,
              goodEnabled: 'Y',
            },
            {
              goodName: '火箭',
              goodImg: '//s1.videocc.net/default-img/donate/rocket.png',
              goodPrice: 100,
              goodEnabled: 'Y',
            },
          ],
          scoreUnit: '点',
        };
      },
    },

    channelId: {
      type: [String, Number],
    },

    // 分房间号
    channelRoomId: {
      type: [String, Number],
    },

    weixinPayEnabled: Boolean,
  },

  data() {
    return {
      globalSettingEnabled: false, // 应用全局设置
      donateCashEnabled: false, // 开启现金打赏
      donateGoodEnabled: false, // 开启道具打赏
      donatePointEnabled: false, // 开启积分打赏
      donateTips: '', //
      pointUnit: '', // 积分打赏单位
      cashMin: '', // 现金打赏最低金额
      cashes: [], // 固定金额现金打赏数组
      goods: [], // 道具/积分道具
      points: 0, // 积分打赏，我的剩余积分

      goodNums: [1, 5, 10, 66, 88, 666], // 积分打赏数量类别
      selectedNum: 1, // 积分打赏已选数量
      selectedCash: null, // 现金打赏已选金额
      donateCash: 0, // 已输入的自定义现金额度
      selectedDonate: null, // 已选中的打赏方式, pc 悬浮时设置, 移动端点击时设置
      selectedDonateType: '', // good, point, cash

      checkDonateTimer: null, // 查询打赏状态定时器
      checkDonateCount: 100, // 100 s后清除打赏状态查询
    };
  },

  computed: {
    donateData() {
      return null;
    },

    showGoods() {
      return this.donateGoodEnabled || this.donatePointEnabled;
    },
  },

  filters: {
    priceText(price) {
      if (price) {
        return `￥${price}`;
      }
      return '免费';
    },
  },

  watch: {
    donateSetting: {
      immediate: true,
      handler(donateSetting = {}) {
        this.globalSettingEnabled = ynToBool(
          donateSetting.globalSettingEnabled
        );
        this.donateCashEnabled = ynToBool(donateSetting.donateCashEnabled);
        this.donateGoodEnabled = ynToBool(donateSetting.donateGoodEnabled);
        this.donatePointEnabled = ynToBool(donateSetting.donatePointEnabled);
        this.donatePointEnabled = true;
        this.donateTips = donateSetting.donateTips;
        this.pointUnit = donateSetting.pointUnit;
        this.cashMin = donateSetting.cashMin;
        this.cashes = donateSetting.cashes;
        this.goods = donateSetting.goods;
      },
    },

    selectedCash(newVal) {
      if (newVal) {
        this.donateCash = newVal;
      }
    },

    // 限制数字
    donateCash(newVal) {
      if (newVal !== this.selectedCash) {
        this.selectedCash = null;
      }

      if (typeof newVal === 'number') {
        return;
      }

      let val = newVal && newVal.replace(/[^0-9.]/g, '');

      if (val.indexOf('.') !== val.lastIndexOf('.')) {
        val =
          val.substring(0, val.lastIndexOf('.')) +
          val.substring(val.lastIndexOf('.') + 1);
      }

      this.donateCash = val;
    },

    // 关闭扫码支付弹窗，清除定时查询
    donateData(newVal) {
      if (!newVal) {
        this.clearCheckTimer();
      }
    },
  },

  mounted() {
    if (this.donatePointEnabled) {
      this.getPoints();
    }
  },

  methods: {
    async getPoints() {
      try {
        // TODO 获取积分数
        this.points = 100;
      } catch (e) {
        this.$dialog.alert({
          message: '获取积分失败',
        });
      }
    },

    // 给具体费用带上单位(道具是￥，积分是积分单位)
    goodsPriceText(price) {
      if (!price) return '免费';

      if (this.donateGoodEnabled) {
        return `￥${price}`;
      }
      if (price) {
        return `${price} ${this.pointUnit}`;
      }
    },

    setRandCash() {
      this.donateCash = (Math.random() * 10).toFixed(2);
    },

    // 处理积分打赏
    async handlePointDonate() {
      try {
        const donateData = {
          goodId: this.selectedDonate && this.selectedDonate.goodId,
          goodNum: this.selectedNum || 1,
          channelId: this.channelId,
        };
        if (this.channelRoomId && this.channelRoomId !== this.channelId) {
          donateData.masterChannelId = this.channelId;
          donateData.channelId = this.channelRoomId;
        }
        // TODO 请求积分打赏接口
        this.handleDonatePointRes({ code: 0, data: 100 });
      } catch (e) {
        this.$dialog.alert({ message: e.message });
      }
    },

    /**
     * 处理积分打赏结果
     * @param {Object}} res
     */
    handleDonatePointRes(res) {
      const { code, data } = res;

      if (code === 0) {
        // 打赏成功, 从结果更新积分
        this.points = data;
        DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
        this.clear();
      } else {
        this.$dialog.alert({ message: '打赏失败' });
      }
    },

    clear() {
      this.selectedDonateType = '';
      this.selectedDonate = null;
      this.selectedNum = 1;
    },

    isGoodVisible(good) {
      return (
        ynToBool(good.goodEnabled || 'Y') &&
        (this.weixinPayEnabled ||
          good.goodPrice === 0 ||
          this.donatePointEnabled)
      );
    },
  },
};
