import { getRuntimeEnv } from '@/config/runtimeEnv';

export function getGoogleAnalyticsId(): string {
  return getRuntimeEnv('VITE_GA_ID');
}

export function initGA(): void {
  const gaId = getGoogleAnalyticsId();
  if (!gaId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
}
