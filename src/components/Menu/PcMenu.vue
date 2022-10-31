<template>
  <div class="plv-pc-menu">
    <div class="plv-pc-menu__container">
      <ul class="plv-pc-menu__tab">
        <li v-for="menu in menus"
            :key="menu.menuId"
            :class="{
              'active':isActiveTab(menu)
            }"
            @click="handleTabClick(menu)">
          {{ menu.name }}
        </li>
      </ul>
      <div class="plv-pc-menu__content">
        <div v-for="menu in menus"
             :key="menu.menuId"
             :class="{'active': isActiveTab(menu)}"
             v-html="menu.content">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { plvLiveMessageHub, PlvLiveMessageHubEvents } from '@/sdk/live';

export default {
  name: 'PC-Menu',
  data() {
    return {
      activeMenuId: '',
      menus: [],
    };
  },
  mounted() {
    // 播放器初始化
    plvLiveMessageHub.on(PlvLiveMessageHubEvents.PLAYER_INIT, ({ data }) => {
      const menus = data.channelMenus;
      // pc端只渲染直播介绍与自定义图文菜单
      this.menus = menus.filter(
        (menu) => menu.menuType === 'desc' || menu.menuType === 'text'
      );
      if (this.menus.length > 0) {
        this.activeMenuId = this.menus[0].menuId;
      }
    });
  },
  methods: {
    isActiveTab(menu) {
      return menu.menuId === this.activeMenuId;
    },
    handleTabClick(menu) {
      this.activeMenuId = menu.menuId;
    },
  },
};
</script>

<style lang="scss">
/* PC 菜单栏 */
.plv-pc-menu {
  background: #fff;
  margin: auto;
}

.plv-pc-menu__tab {
  border-bottom: 1px solid #ededef;
}

.plv-pc-menu__tab>li {
  padding: 0 15px;
  display: inline-block;
  height: 80px;
  line-height: 80px;
  font-size: 18px;
  color: #aaa;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.plv-pc-menu__tab>li.active {
  color: #333;
  border-bottom: 2px solid #2196f3;
}

.plv-pc-menu__content {
  padding: 40px 0;
  min-height: 200px;
}

.plv-pc-menu__content>div {
  display: none;
}

.plv-pc-menu__content>div.active {
  display: block;
}
</style>
