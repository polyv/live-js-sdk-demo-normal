import Vue from 'vue';
import MobileIntro from './Component.vue';

/** 获取移动端-直播介绍页组件的 DOM 和实例 */
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
