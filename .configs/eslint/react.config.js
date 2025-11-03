import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/display-name': ['error', { ignoreTranspilerName: false }],
      // Règles strictes supplémentaires (non dans recommended)
      'react/destructuring-assignment': ['error', 'always'],
      'react/forbid-prop-types': [
        'error',
        {
          checkChildContextTypes: true,
          checkContextTypes: true,
          forbid: ['any', 'array', 'object'],
        },
      ],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': [
        'error',
        {
          children: 'never',
          props: 'never',
        },
      ],
      'react/jsx-fragments': ['error', 'element'],
      'react/jsx-no-bind': [
        'error',
        {
          allowArrowFunctions: true,
          allowBind: false,
          allowFunctions: false,
          ignoreDOMComponents: true,
          ignoreRefs: true,
        },
      ],
      'react/jsx-no-useless-fragment': ['error'],
      'react/jsx-props-no-spreading': [
        'warn',
        {
          custom: 'enforce',
          exceptions: ['input', 'textarea'],
          explicitSpread: 'ignore',
          html: 'enforce',
        },
      ],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          ignoreCase: true,
          locale: 'auto',
          multiline: 'ignore',
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
        },
      ],
      'react/no-array-index-key': ['error'],
      'react/no-unstable-nested-components': ['error'],
      'react/prefer-exact-props': ['error'],
      'react/self-closing-comp': ['error'],
    },
  },
]
