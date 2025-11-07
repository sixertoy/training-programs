import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/*.json'],
    plugins: {
      '@eslint-community/eslint-comments': eslintComments,
    },
    rules: {
      ...eslintComments.configs.recommended.rules,
    },
  },
]
