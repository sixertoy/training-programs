import json from '@eslint/json';

export default [
  json.configs.recommended,
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json', 'yarn.lock'],
    // Désactivation des règles problématiques avec ESLint 9.39.0
    rules: {
      'json/sort-keys': 'off',
      'json/top-level-interop': 'off',
    },
  },
];
