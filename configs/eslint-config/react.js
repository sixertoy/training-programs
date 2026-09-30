import { reactConfig as napprReactConfig } from '@nappr/eslint-config/react';

import { baseIgnores, baseJsonDisable, baseSharedRules } from './base.js';

export const reactConfig = [
  baseIgnores,
  baseJsonDisable,
  ...napprReactConfig,
  baseSharedRules,
];
