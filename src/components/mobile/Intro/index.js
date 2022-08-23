import Vue from 'vue';
import MobileIntro from './Component.vue';

export default class MobileIntroService {
  vueInstance = null;

  /** 获取移动端-直播介绍页组件的 DOM 和实例 */
  static getMobileIntroComponent(properties) {
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

  static destroy() {
    this.vueInstance.$destroy();
  }
}
