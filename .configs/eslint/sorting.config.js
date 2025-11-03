import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import sortKeysFix from 'eslint-plugin-sort-keys-fix'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
    },
    rules: {
      // Trier les clés dans les objets
      'sort-keys-fix/sort-keys-fix': 'error',
      // Trier les clés dans les destructuring
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        {
          caseSensitive: false,
          natural: true,
        },
      ],
    },
  },
]
