/**
 * @file Ajax 处理
 */

const $ = window.jQuery;

/**
 * 封装了一下ajax, 加上一些特殊情况的处理
 * @param {Object} options ajax请求的参数
 */
export default function request(options) {
  const config = options;
  typeof config.error === 'function' || (config.error = error); // 默认给接口设置一个error的回调处理  @resolved 缺少出错时的回调以及对应处理

  function error(xhr) {
    const errorText = xhr.responseText;
    alert(errorText);
  }

  $.ajax(config);
}
