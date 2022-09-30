import Vue from 'vue';
import store from '@/store';
import ProdcutEntrance from './Entrance.vue';

/** @class 组件服务-商品库 */
export default class ProdcutEntranceService {
  /** @type {Vue | null} */
  vueInstance = null;

  /** 获取商品库入口组件的 DOM 和实例 */
  getProdcutEntranceComponent(properties) {
    const props = properties || {};

    const VueInstance = new Vue({
      store,
      render(h) {
        return h(ProdcutEntrance, {
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
