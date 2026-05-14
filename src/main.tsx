import '../instrument.ts';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

import { setUnauthorizedHandler } from '@/apis';
import App from './App.tsx';
import AppProviders from './providers/AppProviders.tsx';
import { initGA } from './lib/googleAnalytics.ts';
import { initClarity } from './lib/clarity.ts';
import { useAuthStore } from '@/stores/authStore.ts';

initGA();
initClarity();

setUnauthorizedHandler(() => {
  useAuthStore.getState().clearSession();
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path.startsWith('/console') && !path.startsWith('/console/login')) {
    window.location.assign('/console/login');
  } else if (path.startsWith('/booth/manage') && !path.startsWith('/booth/manage/login')) {
    window.location.assign('/booth/manage/login');
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
