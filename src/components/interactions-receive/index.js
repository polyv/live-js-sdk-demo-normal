import Vue from 'vue';
import store from '@/store';
import InteractionsReceiveEntrance from './Entrance.vue';

export default InteractionsReceiveEntrance;

/** 获取互动 UI 组件入口的 DOM 节点和实例 */
export const getIREntrance = (properties) => {
  const props = properties || {};

  const VueInstance = new Vue({
    store,
    render(h) {
      return h(InteractionsReceiveEntrance, {
        props: props
      });
    }
  });

  VueInstance.$mount();
  return {
    $el: VueInstance.$el,
    instance: VueInstance.$children[0]
  };
};
