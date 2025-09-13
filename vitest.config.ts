import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['server/tests/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'tests/**/*.test.js'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});