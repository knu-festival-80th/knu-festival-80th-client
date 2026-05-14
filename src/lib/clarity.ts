export function initClarity(): void {
  const clarityId = import.meta.env.VITE_CLARITY_ID;
  if (!clarityId) return;

  (function (c: Window & typeof globalThis, l: Document, a: string, r: string, i: string) {
    (c[a as keyof Window] as unknown as { q?: unknown[] }) = (c[a as keyof Window] as unknown as {
      q?: unknown[];
    }) || { q: [] };
    const t = (c[a as keyof Window] as unknown as { q: unknown[] }).q;
    (c[a as keyof Window] as unknown as (...args: unknown[]) => void) = function (
      ...args: unknown[]
    ) {
      t.push(args);
    };
    const s = l.createElement(r) as HTMLScriptElement;
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(s, y);
  })(window, document, 'clarity', 'script', clarityId);
}
