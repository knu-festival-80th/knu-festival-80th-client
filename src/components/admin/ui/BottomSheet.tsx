import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { usePortalTheme } from './usePortalTheme';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const { markerRef, wrapperRef } = usePortalTheme<HTMLDivElement>();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <span ref={markerRef} aria-hidden style={{ display: 'none' }} />
      {createPortal(
        <div
          ref={wrapperRef}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--admin-bg)]/0"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--admin-surface)] pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.25s_ease-out]">
            <div className="sticky top-0 z-10 flex justify-center bg-[var(--admin-surface)] pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--admin-border-strong)]" />
            </div>
            {title && (
              <h3 className="px-5 pt-1 pb-3 text-lg font-bold text-[var(--admin-text)]">{title}</h3>
            )}
            <div className="px-5 pb-5">{children}</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
