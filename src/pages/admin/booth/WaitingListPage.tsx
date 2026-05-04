import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApiClientError, boothApi, waitingApi } from '@/apis';
import type { WaitingItem, WaitingStatus } from '@/apis';

const STATUS_FILTERS: { value: WaitingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'WAITING', label: '대기중' },
  { value: 'CALLED', label: '호출됨' },
  { value: 'ENTERED', label: '입장' },
  { value: 'SKIPPED', label: '미방문' },
  { value: 'CANCELLED', label: '취소' },
];

const STATUS_LABEL: Record<WaitingStatus, string> = {
  WAITING: '대기중',
  CALLED: '호출됨',
  ENTERED: '입장',
  SKIPPED: '미방문',
  CANCELLED: '취소',
};

export default function WaitingListPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);
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
      waitingApi.listWaitings(boothId, statusFilter === 'ALL' ? undefined : statusFilter),
    enabled: Number.isInteger(boothId) && boothId > 0,
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
    mutationFn: (open: boolean) => waitingApi.toggleBoothWaiting(boothId, { open }),
    onSuccess: invalidate,
    onError: (e) => onError(e, '대기 접수 상태 변경에 실패했습니다.'),
  });

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-subheading font-semibold text-text">대기열</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body2 text-text-muted">
            {myBooth ? (myBooth.waitingOpen ? '접수중' : '접수중단') : '-'}
          </span>
          {myBooth && (
            <button
              type="button"
              onClick={() => toggleMutation.mutate(!myBooth.waitingOpen)}
              disabled={toggleMutation.isPending}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background disabled:opacity-60"
            >
              {myBooth.waitingOpen ? '접수 중단' : '접수 시작'}
            </button>
          )}
          <Link
            to={`/admin/booth/${boothId}/waitings/insert`}
            className="rounded-md bg-primary px-3 py-1.5 text-body2 font-semibold text-surface transition hover:opacity-90"
          >
            + 중간 삽입
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full border px-3 py-1 text-body2 transition ${
              statusFilter === filter.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface text-text-muted hover:text-text'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {waitingsQuery.isLoading && <p className="text-body2 text-text-muted">불러오는 중…</p>}

      {waitingsQuery.isError && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">
          {waitingsQuery.error instanceof ApiClientError
            ? waitingsQuery.error.message
            : '대기 목록을 불러오지 못했습니다.'}
        </p>
      )}

      {waitingsQuery.data && waitingsQuery.data.length === 0 && (
        <p className="text-body2 text-text-muted">표시할 대기팀이 없습니다.</p>
      )}

      {waitingsQuery.data && waitingsQuery.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {waitingsQuery.data.map((waiting) => (
            <li key={waiting.waitingId} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body1 font-semibold text-text">
                    #{waiting.waitingNumber} · {waiting.name} ({waiting.partySize}명)
                    <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-caption text-text-muted">
                      {STATUS_LABEL[waiting.status]}
                    </span>
                  </span>
                  <span className="text-caption text-text-muted">
                    {waiting.maskedPhoneNumber} · 순서 {waiting.sortOrder}
                    {waiting.smsSent && ' · SMS 발송됨'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {waiting.status === 'WAITING' && (
                  <button
                    type="button"
                    onClick={() => callMutation.mutate(waiting.waitingId)}
                    disabled={callMutation.isPending}
                    className="rounded-md bg-primary px-3 py-1.5 text-body2 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
                  >
                    호출
                  </button>
                )}
                {(waiting.status === 'WAITING' || waiting.status === 'CALLED') && (
                  <button
                    type="button"
                    onClick={() => enterMutation.mutate(waiting.waitingId)}
                    disabled={enterMutation.isPending}
                    className="rounded-md border border-secondary-green/40 bg-secondary-green/10 px-3 py-1.5 text-body2 text-secondary-green transition hover:bg-secondary-green/20 disabled:opacity-60"
                  >
                    입장 완료
                  </button>
                )}
                {waiting.status === 'CALLED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => skipMutation.mutate(waiting.waitingId)}
                      disabled={skipMutation.isPending}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background disabled:opacity-60"
                    >
                      미방문 처리
                    </button>
                    <button
                      type="button"
                      onClick={() => resendSmsMutation.mutate(waiting.waitingId)}
                      disabled={resendSmsMutation.isPending}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background disabled:opacity-60"
                    >
                      SMS 재발송
                    </button>
                  </>
                )}
                {(waiting.status === 'WAITING' || waiting.status === 'CALLED') && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReorder(waiting)}
                      disabled={reorderMutation.isPending}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background disabled:opacity-60"
                    >
                      순서 변경
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(waiting.waitingId)}
                      disabled={cancelMutation.isPending}
                      className="rounded-md border border-knu-red/30 bg-knu-red/5 px-3 py-1.5 text-body2 text-knu-red transition hover:bg-knu-red/10 disabled:opacity-60"
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
