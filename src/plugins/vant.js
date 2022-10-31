// 借助 babel-plugin-import 自动导入到 vue 中
import { Dialog, Toast } from 'vant';

Toast.setDefaultOptions({
  duration: 3 * 1000
});
Dialog.setDefaultOptions({
  theme: 'round-button',
  confirmButtonColor: 'rgb(71, 146, 244)',
});
