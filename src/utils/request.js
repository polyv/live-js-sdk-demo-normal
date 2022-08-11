/**
 * @file Ajax 处理
 */

import Axios from 'axios';

function _getProtocol() {
  return window.location.protocol === 'http:' ? 'http:' : 'https:';
}

const axios = Axios.create({
  baseURL: `${_getProtocol()}//api.polyv.net/live/v3`,
  timeout: 2 * 60 * 1000
});

axios.interceptors.response.use((response) => {
  return response.data;
}, err => {
  console.error(err);
});

export default axios;
