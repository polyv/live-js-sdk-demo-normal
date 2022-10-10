<template>
  <transition name="intr-panel-slide-up">
    <section class="c-donate"
             ref="donate"
             v-show="donatePanelVisible">
      <section v-show="selectedDonateType !== 'cash'">
        <section class="c-donate__swiper-wrap">
          <section v-if="donatePointEnabled"
                   class="c-donate__points">
            我的积分：<span style="color: #FF5353;">{{ points }}</span>
          </section>
          <swiper ref="mySwiper"
                  @slideChange="handleSlideChange">
            <swiper-slide v-for="(page, pageIndex) in donatePages"
                          :key="pageIndex">
              <ul class="c-donate__good-list">
                <template v-for="(good, goodIndex) in page">
                  <!-- 现金打赏条目 -->
                  <li :key="goodIndex"
                      v-if="good._type === 'cash'"
                      class="c-donate__good-item pws-donate-good-item"
                      @click="handleItemEvent($event, {
                    type: 'cash',
                    goodName: '打赏',
                    goodPrice: '现金',
                  })">
                    <p class="c-donate__good-img c-donate__good-img__cash"></p>
                    <p class="c-donate__good-name pws-donate-good-name">打赏</p>
                    <p class="c-donate__good-price pws-give-price-text-color">现金</p>
                  </li>
                  <!-- 道具/积分打赏条目 -->
                  <li v-else-if="isGoodVisible(good)"
                      class="c-donate__good-item pws-donate-good-item"
                      :key="goodIndex"
                      :class="{
                    'c-donate__good-item--selected pws-donate-good-item--selected': selectedDonate && selectedDonate.goodId === pageIndex * 10 + (goodIndex + 1)
                  }"
                      @click="handleItemEvent($event, {
                    type: 'good',
                    goodId: pageIndex * 10 + (goodIndex + 1),
                    ...good
                  })">
                    <img class="c-donate__good-img"
                         :src="good.goodImg" />
                    <p class="c-donate__good-name pws-donate-good-name">{{ good.goodName }}</p>
                    <p class="c-donate__good-price pws-give-price-text-color">{{ goodsPriceText(good.goodPrice) }}</p>
                  </li>
                </template>
              </ul>
            </swiper-slide>
          </swiper>
        </section>
        <section v-if="donatePages && donatePages.length > 1"
                 class="c-donate__paginator">
          <span class="c-donate__paginator__dot pws-donate__paginator__dot"
                v-for="(page, index) in donatePages"
                :key="index"
                :class="{
            'c-donate__paginator__dot--cur pws-donate__paginator__dot--cur': curPage === index + 1
          }"></span>
        </section>

        <section v-if="donatePointEnabled"
                 class="c-donate__selections">
          <!-- 积分打赏才会有数量选择 -->
          <section class="c-donate__good-num-wrap">
            <span class="c-donate__good-num pws-donate-good-num"
                  v-for="(goodNum, index) in goodNums"
                  :key="index"
                  :class="{
              'c-donate__good-num--selected': selectedNum === goodNum
            }"
                  @click="selectedNum = goodNum">{{ goodNum }}</span>
          </section>
          <button class="c-donate__confirm-btn"
                  @click="handlePointDonate">打赏</button>
        </section>
      </section>

      <section v-show="selectedDonateType === 'cash'"
               class="c-donate__cash-wrap pws-mob-chat-input-panel-bg-color">
        <section class="c-donate__cash__header pws-donate__cash__header">
          <i class="iconfont-mob g-icon-mob-back pws-mob-give-arrow-color"
             @click="handleCashBack"></i>
          <h3>现金打赏</h3>
        </section>
        <section class="c-donate__cash__body">
          <section v-show="!showCustomCash"
                   class="c-donate__cash__list-wrap">
            <section class="c-donate__cash__list">
              <span class="c-donate__cash pws-mob-give-price-bg-color"
                    v-for="(cash, index) in cashes"
                    :key="index"
                    :title="cash | priceText"
                    :class="{
                'c-donate__cash--selected': selectedCashIndex === index
              }"
                    @click="handleSelectCash(index)">{{ cash | priceText }}</span>
            </section>
            <p class="c-donate__cash__custom-btn pws-mob-give-var-price-text-color"
               @click="handleClickCustom">自定义金额</p>
          </section>

          <section v-show="showCustomCash"
                   class="c-donate__cash__custom">
            <section ref="customInputWrap"
                     class="c-donate__cash__custom__input-wrap pws-mob-give-input-bg-color">
              <span ref="customCashLabel"
                    class="c-donate__cash__custom__label pws-mob-give-var-price-text-label-color">自定义金额</span>
              <input class="c-donate__cash__custom__input pws-mob-give-input-bg-color pws-mob-give-input-color"
                     placeholder="请输入金额"
                     :style="{ maxWidth: customCashMaxWidth }"
                     v-model="donateCash" />
              <span ref="customCashRandBtn"
                    class="c-donate__cash__custom__rand-btn pws-mob-give-random-text-color"
                    @click="setRandCash">随机</span>
            </section>
            <section class="c-donate__cash__btn__wrap">
              <input type="button"
                     class="c-donate__cash__btn pws-mob-give-btn-color"
                     value="打赏"
                     @click="handleCashDonate" />
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

