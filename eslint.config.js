import { reactConfig } from '@nappr/eslint-config';

export default [
  ...reactConfig,
  {
    ignores: ['dist/**', 'node_modules/**', 'build/**', 'public/**'],
    rules: {
      "@typescript-eslint/unified-signatures": "off",
    }
  },
];
