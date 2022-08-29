import Vue from 'vue';
import store from '@/store';
import InteractionsReceiveEntrance from './Entrance.vue';

/** @class 组件服务-公共-主要交互入口 */
export default class IREntranceService {
  /** @type {Vue | null} */
  vueInstance = null;

  /** 获取互动 UI 组件入口的 DOM 节点和实例 */
  getIREntrance(properties) {
    const props = properties || {};

    const VueInstance = new Vue({
      store,
      render(h) {
        return h(InteractionsReceiveEntrance, {
          props: props
        });
      }
    });

    this.vueInstance = VueInstance;
    VueInstance.$mount();

    return {
      $el: VueInstance.$el,
      instance: VueInstance.$children[0]
    };
  }

  /** 销毁组件实例 */
  destroy() {
    this.vueInstance && this.vueInstance.$destroy();
    this.vueInstance = null;
  }
}
