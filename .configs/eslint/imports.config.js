import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.config.{js,ts}', '**/eslint.config.js'],
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Interdire les exports par défaut (sauf fichiers de config)
      'import/no-default-export': 'error',
      // Préférer les imports nommés
      'import/prefer-default-export': 'off',
      // Trier les imports automatiquement
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Règles strictes supplémentaires pour les imports
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',
      'import/no-cycle': [
        'error',
        {
          allowUnsafeDynamicCyclicDependency: false,
          disableScc: false,
          ignoreExternal: false,
          maxDepth: '∞',
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-import-module-exports': [
        'error',
        {
          exceptions: [],
        },
      ],
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-named-default': 'error',
      'import/no-relative-packages': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': [
        'error',
        {
          commonjs: true,
        },
      ],
      'import/no-webpack-loader-syntax': 'error',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: true,
      },
    },
  },
]
