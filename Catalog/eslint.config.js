import antfu from '@antfu/eslint-config';

export default antfu(
  {
    type: 'app',
    formatters: { css: true, html: true, markdown: 'prettier' },
    ignores: ['dist/**'],
    stylistic: { indent: 2, quotes: 'single', semi: true },
    typescript: true,
    vue: true,
  },
  {
    rules: {
      'style/max-statements-per-line': 'off',
      'ts/explicit-function-return-type': 'off',
    },
  },
);
