/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {

  publicPath: process.env.VUE_APP_BUILD_MODE === 'STATIC' ? './' : '/live',

  productionSourceMap: false,

  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Live SDK Demo',
    }
  },

  configureWebpack: {
    /** 运行在 IE 上需要更改 devtool 的默认值，不然异步组件无法正常使用 */
    devtool: process.env.VUE_APP_BROWSER === 'IE' ? 'source-map' : 'eval-cheap-module-source-map'
  }
};
