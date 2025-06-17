import globals from 'globals';
import js from '@eslint/js';
import eslintParser from '@typescript-eslint/parser';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: eslintParser,
      ecmaVersion: 'latest',
    },
    plugins: { eslintPlugin },
    rules: {
      'arrow-parens': [2, 'always'],
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    files: ['web/**/*.js', 'web/**/*.ts'],
  },
];
