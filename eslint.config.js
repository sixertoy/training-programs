import base from './.configs/eslint/base.config.js'
import typescript from './.configs/eslint/typescript.config.js'
import react from './.configs/eslint/react.config.js'
import jsxA11y from './.configs/eslint/jsx-a11y.config.js'
import imports from './.configs/eslint/imports.config.js'
import formatting from './.configs/eslint/formatting.config.js'
import sorting from './.configs/eslint/sorting.config.js'
import json from './.configs/eslint/json.config.js'
import comments from './.configs/eslint/comments.config.js'
import standard from './.configs/eslint/standard.config.js'

export default [
  ...base,
  ...typescript,
  ...react,
  ...jsxA11y,
  ...imports,
  ...formatting,
  ...sorting,
  ...json,
  ...comments,
  ...standard,
]
