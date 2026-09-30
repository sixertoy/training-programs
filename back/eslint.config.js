import { nodeConfig } from '@training-programs/eslint-config/node';

export default [
  ...nodeConfig,
  {
    name: '@training-programs/back',
    rules: {},
  },
];
