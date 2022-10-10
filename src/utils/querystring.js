/**
 * 本模块提供 URL 查询字符串的操作方法。
 * @module querystring
 */

import { hasOwnProp } from './lang';

/**
 * 把查询字符串反序列化为键值对集合。
 * @author luoliquan
 * @param {string} str 查询字符串。
 * @return {Object} 键值对集合。
 * @example
 * parse('a=1&%E9%94%AE=%E5%80%BC'); // { a: 1, '键': '值' }
 * parse('a=1&a=2&b=3'); // { a: [1, 2], b: 3 }
 */
export function parse(str) {
  if (typeof str !== 'string') {
    throw new Error('The str argument must be a string type');
  }

  const result = {};

  str.split('&').forEach(function(pair) {
    if (!pair) { return; }
    pair = pair.split('=');
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');

    if (hasOwnProp(result, key)) {
      // 出现重复 key 值时解析为数组
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });

  return result;
}

/**
 * 把键值对集合序列化为查询字符串。
 * @author luoliquan
 * @param {Object} data 键值对集合。
 * @param {Object} [options] 参数。
 *   @param {Boolean} [options.ignoreEmpty=false] 是否忽略空值（包括null、undefined、空字符串）。
 * @return {string} 序列化结果。
 * @example
 * stringify({ a: 1, '键': '值' }); // 'a=1&%E9%94%AE=%E5%80%BC'
 * stringify({ a: [1, 2], b: 3 }); // 'a=1&a=2&b=3'
 */
export function stringify(data, options) {
  options = options || {};

  const result = [];
  function addToResult(key, value) {
    if (value == null) { value = ''; }
    // 忽略空值的情况
    if (value === '' && options.ignoreEmpty) { return; }

    result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  }

  let key, value;

  // 避免在循环中生成匿名函数，提到循环外
  function loopItem(item) { addToResult(key, item); }

  for (key in data) {
    if (hasOwnProp(data, key)) {
      value = data[key];
      if (Array.isArray(value)) {
        value.forEach(loopItem);
      } else {
        addToResult(key, value);
      }
    }
  }

  return result.join('&');
}

/**
 * 把键值对集合序列化为查询字符串后拼接到指定URL。
 * @author luoliquan
 * @param {string} url 指定URL。
 * @param {Object|string} data 键值对集合。
 * @param {Object} [options] 参数。
 *   @param {Boolean} [options.ignoreEmpty] 序列化时是否忽略空值（包括null、undefined、空字符串）。
 * @return {String} 处理后的URL。
 * @example
 * append('http://abc.com?a=1', { b: 2, c: 3 }); // 'http://abc.com?a=1&b=2&c=3'
 * append('http://abc.com', { a: 1, b: 2 }); // 'http://abc.com?a=1&b=2'
 */
export function append(url, data, options) {
  if (url == null) { return url; }
  url = String(url);

  // 如果url中包含hash，要先剪出来
  const temp = url.indexOf('#');
  let hash = '';
  if (temp !== -1) {
    hash = url.substring(temp, url.length);
    url = url.substring(0, temp);
  }

  // 移除位于末尾的?和&，方便拼接
  url = url.replace(/[?&]$/, '');

  if (typeof data !== 'string') {
    data = stringify(data, options);
  } else {
    // 移除位于开头的?和&，方便拼接
    data = data.replace(/^[?&]/, '');
  }

  return url + (
    data ? ((url.indexOf('?') !== -1 ? '&' : '?') + data) : ''
  ) + hash;
}
