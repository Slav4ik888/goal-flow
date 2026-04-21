import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      semi: 0,
      indent: 0,
      'comma-dangle': 0,
      'key-spacing': 0,
      'react/jsx-filename-extension': [2, {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }],
      'switch-colon-spacing': 0,
      'no-else-return': 0,
      'space-unary-ops': 0,
      'consistent-return': 0,
      'no-unused-vars': 0,
      'no-unused-expressions': 0,
      'function-paren-newline': 0,
      'brace-style': 0,
      'import/no-extraneous-dependencies': 0,
      'import/no-unresolved': 0,
      'import/extensions': 0,
      'import/prefer-default-export': 0,
      'import/order': 0,
      'no-undef': 0,
      'no-multi-spaces': 0,
      'no-underscore-dangle': 0,
      'one-var': 0,
      'no-plusplus': 0,
      'no-whitespace-before-property': 0,
      'no-irregular-whitespace': 0,
      'object-curly-newline': 0,
      'no-shadow': 0,
      'no-multiple-empty-lines': ['error', {
        max: 3,
        maxEOF: 1,
        maxBOF: 1
      }],
      'no-unneeded-ternary': 0,
      'arrow-parens': 0,
      'no-confusing-arrow': 0,
      'max-len': ['error', {
        code: 120,
        ignoreComments: true
      }],
      'no-restricted-globals': 0,
      'no-param-reassign': 0,
      'lines-between-class-members': 0,
      'nonblock-statement-body-position': 0,
      'no-nested-ternary': 0,
      'quote-props': 0,
      curly: 0,
      'implicit-arrow-linebreak': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/semi': 0,
      '@typescript-eslint/type-annotation-spacing': 0,
      '@typescript-eslint/brace-style': 0,
      '@typescript-eslint/func-call-spacing': 0,
      '@typescript-eslint/strict-boolean-expressions': 0,
      '@typescript-eslint/no-misused-promises': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          'allowShortCircuit': true,  // Разрешает a && b()
          'allowTernary': true // Разрешает a ? b() : c()
        }
      ],
      'react/jsx-indent': 0,
      'react/display-name': 0,
      'react/jsx-props-no-multi-spaces': 0,
      'react/jsx-no-useless-fragment': 0,
      'react/react-in-jsx-scope': 0,
      'react/function-component-definition': 0,
      'react/jsx-equals-spacing': 0,
      'react/jsx-wrap-multilines': 0,
      'react/no-array-index-key': 0,
      'react/jsx-props-no-spreading': 0,
      'react/no-unused-prop-types': 0,
      'react/jsx-one-expression-per-line': 0,
      'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
      'react-hooks/exhaustive-deps': 'error', // Checks effect dependencies
      'react/no-children-prop': 0,
      'react/require-default-props': 0,
      'react/jsx-closing-tag-location': 0,
      'react/jsx-closing-bracket-location': 0,
      // 'react/jsx-curly-spacing': 0,
      'react/prop-types': 0,
      'jsx-quotes': ['error', 'prefer-single'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/material',
              message: 'Запрещён импорт из корня. Используйте прямой импорт, например:'
                + ' "import Box from \'@mui/material/Box\'"',
            },
            {
              name: '@mui/icons-material',
              message: 'Используйте прямой импорт из конкретного модуля, например:'
                + ' "import Menu from \'@mui/icons-material/Menu\'"',
            },
          ],
        },
      ],
      'slavchik888-plugin/path-checker': 'error',
    },
    globals: {
      __IS_DEV__: true,
      __API_URL__: true,
      __PROJECT__: true
    }
  },
])
