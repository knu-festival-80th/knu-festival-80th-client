import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PostHogProvider } from '@posthog/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScrollToTop from '@/components/common/ScrollToTop';
import { getRuntimeEnv } from '@/config/runtimeEnv';

const queryClient = new QueryClient();

const posthogOptions = {
  api_host: getRuntimeEnv('VITE_PUBLIC_POSTHOG_HOST') || 'https://us.i.posthog.com',
  capture_pageview: false,
  autocapture: true,
};

export default function AppProviders({ children }: { children: ReactNode }) {
  const app = (
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );

  const posthogKey = getRuntimeEnv('VITE_PUBLIC_POSTHOG_KEY');
  if (!posthogKey) {
    return app;
  }

  return (
    <PostHogProvider apiKey={posthogKey} options={posthogOptions}>
      {app}
    </PostHogProvider>
  );
}
