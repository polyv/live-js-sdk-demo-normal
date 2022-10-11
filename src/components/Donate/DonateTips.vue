<template>
  <div class="c-donate-tips">
    <div v-for="(reward, index) in showingReward"
         class="c-donate-tips__item--wrap"
         :key="index">
      <transition name="ani-donate-tips"
                  @after-enter="afterEnter">
        <div v-if="reward"
             class="c-donate-tips__item">
          <p class="c-donate-tips__nick">{{ translateNick(reward.content.unick, lang) }}</p>
          <p class="c-donate-tips__gift">
            赠送 {{ reward.content.gimg ? '' : '￥' }} {{ reward.content.rewardContent || reward.content.rewardContent }}
          </p>
          <div class="c-donate-tips__img"
               :class="{
              'c-donate-tips__img--cash': !reward.content.gimg,
            }"
               :style="{ backgroundImage: `url(${reward.content.gimg})` }"></div>
          <p v-if="reward.content.giftNum && reward.content.giftNum > 1"
             class="c-donate-tips__num"
             :class="{
              'c-donate-tips__num--long': reward.content.giftNum && reward.content.giftNum > 99
            }">
            <span>&times;</span> <span>{{ reward.content.giftNum }}</span>
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { loadImg } from '@/utils';
import { mapState } from 'vuex';

const donateBg = require('./imgs/donate-float-tips-bg.png');

/**
 * 打赏动效组件
 */
export default {
  props: {
    isMobile: Boolean,
    // 付费打赏道具列表
    notFreegifts: {
      type: Array,
    },
  },

  data() {
    return {
      rewardQueue: [], // 收到的打赏事件数据暂存队列
      showingReward: [undefined, undefined, undefined], // 正在展示的打赏数据
      queueTimer: null,
    };
  },

  created() {
    // 预加载打赏动效背景图
    loadImg({
      imgs: donateBg,
    });
  },

  mounted() {
    // messageHub.on('REWARD', this.handleReward);

    this.queueTimer = setInterval(() => {
      this.handleRewardQueue();
    }, 2000);
  },

  beforeDestroy() {
    // messageHub.off('REWARD', this.handleReward);
    clearInterval(this.queueTimer);
    this.queueTimer = null;
  },

  computed: {
    ...mapState({
      lang: (state) => state.lang.lang,
      viewerInfo: (state) => state.viewer.viewerInfo,
      isGoOnRedpackRain: (state) => state.redEnvelope.isGoOnRedpackRain,
    }),
  },

  methods: {
    handleReward(evt) {
      const data = evt.data;
      const isSelfgift =
        data.content.rewardUser.userId === this.viewerInfo.viewerId;
      const isFreegift =
        this.notFreegifts.findIndex(
          (gift) => gift.name === data.content?.rewardContent
        ) === -1;
      // 自己的打赏、收费道具必须显示。当前待显示打赏数量太多时（达到 100 个），免费道具丢弃。
      if (isSelfgift || !isFreegift || this.rewardQueue?.length < 100) {
        this.rewardQueue.push(data);
      }
    },

    handleRewardQueue() {
      if (
        !this.rewardQueue ||
        !this.rewardQueue.length ||
        this.isGoOnRedpackRain
      ) {
        return;
      }

      for (let i = 0; i < 3; i++) {
        if (typeof this.showingReward[i] === 'undefined') {
          const rewardData = this.rewardQueue.shift();
          this.showingReward.splice(i, 1, rewardData);
        }
      }
    },

    afterEnter(e) {
      e.classList.add('ani-donate-tips__num');
      const disappearTimer = setTimeout(() => {
        const index = Array.prototype.indexOf.call(
          e.parentNode.parentNode.childNodes,
          e.parentNode
        );
        this.showingReward.splice(index, 1, undefined);
        clearTimeout(disappearTimer);
      }, 2000);
    },
  },
};
</script>

<style lang="scss">
.c-donate-tips {
  padding-top: 16px;
  overflow-x: hidden;
  pointer-events: none;
}

.c-donate-tips__item--wrap {
  position: relative;
  min-height: 40px;
  margin-bottom: 32px;
}
.c-donate-tips__item {
  width: 270px;
  height: 40px;
  padding: 6px 13px 4px;
  background-image: url(./imgs/donate-float-tips-bg.png);
  background-size: 100%;
  background-position: center;
  box-sizing: border-box;
}

.c-donate-tips__nick {
  font-size: 14px;
  color: #FCF2A6;
  width: 124px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-donate-tips__gift {
  font-size: 12px;
  color: #fff;
  margin-top: 4px;
}

.c-donate-tips__img {
  position: absolute;
  left: 150px;
  top: -16px;
  width: 56px;
  height: 56px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  &--cash {
    background-image: url(./imgs/donate-float-tips-redpaper.png);
  }
}

.c-donate-tips__num {
  position: absolute;
  left: 210px;
  top: 8px;
  font-style: italic;
  font-weight: 800;
  color: #F57C00;
  text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
  >span {
    margin-right: 2px;
    &:first-child {
      font-size: 20px;
    }
    &:last-child {
      font-size: 28px;
    }
  }

  &--long {
    >span {
      &:last-child {
        font-size: 22px;
      }
    }
  }
}

.ani-donate-tips-enter-active {
  transform: translateX(-270px);
  animation: rewardStart 0.15s linear forwards;
}
.ani-donate-tips-leave-active {
  transform: translateY(0);
  animation: rewardEnd 0.1s linear;
}
.ani-donate-tips__num {
  .c-donate-tips__num {
    animation: rewardNumber 0.3s linear;
  }
}

@keyframes rewardStart {
  from {
    transform: translateX(-270px);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes rewardEnd {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-40px);
    opacity: 0;
  }
}
@keyframes rewardNumber {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
