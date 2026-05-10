import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useGAPageView() {
  const location = useLocation();

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_ID;
    if (!gaId || !window.gtag) {
      return;
    }

    window.gtag('config', gaId, {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);
}
