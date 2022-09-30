/**
 * @file Ajax 封装
 */

import Axios from 'axios';

/** 获取 http 协议 */
function _getProtocol() {
  return window.location.protocol === 'http:' ? 'http:' : 'https:';
}

/** Axios 实例 */
const request = Axios.create({
  baseURL: `${_getProtocol()}//api.polyv.net/live/v3`,
  timeout: 2 * 60 * 1000
});

// 响应拦截
request.interceptors.response.use((response) => {
  return response.data;
}, err => {
  console.error(err);
});

export default request;
