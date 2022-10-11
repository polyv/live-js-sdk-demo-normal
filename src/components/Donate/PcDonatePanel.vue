<template>
  <transition name="intr-panel-slide-up">
    <section ref="donate"
             class="c-donate"
             v-show="donatePanelVisible">
      <!-- 悬浮面板 -->
      <section ref="hoverPanel"
               v-show="showHoverPanel"
               class="c-donate__hover-panel"
               :style="hoverPanelStyle">
        <!-- 现金打赏悬浮面板 -->
        <section v-if="selectedDonateType === DonateType.CASH"
                 class="c-donate__hover-panel__content">
          <section class="c-donate__hover-panel__gift-info">
            <section class="c-donate__hover-panel__gift-info__img c-donate__hover-panel__gift-info__img--cash"></section>
            <section class="c-donate__hover-panel__gift-info__meta">
              <p class="c-donate__hover-panel__gift-info__name">打赏</p>
              <p class="c-donate__hover-panel__gift-info__price">现金</p>
            </section>
          </section>
          <section class="c-donate__hover-panel__gift-choice__wrap c-donate__hover-panel__gift-choice__cash-wrap">
            <span class="c-donate__hover-panel__gift-choice c-donate__hover-panel__gift-choice__cash"
                  v-for="(cash, index) in cashDonate.cashs"
                  :key="index"
                  :class="{'c-donate__hover-panel__gift-choice--selected': selectedCash === cash}"
                  @click="selectedCash = cash">
              {{ convertCashPriceText(cash) }}
            </span>
          </section>
          <section class="c-donate__hover-panel__custom-wrap">
            <span>自定义:</span>
            <section class="c-donate__hover-panel__custom-input-wrap">
              <input class="c-donate__hover-panel__custom-input"
                     v-model="donateCash" /><span>元</span>
            </section>
            <section class="c-donate__hover-panel__custom__rand-btn"
                     @click="setRandomCash">随机</section>
          </section>
          <button class="c-donate__hover-panel__btn"
                  @click="handleCashDonate">确认打赏</button>
        </section>

        <!-- 礼物打赏悬浮面板 -->
        <section v-else-if="selectedDonateType === DonateType.GIFT"
                 class="c-donate__hover-panel__content">
          <section class="c-donate__hover-panel__gift-info">
            <img class="c-donate__hover-panel__gift-info__img"
                 :src="selectedDonate.img" />
            <section class="c-donate__hover-panel__gift-info__meta">
              <p class="c-donate__hover-panel__gift-info__name">
                {{ selectedDonate.name }}
              </p>
              <p class="c-donate__hover-panel__gift-info__price">
                {{ convertGiftPriceText(selectedDonate.price) }}
              </p>
            </section>
          </section>
          <!-- "礼物打赏-积分支付"才会有数量选择 -->
          <section v-if="isGiftPonitPayWay"
                   class="c-donate__hover-panel__gift-choice__wrap c-donate__hover-panel__gift-choice__gift-wrap">
            <span class="c-donate__hover-panel__gift-choice c-donate__hover-panel__gift-choice__gift"
                  v-for="(giftNum, index) in giftNums"
                  :key="index"
                  :class="{
              'c-donate__hover-panel__gift-choice--selected': selectedGiftNum === giftNum
            }"
                  @click="selectedGiftNum = giftNum">{{ giftNum }}</span>
          </section>
          <button class="c-donate__hover-panel__btn"
                  @click="handleGiftPointPayDonate">确认打赏</button>
          <p v-if="isGiftPonitPayWay"
             class="c-donate__hover-panel__points">
            我的积分：<span>{{ userPoints }}</span>
          </p>
        </section>

        <section class="c-donate__hover-panel__close"
                 @click="handleHoverPanelClose">&times;</section>
        <section class="c-donate__hover-panel__border-bottom"></section>
        <section class="c-donate__hover-panel__triangle"
                 :style="hoverPanelTriagleStyle"></section>
      </section>

      <!-- 打赏种类列表 -->
      <ul ref="donateList"
          class="c-donate__gift-list">
        <!-- 礼物打赏 -->
        <template v-if="donateGiftEnabled">
          <template v-for="(gift, index) in giftList">
            <li class="c-donate__gift-item"
                :key="index"
                :class="{
              'c-donate__gift-item--selected': selectedDonate && selectedDonate.giftId === index + 1
            }"
                @click="debounceHandleDonateItemClick($event.currentTarget, {type: DonateType.GIFT, giftId: index + 1,...gift})">
              <img class="c-donate__gift-img"
                   :src="gift.img" />
              <p class="c-donate__gift-name">
                {{ gift.name }}
              </p>
              <p class="c-donate__gift-price">
                {{ convertGiftPriceText(gift.price) }}
              </p>
            </li>
          </template>
        </template>
        <!-- 现金打赏 -->
        <li v-if="donateCashEnabled "
            class="c-donate__gift-item"
            :class="{
          'c-donate__gift-item--selected': selectedDonate && !selectedDonate.giftId
        }"
            @click="debounceHandleDonateItemClick($event.currentTarget, {
          type: DonateType.CASH,
          name: '打赏',
          price: '现金',
        })">
          <p class="c-donate__gift-img c-donate__gift-img__cash"></p>
          <p class="c-donate__gift-name">打赏</p>
          <p class="c-donate__gift-price">现金</p>
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
      showHoverPanel: false,
      // 悬浮面板定位样式
      hoverPanelStyle: {
        left: 0,
        top: 0,
      },
      // 悬浮面板下方指示小三角定位样式
      hoverPanelTriagleStyle: {
        left: 0,
      },
      debounceHandleDonateItemClick: debounce(this.handleDonateItemClick),
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
        this.showHoverPanel = false;
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
          window.addEventListener('click', this.handleContainEl, true);
        } else {
          window.removeEventListener('click', this.handleContainEl, true);
        }
      }
    );
  },

  methods: {
    /** 判断点击区域是否需要隐藏当前面板 */
    handleContainEl(evt) {
      if (evt.target.getAttribute('data-type') === 'donate-entrance') return;

      /** @type {HTMLElement} */
      const $panel = this.$refs.donate;
      const $hoverPanel = this.$refs.hoverPanel;
      const $donateList = this.$refs.donateList;
      if (
        $panel.contains(evt.target) ||
        $hoverPanel.contains(evt.target) ||
        $donateList.contains(evt.target)
      ) {
        return;
      }

      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
    },
    // 鼠标点击某打赏条目
    handleDonateItemClick($donateItem, donateItem) {
      this.showHoverPanel = false;
      this.hoverItem = $donateItem;

      this.selectedDonateType = donateItem.type;
      this.selectedDonate = donateItem;
      this.selectedGiftNum = 1;
      this.selectedCash = null;

      // "礼物打赏-现金支付" 不需要 hoverPanel
      if (donateItem.type === this.DonateType.GIFT && this.isGiftCashPayWay) {
        this.handleGiftCashPayDonate(donateItem);
        return;
      }

      this.showHoverPanel = true;
      this.setHoverPanelStyle($donateItem);
    },
    setHoverPanelStyle($donateItem) {
      const donateList = this.$refs.donateList;
      const donateEl = this.$refs.donate; // 组件根元素
      const containerWidth = donateEl.offsetWidth;

      const itemWidth = $donateItem.offsetWidth; // 道具条目宽度

      // selectedDonateType 会控制悬浮面板是否显示，确保显示、有高度后再进行计算
      this.$nextTick(() => {
        const hoverPanel = this.$refs.hoverPanel;
        const panelWidth = hoverPanel.offsetWidth; // 悬浮面板宽度
        const panelHeight = hoverPanel.offsetHeight;

        let left = $donateItem.offsetLeft + itemWidth / 2 - panelWidth / 2; // 使悬浮面板中点与条目中点重合
        if (left < 0) {
          left = $donateItem.offsetLeft; // 如果面板与条目中点重合会导致面板溢出容器左边，则面板与条目左侧对齐
        }
        if (left + panelWidth > containerWidth) {
          left = $donateItem.offsetLeft - (panelWidth - itemWidth); // 如果面板与条目中点重合会导致面板溢出容器右边，则面板与右侧对齐
        }

        let top = -(panelHeight - $donateItem.offsetTop + 10); // 悬浮面板底部与道具条目顶部相差10px(小三角形高度)
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
    handleHoverPanelClose() {
      this.selectedDonateType = '';
      this.selectedDonate = null;
      this.selectedGiftNum = 1;
      this.showHoverPanel = false;
    },
    /** 现金打赏 */
    handleCashDonate() {
      const cash = Number(this.donateCash);
      if (cash === 0) {
        this.$dialog.alert({ message: '输入金额不能是0' });
        return;
      }
      if (cash < this.cashDonate.cashMin) {
        this.$dialog.alert({
          message: `请输入大于等于${this.cashDonate.cashMin}的金额`,
        });
        return;
      }

      // TODO 处理真实的现金打赏逻辑
      console.info('handleCashDonate', cash);
      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      this.resetSelectedDonateInfo();
    },
    /** 处理礼物打赏-现金支付 */
    async handleGiftCashPayDonate(donateItem) {
      // TODO 处理真实的礼物打赏-积分支付逻辑
      console.info('handleGiftCashPayDonate', donateItem);
      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      this.resetSelectedDonateInfo();
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
.c-donate__gift-list {
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

.c-donate__gift-item {
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
  .c-donate__gift {
    &-img {
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
.c-donate__gift-img__cash {
  display: inline-block;
  background-image: url(./imgs/redpack-cash.png);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.c-donate__hover-panel__gift-info {
  margin: 24px auto 16px;
  padding: 0 32px;
}
.c-donate__hover-panel__gift-info__img {
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
.c-donate__hover-panel__gift-info__meta {
  display: inline-block;
  .c-donate__hover-panel__gift-info__name {
    font-size: 16px;
    color: #333;
    margin-top: 10px;
  }
  .c-donate__hover-panel__gift-info__price {
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

.c-donate__hover-panel__gift-choice__cash-wrap {
  margin: 0 20px;
}
.c-donate__hover-panel__gift-choice__gift-wrap {
  margin: 0 20px;
}
.c-donate__hover-panel__gift-choice {
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

  &__gift {
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
  .c-donate__gift-item {
    width: 70px;
  }
}
</style>
