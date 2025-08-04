import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '**/*.d.ts', 'vite.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      // Allow unused variables (common in prototyping)
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow any type for rapid prototyping
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow console statements
      'no-console': 'warn',
      // Allow lexical declarations in case blocks
      'no-case-declarations': 'off',
    },
  },
)
