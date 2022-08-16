import Vue from 'vue';
import Like from './Component.vue';

/** 获取点赞组件的 DOM 和实例 */
export default function getLikeComponent(properties) {
  const props = properties || {};

  const VueInstance = new Vue({
    render(h) {
      return h(Like, {
        props: props
      });
    }
  });

  VueInstance.$mount();
  return {
    $el: VueInstance.$el,
    instance: VueInstance.$children[0]
  };
}
