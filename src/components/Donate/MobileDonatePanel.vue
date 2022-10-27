<template>
  <transition name="intr-panel-slide-up">
    <section class="c-donate"
             ref="donate"
             v-show="donatePanelVisible">
      <section v-show="selectedDonateType !== DonateType.CASH">
        <section class="c-donate__swiper-wrap">
          <section v-if="isGiftPonitPayWay"
                   class="c-donate__points">
            我的积分：<span style="color: #FF5353;">{{ userPoints }}</span>
          </section>
          <swiper ref="mySwiper"
                  @slideChange="handleSlideChange">
            <swiper-slide v-for="(page, pageIndex) in donatePages"
                          :key="pageIndex">
              <ul class="c-donate__gift-list">
                <template v-for="(gift, giftIndex) in page">
                  <!-- 现金打赏 -->
                  <li :key="giftIndex"
                      v-if="gift._type === 'cash'"
                      class="c-donate__gift-item"
                      @click="handleDonateItemClick($event, {
                    type: DonateType.CASH,
                    name: '打赏',
                    price: '现金',
                  })">
                    <p class="c-donate__gift-img c-donate__gift-img__cash"></p>
                    <p class="c-donate__gift-name">打赏</p>
                    <p class="c-donate__gift-price">现金</p>
                  </li>
                  <!-- 礼物打赏列表 -->
                  <li v-else
                      class="c-donate__gift-item"
                      :key="giftIndex"
                      :class="{
                    'c-donate__gift-item--selected': selectedDonate && selectedDonate.giftId === pageIndex * 10 + (giftIndex + 1)
                  }"
                      @click="handleDonateItemClick($event, {
                    type: DonateType.GIFT,
                    giftId: pageIndex * 10 + (giftIndex + 1),
                    ...gift
                  })">
                    <img class="c-donate__gift-img"
                         :src="gift.img" />
                    <p class="c-donate__gift-name e">
                      {{ gift.name }}
                    </p>
                    <p class="c-donate__gift-price ">{{ convertGiftPriceText(gift.price) }}</p>
                  </li>
                </template>
              </ul>
            </swiper-slide>
          </swiper>
        </section>
        <!-- 分页组件 -->
        <section v-if="donatePages && donatePages.length > 1"
                 class="c-donate__paginator">
          <span class="c-donate__paginator__dot"
                v-for="(page, index) in donatePages"
                :key="index"
                :class="{
            'c-donate__paginator__dot--cur': curPage === index + 1
          }"></span>
        </section>

        <!-- "礼物打赏-积分支付"才会有数量选择 -->
        <section v-if="isGiftPonitPayWay"
                 class="c-donate__selections">
          <section class="c-donate__gift-num-wrap">
            <span class="c-donate__gift-num"
                  v-for="(giftNum, index) in giftNums"
                  :key="index"
                  :class="{
              'c-donate__gift-num--selected': selectedGiftNum === giftNum
            }"
                  @click="selectedGiftNum = giftNum">{{ giftNum }}</span>
          </section>
          <button class="c-donate__confirm-btn"
                  @click="handleGiftPointPayDonate">打赏</button>
        </section>
      </section>

      <section v-show="selectedDonateType === DonateType.CASH"
               class="c-donate__cash-wrap">
        <section class="c-donate__cash__header">
          <span class="iconfont-mob g-icon-mob-back"
                @click="handleCashSelectPanelHidden">&lt;</span>
          <h3>现金打赏</h3>
        </section>
        <section class="c-donate__cash__body">
          <section v-show="!showCustomCash"
                   class="c-donate__cash__list-wrap">
            <section class="c-donate__cash__list">
              <span class="c-donate__cash"
                    v-for="(cash, index) in cashDonate.cashs"
                    :key="index"
                    :class="{'c-donate__cash--selected': selectedCashIndex === index}"
                    @click="handleSelectCash(index)">
                {{ convertCashPriceText(cash) }}
              </span>
            </section>
            <p class="c-donate__cash__custom-btn"
               @click="handleCustomCashBtnClick">
              自定义金额<span style="letter-spacing: -5px;">>>></span>
            </p>
          </section>

          <section v-show="showCustomCash"
                   class="c-donate__cash__custom">
            <section ref="customInputWrap"
                     class="c-donate__cash__custom__input-wrap">
              <span ref="customCashLabel"
                    class="c-donate__cash__custom__label">自定义金额</span>
              <input class="c-donate__cash__custom__input"
                     placeholder="请输入金额"
                     :style="{ maxWidth: customCashMaxWidth }"
                     v-model="donateCash" />
              <span ref="customCashRandBtn"
                    class="c-donate__cash__custom__rand-btn"
                    @click="setRandomCash">随机</span>
            </section>
            <section class="c-donate__cash__btn__wrap">
              <button class="c-donate__cash__btn"
                      @click="handleCashDonate">
                打赏
              </button>
            </section>
          </section>
        </section>
      </section>
    </section>
  </transition>

