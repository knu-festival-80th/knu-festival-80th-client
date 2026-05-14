interface SegmentedTabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  accentVar?: string;
}

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  items: SegmentedTabItem<T>[];
  size?: 'sm' | 'md';
  className?: string;
}

export default function SegmentedTabs<T extends string>({
  value,
  onChange,
  items,
  size = 'md',
  className = '',
}: SegmentedTabsProps<T>) {
  const heightCls = size === 'sm' ? 'h-9' : 'h-11';
  const textCls = size === 'sm' ? 'text-[12px]' : 'text-[13px]';

  return (
    <div
      role="tablist"
      className={[
        'inline-flex w-full items-center gap-1 rounded-xl bg-[var(--admin-surface-hover)] p-1',
        className,
      ].join(' ')}
    >
      {items.map((item) => {
        const active = item.value === value;
        const accent = item.accentVar ? `var(${item.accentVar})` : 'var(--admin-text)';
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors',
              heightCls,
              textCls,
              active
                ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm'
                : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
            ].join(' ')}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className="tabular text-[12px] font-bold"
                style={{ color: active ? accent : 'currentColor' }}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
