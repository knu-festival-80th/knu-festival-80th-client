import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bell, Check, GripVertical, MessageSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { WaitingItem } from '@/apis';
import { OverflowMenu } from '@/components/admin/ui';

export type WaitingActionType = 'call' | 'enter' | 'cancel' | 'skip' | 'resend' | 'moveToTop';

interface WaitingCardProps {
  waiting: WaitingItem;
  sortable: boolean;
  showDetails: boolean;
  onAction: (type: WaitingActionType, waiting: WaitingItem) => void;
  isFirstInColumn?: boolean;
}

const STATUS_ACCENT_VAR: Record<string, string> = {
  WAITING: '--admin-accent-waiting',
  CALLED: '--admin-accent-called',
  ENTERED: '--admin-accent-entered',
  SKIPPED: '--admin-accent-skipped',
  CANCELLED: '--admin-accent-cancelled',
};

const CALL_TIMEOUT_MS = 10 * 60 * 1000;

function useElapsedTimer(
  createdAt: string,
  calledAt: string | null,
  status: string,
): { text: string; isOverdue: boolean } | null {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (status === 'CALLED' && calledAt) {
      const id = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(id);
    }
    if (status === 'WAITING') {
      const id = setInterval(() => setNow(Date.now()), 30_000);
      return () => clearInterval(id);
    }
  }, [status, calledAt]);

  if (status === 'CALLED' && calledAt) {
    const remaining = CALL_TIMEOUT_MS - (now - new Date(calledAt).getTime());
    if (remaining <= 0) {
      return { text: '시간 초과', isOverdue: true };
    }
    const mins = Math.floor(remaining / 60_000);
    const secs = Math.floor((remaining % 60_000) / 1000);
    return { text: `${mins}:${secs.toString().padStart(2, '0')}`, isOverdue: false };
  }

  if (status === 'WAITING') {
    const diff = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));
    return { text: `${diff}분 대기`, isOverdue: false };
  }

  return null;
}

function timeLabel(iso: string | null, prefix: string): string | null {
  if (!iso) return null;
  const time = new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return `${prefix} ${time}`;
}

export default function WaitingCard({
  waiting,
  sortable,
  showDetails,
  onAction,
  isFirstInColumn,
}: WaitingCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: waiting.waitingId,
    disabled: !sortable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const accentVar = STATUS_ACCENT_VAR[waiting.status] ?? '--admin-text-muted';
  const accent = `var(${accentVar})`;

  const timer = useElapsedTimer(waiting.createdAt, waiting.calledAt, waiting.status);

  const isWaiting = waiting.status === 'WAITING';
  const isCalled = waiting.status === 'CALLED';
  const isEntered = waiting.status === 'ENTERED';

  const menuItems = useMemo(() => {
    const items: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean }[] =
      [];
    if (isCalled) {
      items.push({ label: 'SMS 재발송', onClick: () => onAction('resend', waiting) });
      items.push({ label: '미방문 처리', onClick: () => onAction('skip', waiting) });
    }
    if (isWaiting && !isFirstInColumn) {
      items.push({ label: '맨 위로', onClick: () => onAction('moveToTop', waiting) });
    }
    if (isWaiting || isCalled) {
      items.push({ label: '대기 취소', onClick: () => onAction('cancel', waiting), danger: true });
    }
    return items;
  }, [isCalled, isWaiting, isFirstInColumn, waiting, onAction]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'group relative flex flex-col rounded-xl bg-[var(--admin-surface)] ring-1 transition-shadow',
        isDragging
          ? 'ring-[var(--admin-primary)] shadow-lg'
          : 'ring-[var(--admin-border)] hover:ring-[var(--admin-border-strong)]',
      ].join(' ')}
    >
      <div className="flex items-stretch">
        <span aria-hidden className="w-1 shrink-0 rounded-l-xl" style={{ background: accent }} />
        {sortable ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex w-7 shrink-0 items-center justify-center text-[var(--admin-text-faint)] hover:text-[var(--admin-text-muted)] active:text-[var(--admin-text)]"
            aria-label="순서 변경 핸들"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={16} />
          </button>
        ) : (
          <span aria-hidden className="w-2 shrink-0" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-1.5">
          <span className="tabular shrink-0 text-[15px] font-bold" style={{ color: accent }}>
            #{waiting.waitingNumber}
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--admin-text)]">
            {waiting.name}
          </span>
          <span className="tabular shrink-0 rounded-md bg-[var(--admin-surface-hover)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--admin-text-muted)]">
            {waiting.partySize}명
          </span>

          {isWaiting && (
            <button
              type="button"
              onClick={() => onAction('call', waiting)}
              className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-[var(--admin-primary)] px-2.5 text-[12px] font-semibold text-white active:opacity-80"
            >
              <Bell size={12} />
              호출
            </button>
          )}
          {isCalled && (
            <button
              type="button"
              onClick={() => onAction('enter', waiting)}
              className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-[var(--admin-success)] px-2.5 text-[12px] font-semibold text-white active:opacity-80"
            >
              <Check size={12} />
              입장
            </button>
          )}

          {menuItems.length > 0 ? (
            <div className="shrink-0">
              <OverflowMenu items={menuItems} />
            </div>
          ) : (
            <span aria-hidden className="w-2 shrink-0" />
          )}
        </div>
      </div>

      {showDetails && (
        <div className="tabular flex items-center gap-1.5 px-3 pb-2 pl-[3.25rem] text-[11px] text-[var(--admin-text-faint)]">
          <span>{waiting.maskedPhoneNumber}</span>
          {waiting.smsSent && (
            <span className="inline-flex items-center gap-0.5 text-[var(--admin-primary)]">
              <MessageSquare size={10} />
              SMS
            </span>
          )}
          {timer && (
            <>
              <span>·</span>
              <span
                className={timer.isOverdue ? 'font-semibold' : undefined}
                style={
                  timer.isOverdue ? { color: 'var(--admin-accent-cancelled, #ef4444)' } : undefined
                }
              >
                {timer.text}
              </span>
            </>
          )}
          {isEntered && waiting.enteredAt && (
            <>
              <span>·</span>
              <span>{timeLabel(waiting.enteredAt, '입장')}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
