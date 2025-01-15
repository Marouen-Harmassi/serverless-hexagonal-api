import { defineConfig } from 'vitest/config';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        ...configDefaults.exclude,
        'dist/**',
        'build/**',
        '.serverless/**',
        'eslint.config.mjs',
      ],
    },
  },
});
