import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Users } from 'lucide-react';

import type { WaitingItem } from '@/apis';

import WaitingCard, { type WaitingActionType } from './WaitingCard';

interface KanbanColumnProps {
  title: string;
  count: number;
  accentVar: string;
  items: WaitingItem[];
  sortable: boolean;
  showDetails: boolean;
  onAction: (type: WaitingActionType, waiting: WaitingItem) => void;
  emptyMessage: string;
}

export default function KanbanColumn({
  title,
  count,
  accentVar,
  items,
  sortable,
  showDetails,
  onAction,
  emptyMessage,
}: KanbanColumnProps) {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col rounded-2xl bg-[var(--admin-surface-hover)]/60 p-2"
      aria-label={`${title} 컬럼`}
    >
      <header className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: `var(${accentVar})` }} />
          <h2 className="text-[13px] font-semibold text-[var(--admin-text)]">{title}</h2>
        </div>
        <span className="tabular text-[14px] font-bold" style={{ color: `var(${accentVar})` }}>
          {count}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-0.5 pt-1 pb-1">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-10 text-center">
            <Users size={20} className="text-[var(--admin-text-faint)]" />
            <p className="text-[12px] text-[var(--admin-text-faint)]">{emptyMessage}</p>
          </div>
        ) : sortable ? (
          <SortableContext
            items={items.map((w) => w.waitingId)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((w, idx) => (
              <WaitingCard
                key={w.waitingId}
                waiting={w}
                sortable
                showDetails={showDetails}
                onAction={onAction}
                isFirstInColumn={idx === 0}
              />
            ))}
          </SortableContext>
        ) : (
          items.map((w) => (
            <WaitingCard
              key={w.waitingId}
              waiting={w}
              sortable={false}
              showDetails={showDetails}
              onAction={onAction}
            />
          ))
        )}
      </div>
    </section>
  );
}
