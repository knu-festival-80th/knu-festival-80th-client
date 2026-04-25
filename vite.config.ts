import { configDefaults, defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';

const sentryPlugin =
  process.env.SENTRY_AUTH_TOKEN && process.env.VITE_SENTRY_ORG && process.env.VITE_SENTRY_PROJECT
    ? sentryVitePlugin({
        org: process.env.VITE_SENTRY_ORG,
        project: process.env.VITE_SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: false,
      })
    : null;

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    sentryPlugin,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: false,
    clearMocks: true,
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
