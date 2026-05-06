import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, MessageSquare, Plus, RefreshCw, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, boothApi, waitingApi } from '@/apis';
import type { WaitingItem, WaitingStatus } from '@/apis';
import { Button, Card, StatusBadge } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

type FilterKey = 'ALL' | 'ACTIVE' | 'DONE' | 'OTHER';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ACTIVE', label: '진행중' },
  { key: 'DONE', label: '완료' },
  { key: 'OTHER', label: '기타' },
];

const ACTIVE_STATUSES: WaitingStatus[] = ['WAITING', 'CALLED'];
const OTHER_STATUSES: WaitingStatus[] = ['SKIPPED', 'CANCELLED'];

function matchesFilter(status: WaitingStatus, filter: FilterKey): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'ACTIVE') return ACTIVE_STATUSES.includes(status);
  if (filter === 'DONE') return status === 'ENTERED';
  return OTHER_STATUSES.includes(status);
}

function emptyMessage(filter: FilterKey): string {
  if (filter === 'ACTIVE') return '진행중인 대기팀이 없습니다.';
  if (filter === 'DONE') return '입장 완료된 팀이 없습니다.';
  if (filter === 'OTHER') return '미방문/취소된 팀이 없습니다.';
  return '표시할 대기팀이 없습니다.';
}

export default function WaitingListPage() {
  const boothId = useAuthStore((s) => s.boothId);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterKey>('ALL');

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });
  const myBooth = boothsQuery.data?.find((b) => b.boothId === boothId);

  const waitingsQuery = useQuery({
    queryKey: ['admin', 'booth', boothId, 'waitings'],
    queryFn: () => waitingApi.listWaitings(boothId as number),
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
    onError: (e) => onError(e, '미방문 처리에 실패했습니다.'),
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

  const allWaitings = useMemo(() => waitingsQuery.data ?? [], [waitingsQuery.data]);

  const counts = useMemo(() => {
    return allWaitings.reduce(
      (acc, w) => {
        acc[w.status] = (acc[w.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<WaitingStatus, number>,
    );
  }, [allWaitings]);

  const visible = useMemo(
    () => allWaitings.filter((w) => matchesFilter(w.status, filter)),
    [allWaitings, filter],
  );

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

  const waitingCount = counts.WAITING ?? 0;
  const calledCount = counts.CALLED ?? 0;
  const enteredCount = counts.ENTERED ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold text-[var(--admin-text)]">대기열</h1>
          <p className="tabular text-sm text-[var(--admin-text-muted)]">
            대기 {waitingCount} · 호출 {calledCount} · 입장 {enteredCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {myBooth && (
            <Button
              variant={myBooth.waitingOpen ? 'primary' : 'secondary'}
              size="md"
              onClick={() => toggleMutation.mutate(!myBooth.waitingOpen)}
              disabled={toggleMutation.isPending}
            >
              {myBooth.waitingOpen ? '접수 중단' : '접수 시작'}
            </Button>
          )}
          <Link to="/booth/manage/waitings/insert">
            <Button variant="secondary" size="md" iconLeft={<Plus size={14} />}>
              중간 삽입
            </Button>
          </Link>
        </div>
      </header>

      {waitingsQuery.isError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          {waitingsQuery.error instanceof ApiClientError
            ? waitingsQuery.error.message
            : '대기 목록을 불러오지 못했습니다.'}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={[
                'inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors',
                active
                  ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]'
                  : 'border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
              ].join(' ')}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {waitingsQuery.isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-md bg-[var(--admin-surface-hover)]"
            />
          ))}
        </div>
      )}

      {waitingsQuery.data && visible.length === 0 && (
        <div className="rounded-md border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-4 py-10 text-center">
          <p className="text-sm text-[var(--admin-text-muted)]">{emptyMessage(filter)}</p>
        </div>
      )}

      {waitingsQuery.data && visible.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visible.map((waiting) => (
            <li key={waiting.waitingId}>
              <WaitingRow
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface WaitingRowProps {
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

function WaitingRow({
  waiting,
  onCall,
  onEnter,
  onCancel,
  onSkip,
  onResendSms,
  onReorder,
  pending,
}: WaitingRowProps) {
  const isWaiting = waiting.status === 'WAITING';
  const isCalled = waiting.status === 'CALLED';
  const showActions = isWaiting || isCalled;

  return (
    <Card padding="sm">
      <div className="flex items-start gap-3">
        <span className="tabular shrink-0 text-base font-semibold text-[var(--admin-text)]">
          #{waiting.waitingNumber}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-medium text-[var(--admin-text)]">
              {waiting.name}
            </span>
            <span className="tabular shrink-0 text-xs text-[var(--admin-text-muted)]">
              {waiting.partySize}명
            </span>
          </div>
          <div className="tabular flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
            <span>{waiting.maskedPhoneNumber}</span>
            {waiting.smsSent && (
              <MessageSquare
                size={12}
                aria-label="SMS 발송됨"
                className="text-[var(--admin-text-muted)]"
              />
            )}
            <span aria-hidden>·</span>
            <span>순서 {waiting.sortOrder}</span>
          </div>
        </div>
        <StatusBadge status={waiting.status} />
      </div>

      {showActions && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {isWaiting && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onCall}
                disabled={pending.call}
                iconLeft={<Bell size={14} />}
                className="min-h-9"
              >
                호출
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReorder}
                disabled={pending.reorder}
                className="min-h-9"
              >
                순서 변경
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onCancel}
                disabled={pending.cancel}
                iconLeft={<X size={14} />}
                className="ml-auto min-h-9"
              >
                취소
              </Button>
            </>
          )}
          {isCalled && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onEnter}
                disabled={pending.enter}
                iconLeft={<Check size={14} />}
                className="min-h-9"
              >
                입장
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onResendSms}
                disabled={pending.resend}
                iconLeft={<RefreshCw size={14} />}
                className="min-h-9"
              >
                재발송
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                disabled={pending.skip}
                className="min-h-9"
              >
                미방문
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReorder}
                disabled={pending.reorder}
                className="min-h-9"
              >
                순서 변경
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onCancel}
                disabled={pending.cancel}
                iconLeft={<X size={14} />}
                className="min-h-9"
              >
                취소
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
