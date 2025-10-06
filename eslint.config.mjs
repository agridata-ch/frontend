import angularEslintTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import securityPlugin from 'eslint-plugin-security';
import unicornPlugin from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default defineConfig([
  tseslint.configs.recommended,
  {
    ignores: [
      '**/commitlint.config.js',
      '**/temp.js',
      'config/*',
      'node_modules/*',
      'coverage/*',
      'dist/*',
      'src/entities/openapi/*',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      import: importPlugin,
      security: securityPlugin,
      unicorn: unicornPlugin,
    },
    rules: {
      'sort-imports': 'off',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'unknown'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  // Add security plugin rules
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      security: securityPlugin,
    },
    rules: {
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'warn',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-non-literal-regexp': 'warn',
    },
  },
  // Add unicorn plugin rules
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      'unicorn/no-new-buffer': 'error',
      'unicorn/numeric-separators-style': ['warn', { onlyIfContainsSeparator: true }],
      'unicorn/prefer-ternary': 'warn',
      'unicorn/prefer-logical-operator-over-ternary': 'warn',
      'unicorn/prefer-date-now': 'warn',
      'unicorn/prefer-switch': 'warn',
      'unicorn/prefer-at': 'warn',
      'unicorn/prefer-native-coercion-functions': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/prefer-modern-math-apis': 'warn',
      'unicorn/no-unreadable-array-destructuring': 'warn',
      'unicorn/no-empty-file': 'warn',
    },
  },
  // Relax rules for test files
  {
    files: ['**/*.spec.ts'],
    rules: {
      // Allow using 'any' type in tests for accessing protected members
      '@typescript-eslint/no-explicit-any': 'off',
      // Disable other rules that might be too restrictive for tests
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Add Angular template accessibility rules
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularEslintTemplate,
    },
    languageOptions: {
      parser: angularTemplateParser,
      parserOptions: {
        project: null, // Explicitly disable TypeScript checking for HTML files
      },
    },
    rules: {
      // Disable all TypeScript ESLint rules for HTML files
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Angular template accessibility rules
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
    },
  },
  // Add comment rules
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: ['**/*.spec.ts'],
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      'jsdoc/match-description': [
        'error',
        {
          matchDescription: 'CommentLastReviewed: \\d{4}-\\d{2}-\\d{2}',
          message: "Comment must contain 'CommentLastReviewed: YYYY-MM-DD'",
          contexts: ['ClassDeclaration'],
        },
      ],
    },
  },
]);
