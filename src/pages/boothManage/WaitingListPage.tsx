import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, MessageSquare, Plus, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, boothApi, waitingApi } from '@/apis';
import type { WaitingItem, WaitingStatus } from '@/apis';
import { BottomSheet, StatusBadge } from '@/components/admin/ui';
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

type SheetAction = {
  type: 'call' | 'enter' | 'cancel' | 'skip' | 'resend' | 'reorder';
  waiting: WaitingItem;
};

const ACTION_META: Record<
  SheetAction['type'],
  { title: string; desc: string; confirm: string; danger?: boolean }
> = {
  call: {
    title: '호출하시겠습니까?',
    desc: '해당 팀에게 SMS가 발송됩니다.',
    confirm: '호출하기',
  },
  enter: {
    title: '입장 처리하시겠습니까?',
    desc: '호출된 팀이 도착하여 입장합니다.',
    confirm: '입장 확인',
  },
  cancel: {
    title: '대기를 취소하시겠습니까?',
    desc: '취소하면 대기열에서 제거됩니다.',
    confirm: '취소하기',
    danger: true,
  },
  skip: {
    title: '미방문 처리하시겠습니까?',
    desc: '호출했으나 오지 않은 팀을 건너뜁니다.',
    confirm: '미방문 처리',
  },
  resend: {
    title: 'SMS를 재발송하시겠습니까?',
    desc: '호출 안내 메시지를 다시 전송합니다.',
    confirm: '재발송',
  },
  reorder: { title: '순서 변경', desc: '', confirm: '변경' },
};

