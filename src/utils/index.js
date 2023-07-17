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
 * 检查当前 UA 是否符合微信客户端特征。
 */
export function isWeixin() {
  const ua = navigator.userAgent;
  return /\bMicroMessenger\//.test(ua);
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
  if (typeof value !== 'string') value = 'N';
  value = String(value).toUpperCase();
  if (value !== 'Y' && value !== 'N') {
    throw new Error('The value argument must be "Y" or "N"');
  }
  return value === 'Y';
}

export const isFunction = (func) => func instanceof Function;
/**
 * 下载图片
 * @param {object} options 参数对象
 */
export function loadImg(options = {}) {
  const { onSuccess, onFail } = options;
  let imgs = options.imgs;
  if (typeof imgs === 'string') {
    imgs = [imgs];
  }
  if (Array.isArray(imgs)) {
    imgs.forEach((path, index) => {
      const image = new Image();
      const result = { image, index };
      image.src = path;
      image.onload = isFunction(onSuccess) ? onSuccess(result) : null;
      image.onerror = isFunction(onFail) ? onFail(result) : null;
    });
  }
}

/**
 * 格式化时间为 00:00:00
 */
export function formatTime(t) {
  t = Math.floor(t) || 0;
  const hs = 60 * 60;
  const h = Math.floor(t / hs);
  const m = Math.floor((t % hs) / 60);
  const s = t - (h * hs) - (m * 60);
  const addZero = a => (String(a).length === 1 ? `0${a}` : a);
  return `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
}
