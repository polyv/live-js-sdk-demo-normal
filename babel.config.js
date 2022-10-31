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
  plugins: [
    ['import', {
      libraryName: 'vant',
      libraryDirectory: 'es',
      style: true
    }]
  ],
  compact: false
};
