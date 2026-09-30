import { nodeConfig as napprNodeConfig } from '@nappr/eslint-config/node';

import { baseIgnores, baseJsonDisable, baseSharedRules } from './base.js';

export const nodeConfig = [
  baseIgnores,
  baseJsonDisable,
  ...napprNodeConfig,
  baseSharedRules,
];
