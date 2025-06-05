import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
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
    },
    rules: {
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],
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
]);
