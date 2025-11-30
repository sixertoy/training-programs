import { reactConfig } from '@nappr/eslint-config';
import tseslint from 'typescript-eslint';

export default [
  // Ignorer les fichiers publics et autres dossiers de build en premier
  {
    ignores: ['dist/**', 'node_modules/**', 'build/**', 'public/**', '**/*.json'],
  },
  // Exclure les fichiers JSON restants des règles TypeScript
  {
    files: ['**/*.json'],
    ...tseslint.configs.disableTypeChecked,
  },
  ...reactConfig,
  {
    rules: {
      "@typescript-eslint/unified-signatures": "off",
    }
  },
];