import { isMobile, isWeixin } from '@/utils';
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
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },

    // 打赏滑动分页
    donatePages() {
      const pages = [];
      let donateList = []; // 所有打赏种类

      if (this.showGoods) {
        donateList = donateList.concat(this.goods);
      }
      // 现金打赏，特殊处理
      if (this.donateCashEnabled && this.weixinPayEnabled) {
        donateList.push({
          _type: 'cash',
        });
      }

      const totalPages = Math.ceil(donateList.length / 10);
      for (let i = 0; i < totalPages; i++) {
        pages.push(donateList.slice(i * 10, i * 10 + 10));
      }

      return pages;
    },

    formData() {
      return {
        channel_id: this.channelId,
        roomId: this.channelRoomId || this.channelId,
        donate_type: this.donateType,
        good_id: this.goodId,
        amount: this.amount,
      };
    },
  },

  data() {
    return {
      donatePanelVisible: false,
      curPage: 1,
      showCustomCash: false, // 显示自定义金额输入框
      selectedCashIndex: null,
      payType: 'donate', // 支付类型：打赏
      donateType: null, // 打赏类型
      goodId: '', // 礼品id
      amount: '', // 打赏金额
      customCashMaxWidth: null, // 自定义金额输入框宽度
    };
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
    const $tabChat = document.querySelector('#tab-chat');
    $tabChat.querySelector('.polyv-chat-input').appendChild(this.$el);
    DonateMessageHub.on(
      DonateMessageHubEvents.PANEL_VISIBLE_TOGGLE,
      ({ visible }) => {
        this.donatePanelVisible = visible;
        toggleClass($tabChat, 'plv-has-donate-panel');

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
      console.info(evt.target);

      if (!$panel.contains(evt.target)) {
        DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      }
    },
    handleSlideChange() {
      this.curPage =
        (this.$refs.mySwiper.swiperInstance &&
          this.$refs.mySwiper.swiperInstance.activeIndex + 1) ||
        1;
    },
    handleCashBack() {
      this.donateCash = '';
      this.showCustomCash = false;
      this.selectedDonateType = '';
      this.selectedCashIndex = null;
    },
    handleClickCustom() {
      this.donateCash = '';
      this.showCustomCash = true;
    },
    /** 现金打赏 */
    async handleCashDonate() {
      this.donateType = 'cash';
      this.goodId = '';

      const cash = Number(this.donateCash);
      if (isMobile() && !isWeixin()) {
        this.$dialog.alert({ message: '请在微信中打开本页进行支付' });
        return;
      }
      if (cash === 0) {
        this.$dialog.alert({ message: '输入金额不能是0' });
        return;
      }
      if (cash < this.cashMin) {
        this.$dialog.alert({ message: `请输入大于等于${this.cashMin}的金额` });
        return;
      }

      this.amount = cash;

      // TODO 处理真实的打赏逻辑
    },
    async handleItemEvent(e, item) {
      this.selectedDonateType = item.type;
      this.selectedDonate = item;
      this.selectedCashIndex = null;

      // 如果是积分打赏，点击道具仅仅是选中道具
      if (item.type === 'good' && !this.donatePointEnabled) {
        this.handleGoodDonate(item);
        DonateMessageHub.trigger(DonateMessageHubEvents.PANEL_CLOSE);
      }
    },
    // 道具打赏
    async handleGoodDonate(item) {
      this.donateType = 'good';
      this.amount = '';
      this.goodId = item.goodId;

      // TODO 处理真实的打赏逻辑
    },
    handleSelectCash(index) {
      this.selectedCashIndex = index;
      this.selectedCash = this.cashes[index];
      this.donateCash = this.selectedCash;
      this.handleCashDonate();
    },
  },
};
</script>

<style lang="scss">
.plv-has-donate-panel {
  padding-bottom: 350px;
  .polyv-chat-input {
    bottom: 300px;
  }
}
</style>
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

.c-donate {
  position: relative;
  background-color: #2b2c35;
  z-index: 100;
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
.c-donate__good-item {
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
  .c-donate__good {
    &-img {
      margin: 6px auto;
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
.c-donate__good-img__cash {
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
.c-donate__good-num-wrap {
  .c-donate__good-num {
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
    font-size: 28px;
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
  margin: 20px 0;
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
  background: #1A1B1F;
  flex: 1;
}
.c-donate__cash__custom__label {
  color: #ADADC0;
  padding: 0 16px;
}
.c-donate__cash__custom__rand-btn {
  color: #3082FE;
  padding: 0 16px;
}

@media screen and (max-width: 320px) {
  .c-donate__good-num-wrap {
    .c-donate__good-num {
      width: 32px;
    }
  }
}
</style>
