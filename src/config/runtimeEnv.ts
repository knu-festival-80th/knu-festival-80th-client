export type RuntimeEnvKey =
  | 'VITE_BASE_PATH'
  | 'VITE_API_BASE_URL'
  | 'VITE_API_TIMEOUT_MS'
  | 'VITE_SENTRY_DSN'
  | 'VITE_PUBLIC_POSTHOG_KEY'
  | 'VITE_PUBLIC_POSTHOG_HOST'
  | 'VITE_GA_ID'
  | 'VITE_CLARITY_ID';

type RuntimeEnv = Partial<Record<RuntimeEnvKey, string>>;

declare global {
  interface Window {
    __KNU_RUNTIME_ENV__?: RuntimeEnv;
  }
}

const buildTimeEnv: RuntimeEnv = {
  VITE_BASE_PATH: import.meta.env.VITE_BASE_PATH,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_TIMEOUT_MS: import.meta.env.VITE_API_TIMEOUT_MS,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_PUBLIC_POSTHOG_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
  VITE_PUBLIC_POSTHOG_HOST: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  VITE_GA_ID: import.meta.env.VITE_GA_ID,
  VITE_CLARITY_ID: import.meta.env.VITE_CLARITY_ID,
};

export const isProductionMode = import.meta.env.MODE === 'production';

export function getRuntimeEnv(key: RuntimeEnvKey): string {
  const runtimeValue =
    typeof window === 'undefined' ? undefined : window.__KNU_RUNTIME_ENV__?.[key];

  if (runtimeValue !== undefined && runtimeValue !== '') {
    return runtimeValue;
  }

  return buildTimeEnv[key] ?? '';
}

export function getRuntimeEnvNumber(key: RuntimeEnvKey, fallback: number): number {
  const parsedValue = Number(getRuntimeEnv(key));
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function getRuntimeBasePath(): string {
  const basePath = getRuntimeEnv('VITE_BASE_PATH').trim();
  if (!basePath || basePath === '/') return '';
  return `/${basePath.replace(/^\/+|\/+$/g, '')}`;
}
