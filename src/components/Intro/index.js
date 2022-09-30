import Vue from 'vue';
import MobileIntro from './MobileIntro.vue';

/** @class 组件服务-移动端-介绍页 */
export class MobileIntroService {
  /** @type {Vue | null} */
  vueInstance = null;

  /** 获取移动端-直播介绍页组件的 DOM 和实例 */
  getMobileIntroComponent(properties) {
    const props = properties || {};

    const VueInstance = new Vue({
      render(h) {
        return h(MobileIntro, {
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
