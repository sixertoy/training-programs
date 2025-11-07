import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.json'],
    plugins: {
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Forcer les ternaires sur plusieurs lignes (après prettier-config)
      // 'multiline-ternary': ['error', 'always'],
      'multiline-ternary': 'off',
    },
  },
]
