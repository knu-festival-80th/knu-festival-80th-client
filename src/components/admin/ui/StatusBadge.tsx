import type { ReactNode } from 'react';

import type { WaitingStatus } from '@/apis';

type Tone = 'neutral' | 'active' | 'success' | 'muted' | 'danger';

const TONE: Record<Tone, string> = {
  neutral: 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]',
  active: 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]',
  success: 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]',
  muted: 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]',
  danger: 'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]',
};

const FROM_WAITING_STATUS: Record<WaitingStatus, { tone: Tone; label: string }> = {
  WAITING: { tone: 'neutral', label: '대기중' },
  CALLED: { tone: 'active', label: '호출됨' },
  ENTERED: { tone: 'success', label: '입장' },
  SKIPPED: { tone: 'muted', label: '미방문' },
  CANCELLED: { tone: 'danger', label: '취소' },
};

interface StatusBadgeProps {
  status?: WaitingStatus;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}

export default function StatusBadge({ status, tone, children, className = '' }: StatusBadgeProps) {
  const resolvedTone: Tone = tone ?? (status ? FROM_WAITING_STATUS[status].tone : 'neutral');
  const label = children ?? (status ? FROM_WAITING_STATUS[status].label : null);

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE[resolvedTone],
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
