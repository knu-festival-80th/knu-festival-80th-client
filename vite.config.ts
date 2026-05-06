import { configDefaults, defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

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
    tailwindcss(),
    react(),
    ViteImageOptimizer({
      png: { quality: 80, compressionLevel: 9 },
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
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
