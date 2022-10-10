<template>
  <transition name="intr-panel-slide-up">
    <section ref="donate"
             class="c-donate"
             v-show="donatePanelVisible">
      <!-- 悬浮面板 -->
      <section ref="hoverPanel"
               v-show="showFloatPanel"
               class="c-donate__hover-panel"
               :style="hoverPanelStyle">
        <!-- 现金打赏悬浮面板 -->
        <section v-if="selectedDonateType === 'cash'"
                 class="c-donate__hover-panel__content">
          <section class="c-donate__hover-panel__good-info">
            <section class="c-donate__hover-panel__good-info__img c-donate__hover-panel__good-info__img--cash"></section>
            <section class="c-donate__hover-panel__good-info__meta">
              <p class="c-donate__hover-panel__good-info__name">打赏</p>
              <p class="c-donate__hover-panel__good-info__price">现金</p>
            </section>
          </section>
          <section class="c-donate__hover-panel__good-choice__wrap c-donate__hover-panel__good-choice__cash-wrap">
            <span class="c-donate__hover-panel__good-choice c-donate__hover-panel__good-choice__cash"
                  v-for="(cash, index) in cashes"
                  :key="index"
                  :title="cash | priceText"
                  :class="{
              'c-donate__hover-panel__good-choice--selected': selectedCash === cash
            }"
                  @click="selectedCash = cash">{{ cash | priceText }}</span>
          </section>
          <section class="c-donate__hover-panel__custom-wrap">
            <span>自定义:</span>
            <section class="c-donate__hover-panel__custom-input-wrap">
              <input class="c-donate__hover-panel__custom-input"
                     v-model="donateCash" /><span>元</span>
            </section>
            <section class="c-donate__hover-panel__custom__rand-btn"
                     @click="setRandCash">随机</section>
          </section>
          <button class="c-donate__hover-panel__btn"
                  @click="handleCashDonate">确认打赏</button>
        </section>

        <!-- 道具/积分打赏悬浮面板 -->
        <section v-else-if="selectedDonateType === 'good'"
                 class="c-donate__hover-panel__content">
          <section class="c-donate__hover-panel__good-info">
            <img class="c-donate__hover-panel__good-info__img"
                 :src="selectedDonate.goodImg" />
            <section class="c-donate__hover-panel__good-info__meta">
              <p class="c-donate__hover-panel__good-info__name">{{ selectedDonate.goodName }}</p>
              <p class="c-donate__hover-panel__good-info__price"
                 :title="goodsPriceText(selectedDonate.goodPrice)">{{ goodsPriceText(selectedDonate.goodPrice) }}</p>
            </section>
          </section>
          <!-- 积分打赏才会有数量选择 -->
          <section v-if="donatePointEnabled"
                   class="c-donate__hover-panel__good-choice__wrap c-donate__hover-panel__good-choice__good-wrap">
            <span class="c-donate__hover-panel__good-choice c-donate__hover-panel__good-choice__good"
                  v-for="(goodNum, index) in goodNums"
                  :key="index"
                  :class="{
              'c-donate__hover-panel__good-choice--selected': selectedNum === goodNum
            }"
                  @click="selectedNum = goodNum">{{ goodNum }}</span>
          </section>
          <button class="c-donate__hover-panel__btn"
                  @click="handlePointDonate">确认打赏</button>
          <p v-if="donatePointEnabled"
             class="c-donate__hover-panel__points">我的积分：<span>{{ points }}</span></p>
        </section>

        <section class="c-donate__hover-panel__close"
                 @click="handleLeaveGoods">&times;</section>
        <section class="c-donate__hover-panel__border-bottom"></section>
        <section class="c-donate__hover-panel__triangle"
                 :style="hoverPanelTriagleStyle"></section>
      </section>

      <!-- 打赏种类列表 -->
      <ul ref="donateList"
          class="c-donate__good-list pws-tools-scroll-color">
        <!-- 道具/积分打赏 -->
        <template v-if="showGoods">
          <template v-for="(good, index) in goods">
            <li class="c-donate__good-item pws-give-item-hover"
                data-type="good"
                :key="index"
                :class="{
              'c-donate__good-item--selected': selectedDonate && selectedDonate.goodId === index + 1
            }"
                v-if="isGoodVisible(good)"
                @click="debounceHandleItemEvent($event.currentTarget, {
              goodId: index + 1,
              ...good
            })">
              <img class="c-donate__good-img"
                   :src="good.goodImg" />
              <p class="c-donate__good-name pws-donate-good-name">{{ good.goodName }}</p>
              <p class="c-donate__good-price pws-give-price-text-color">{{ goodsPriceText(good.goodPrice) }}</p>
            </li>
          </template>
        </template>
        <!-- 现金打赏 -->
        <li v-if="donateCashEnabled && weixinPayEnabled"
            data-type="cash"
            class="c-donate__good-item pws-give-item-hover"
            :class="{
          'c-donate__good-item--selected': selectedDonate && !selectedDonate.goodId
        }"
            @click="debounceHandleItemEvent($event.currentTarget, {
          goodName: '打赏',
          goodPrice: '现金',
        })">
          <p class="c-donate__good-img c-donate__good-img__cash"></p>
          <p class="c-donate__good-name pws-donate-good-name">打赏</p>
          <p class="c-donate__good-price pws-give-price-text-color">现金</p>
        </li>
      </ul>
    </section>
  </transition>
