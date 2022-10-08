/**
 * @file 工具函数
 */

import SparkMD5 from 'spark-md5';

/**
 * 参数排序，按字典顺序排序
 * @see {@link https://dev.polyv.net/2018/liveproduct/l-api/notice/sign/ sign生成规则}
 * @param {Object} params 待排序的参数
 *
 */
function _sortParams(params) {
  const keys = Object.keys(params).sort();
  let paramsString = '';
  for (let i = 0; i < keys.length; i++) {
    paramsString += keys[i] + params[keys[i]];
  }
  return paramsString;
}

/**
 * 生成直播API的sign
 * 重要！！!不建议在前端生成sign。该demo仅供参考。
 * @param {String} appSecret 直播账号的appSecret
 * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
 */
export function getSign(appSecret, params) {
  const paramString = _sortParams(params);
  const signString = appSecret + paramString + appSecret;
  return SparkMD5.hash(signString).toUpperCase();
}

/**
 * 检查当前UA是否为移动端
 */
export function isMobile() {
  const ua = navigator.userAgent;
  return /mobile|android/i.test(ua) || !/\b(Windows\sNT|Macintosh|Linux)\b/.test(ua);
}

/**
 * 防抖函数
 */
export function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Y 或者 N 转换为布尔值。
 * @author tanyuqin
 * @param {string} value Y 或者 N。
 * @return {boolean} 布尔值。
 */
export function ynToBool(value) {
  value = String(value).toUpperCase();
  if (value !== 'Y' && value !== 'N') {
    throw new Error('The value argument must be "Y" or "N"');
  }
  return value === 'Y';
}
