/**
 * @file 工具函数
 */

import request from './request';

const md5 = window.md5;

/**
 * 参数排序，按字典顺序排序，详细请看sign生成规则
 * https://dev.polyv.net/2018/liveproduct/l-api/notice/sign/
 * @param {Object} params 待排序的参数
 *
 */
export function sortParams(params) {
  const keys = Object.keys(params).sort();
  let paramsString = '';
  for (let i = 0; i < keys.length; i++) {
    paramsString += keys[i] + params[keys[i]];
  }
  return paramsString;
}

/**
 * 生成直播API的sign
 * 重要！！不建议在前端生成sign。该demo仅供参考。
 * @param {String} appSecret 直播账号的appSecret
 * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
 */
export function getSign(appSecret, params) {
  const paramString = sortParams(params);
  const signString = appSecret + paramString + appSecret;
  return md5(signString).toUpperCase();
}

/**
 * 检查当前UA是否为移动端
 */
export function isMobile() {
  const ua = navigator.userAgent;
  return /mobile|android/i.test(ua) || !/\b(Windows\sNT|Macintosh|Linux)\b/.test(ua);
}

/**
 * 获得当前的协议
 */
export function getProtocol() {
  return window.location.protocol === 'http:' ? 'http:' : 'https:';
}

/**
   * 获得频道基础信息
   * https://help.polyv.net/index.html#/live/api/channel/operate/get_channel_detail_setting
   * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
   * @param {Function} callback 接口请求成功后的回调
   */
export function getChannelInfo(params, callback) {
  const api = getProtocol() + '//api.polyv.net/live/v3/channel/basic/get';
  request({
    url: api,
    method: 'GET',
    data: params,
    success: function(res) {
      callback(res.data);
    }
  });
}

/**
 * 获取观众观看调用接口token, 部分SDK的接口会用到这个token
 * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
 * @param {Function} callback 接口请求成功后的回调
 */
export function getApiToken(params, callback) {
  const api = getProtocol() + '//api.polyv.net/live/v3/channel/watch/get-api-token';
  request({
    url: api,
    method: 'POST',
    data: params,
    success: function(res) {
      callback(res.data);
    }
  });
}

/**
 * 获得聊天室的校验token
 * https://help.polyv.net/index.html#/live/api/channel/operate/get_chat_token
 * @param {Object} params 参与sign生成的参数，详细请看sign生成规则
 * @param {Function} callback 接口请求成功后的回调
 */
export function getChatToken(params, callback) {
  const api = getProtocol() + '//api.polyv.net/live/v3/channel/common/get-chat-token';
  request({
    url: api,
    method: 'GET',
    data: params,
    success: function(res) {
      callback(res.data);
    }
  });
}

/**
 * 简单的对象深拷贝, 有些情况的深拷贝可能不支持
 * @param obj {Object} 对象
 */
export function deepCopy(obj) {
  let rs;
  try {
    rs = JSON.parse(JSON.stringify(obj));
  } catch (e) {
    rs = {};
    console.warn('JSON parse error');
  }
  return rs;
}

export function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
