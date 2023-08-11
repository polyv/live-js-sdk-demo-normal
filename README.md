# 直播 JS-SDK Vue-Demo

## 介绍

为了帮助客户更好地理解、接入 **[POLYV 直播 WEB-SDK](https://help.polyv.net/index.html#/live/js/)**，本项目提供了一个以 `Vue2.x` 框架实现的 Demo 以供参考。

## Demo 功能点

| 分类     | 功能                         | 支持情况 |
| -------- | ---------------------------- | -------- |
| 聊天室   | 欢迎语                       | ✔        |
|          | 点赞                         | ✔        |
|          | 送花                         | ✔        |
|          | 聊天信息                     | ✔        |
|          | 只看主持人                   | ✔        |
|          | 设置昵称                     | ✔        |
|          | 连接超时提醒                 | ✔        |
|          | 在线列表                     | ✔        |
|          | 提问                         | ✔        |
|          | 打赏                         | ✔        |
| 播放器   | 音量设置                     | ✔        |
|          | 暂停/恢复播放                | ✔        |
|          | seek                         | ✔        |
|          | 切换倍速                     | ✔        |
|          | 关闭或显示讲师摄像头         | ✔        |
|          | 切换当前线路                 | ✔        |
|          | PPT 翻页                     | ✔        |
|          | 发送弹幕                     | ✔        |
|          | 隐藏/恢复弹幕                | ✔        |
|          | 切换清晰度(需支持多码率)     | ✔        |
|          | 支持回放                     | ✔        |
|          | 无延迟播放                   | ✔        |
|          | 连麦                         | ✔        |
|          | 邀请上麦（注：联系售后开通） | ✔        |
| 互动功能 | 公告                         | ✔        |
|          | 签到                         | ✔        |
|          | 答题卡                       | ✔        |
|          | 问卷                         | ✔        |
|          | 抽奖                         | ✔        |
|          | 卡片推送                     | ✔        |
|          | 条件抽奖                     | ✔        |
|          | 互动红包                     | ✔        |
|          | 商品库                       | ✔        |
|          | 投诉反馈                     | ✔        |
| 其他     | 直播介绍                     | ✔        |
|          | 自定义图文菜单               | ✔        |
|          | 直播间状态显示               | ✔        |
|          | 纯回放模式                   | ✔        |

## Demo 运行

Demo 的源码位于项目的 src 目录下，需要使用 `npm` 来运行 Demo

```sh
npm ci  #安装依赖
npm run dev  #启动项目
```

如需在 IE 浏览器调试，**启动项目**时，请执行 `npm run dev:ie`

执行完成后，可以在浏览器打开 `http://localhost:8080/live/` 访问 Demo 页

另外，您需要结合 [获取密钥](https://help.polyv.net/index.html#/live/api/getSecretKey) 这篇文档来获取必要的信息

您还可以结合 POLYV 官方文档查阅 Demo 源码：

- [直播 JS-SDK](https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_sdk)
  - [无延迟接入](https://help.polyv.net/index.html#/live/js/live_js_sdk/live_low_latency)
  - [连麦接入](https://help.polyv.net/index.html#/live/js/live_js_sdk/live_video_chat)
- [聊天室 JS-SDK](https://help.polyv.net/index.html#/live/js/chat_js_sdk)
- [互动功能接收端 SDK](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/sdk/overview)
  - [答题卡 UI 组件文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/answer_card)
  - [签到 UI 组件文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/check_in)
  - [抽奖 UI 组件文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/lottery)
  - [公告 UI 组件文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/notice)
  - [问卷 UI 组件文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/questionnaire)
  - [卡片推送 UI 组件文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/push_card)
  - [条件抽奖 UI 文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/welfare_lottery)
  - [商品库 UI 文档](https://help.polyv.net/index.html#/live/js/new_sdk/interactions_receive_sdk/ui/default/product)
- [直播 API 签名规则](https://help.polyv.net/index.html#/live/api/buildSign)
- [直播服务端 API](https://help.polyv.net/index.html#/live/api/)
- 打赏
  - [打赏特效](https://help.polyv.net/index.html#/live/js/donate_animation)
  - [查询打赏设置](https://help.polyv.net/index.html#/live/api/v4/channel/donate/get)
  - [发送打赏设置](https://help.polyv.net/index.html#/live/api/live_interaction/send_reward_msg)

## Demo 工程说明

本工程基于 `node@16.9.1` 搭建，如果使用 `VsCode` 作为 IDE 进行开发，推荐使用以下配置作为工作区的 `settings.json`

```json
{
  "vetur.format.defaultFormatter.js": "prettier",
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "vetur.format.defaultFormatter.sass": "none",
  "vetur.format.defaultFormatter.scss": "none",
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "wrap_attributes": "force-aligned"
    },
    "prettier": {
      "singleQuote": true
    }
  },
  "prettier.enable": true,
  "eslint.format.enable": true,
  "[javascript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "stylelint.enable": true,
  "stylelint.validate": ["css", "sass", "scss", "postcss", "vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  }
}
```

- 主要目录文件说明
  - `src/sdk`: 对 Polyv SDK 进行二次封装，采用事件机制进行通信
  - `src/plugins`: 对一些第三方插件的封装和处理，比如 `Axios`, `Vant`
  - `src/utils`: 相关工具函数
  - `src/store`: vuex 存储，组件共享主要配置
  - `src/components/Watch`: 观看页主体 UI 组件
  - `src/components/Base`: 和业务无关的通用全局组件
  - `src/components/InteractionsReceive`: 互动 SDK UI 组件
- 使用到的第三方库：参考项目中的 package.json 的 dependencies。
- 使用低版本 `node` 注意事项【建议使用 `16.9.1` 版本】
  - 安装依赖时，会出现 `integrity checksum failed` 的错误，原因主要是 `sha` 加密算法不同，删掉 `packgae-lock.json` 再安装依赖即可
  - 由于依赖的 `eslint` 版本较高，执行 `npm run dev` 时可能会报错，可以执行 `npm run serve` 绕过校验来启动项目，如果需要运行在 IE 浏览器上，可以执行 `npm run serve:ie`
  - 请保证 node 版本 `>= 10.13.0`

## Demo 服务器部署

由于项目中使用了 `vue-router`，所以本 demo 中也支持了**两种**构建模式。前置知识可以看下这篇文档 [VueRouter-不同的历史模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

- 一种是执行 `npm run build` 命令，可以构建基于 `history` 模式的产物，需要服务器使用 `nginx` 之类的工具进行代理转发
- 一种是执行 `npm run build-static` 命令，可以构建基于 `hash` 模式的产物，不需要在服务器上进行特殊处理，直接将文件放到服务器上即可

## 浏览器兼容性

- 支持主流 PC 浏览器，包括 Chrome、Safari、Edge、Firefox、IE(>=10) 等 。
- 支持主流移动端浏览器或 WebView，包括 UC 浏览器、QQ 浏览器、微信浏览器、各厂商自带浏览器等。

## 补充说明

### 安全性说明（重要）

- 实际使用时，请 **不要** 将 appSecret 暴露在前端，本 demo 仅为演示。

### 关于自动播放

设置了 autoplay 参数后, 使用 PC Chrome 浏览器打开 demo 页可能会出现静音自动播放的情况, 这是浏览器的自动播放策略导致的。关于 Chrome 的自动播放策略请参考 [Autoplay Policy Changes(国内网络可能打不开)](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes)。

此外， 移动端不支持自动播放。

### 关于回放

播放器的配置参数[type](https://help.polyv.net/index.html#/live/js/live_js_sdk/live_js_sdk?id=%E5%AE%9E%E4%BE%8B%E5%B1%9E%E6%80%A7)会影响播放器的回放：

- 设置为 `auto` 时，根据频道的实际设置自动选择播放类型，也是 demo 页的设置。此时播放器会按以下优先级播放视频：
  1. 直播；
  2. 回放列表视频；
  3. 第一个暂存视频。
- 设置为 `live` 时，不播放回放。
- 设置为 `vod` 时，需要设置 vid 参数去指定某个回放。vid 的值可以通过 SDK 的实例方法 getPlaybackLists 获取。

### 其他示例仓库

- [直播 JS-SDK DEMO](https://github.com/polyv/live-js-sdk-demo-basic)
- [直播 JS-SDK 竖屏 DEMO](https://github.com/polyv/live-js-sdk-demo-portrait)
