import '../instrument.ts';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import AppProviders from './providers/AppProviders.tsx';
import { initGA } from './lib/googleAnalytics.ts';

initGA();

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
