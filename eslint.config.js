import js from '@eslint/js';
import globals from 'globals';
import tsparser from '@typescript-eslint/parser';

export default [
  { 
    ignores: [
      'dist', 
      'node_modules', 
      'server/server', 
      '*.cjs',
      'archive/**',
      'docs/**',
      'test*.js',
      '*test*.js',
      'validate*.js',
      'stress-test*.js',
      'e2e-test-runner.js',
      'integration-test-runner.js',
      'master-test-runner.js',
      'run-tests.js',
      'server.js',
      'start*.js',
      'db-healer.js',
      'env-healer.js',
      'git-safety.js',
      'scripts/**'
    ] 
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off', // Allow unused vars in JS files
      'no-console': 'off', // Allow console in JS files
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off', // TypeScript handles this
      'no-console': 'off', // Allow console in TS files
    },
  },
  {
    files: ['tests/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        config: 'readonly',
      },
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off',
      'no-console': 'off', // Allow console in tests
    },
  }
];
