<template>
  <section class="c-tab-nav-wrapper">
    <ul class="c-tab-nav">
      <li v-for="tab in tabData"
          :key="tab.type"
          :class="{ 'tab-active': tab.type === activeTab }"
          @click="handleTabClick(tab)">
        <span>{{ tab.name }}</span>
        <span v-if="isUserListTab(tab)">
          (<span>{{userCount}}</span>)
        </span>
      </li>
    </ul>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import { TabNavType } from '@/const';
import PolyvChat from '@/sdk/chat';
/** @type {null|HTMLElement} */
let $originTabWrapper = null;

export default {
  name: 'Tab-Nav',
  model: {
    prop: 'activeTab',
    event: 'change',
  },
  data() {
    return {
      userCount: '',
      smoothUserCountTimer: null,
    };
  },
  props: {
    activeTab: {
      type: String,
      default: 'chat',
    },
    originTabTypes: {
      type: Array,
      default: () => [],
    },
    tabData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState({
      config: (state) => state.config,
    }),
  },
  watch: {
    activeTab: {
      handler() {
        this.$nextTick(() => {
          if (this.originTabTypes.includes(this.activeTab)) {
            this.handleOriginTabClick(this.activeTab);
          }
        });
      },
      immediate: true,
    },
    'config.chat.showUserList': {
      handler(val) {
        if (!val) {
          this.smoothUserCountTimer && clearInterval(this.smoothUserCountTimer);
          return;
        }

        setTimeout(() => {
          this.setUserCount();
        }, 500);
        this.smoothUserCountTimer = setInterval(() => {
          this.setUserCount();
        }, 3000);
      },
      immediate: true,
    },
  },
  mounted() {
    $originTabWrapper = document.querySelector('.polyv-cr-head');
  },
  beforeDestroy() {
    this.smoothUserCountTimer && clearInterval(this.smoothUserCountTimer);
  },
  methods: {
    isUserListTab(tab) {
      return tab.type === TabNavType.ONLINE;
    },
    setUserCount() {
      const $userCount = document.querySelector('.polyv-user-count');
      this.userCount = $userCount.innerHTML;
    },
    handleTabClick(tab) {
      this.$emit('change', tab.type);
    },
    handleOriginTabClick(tabType) {
      // const $tabEl =
      //   $originTabWrapper &&
      //   $originTabWrapper.querySelector(`li[data-type='${tabType}']`);
      // $tabEl && $tabEl.click();
      const index = this.tabData.findIndex((tab) => tab.type === tabType);
      if (index !== -1) {
        const plvChat = PolyvChat._instance;
        plvChat.chatroom.changeTab(index);
      }
    },
  },
};
</script>

<style lang="scss">
.c-tab-nav {
  box-sizing: border-box;
  display: flex;
  padding: 0 10px;
  font-size: 12px;
  white-space: nowrap;
  list-style: none;
  overflow: auto;
}
.c-tab-nav > li {
  color: #adadc0;
  line-height: 35px;
  text-align: center;
  cursor: pointer;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}
.c-tab-nav > li.tab-active {
  color: #2196f3;
  border-bottom: 3px solid #03a9f4;
}

.plv-skin--dark .c-tab-nav {
  background-color: #3e3e4e;
}
.plv-skin--dark .c-tab-nav > li {
  color: #adadc0;
}
.plv-skin--dark .c-tab-nav
> li.tab-active {
  color: #fff;
  border-bottom: 0;
}
.plv-skin--dark .c-tab-nav
> li.tab-active
> span:first-child {
  border-bottom: 3px solid #fff;
}
.plv-skin--dark .c-tab-nav
> li
> span:first-child {
  display: inline-block;
  line-height: 35px;
}
.plv-skin--dark .c-tab-nav > li > span {
  display: inline-block;
  line-height: 35px;
}
</style>
