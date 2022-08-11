import Vue from 'vue';
import MobileIntro from './Component.vue';

export default function getMobileIntroComponent(properties) {
  const props = properties || {};

  const VueInstance = new Vue({
    render(h) {
      return h(MobileIntro, {
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
