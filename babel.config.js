module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        modules: false,
        useBuiltIns: 'entry',
        corejs: 3
      }
    ]
  ],
  compact: false
};
