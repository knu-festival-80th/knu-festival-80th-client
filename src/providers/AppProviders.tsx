import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PostHogProvider } from '@posthog/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  capture_pageview: false,
  autocapture: true,
};

export default function AppProviders({ children }: { children: ReactNode }) {
  const app = (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );

  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) {
    return app;
  }

  return (
    <PostHogProvider apiKey={posthogKey} options={posthogOptions}>
      {app}
    </PostHogProvider>
  );
}
