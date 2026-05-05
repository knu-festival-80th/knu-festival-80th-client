import type { WaitingStatus } from '@/apis';

type WaitingTone = 'waiting' | 'called' | 'entered' | 'skipped' | 'cancelled' | 'neutral';

const TONE: Record<WaitingTone, string> = {
  waiting:
    'bg-[var(--color-secondary-blue)]/10 text-[var(--color-secondary-blue)] ' +
    'border-[var(--color-secondary-blue)]/35',
  called:
    'bg-[var(--color-secondary-yellow)]/15 text-[var(--color-knu-gold)] ' +
    'border-[var(--color-knu-gold)]/45',
  entered:
    'bg-[var(--admin-success-soft)] text-[var(--admin-success)] ' +
    'border-[var(--admin-success)]/35',
  skipped:
    'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)] ' +
    'border-[var(--admin-border)]',
  cancelled:
    'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)] ' + 'border-[var(--admin-danger)]/35',
  neutral:
    'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)] ' +
    'border-[var(--admin-border)]',
};

const FROM_WAITING_STATUS: Record<WaitingStatus, { tone: WaitingTone; label: string }> = {
  WAITING: { tone: 'waiting', label: '대기중' },
  CALLED: { tone: 'called', label: '호출됨' },
  ENTERED: { tone: 'entered', label: '입장' },
  SKIPPED: { tone: 'skipped', label: '미방문' },
  CANCELLED: { tone: 'cancelled', label: '취소' },
};

interface StatusBadgeProps {
  status?: WaitingStatus;
  tone?: WaitingTone;
  children?: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export default function StatusBadge({
  status,
  tone,
  children,
  className = '',
  pulse,
}: StatusBadgeProps) {
  const resolvedTone: WaitingTone = tone ?? (status ? FROM_WAITING_STATUS[status].tone : 'neutral');
  const label = children ?? (status ? FROM_WAITING_STATUS[status].label : null);

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border',
        'px-2.5 py-0.5 text-caption font-semibold',
        'whitespace-nowrap',
        TONE[resolvedTone],
        className,
      ].join(' ')}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}
