import tseslint from 'typescript-eslint';

export const baseIgnores = {
  ignores: [
    'dist/**',
    'node_modules/**',
    'build/**',
    'public/**',
    'coverage/**',
    '**/*.json',
    '**/*.module.d.scss.ts',
    '**/*.module.scss.d.ts',
    '**/.prettierrc.js',
    '**/eslint.config.js',
  ],
};

export const baseJsonDisable = {
  files: ['**/*.json'],
  ...tseslint.configs.disableTypeChecked,
};

export const baseSharedRules = {
  name: '@training-programs/eslint-config/shared',
  rules: {
    '@typescript-eslint/unified-signatures': 'off',
  },
};

export const baseConfig = [baseIgnores, baseJsonDisable, baseSharedRules];
