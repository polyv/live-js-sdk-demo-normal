import { Dialog, Toast } from 'vant';

// 借助 babel-plugin-import 自动导入到 vue 中
Toast.setDefaultOptions({
  duration: 3 * 1000
});
Dialog.setDefaultOptions({
  theme: 'round-button',
  confirmButtonColor: 'rgb(71, 146, 244)',
});
