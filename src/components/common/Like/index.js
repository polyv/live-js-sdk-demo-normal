import Vue from 'vue';
import Like from './Component.vue';

export default class LikeService {
  vueInstance = null;

  /** 获取点赞组件的 DOM 和实例 */
  static getLikeComponent(properties) {
    const props = properties || {};

    const VueInstance = new Vue({
      render(h) {
        return h(Like, {
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
