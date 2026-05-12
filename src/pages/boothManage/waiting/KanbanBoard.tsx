import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { WaitingItem } from '@/apis';
import { SegmentedTabs } from '@/components/admin/ui';

import KanbanColumn from './KanbanColumn';
import type { WaitingActionType } from './WaitingCard';

type ColumnKey = 'WAITING' | 'CALLED' | 'ENTERED';

const COLUMN_META: Record<ColumnKey, { title: string; accentVar: string; emptyMessage: string }> = {
  WAITING: {
    title: '대기',
    accentVar: '--admin-accent-waiting',
    emptyMessage: '대기 중인 팀이 없어요',
  },
  CALLED: {
    title: '호출',
    accentVar: '--admin-accent-called',
    emptyMessage: '호출한 팀이 없어요',
  },
  ENTERED: {
    title: '입장 완료',
    accentVar: '--admin-accent-entered',
    emptyMessage: '입장한 팀이 없어요',
  },
};

interface KanbanBoardProps {
  boothId: number;
  waitings: WaitingItem[];
  onAction: (type: WaitingActionType, waiting: WaitingItem) => void;
  onReorder: (waitingId: number, newSortOrder: number) => void;
}

export default function KanbanBoard({ boothId, waitings, onAction, onReorder }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [activeColumn, setActiveColumn] = useState<ColumnKey>('WAITING');
  const [showDetails, setShowDetails] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grouped = useMemo(() => {
    const acc: Record<ColumnKey, WaitingItem[]> = {
      WAITING: [],
      CALLED: [],
      ENTERED: [],
    };
    for (const w of waitings) {
      if (w.status === 'WAITING') acc.WAITING.push(w);
      else if (w.status === 'CALLED') acc.CALLED.push(w);
      else if (w.status === 'ENTERED') acc.ENTERED.push(w);
    }
    acc.WAITING.sort((a, b) => a.sortOrder - b.sortOrder);
    acc.CALLED.sort((a, b) => {
      const ta = a.calledAt ? new Date(a.calledAt).getTime() : 0;
      const tb = b.calledAt ? new Date(b.calledAt).getTime() : 0;
      return ta - tb;
    });
    acc.ENTERED.sort((a, b) => {
      const ta = a.enteredAt ? new Date(a.enteredAt).getTime() : 0;
      const tb = b.enteredAt ? new Date(b.enteredAt).getTime() : 0;
      return tb - ta;
    });
    return acc;
  }, [waitings]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const list = grouped.WAITING;
    const oldIndex = list.findIndex((w) => w.waitingId === active.id);
    const newIndex = list.findIndex((w) => w.waitingId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = list[oldIndex];
    const overItem = list[newIndex];
    const newOrderArray = arrayMove(list, oldIndex, newIndex);

    queryClient.setQueryData<WaitingItem[]>(['admin', 'booth', boothId, 'waitings'], (prev) => {
      if (!prev) return prev;
      const others = prev.filter((w) => w.status !== 'WAITING');
      return [...newOrderArray, ...others];
    });

    onReorder(moved.waitingId, overItem.sortOrder);
  };

  const tabItems: { value: ColumnKey; label: string; count: number; accentVar: string }[] = (
    ['WAITING', 'CALLED', 'ENTERED'] as ColumnKey[]
  ).map((key) => ({
    value: key,
    label: COLUMN_META[key].title,
    count: grouped[key].length,
    accentVar: COLUMN_META[key].accentVar,
  }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <div className="flex-1">
            <SegmentedTabs
              value={activeColumn}
              onChange={setActiveColumn}
              items={tabItems}
              size="sm"
            />
          </div>
          <DetailsToggle value={showDetails} onChange={setShowDetails} />
        </div>

        <div className="hidden items-center justify-end md:flex">
          <DetailsToggle value={showDetails} onChange={setShowDetails} />
        </div>

        <div className="md:hidden">
          <ColumnFor
            statusKey={activeColumn}
            waitings={grouped[activeColumn]}
            showDetails={showDetails}
            onAction={onAction}
          />
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-3">
          {(['WAITING', 'CALLED', 'ENTERED'] as ColumnKey[]).map((key) => (
            <ColumnFor
              key={key}
              statusKey={key}
              waitings={grouped[key]}
              showDetails={showDetails}
              onAction={onAction}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

function ColumnFor({
  statusKey,
  waitings,
  showDetails,
  onAction,
}: {
  statusKey: ColumnKey;
  waitings: WaitingItem[];
  showDetails: boolean;
  onAction: (type: WaitingActionType, waiting: WaitingItem) => void;
}) {
  const meta = COLUMN_META[statusKey];
  return (
    <KanbanColumn
      title={meta.title}
      count={waitings.length}
      accentVar={meta.accentVar}
      items={waitings}
      sortable={statusKey === 'WAITING'}
      showDetails={showDetails}
      onAction={onAction}
      emptyMessage={meta.emptyMessage}
    />
  );
}

function DetailsToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)]"
      aria-pressed={value}
    >
      {value ? <Eye size={14} /> : <EyeOff size={14} />}
      <span>{value ? '자세히' : '간단히'}</span>
    </button>
  );
}
