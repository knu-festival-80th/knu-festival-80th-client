import { useLayoutEffect, useRef } from 'react';

/**
 * portal로 document.body 등으로 빠져나간 wrapper에 호출 위치(trigger)의
 * 가장 가까운 [data-admin-theme] 값을 자동으로 부착해 CSS 변수 cascade를 복원한다.
 *
 * 사용법:
 *   const { markerRef, wrapperRef } = usePortalTheme<HTMLDivElement>();
 *   return (
 *     <>
 *       <span ref={markerRef} aria-hidden style={{ display: 'none' }} />
 *       {createPortal(<div ref={wrapperRef}>...</div>, document.body)}
 *     </>
 *   );
 */
export function usePortalTheme<E extends HTMLElement>() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<E>(null);

  useLayoutEffect(() => {
    const marker = markerRef.current;
    const wrapper = wrapperRef.current;
    if (!marker || !wrapper) return;
    const themed = marker.parentElement?.closest('[data-admin-theme]');
    const value = themed?.getAttribute('data-admin-theme');
    if (value) wrapper.setAttribute('data-admin-theme', value);
  });

  return { markerRef, wrapperRef };
}