</template>

<script>
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';

import { toggleClass } from '@/utils/dom';
import DonateMixin, {
  DonateMessageHub,
  DonateMessageHubEvents,
} from './DonateMixin.js';

export default {
  mixins: [DonateMixin],
  components: {
    Swiper,
    SwiperSlide,
  },
  directives: {
    swiper: directive,
  },

  data() {
    return {
      donatePanelVisible: false,
      curPage: 1,
      showCustomCash: false, // 显示自定义金额输入框
      selectedCashIndex: null,
      giftId: '', // 礼品id
      customCashMaxWidth: null, // 自定义金额输入框宽度
    };
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },

    /**
     * 打赏滑动分页，现金打赏会设置为礼物的形式展示，
     * */
    donatePages() {
      const pages = [];
      let donateList = []; // 所有打赏种类

      if (this.donateGiftEnabled) {
        donateList = donateList.concat(this.giftList);
      }

      // 现金打赏，特殊处理
      if (this.donateCashEnabled) {
        donateList.push({
          _type: this.DonateType.CASH,
        });
      }

      const pageSize = window.innerWidth <= 320 ? 5 : 10;
      const totalPages = Math.ceil(donateList.length / pageSize);
      for (let i = 0; i < totalPages; i++) {
        pages.push(donateList.slice(i * pageSize, i * pageSize + pageSize));
      }

      return pages;
    },
  },
  watch: {
    showCustomCash() {
      // 设置自定义金额输入框宽度，避免溢出
      this.$nextTick(() => {
        const customInputWrap = this.$refs.customInputWrap;
        const customCashLabel = this.$refs.customCashLabel;
        const customCashRandBtn = this.$refs.customCashRandBtn;
        const customCashMaxWidth =
          customInputWrap?.clientWidth -
          customCashLabel?.clientWidth -
          customCashRandBtn?.clientWidth;
        this.customCashMaxWidth = `${customCashMaxWidth}px`;
      });
    },
  },

  mounted() {
    this.customMountEl();
    const $tabChat = document.querySelector('#tab-chat');
    DonateMessageHub.on(
      DonateMessageHubEvents.PANEL_VISIBLE_TOGGLE,
      ({ visible }) => {
        this.donatePanelVisible = visible;
        if (this.isGiftPonitPayWay) {
          toggleClass($tabChat, 'plv-has-donate-panel-score');
        } else {
          toggleClass($tabChat, 'plv-has-donate-panel-cash');
        }

        if (this.donatePanelVisible) {
          window.addEventListener('click', this.handleContainEl, true);
          window.addEventListener('touchend', this.handleContainEl, true);
        } else {
          window.removeEventListener('click', this.handleContainEl, true);
          window.removeEventListener('touchend', this.handleContainEl, true);
        }
      }
    );
  },

  methods: {
    customMountEl() {
      // 挂载在聊天室区域
      const $tabChat = document.querySelector('#tab-chat');
      $tabChat.querySelector('.polyv-chat-input').appendChild(this.$el);
    },
    handleContainEl(evt) {
      if (evt.target.getAttribute('data-type') === 'donate-entrance') return;

      /** @type {HTMLElement} */
      const $panel = this.$refs.donate;
      if (!$panel.contains(evt.target)) {
        evt.preventDefault();
        this.resetSelectedDonateInfo();
        DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      }
    },
    handleSlideChange() {
      this.curPage =
        (this.$refs.mySwiper.swiperInstance &&
          this.$refs.mySwiper.swiperInstance.activeIndex + 1) ||
        1;
    },
    /** 打赏项点击处理 */
    async handleDonateItemClick(e, donateItem) {
      // 设置打赏类型后会切换窗口
      this.selectedDonateType = donateItem.type;
      this.selectedDonate = donateItem;
      this.selectedCashIndex = null;

      // 如果是"礼物打赏-积分支付"，则需要在 handleGiftPointPayDonate 中处理
      if (donateItem.type === this.DonateType.GIFT && this.isGiftCashPayWay) {
        this.handleGiftCashPayDonate(donateItem);
      }
    },
    /** 处理礼物打赏-现金支付 */
    async handleGiftCashPayDonate(donateItem) {
      this.giftId = donateItem.giftId;
      // TODO 处理真实的礼物打赏-现金支付逻辑
      console.info('handleGiftCashPayDonate', donateItem);
      DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);

      this.handleSendRewardMsg({
        donateType: 'good', // 虽然是现金支付，但需要用道具的动效展示
        content: this.selectedDonate.name,
        goodImage: this.selectedDonate.img,
      });
      this.resetSelectedDonateInfo();
    },
    /** 当 selectedDonateType 为 DonateType.CASH 可以选择现金数量  */
    handleSelectCash(index) {
      this.selectedCashIndex = index;
      this.selectedCash = this.cashDonate.cashs[index];
      this.donateCash = this.selectedCash;
      this.handleCashDonate();
    },
    handleCustomCashBtnClick() {
      this.donateCash = '';
      this.showCustomCash = true;
    },
    /** 现金打赏 */
    async handleCashDonate() {
      this.giftId = '';

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
      this.handleSendRewardMsg({
        donateType: 'cash',
        content: cash,
      });
      this.resetSelectedDonateInfo();
    },
    handleCashSelectPanelHidden() {
      this.donateCash = '';
      this.showCustomCash = false;
      this.selectedDonateType = '';
      this.selectedCashIndex = null;
    },
  },
};
</script>

