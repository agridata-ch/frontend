import angular from '@analogjs/vite-plugin-angular';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [angular()],
  // Resolve the tsconfig `@/…` path aliases natively (Vite 8+), no plugin needed.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    // Migrate on jsdom (matches the previous jest-preset-angular env); happy-dom is a
    // post-migration experiment - only flip if the full suite stays green.
    environment: 'jsdom',
    // Match the previous jest-preset-angular default origin (Vitest's jsdom defaults to :3000).
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    setupFiles: ['src/test-setup.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'lcov'],
      reportsDirectory: 'coverage',
      // Extend Vitest's defaults (node_modules, .d.ts, config files, ...) and mirror
      // sonar.exclusions so both tools score the same set of files.
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/entities/**',
        '**/shared/testing/mocks/**',
        '**/*.module.ts',
        '**/*.stories.ts',
        'src/main.ts',
        'src/styles/**',
      ],
    },
  },
});
