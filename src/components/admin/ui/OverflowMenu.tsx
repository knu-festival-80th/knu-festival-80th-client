import { MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface OverflowMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface OverflowMenuProps {
  items: OverflowMenuItem[];
}

export default function OverflowMenu({ items }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)]"
        aria-label="더보기"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={[
                'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                item.danger
                  ? 'text-[var(--admin-danger)] hover:bg-[var(--admin-danger-soft)]'
                  : 'text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]',
                item.disabled ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