</template>

<script>
import DonateMixin, {
  DonateMessageHub,
  DonateMessageHubEvents,
} from './DonateMixin.js';
import { debounce } from '@/utils';

export default {
  mixins: [DonateMixin],

  data() {
    return {
      donatePanelVisible: false,
      hoverItem: null,
      showFloatPanel: false,
      // 悬浮面板定位样式
      hoverPanelStyle: {
        left: 0,
        top: 0,
      },
      // 悬浮面板下方指示小三角定位样式
      hoverPanelTriagleStyle: {
        left: 0,
      },
      debounceHandleItemEvent: debounce(this.handleItemEvent),
    };
  },

  watch: {
    hoverPanelStyle() {
      if (!this.hoverItem) {
        return;
      }
      const triangleWidth = 20;

      this.$nextTick(() => {
        const hoverPanel = this.$refs.hoverPanel;
        const hoverPanelTriangleLeft =
          this.hoverItem.offsetLeft -
          hoverPanel.offsetLeft +
          this.hoverItem.offsetWidth / 2 -
          triangleWidth / 2;
        this.hoverPanelTriagleStyle = {
          left: `${hoverPanelTriangleLeft}px`,
        };
      });
    },

    selectedDonate(newVal) {
      if (!newVal) {
        this.showFloatPanel = false;
      }
    },
  },

  mounted() {
    const $tabChat = document.querySelector('#tab-chat');
    $tabChat.appendChild(this.$el);
    DonateMessageHub.on(
      DonateMessageHubEvents.PANEL_VISIBLE_TOGGLE,
      ({ visible }) => {
        this.donatePanelVisible = visible;

        if (this.donatePanelVisible) {
          window.addEventListener('click', this.handleContain, false);
        } else {
          window.removeEventListener('click', this.handleContain, false);
        }
      }
    );
  },

  methods: {
    handleContain(evt) {
      if (evt.target.getAttribute('data-type') === 'donate-entrance') return;

      /** @type {HTMLElement} */
      const $panel = this.$refs.donate;
      const $hoverPanel = this.$refs.hoverPanel;
      const $donateList = this.$refs.donateList;

      if (
        !$panel.contains(evt.target) &&
        !$hoverPanel.contains(evt.target) &&
        !$donateList.contains(evt.target)
      ) {
        DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      }
    },
    // 鼠标点击某打赏条目
    handleItemEvent(item, good) {
      this.showFloatPanel = false;
      const donateList = this.$refs.donateList;
      const itemWidth = item.offsetWidth; // 道具条目宽度
      const donateEl = this.$refs.donate; // 组件根元素
      const containerWidth = donateEl.offsetWidth;
      const type = item && item.getAttribute('data-type');
      this.selectedDonateType = type;
      this.selectedDonate = good;
      this.hoverItem = item;
      this.selectedNum = 1;
      this.selectedCash = null;

      if (
        !this.donatePointEnabled &&
        this.donateGoodEnabled &&
        type !== 'cash'
      ) {
        this.handleNormalDonate({
          donate_type: 'good',
          good_id: good.goodId,
        });

        DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
        return;
      }

      this.showFloatPanel = true;

      // selectedDonateType 会控制悬浮面板是否显示，确保显示、有高度后再进行计算
      this.$nextTick(() => {
        const hoverPanel = this.$refs.hoverPanel;
        const panelWidth = hoverPanel.offsetWidth; // 悬浮面板宽度
        const panelHeight = hoverPanel.offsetHeight;

        let left = item.offsetLeft + itemWidth / 2 - panelWidth / 2; // 使悬浮面板中点与条目中点重合
        if (left < 0) {
          left = item.offsetLeft; // 如果面板与条目中点重合会导致面板溢出容器左边，则面板与条目左侧对齐
        }
        if (left + panelWidth > containerWidth) {
          left = item.offsetLeft - (panelWidth - itemWidth); // 如果面板与条目中点重合会导致面板溢出容器右边，则面板与右侧对齐
        }

        let top = -(panelHeight - item.offsetTop + 10); // 悬浮面板底部与道具条目顶部相差10px(小三角形高度)
        top -= donateList.scrollTop; // 上滑距离

        // 如果距离容器上边缘过高，
        if (Math.abs(top) - Math.abs(panelHeight) - 10 >= 0) {
          top = -panelHeight - 10; // 三角形高10
        }

        this.hoverPanelStyle = {
          left: `${left}px`,
          top: `${top}px`,
        };
      });
    },

    handleLeaveGoods() {
      this.selectedDonateType = '';
      this.selectedDonate = null;
      this.selectedNum = 1;
      this.showFloatPanel = false;
    },

    handleCashDonate() {
      const cash = Number(this.donateCash);
      if (cash === 0) {
        this.$dialog.alert({ message: '输入金额不能是0' });
        return;
      }
      if (cash < this.cashMin) {
        this.$dialog.alert({ message: `请输入大于等于${this.cashMin}的金额` });
        return;
      }
      this.handleNormalDonate({
        donate_type: 'cash',
        amount: this.donateCash,
      });
    },

    clearCheckTimer() {
      clearInterval(this.checkDonateTimer);
      this.checkDonateCount = 100;
      this.checkDonateTimer = null;
    },

    // 处理道具、现金打赏
    async handleNormalDonate(data) {
      this.clearCheckTimer();
      // TODO 处理真实打赏逻辑
    },

    async checkDonateStatus() {
      const donateData = this.donateData;
      if (!donateData) {
        this.clearCheckTimer();
        return;
      }
      if (this.checkDonateCount === 0) {
        this.clearCheckTimer();
        this.$dialog.alert({ message: '支付超时，请重新扫码付费' });
        // TODO 清空 donateData
        return;
      }
      this.checkDonateCount -= 1;

      // TODO 自行处理打赏状态
    },
  },
};
</script>

