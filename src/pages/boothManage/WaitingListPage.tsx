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
    <div className="flex flex-col gap-2.5">
      {/* 통계 인라인 바 */}
      <div className="flex items-center gap-3 rounded-xl bg-[var(--admin-surface)] px-4 py-2.5">
        <StatChip label="대기" value={waitingCount} color="var(--admin-text)" />
        <div className="h-4 w-px bg-[var(--admin-border)]" />
        <StatChip label="호출" value={calledCount} color="var(--admin-primary)" />
        <div className="h-4 w-px bg-[var(--admin-border)]" />
        <StatChip label="입장" value={enteredCount} color="var(--admin-success)" />
      </div>

      {/* 접수 토글 */}
      {myBooth && (
        <button
          type="button"
          onClick={() => toggleMutation.mutate(!myBooth.waitingOpen)}
          disabled={toggleMutation.isPending}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-all disabled:opacity-60',
            myBooth.waitingOpen
              ? 'bg-[var(--admin-primary)] text-white'
              : 'bg-[var(--admin-surface)] text-[var(--admin-text)] ring-1 ring-[var(--admin-border)]',
          ].join(' ')}
        >
          {myBooth.waitingOpen ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              접수중 — 탭하여 중단
            </>
          ) : (
            '접수 시작'
          )}
        </button>
      )}

      {/* 필터 + 삽입 */}
      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={[
                'inline-flex h-7 shrink-0 items-center rounded-full px-3 text-[12px] font-medium transition-colors',
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
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-text-muted)] ring-1 ring-[var(--admin-border)]"
            aria-label="중간 삽입"
          >
            <Plus size={14} />
          </button>
        </Link>
      </div>

      {/* 에러 */}
      {waitingsQuery.isError && (
        <div
          role="alert"
          className="rounded-xl bg-[var(--admin-danger-soft)] px-3 py-2 text-[13px] text-[var(--admin-danger)]"
        >
          {waitingsQuery.error instanceof ApiClientError
            ? waitingsQuery.error.message
            : '대기 목록을 불러오지 못했습니다.'}
        </div>
      )}

      {/* 로딩 */}
      {waitingsQuery.isLoading && (
        <div className="flex flex-col gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--admin-surface)]" />
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {waitingsQuery.data && visible.length === 0 && (
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-[var(--admin-surface)] px-4 py-10 text-center">
          <Users size={28} className="text-[var(--admin-border-strong)]" />
          <p className="text-[13px] text-[var(--admin-text-faint)]">{emptyMessage(filter)}</p>
        </div>
      )}

      {/* 대기 목록 */}
      {waitingsQuery.data && visible.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {visible.map((w) => (
            <li key={w.waitingId}>
              <WaitingRow waiting={w} onAction={(type) => openSheet(type, w)} />
            </li>
          ))}
        </ul>
      )}

      {/* 바텀시트 */}
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
                className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3 text-[15px] font-semibold text-[var(--admin-text)]"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={anyPending}
                className={[
                  'flex-1 rounded-xl py-3 text-[15px] font-semibold text-white disabled:opacity-60',
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
              className="h-11 rounded-xl border-0 bg-[var(--admin-surface-hover)] px-4 text-center text-lg font-bold tabular text-[var(--admin-text)] outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSheet(null)}
                disabled={anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3 text-[15px] font-semibold text-[var(--admin-text)]"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-primary)] py-3 text-[15px] font-semibold text-white disabled:opacity-60"
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

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-[var(--admin-text-muted)]">{label}</span>
      <span className="tabular text-[18px] font-bold leading-none" style={{ color }}>
        {value}
      </span>
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
    <div className="rounded-xl bg-[var(--admin-surface)] px-3.5 py-3">
      {/* 상단: 번호 + 이름 + 상태 + 메인 액션 */}
      <div className="flex items-center gap-2">
        <span className="tabular text-[15px] font-bold text-[var(--admin-text)]">
          #{waiting.waitingNumber}
        </span>
        <span className="min-w-0 truncate text-[14px] font-medium text-[var(--admin-text)]">
          {waiting.name}
        </span>
        <span className="tabular text-[12px] text-[var(--admin-text-faint)]">
          {waiting.partySize}명
        </span>
        <StatusBadge status={waiting.status} />

        {/* 메인 액션 버튼 - 오른쪽 끝 */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {isWaiting && (
            <button
              type="button"
              onClick={() => onAction('call')}
              className="flex h-8 items-center gap-1 rounded-lg bg-[var(--admin-primary)] px-3 text-[12px] font-semibold text-white active:opacity-90"
            >
              <Bell size={12} />
              호출
            </button>
          )}
          {isCalled && (
            <button
              type="button"
              onClick={() => onAction('enter')}
              className="flex h-8 items-center gap-1 rounded-lg bg-[var(--admin-success)] px-3 text-[12px] font-semibold text-white active:opacity-90"
            >
              <Check size={12} />
              입장
            </button>
          )}
        </div>
      </div>

      {/* 하단: 부가 정보 + 부가 액션 */}
      <div className="mt-1.5 flex items-center justify-between">
        <div className="tabular flex items-center gap-1.5 text-[11px] text-[var(--admin-text-faint)]">
          <span>{waiting.maskedPhoneNumber}</span>
          {waiting.smsSent && <MessageSquare size={10} />}
          <span>·</span>
          <span>순서 {waiting.sortOrder}</span>
        </div>

        {/* 부가 액션 텍스트 링크 */}
        {(isWaiting || isCalled) && (
          <div className="flex items-center gap-2 text-[11px] font-medium">
            {isCalled && (
              <button
                type="button"
                onClick={() => onAction('resend')}
                className="text-[var(--admin-text-muted)]"
              >
                SMS재발송
              </button>
            )}
            {isCalled && (
              <button
                type="button"
                onClick={() => onAction('skip')}
                className="text-[var(--admin-text-muted)]"
              >
                미방문
              </button>
            )}
            <button
              type="button"
              onClick={() => onAction('reorder')}
              className="text-[var(--admin-text-muted)]"
            >
              순서
            </button>
            <button
              type="button"
              onClick={() => onAction('cancel')}
              className="text-[var(--admin-danger)]"
            >
              취소
            </button>
          </div>
        )}

        {!isWaiting && !isCalled && (
          <span className="text-[11px] text-[var(--admin-text-faint)]">
            {waiting.status === 'ENTERED' &&
              waiting.enteredAt &&
              `입장 ${new Date(waiting.enteredAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
            {waiting.status === 'CANCELLED' && '취소됨'}
            {waiting.status === 'SKIPPED' && '미방문'}
          </span>
        )}
      </div>
    </div>
  );
}
