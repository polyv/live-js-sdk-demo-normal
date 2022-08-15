import Vue from 'vue';
import store from '@/store';
import InteractionsReceiveEntrance from './Entrance.vue';

export default InteractionsReceiveEntrance;

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
