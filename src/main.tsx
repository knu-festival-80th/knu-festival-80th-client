import '../instrument.ts';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

import { setUnauthorizedHandler } from '@/apis';
import App from './App.tsx';
import AppProviders from './providers/AppProviders.tsx';
import { useAuthStore } from '@/stores/authStore.ts';

setUnauthorizedHandler(() => {
  useAuthStore.getState().clearSession();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
    window.location.assign('/admin/login');
  }
});

const isProd = import.meta.env.MODE === 'production';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found.');
}

const root = createRoot(container, {
  ...(isProd && {
    onUncaughtError: Sentry.reactErrorHandler(),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  }),
});

root.render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