<style lang="scss" scoped>
.intr-panel-slide-up-enter-active {
  animation: intr-panel-slide-up .3s ease-in;
}
.intr-panel-slide-up-leave-active {
  animation: intr-panel-slide-up .3s reverse ease-in-out;
}

@keyframes intr-panel-slide-up {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@mixin scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: #46464F;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
    box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
  }
}

.c-donate {
  height: 158px;
  box-sizing: border-box;
  overflow: visible;
  position: relative;
  background-color: #2b2c35;
  top: -158px;
}
.c-donate__good-list {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fill, 70px);
  justify-content: space-around;
  padding-bottom: 14px;
  @include scrollbar();
}
.c-donate__hover-panel {
  z-index: 21;
  position: absolute;
  top: -200px;
  left: 0;
  width: 200px;
  padding-bottom: 24px;
  background: #fff;
  box-shadow: 0 8px 30px 0 rgba(37, 43, 58, 0.08);
  border: 1px solid rgba(236, 238, 241, 1);
  border-radius: 2px;
  .c-donate__hover-panel__border-bottom {
    position: absolute;
    height: 10px;
    width: 36px;
    left: 100px;
    margin-left: -18px;
    bottom: -10px;
    background: transparent;
  }
}
// 悬浮面板底部小三角形
.c-donate__hover-panel__triangle {
  position: absolute;
  bottom: -10px;
  border-top: 10px solid #fff;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

.c-donate__good-item {
  width: 70px;
  height: 96px;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .1s ease-in-out;
  &:hover, &--selected {
    background: #3E3E4E;
    border: 1px solid #ADADC0;
    border-radius: 2px;
  }
  .c-donate__good {
    &-img {
      margin: 6px 11px 4px;
      width: 48px;
      height: 48px;
    }
    &-name {
      color: #FFFFFF;
      font-size: 13px;
      margin: 4px 0;
    }
    &-price {
      color: #ADADC0;
      font-size: 12px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transform: scale(0.83);
    }
  }
}
.c-donate__good-img__cash {
  display: inline-block;
  background-image: url(./imgs/redpack-cash.png);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.c-donate__hover-panel__good-info {
  margin: 24px auto 16px;
  padding: 0 32px;
}
.c-donate__hover-panel__good-info__img {
  display: inline-block;
  width: 56px;
  height: 56px;
  margin-right: 16px;
  vertical-align: top;
  &--cash {
    background-image: url(./imgs/redpack-cash.png);
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
}
.c-donate__hover-panel__good-info__meta {
  display: inline-block;
  .c-donate__hover-panel__good-info__name {
    font-size: 16px;
    color: #333;
    margin-top: 10px;
  }
  .c-donate__hover-panel__good-info__price {
    font-size: 12px;
    color: #FF5353;
    margin-top: 8px;
    max-width: 64px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.c-donate__hover-panel__close {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: #546E7A;
  text-align: center;
  line-height: 32px;
  cursor: pointer;
}

.c-donate__hover-panel__good-choice__cash-wrap {
  margin: 0 22px;
}
.c-donate__hover-panel__good-choice__good-wrap {
  margin: 0 28px;
}
.c-donate__hover-panel__good-choice {
  border: 1px solid #ECEEF1;
  display: inline-block;
  box-sizing: border-box;
  border-radius: 2px;
  font-size: 12px;
  color: #333333;
  cursor: pointer;
  padding: 0 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all .1s ease-in-out;

  &__cash {
    width: 48px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    margin: 3px 2px;
  }

  &__good {
    width: 40px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    margin: 4px;
  }

  &--selected {
    border: 1px solid #FF5353;
    color: #FF5353;
  }
  &:hover {
    border: 1px solid #FF5353;
    color: #FF5353;
  }
}
.c-donate__hover-panel__points {
  color: #333;
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
  span {
    color: #FF5722;
  }
}

// 自定义金额
.c-donate__hover-panel__custom-wrap {
  font-size: 12px;
  color: #333;
  text-align: center;
  margin-top: 4px;
  // margin-right: -10px; // 调节自定义输入框与上方第二个方框左边缘对齐
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  section {
    display: inline-block;
  }
}
.c-donate__hover-panel__custom-input-wrap {
  position: relative;

  input {
    width: 72px;
    height: 24px;
    border: 1px solid #ECEEF1;
    border-radius: 2px;
    padding-left: 2px;
    padding-right: 18px;
    box-sizing: border-box;
    text-align: center;
  }
  span {
    position: absolute;
    top: 0;
    right: 4px;
    line-height: 24px;
  }
}

.c-donate__hover-panel__custom__rand-btn {
  color: #2196F3;
  margin-left: 4px;
  cursor: pointer;
}

// 确认打赏按钮
.c-donate__hover-panel__btn {
  display: block;
  margin: 16px auto 0;
  width: 152px;
  height: 32px;
  border: none;
  outline: none;
  border-radius: 2px;
  background-color: #FF5353;
  color: #fff;
  cursor: pointer;
}

@media (max-width: 1280px) {
  .c-donate__good-item {
    width: 70px;
  }
}
</style>
