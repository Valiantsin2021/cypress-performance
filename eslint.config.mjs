import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginChaiFriendly from 'eslint-plugin-chai-friendly'
import pluginCypress from 'eslint-plugin-cypress/flat'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import globals from 'globals'

export default [
  js.configs.recommended,
  pluginCypress.configs.recommended,
  pluginChaiFriendly.configs.recommendedFlat,
  {
    plugins: { prettier, noOnlyTests },
    ignores: ['**/node_modules/*', 'jenkins_home/**/*', 'jenkins_backup/**/*'],
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser
      },
      parserOptions: {
        sourceType: 'module',
        project: ['tsconfig.json']
      }
    },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'warn',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-force': 'warn',
      'cypress/no-async-tests': 'error',
      'cypress/unsafe-to-chain-command': 'warn',
      'cypress/no-pause': 'error',
      'noOnlyTests/no-only-tests': ['error', { fix: true }],
      'no-console': 'warn',
      'no-useless-escape': 'off',
      'no-empty-pattern': 'off',
      complexity: ['error', { max: 7 }],
      'max-depth': ['error', { max: 5 }],
      'max-nested-callbacks': ['warn', { max: 3 }],
      'max-params': ['error', { max: 4 }],
      'max-statements': ['error', { max: 50 }, { ignoreTopLevelFunctions: true }],
      'max-lines': ['error', { max: 200, skipComments: true, skipBlankLines: true }],
      'max-len': ['warn', { code: 120, ignoreComments: true, ignoreUrls: true }],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
      'no-eval': 'error',
      'no-multi-spaces': 'error',
      'no-new': 'warn',
      'no-return-assign': 'warn',
      'comma-dangle': ['error', 'never'],
      strict: ['error', 'global'],
      'func-style': ['warn', 'expression'],
      'no-new-func': 'error',
      'no-param-reassign': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-invalid-this': 'warn',
      'prefer-destructuring': ['warn', { array: true, object: true }, { enforceForRenamedProperties: true }],
      'no-implied-eval': 'error',
      eqeqeq: 'error',
      'no-with': 'error',
      'func-call-spacing': ['error', 'never'],
      'new-cap': ['error', { newIsCap: true }],
      'new-parens': 'error',
      quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-var': 'error',
      'no-unused-vars': ['warn', { vars: 'local' }],
      'import/extensions': 'off',
      'no-prototype-builtins': 'off'
    }
  }
]
