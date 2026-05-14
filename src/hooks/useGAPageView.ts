import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getGoogleAnalyticsId } from '@/lib/googleAnalytics';

export function useGAPageView() {
  const location = useLocation();

  useEffect(() => {
    const gaId = getGoogleAnalyticsId();
    if (!gaId || !window.gtag) {
      return;
    }

    window.gtag('config', gaId, {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);
}
