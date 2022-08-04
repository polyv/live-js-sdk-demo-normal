module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    './node_modules/@polyv/eslint-config/lib/for-vue'
  ],
  rules: {
    'vue/multi-word-component-names': 0
  }
};
