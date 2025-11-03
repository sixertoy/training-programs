import json from '@eslint/json'

export default [
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json'],
    plugins: {
      json,
    },
    language: 'json/json',
    extends: ['json/recommended'],
    rules: {
      'json/sort-keys': 'error',
      'json/top-level-interop': 'error',
    },
  },
]
