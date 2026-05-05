import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ListOrdered, MessageSquare, Phone, Plus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, boothApi, waitingApi } from '@/apis';
import type { WaitingItem, WaitingStatus } from '@/apis';
import { Button, StatusBadge } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

const STATUS_FILTERS: { value: WaitingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'WAITING', label: '대기중' },
  { value: 'CALLED', label: '호출됨' },
  { value: 'ENTERED', label: '입장' },
  { value: 'SKIPPED', label: '미방문' },
  { value: 'CANCELLED', label: '취소' },
];

const STATUS_BAND: Record<WaitingStatus, string> = {
  WAITING: 'bg-[var(--color-secondary-blue)]',
  CALLED: 'bg-[var(--color-knu-gold)]',
  ENTERED: 'bg-[var(--admin-success)]',
  SKIPPED: 'bg-[var(--admin-text-faint)]',
  CANCELLED: 'bg-[var(--admin-danger)]',
};

export default function WaitingListPage() {
  const boothId = useAuthStore((s) => s.boothId);
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<WaitingStatus | 'ALL'>('ALL');

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });
  const myBooth = boothsQuery.data?.find((b) => b.boothId === boothId);

  const waitingsQuery = useQuery({
    queryKey: [
      'admin',
      'booth',
      boothId,
      'waitings',
      { status: statusFilter === 'ALL' ? null : statusFilter },
    ],
    queryFn: () =>
      waitingApi.listWaitings(boothId as number, statusFilter === 'ALL' ? undefined : statusFilter),
    enabled: boothId !== null && Number.isInteger(boothId) && boothId > 0,
    refetchInterval: 5000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'waitings'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
  };

  const onError = (error: unknown, fallback: string) => {
    const message = error instanceof ApiClientError ? error.message : fallback;
    alert(message);
  };

  const callMutation = useMutation({
    mutationFn: waitingApi.callWaiting,
    onSuccess: invalidate,
    onError: (e) => onError(e, '호출에 실패했습니다.'),
  });
  const enterMutation = useMutation({
    mutationFn: waitingApi.enterWaiting,
    onSuccess: invalidate,
    onError: (e) => onError(e, '입장 처리에 실패했습니다.'),
  });
  const cancelMutation = useMutation({
    mutationFn: waitingApi.cancelWaiting,
    onSuccess: invalidate,
    onError: (e) => onError(e, '취소에 실패했습니다.'),
  });
  const skipMutation = useMutation({
    mutationFn: waitingApi.skipWaiting,
    onSuccess: invalidate,
    onError: (e) => onError(e, '건너뛰기에 실패했습니다.'),
  });
  const resendSmsMutation = useMutation({
    mutationFn: waitingApi.resendWaitingSms,
    onSuccess: () => alert('SMS 재발송을 요청했습니다.'),
    onError: (e) => onError(e, 'SMS 재발송에 실패했습니다.'),
  });
  const reorderMutation = useMutation({
    mutationFn: ({ waitingId, newSortOrder }: { waitingId: number; newSortOrder: number }) =>
      waitingApi.reorderWaiting(waitingId, { newSortOrder }),
    onSuccess: invalidate,
    onError: (e) => onError(e, '순서 변경에 실패했습니다.'),
  });
  const toggleMutation = useMutation({
    mutationFn: (open: boolean) => waitingApi.toggleBoothWaiting(boothId as number, { open }),
    onSuccess: invalidate,
    onError: (e) => onError(e, '대기 접수 상태 변경에 실패했습니다.'),
  });

  if (boothId === null) return null;

  const handleReorder = (waiting: WaitingItem) => {
    const input = window.prompt('새 순서(숫자)를 입력하세요.', String(waiting.sortOrder));
    if (!input) return;
    const newSortOrder = Number(input);
    if (!Number.isInteger(newSortOrder) || newSortOrder <= 0) {
      alert('1 이상의 정수를 입력해주세요.');
      return;
    }
    reorderMutation.mutate({ waitingId: waiting.waitingId, newSortOrder });
  };

  const waitings = waitingsQuery.data ?? [];
  const counts = waitings.reduce(
    (acc, w) => {
      acc[w.status] = (acc[w.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<WaitingStatus, number>,
  );
  const waitingCount = counts.WAITING ?? 0;
  const calledCount = counts.CALLED ?? 0;
  const isFresh = waitingsQuery.isFetched && !waitingsQuery.isFetching;

  return (
    <div className="flex flex-col gap-4 pb-24 sm:pb-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              {!isFresh ? null : (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--admin-success)] opacity-60" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isFresh ? 'bg-[var(--admin-success)]' : 'bg-[var(--admin-text-faint)]'
                }`}
              />
            </span>
            대기열 · 실시간
          </span>
          <h2 className="text-heading2 font-semibold text-[var(--admin-text)]">
            대기 <span className="tabular text-[var(--admin-primary)]">{waitingCount}</span>팀 ·
            호출 <span className="tabular text-[var(--color-knu-gold)]">{calledCount}</span>팀
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {myBooth && (
            <Button
              variant={myBooth.waitingOpen ? 'primary' : 'ghost'}
              size="md"
              onClick={() => toggleMutation.mutate(!myBooth.waitingOpen)}
              disabled={toggleMutation.isPending}
              className={
                !myBooth.waitingOpen
                  ? 'border-[var(--admin-danger)]/40 text-[var(--admin-danger)]'
                  : ''
              }
            >
              {myBooth.waitingOpen ? '접수중' : '접수 중단'}
            </Button>
          )}
          <Link to="/booth/manage/waitings/insert">
            <Button variant="secondary" size="md" iconLeft={<Plus size={16} />}>
              중간 삽입
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={[
                'rounded-full px-3.5 py-1.5 text-body2 font-medium transition-colors',
                active
                  ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]'
                  : 'bg-transparent text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)]',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {waitingsQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)]"
            />
          ))}
        </div>
      )}

      {waitingsQuery.isError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
        >
          {waitingsQuery.error instanceof ApiClientError
            ? waitingsQuery.error.message
            : '대기 목록을 불러오지 못했습니다.'}
        </div>
      )}

      {waitingsQuery.data && waitings.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]">
            <Users size={28} />
          </div>
          <p className="text-body1 font-semibold text-[var(--admin-text)]">
            표시할 대기팀이 없어요
          </p>
          <p className="max-w-xs text-body2 text-[var(--admin-text-muted)]">
            손님이 줄을 서면 자동으로 나타납니다. 5초마다 새로고침되고 있어요.
          </p>
        </div>
      )}

      {waitingsQuery.data && waitings.length > 0 && (
        <ul className="flex flex-col gap-3">
          {waitings.map((waiting) => (
            <WaitingCard
              key={waiting.waitingId}
              waiting={waiting}
              onCall={() => callMutation.mutate(waiting.waitingId)}
              onEnter={() => enterMutation.mutate(waiting.waitingId)}
              onCancel={() => cancelMutation.mutate(waiting.waitingId)}
              onSkip={() => skipMutation.mutate(waiting.waitingId)}
              onResendSms={() => resendSmsMutation.mutate(waiting.waitingId)}
              onReorder={() => handleReorder(waiting)}
              pending={{
                call: callMutation.isPending,
                enter: enterMutation.isPending,
                cancel: cancelMutation.isPending,
                skip: skipMutation.isPending,
                resend: resendSmsMutation.isPending,
                reorder: reorderMutation.isPending,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface WaitingCardProps {
  waiting: WaitingItem;
  onCall: () => void;
  onEnter: () => void;
  onCancel: () => void;
  onSkip: () => void;
  onResendSms: () => void;
  onReorder: () => void;
  pending: {
    call: boolean;
    enter: boolean;
    cancel: boolean;
    skip: boolean;
    resend: boolean;
    reorder: boolean;
  };
}

function WaitingCard({
  waiting,
  onCall,
  onEnter,
  onCancel,
  onSkip,
  onResendSms,
  onReorder,
  pending,
}: WaitingCardProps) {
  const showCallActions = waiting.status === 'WAITING';
  const showCalledActions = waiting.status === 'CALLED';
  const showEnter = waiting.status === 'WAITING' || waiting.status === 'CALLED';
  const showSecondaryActions = waiting.status === 'WAITING' || waiting.status === 'CALLED';

  return (
    <li className="relative overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
      <span
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 w-1 ${STATUS_BAND[waiting.status]}`}
      />

      <div className="flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-stretch sm:gap-0 sm:p-0 sm:pl-1">
        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:justify-center sm:gap-1 sm:border-r sm:border-[var(--admin-border)] sm:px-5 sm:py-4">
          <span className="tabular text-display1 font-bold leading-none text-[var(--admin-text)] sm:text-[3.25rem]">
            #{waiting.waitingNumber}
          </span>
          <span className="text-caption text-[var(--admin-text-faint)]">
            순서 <span className="tabular">{waiting.sortOrder}</span>
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-subheading font-semibold text-[var(--admin-text)]">
                  {waiting.name}
                </span>
                <span className="text-caption text-[var(--admin-text-muted)]">
                  (<span className="tabular">{waiting.partySize}</span>명)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-caption text-[var(--admin-text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Phone size={12} />
                  <span className="tabular">{waiting.maskedPhoneNumber}</span>
                </span>
                {waiting.smsSent && (
                  <span className="inline-flex items-center gap-1 text-[var(--admin-success)]">
                    <MessageSquare size={12} />
                    SMS 발송
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={waiting.status} pulse={waiting.status === 'CALLED'} />
          </div>

          {(showCallActions || showCalledActions || showEnter || showSecondaryActions) && (
            <div className="flex flex-wrap gap-2">
              {showCallActions && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onCall}
                  disabled={pending.call}
                  iconLeft={<Bell size={14} />}
                >
                  호출
                </Button>
              )}
              {showEnter && (
                <Button
                  variant={showCalledActions ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={onEnter}
                  disabled={pending.enter}
                  iconLeft={<Check size={14} />}
                >
                  입장 완료
                </Button>
              )}
              {showCalledActions && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onResendSms}
                    disabled={pending.resend}
                    iconLeft={<MessageSquare size={14} />}
                  >
                    SMS 재발송
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onSkip} disabled={pending.skip}>
                    미방문
                  </Button>
                </>
              )}
              {showSecondaryActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReorder}
                    disabled={pending.reorder}
                    iconLeft={<ListOrdered size={14} />}
                  >
                    순서 변경
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={onCancel}
                    disabled={pending.cancel}
                    iconLeft={<X size={14} />}
                    className="ml-auto"
                  >
                    취소
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
