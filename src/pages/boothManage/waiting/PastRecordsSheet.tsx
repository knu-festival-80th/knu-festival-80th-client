import { useMemo } from 'react';

import type { WaitingItem } from '@/apis';
import { BottomSheet, StatusBadge } from '@/components/admin/ui';

interface PastRecordsSheetProps {
  open: boolean;
  onClose: () => void;
  waitings: WaitingItem[];
}

export default function PastRecordsSheet({ open, onClose, waitings }: PastRecordsSheetProps) {
  const records = useMemo(
    () =>
      waitings
        .filter((w) => w.status === 'SKIPPED' || w.status === 'CANCELLED')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [waitings],
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="지난 기록">
      {records.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--admin-text-faint)]">
          미방문/취소 기록이 없어요.
        </p>
      ) : (
        <ul className="flex max-h-[60dvh] flex-col gap-1.5 overflow-y-auto">
          {records.map((w) => {
            const time = new Date(w.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <li
                key={w.waitingId}
                className="flex items-center gap-2 rounded-lg bg-[var(--admin-surface-hover)] px-3 py-2.5"
              >
                <span className="tabular shrink-0 text-[13px] font-bold text-[var(--admin-text-muted)]">
                  #{w.waitingNumber}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--admin-text)]">
                  {w.name}
                </span>
                <span className="tabular shrink-0 text-[11px] text-[var(--admin-text-faint)]">
                  {w.partySize}명 · {time}
                </span>
                <StatusBadge status={w.status} />
              </li>
            );
          })}
        </ul>
      )}
    </BottomSheet>
  );
}