export default function WaitingListPage() {
  const boothId = useAuthStore((s) => s.boothId);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [sheet, setSheet] = useState<SheetAction | null>(null);
  const [reorderValue, setReorderValue] = useState('');

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
    alert(error instanceof ApiClientError ? error.message : fallback);
  };

  const callMutation = useMutation({
    mutationFn: waitingApi.callWaiting,
    onSuccess: () => {
      invalidate();
      setSheet(null);
    },
    onError: (e) => onError(e, '호출에 실패했습니다.'),
  });
  const enterMutation = useMutation({
    mutationFn: waitingApi.enterWaiting,
    onSuccess: () => {
      invalidate();
      setSheet(null);
    },
    onError: (e) => onError(e, '입장 처리에 실패했습니다.'),
  });
  const cancelMutation = useMutation({
    mutationFn: waitingApi.cancelWaiting,
    onSuccess: () => {
      invalidate();
      setSheet(null);
    },
    onError: (e) => onError(e, '취소에 실패했습니다.'),
  });
  const skipMutation = useMutation({
    mutationFn: waitingApi.skipWaiting,
    onSuccess: () => {
      invalidate();
      setSheet(null);
    },
    onError: (e) => onError(e, '미방문 처리에 실패했습니다.'),
  });
  const resendSmsMutation = useMutation({
    mutationFn: waitingApi.resendWaitingSms,
    onSuccess: () => {
      setSheet(null);
      alert('SMS 재발송 완료');
    },
    onError: (e) => onError(e, 'SMS 재발송에 실패했습니다.'),
  });
  const reorderMutation = useMutation({
    mutationFn: ({ waitingId, newSortOrder }: { waitingId: number; newSortOrder: number }) =>
      waitingApi.reorderWaiting(waitingId, { newSortOrder }),
    onSuccess: () => {
      invalidate();
      setSheet(null);
    },
    onError: (e) => onError(e, '순서 변경에 실패했습니다.'),
  });
  const toggleMutation = useMutation({
    mutationFn: (open: boolean) => waitingApi.toggleBoothWaiting(boothId as number, { open }),
    onSuccess: invalidate,
    onError: (e) => onError(e, '상태 변경에 실패했습니다.'),
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

  const openSheet = useCallback((type: SheetAction['type'], waiting: WaitingItem) => {
    if (type === 'reorder') setReorderValue(String(waiting.sortOrder));
    setSheet({ type, waiting });
  }, []);

  const handleConfirm = () => {
    if (!sheet) return;
    const id = sheet.waiting.waitingId;
    switch (sheet.type) {
      case 'call':
        callMutation.mutate(id);
        break;
      case 'enter':
        enterMutation.mutate(id);
        break;
      case 'cancel':
        cancelMutation.mutate(id);
        break;
      case 'skip':
        skipMutation.mutate(id);
        break;
      case 'resend':
        resendSmsMutation.mutate(id);
        break;
      case 'reorder': {
        const n = Number(reorderValue);
        if (!Number.isInteger(n) || n < 1) {
          alert('1 이상의 정수를 입력해주세요.');
          return;
        }
        reorderMutation.mutate({ waitingId: id, newSortOrder: n });
        break;
      }
    }
  };

  if (boothId === null) return null;

  const waitingCount = counts.WAITING ?? 0;
  const calledCount = counts.CALLED ?? 0;
  const enteredCount = counts.ENTERED ?? 0;
  const anyPending =
    callMutation.isPending ||
    enterMutation.isPending ||
    cancelMutation.isPending ||
    skipMutation.isPending ||
    resendSmsMutation.isPending ||
    reorderMutation.isPending;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          label="대기"
          desc="순서를 기다리는 중"
          value={waitingCount}
          color="var(--admin-text)"
        />
        <StatCard
          label="호출"
          desc="SMS 발송 완료"
          value={calledCount}
          color="var(--admin-primary)"
        />
        <StatCard
          label="입장"
          desc="부스에 도착"
          value={enteredCount}
          color="var(--admin-success)"
        />
      </div>

      {myBooth && (
        <button
          type="button"
          onClick={() => toggleMutation.mutate(!myBooth.waitingOpen)}
          disabled={toggleMutation.isPending}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-all disabled:opacity-60',
            myBooth.waitingOpen
              ? 'bg-[var(--admin-primary)] text-white'
              : 'bg-[var(--admin-surface)] text-[var(--admin-text)] ring-1 ring-[var(--admin-border)]',
          ].join(' ')}
        >
          {myBooth.waitingOpen ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              접수중 — 탭하여 중단
            </>
          ) : (
            '접수 시작'
          )}
        </button>
      )}

      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={[
                'inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors',
                filter === f.key
                  ? 'bg-[var(--admin-text)] text-white'
                  : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)] ring-1 ring-[var(--admin-border)]',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link to="/booth/manage/waitings/insert">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-text-muted)] ring-1 ring-[var(--admin-border)] transition-colors hover:bg-[var(--admin-surface-hover)]"
            aria-label="중간 삽입"
          >
            <Plus size={16} />
          </button>
        </Link>
      </div>

      {waitingsQuery.isError && (
        <div
          role="alert"
          className="rounded-xl bg-[var(--admin-danger-soft)] px-4 py-3 text-sm text-[var(--admin-danger)]"
        >
          {waitingsQuery.error instanceof ApiClientError
            ? waitingsQuery.error.message
            : '대기 목록을 불러오지 못했습니다.'}
        </div>
      )}

      {waitingsQuery.isLoading && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[var(--admin-surface)]" />
          ))}
        </div>
      )}

      {waitingsQuery.data && visible.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--admin-surface)] px-4 py-14 text-center">
          <Users size={36} className="text-[var(--admin-border-strong)]" />
          <p className="text-sm text-[var(--admin-text-faint)]">{emptyMessage(filter)}</p>
        </div>
      )}

      {waitingsQuery.data && visible.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {visible.map((w) => (
            <li key={w.waitingId}>
              <WaitingRow waiting={w} onAction={(type) => openSheet(type, w)} />
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={sheet !== null}
        onClose={() => !anyPending && setSheet(null)}
        title={sheet ? `#${sheet.waiting.waitingNumber} ${sheet.waiting.name}` : undefined}
      >
        {sheet && sheet.type !== 'reorder' && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[var(--admin-text)]">
                {ACTION_META[sheet.type].title}
              </p>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                {ACTION_META[sheet.type].desc}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSheet(null)}
                disabled={anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3.5 text-[15px] font-semibold text-[var(--admin-text)] transition-colors"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={anyPending}
                className={[
                  'flex-1 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-60',
                  ACTION_META[sheet.type].danger
                    ? 'bg-[var(--admin-danger)]'
                    : 'bg-[var(--admin-primary)]',
                ].join(' ')}
              >
                {anyPending ? '처리 중...' : ACTION_META[sheet.type].confirm}
              </button>
            </div>
          </div>
        )}
        {sheet && sheet.type === 'reorder' && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[var(--admin-text)]">순서 변경</p>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                현재 순서: {sheet.waiting.sortOrder}번 — 이동할 순서를 입력하세요.
              </p>
            </div>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={reorderValue}
              onChange={(e) => setReorderValue(e.target.value)}
              className="h-12 rounded-xl border-0 bg-[var(--admin-surface-hover)] px-4 text-center text-lg font-bold tabular text-[var(--admin-text)] outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSheet(null)}
                disabled={anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3.5 text-[15px] font-semibold text-[var(--admin-text)]"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-primary)] py-3.5 text-[15px] font-semibold text-white disabled:opacity-60"
              >
                {anyPending ? '처리 중...' : '변경'}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function StatCard({
  label,
  desc,
  value,
  color,
}: {
  label: string;
  desc: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-[var(--admin-surface)] p-3.5">
      <span className="tabular text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[13px] font-semibold text-[var(--admin-text)]">{label}</span>
      <span className="text-[11px] leading-tight text-[var(--admin-text-faint)]">{desc}</span>
    </div>
  );
}

interface WaitingRowProps {
  waiting: WaitingItem;
  onAction: (type: SheetAction['type']) => void;
}

function WaitingRow({ waiting, onAction }: WaitingRowProps) {
  const isWaiting = waiting.status === 'WAITING';
  const isCalled = waiting.status === 'CALLED';

  return (
    <div className="rounded-2xl bg-[var(--admin-surface)] p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="tabular text-lg font-bold text-[var(--admin-text)]">
              #{waiting.waitingNumber}
            </span>
            <StatusBadge status={waiting.status} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-medium text-[var(--admin-text)]">{waiting.name}</span>
            <span className="tabular text-sm text-[var(--admin-text-faint)]">
              {waiting.partySize}명
            </span>
          </div>
        </div>
      </div>

      <div className="tabular mt-1.5 flex items-center gap-1.5 text-xs text-[var(--admin-text-faint)]">
        <span>{waiting.maskedPhoneNumber}</span>
        {waiting.smsSent && <MessageSquare size={11} />}
        <span>·</span>
        <span>순서 {waiting.sortOrder}</span>
      </div>

      {isWaiting && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onAction('call')}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--admin-primary)] py-3 text-[15px] font-semibold text-white transition-colors active:opacity-90"
          >
            <Bell size={16} />
            호출하기
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAction('reorder')}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-2.5 text-[13px] font-medium text-[var(--admin-text-muted)] transition-colors"
            >
              순서 변경
            </button>
            <button
              type="button"
              onClick={() => onAction('cancel')}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-2.5 text-[13px] font-medium text-[var(--admin-danger)] transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isCalled && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onAction('enter')}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--admin-success)] py-3 text-[15px] font-semibold text-white transition-colors active:opacity-90"
          >
            <Check size={16} />
            입장 확인
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAction('resend')}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-2.5 text-[13px] font-medium text-[var(--admin-text-muted)]"
            >
              SMS 재발송
            </button>
            <button
              type="button"
              onClick={() => onAction('skip')}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-2.5 text-[13px] font-medium text-[var(--admin-text-muted)]"
            >
              미방문
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAction('reorder')}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-2.5 text-[13px] font-medium text-[var(--admin-text-muted)]"
            >
              순서 변경
            </button>
            <button
              type="button"
              onClick={() => onAction('cancel')}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-2.5 text-[13px] font-medium text-[var(--admin-danger)]"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {!isWaiting && !isCalled && (
        <div className="mt-2 text-xs text-[var(--admin-text-faint)]">
          {waiting.status === 'ENTERED' &&
            waiting.enteredAt &&
            `입장: ${new Date(waiting.enteredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
          {waiting.status === 'CANCELLED' && '취소됨'}
          {waiting.status === 'SKIPPED' && '미방문'}
        </div>
      )}
    </div>
  );
}
