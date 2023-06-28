module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    './node_modules/@polyv/eslint-config/lib/for-vue'
  ],
  rules: {
    'no-console': 0,
    'vue/html-indent': 0,
    'vue/multi-word-component-names': 0,
    'no-unused-vars': 0,
    'promise/prefer-await-to-then': 0,
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
    'multiline-ternary': 0,
    'vue/v-on-event-hyphenation': 0,
    'vue/attribute-hyphenation': 0
  }
};
