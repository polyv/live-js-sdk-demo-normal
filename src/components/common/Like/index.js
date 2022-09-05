import Vue from 'vue';
import Like from './Component.vue';

/** @class 组件服务-公共-点赞按钮 */
export default class LikeService {
  /** @type {Vue | null} */
  vueInstance = null;

  /** 获取点赞组件的 DOM 和实例 */
  getLikeComponent(properties) {
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

  /** 销毁组件实例 */
  destroy() {
    this.vueInstance && this.vueInstance.$destroy();
    this.vueInstance = null;
  }
}
