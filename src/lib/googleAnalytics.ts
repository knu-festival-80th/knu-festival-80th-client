const GA_ID = import.meta.env.VITE_GA_ID;

export function initGA(): void {
  if (!GA_ID) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}