<style lang="scss">
$donatePanelHeightScore: 280px;
$donatePanelHeightCash: 220px;

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

// 对于 iphone x 系列采用安全距离作为底部 padding
// $normalBottom, 若非 iphone x 系列,底部距离
@mixin iphone-x-pb($normalBottom, $isReplace: false) {
  // 用安全距离替换原底部padding值。若原底部padding值大于底部安全距离，则不会被替换。
  @if $isReplace {
    padding-bottom: $normalBottom;
    .g-page--ios & {
      @supports (padding-bottom: env(safe-area-inset-bottom)) or (padding-bottom: constant(safe-area-inset-bottom, $normalBottom)) {
        padding-bottom: unquote('max(constant(safe-area-inset-bottom, #{$normalBottom}), #{$normalBottom})');
        padding-bottom: unquote('max(env(safe-area-inset-bottom, #{$normalBottom}), #{$normalBottom})');
      }
    }
  } @else {
    // 安全距离与原底部padding值叠加
    // ios < 11.2
    padding-bottom: calc(constant(safe-area-inset-bottom) + #{$normalBottom});
    // ios >= 11.2
    padding-bottom: calc(env(safe-area-inset-bottom) + #{$normalBottom});
    // 兼容不支持calc(env(safe-area-inset-bottom)和calc(constant(safe-area-inset-bottom)这两种写法的浏览器，假设安全距离为0，设置padding-bottom为传出的值
    @supports not(padding-bottom: calc(env(safe-area-inset-bottom) + #{$normalBottom}) or (padding-bottom: calc(constant(safe-area-inset-bottom, $normalBottom) + #{$normalBottom}))) {
      padding-bottom: $normalBottom;
    }
  }
}

.c-donate__swiper-wrap {
  padding: 6px 8px 8px;
  box-sizing: border-box;
}
.c-donate__points {
  color: #FFFFFF;
  font-size: 12px;
  margin: 8px 8px 4px 0;
  text-align: right;
}
.c-donate__gift-item {
  width: 20%;
  height: 95px;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .1s ease-in-out;
  &--selected {
    background: #3E3E4E;
    border: 1px solid #ADADC0;
    border-radius: 4px;
  }
  .c-donate__gift {
    &-img {
      margin: auto;
      width: 48px;
      height: 48px;
    }
    &-name {
      color: #FFFFFF;
      font-size: 13px;
      margin: 2px 0 4px;
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
  background-image: url(./imgs/redpack-cash.png);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
$paginator-size: 4px;
.c-donate__paginator {
  width: 100%;
  text-align: center;
  height: $paginator-size;
  line-height: $paginator-size;
  margin-top: -2px;
}
.c-donate__paginator__dot {
  display: inline-block;
  width: $paginator-size;
  height: $paginator-size;
  background: #1A1B1F;
  margin: 0 4px;
  border-radius: 50%;
  &--cur {
    background: #ADADC0;
  }
}

.c-donate__selections {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.c-donate__gift-num-wrap {
  .c-donate__gift-num {
    width: 36px;
    line-height: 24px;
    display: inline-block;
    background: #1A1B1F;
    color: #ADADC0;
    border-radius: 12px;
    text-align: center;
    font-size: 12px;
    margin-right: 4px;
    box-sizing: border-box;

    &--selected {
      border: 1px solid #ADADC0;
      color: #fff;
      background: #3E3E4E;
    }
  }
}
.c-donate__confirm-btn {
  width: 54px;
  line-height: 32px;
  background: #FF5353;
  color: #FFFFFF;
  font-size: 14px;
  border-radius: 16px;
}

.c-donate__cash-wrap {
  z-index: 1;
  position: relative;
  top: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: #2B2C35;
}
.c-donate__cash__header {
  position: relative;
  line-height: 48px;
  font-size: 16px;
  color: #fff;
  text-align: center;
  .g-icon-mob-back {
    position: absolute;
    top: 0;
    left: 16px;
    width: 28px;
    height: 28px;
    font-size: 22px;
    transform: scaleY(1.5);
    color: #9195A1;
  }
  .c-donate__cash__back {
    position: absolute;
    top: 10px;
    left: 16px;
    width: 28px;
    height: 28px;
  }
}
.c-donate__cash__list {
  padding: 0 24px;
  margin: 16px 0 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.c-donate__cash {
  display: inline-block;
  line-height: 40px;
  background-color: #1A1B1F;
  border-radius: 20px;
  flex: 0 0 calc(33.3% - 8px);
  text-align: center;
  box-sizing: border-box;
  border: 1px solid transparent;
  font-size: 16px;
  &:nth-child(3n + 1) {
    margin-left: 0;
  }
  &--selected {
    border: 1px solid #ADADC0;
    background: #3E3E4E;
  }
  &:nth-child(1), &:nth-child(2), &:nth-child(3) {
    margin-bottom: 8px;
  }
}
.c-donate__cash__custom-btn {
  margin: 20px 0 !important;
  text-align: center;
  font-size: 16px;
  color: #ADADC0;
}
.c-donate__cash__btn__wrap {
  width: 100%;
  padding: 20px 24px;
  @include iphone-x-pb(20px);
  box-sizing: border-box;
}
.c-donate__cash__btn {
  display: block;
  width: 100%;
  line-height: 48px;
  background: #F06E6E;
  color: #fff;
  border-radius: 25px;
  font-size: 16px;
}

.c-donate__cash__custom {
  position: relative;
  padding: 16px 24px;
  box-sizing: border-box;
}
.c-donate__cash__custom__input-wrap {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  color: #fff;
  border-radius: 20px;
  background: #1A1B1F;
  line-height: 40px;
  font-size: 16px;
  white-space: nowrap;
  justify-content: space-around;
  box-sizing: border-box;
  padding: 0 16px;
}
.c-donate__cash__custom__input {
  color: #fff;
  border: none;
  font-size: 16px;
  background: #1A1B1F !important;
  flex: 1;
}
.c-donate__cash__custom__label {
  color: #ADADC0;
  padding: 0 16px !important;
}
.c-donate__cash__custom__rand-btn {
  color: #3082FE;
  padding: 0 16px;
}

@media screen and (max-width: 320px) {
  .c-donate__gift-num-wrap {
    .c-donate__gift-num {
      width: 32px;
    }
  }
}

// hack 聊天室区域来展示当前面板
.mobile-wrap .tab-chat.plv-has-donate-panel-cash {
  padding-bottom: 260px;
  .polyv-chat-input {
    bottom: $donatePanelHeightCash;
  }
  .c-donate {
    position: relative;
    background-color: #2b2c35;
    min-height: $donatePanelHeightCash;
    z-index: 100;
  }
}

.mobile-wrap .tab-chat.plv-has-donate-panel-score {
  padding-bottom: 320px;
  .polyv-chat-input {
    bottom: $donatePanelHeightScore;
  }
  .c-donate {
    position: relative;
    background-color: #2b2c35;
    min-height: $donatePanelHeightScore;
    z-index: 100;
  }
}
</style>
