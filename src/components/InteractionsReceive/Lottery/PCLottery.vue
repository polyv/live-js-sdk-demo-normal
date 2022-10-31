<template>
  <div name="pc-lottery"
       class="plv-demo-lottery-default">
    <entrance-icon v-if="entranceVisible"
                   :name="entrance.name"
                   :icon="entrance.icon"
                   :open="handleClickEntranceIcon" />
    <div class="plv-demo-lottery-default__lottery"
         ref="plv-demo-lottery-default__lottery">
      <!-- 抽奖中 -->
      <on-lottery v-show="isLotteryShowing"
                  :lottery-sdk="lotterySdk"
                  :delayTime="1000"
                  :lang="lang"
                  @lottery-status-changed="onLotteryStatusChange"
                  @is-show-changed="onLotteryShowChange" />
    </div>

    <!-- 中奖记录 -->
    <modal title="中奖记录"
           :visible="isShowRecord"
           :close-on-click-modal="false"
           @close="isShowRecord = false">
      <lottery-record :lottery-sdk="lotterySdk"
                      :lang="lang"
                      :delay-time="2000"
                      @lottery-list="onLotteryRecord"
                      @submit-info="onClickRecord"
                      @check-info="onClickRecord" />
    </modal>

    <!-- 中奖结果 -->
    <!-- modal是一个弹窗组件，可根据界面风格自行设计-->
    <modal title="中奖结果"
           :visible="isShowResult"
           :close-on-click-modal="false"
           :lang="lang"
           @close="setLotteryResultHide">
      <lottery-end ref="lotteryEnd"
                   :lottery-sdk="lotterySdk"
                   :lottery-list="lotteryList"
                   :lang="lang"
                   :delayTime="2000"
                   @to-show="setLotteryResultShow"
                   @to-hide="setLotteryResultHide" />
    </modal>
  </div>
</template>

<script>
import OnLottery from '@polyv/interactions-receive-sdk-ui-default/lib/PcOnLottery';
import LotteryEnd from '@polyv/interactions-receive-sdk-ui-default/lib/PcLotteryEnd';
import LotteryRecord from '@polyv/interactions-receive-sdk-ui-default/lib/PcLotteryRecord';
import { Lottery } from '@polyv/interactions-receive-sdk';
import EntranceIcon from '../EntranceIcon.vue';

export default {
  components: {
    OnLottery,
    LotteryEnd,
    LotteryRecord,
    EntranceIcon,
  },

  data() {
    return {
      entranceVisible: false,
      entrance: {
        name: '中奖记录',
        icon: require('@/assets/ir-imgs/icon-lottery-record.png'),
      },
      // 语言
      lang: 'zh_CN',
      // 抽奖 SDK 实例
      lotterySdk: null,
      // 是否展示结果
      isShowResult: false,
      // 中奖记录数据
      lotteryList: [],
      // 是否展示抽奖盒子
      isLotteryShowing: false,
      // 是否展示抽奖记录
      isShowRecord: false,
    };
  },

  watch: {
    lotteryList: {
      handler() {
        const hasNoReceived = this.lotteryList.some((item) => !item.received); // 是否还有未提交的中奖信息
        if (this.lotteryList.length > 0 && hasNoReceived) {
          this.entranceVisible = true;
        } else {
          this.entranceVisible = false;
        }
      },
      immediate: true,
    },
  },

  created() {
    this.lotterySdk = new Lottery();
  },

  mounted() {
    this.customMountEl();
  },

  beforeDestroy() {
    this.lotterySdk?.destroy();
    this.lotterySdk = null;
  },

  methods: {
    customMountEl() {
      const $el = this.$refs['plv-demo-lottery-default__lottery'];
      document.body.appendChild($el);
    },

    handleClickEntranceIcon() {
      if (this.lotteryList.length === 1) {
        this.setLotteryResultShow();
      } else {
        this.isShowRecord = true;
      }
    },

    /** 抽奖中-状态回调钩子 */
    onLotteryStatusChange(status) {
      if (status === 'running') {
        this.isLotteryShowing = true;
      } else if (status === 'over') {
        this.isLotteryShowing = false;
      }
    },

    /** 抽奖中-是否显示回调钩子 */
    onLotteryShowChange(isShowing) {
      this.isLotteryShowing = isShowing;
    },

    /** 中奖记录数据回调 - 如果有中奖记录数据，那组件初始化后会自动回调一次 */
    onLotteryRecord(lotteryList = []) {
      console.warn('onLotteryRecord');
      if (lotteryList.length) {
        this.lotteryList = lotteryList;
      }
    },

    /** 中奖记录-点击查看中奖结果详情回调 */
    onClickRecord(record = {}) {
      this.isShowRecord = false;
      const { prize, lotteryId, collectInfo, winnerCode, sessionId, received } =
        record;
      this.$refs.lotteryEnd.setLottery({
        received,
        prize,
        lotteryId,
        collectInfo,
        winnerCode,
        sessionId,
        isWinner: true,
      });
      this.setLotteryResultShow();
    },

    /** 中奖结果-展示 */
    setLotteryResultShow() {
      this.isShowResult = true;
    },

    /** 中奖结果-隐藏 */
    setLotteryResultHide() {
      this.isShowResult = false;
      setTimeout(() => {
        this.$refs.lotteryEnd && this.$refs.lotteryEnd.toBack();
      }, 500);
    },
  },
};
</script>

<style lang="scss">
.plv-demo-lottery-default__lottery {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2002;
}
.plv-lottery-record-default {
  background-color: #fff;
}
.plv-lottery-record-default__content {
  color: #202127;
}
</style>
