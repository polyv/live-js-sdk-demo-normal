<template>
  <section class="c-tab-nav-wrapper">
    <ul class="c-tab-nav">
      <li v-for="tab in tabData"
          :key="tab.type"
          :class="{ 'tab-active': tab.type === activeTab }"
          @click="handleTabClick(tab)">
        <span>{{ tab.name }}</span>
      </li>
    </ul>
  </section>
</template>

<script>
/** @type {null|HTMLElement} */
let $originTabWrapper = null;

export default {
  name: 'Tab-Nav',
  model: {
    prop: 'activeTab',
    event: 'change',
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
  mounted() {
    $originTabWrapper = document.querySelector('.polyv-cr-head');
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
  },
  methods: {
    handleTabClick(tab) {
      this.$emit('change', tab.type);
    },
    handleOriginTabClick(tabType) {
      const $tabEl =
        $originTabWrapper &&
        $originTabWrapper.querySelector(`li[data-type='${tabType}']`);
      $tabEl && $tabEl.click();
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
  list-style: none;
}
.c-tab-nav > li {
  flex: 1;
  color: #adadc0;
  line-height: 35px;
  text-align: center;
  cursor: pointer;
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
