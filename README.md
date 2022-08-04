# 直播 JS-SDK Vue-Demo

## 关联仓库

- [live-js-sdk-demo-basic](https://github.com/polyv/live-js-sdk-demo-basic)

## 工程环境说明

本工程基于 `node@16.9.1` 搭建

如果使用 `VsCode` 作为 IDE 进行开发，推荐使用以下配置作为工作区的 `settings.json`

```json
{
  "vetur.format.defaultFormatter.js": "none",
  "vetur.format.defaultFormatter.html": "none",
  "vetur.format.defaultFormatter.sass": "none",
  "vetur.format.defaultFormatter.scss": "none",

  "eslint.format.enable": true,
  "[javascript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },

  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "stylelint.enable": true, // Enable stylelint
  "stylelint.validate": ["css", "sass", "scss", "postcss", "vue"],

  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  }
}
```
