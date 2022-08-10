import Vue from 'vue';
import Like from './index.vue';

export default function getLikeComponent(properties) {
  const props = properties || {};

  const VueInstance = new Vue({
    data: props,
    render(h) {
      // VNode
      return h(Like, {
        props: props
      });
    }
  });

  VueInstance.$mount();
  return {
    el: VueInstance.$el,
    instance: VueInstance.$children[0]
  };
}
