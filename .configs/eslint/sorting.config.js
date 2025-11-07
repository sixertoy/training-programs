import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import sortKeysFix from 'eslint-plugin-sort-keys-fix'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.json'],
    plugins: {
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
    },
    rules: {
      'sort-keys-fix/sort-keys-fix': 'error',
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        {
          caseSensitive: true,
        },
      ],
    },
  },
]
