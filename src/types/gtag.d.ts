declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (command: string, action: string | Date, params?: Record<string, unknown>) => void;
  }
}

export {};
