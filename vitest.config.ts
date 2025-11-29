import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setupTests.ts',
    threads: false,
    include: ['components/**/*.test.{ts,tsx,js,jsx}'],
  },
});
