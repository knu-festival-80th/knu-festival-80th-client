import * as Sentry from '@sentry/react';
import { getRuntimeEnv, isProductionMode } from '@/config/runtimeEnv';

const sentryDsn = getRuntimeEnv('VITE_SENTRY_DSN');
const apiBaseUrl = getRuntimeEnv('VITE_API_BASE_URL');

if (isProductionMode && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    sendDefaultPii: true,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', apiBaseUrl].filter(Boolean),
    ignoreErrors: ['Java object is gone', 'Error invoking postMessage', 'Request aborted'],
  });
}
