import { useQuery } from '@tanstack/react-query';
import { History, Plus, Power, PowerOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiClientError, boothApi, waitingApi } from '@/apis';
import type { WaitingItem } from '@/apis';
import { BottomSheet } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

import KanbanBoard from './waiting/KanbanBoard';
import PastRecordsSheet from './waiting/PastRecordsSheet';
import { useWaitingActions } from './waiting/useWaitingActions';
import type { WaitingActionType } from './waiting/WaitingCard';
import WaitingInsertSheet from './waiting/WaitingInsertSheet';

interface ActionConfirmState {
  type: 'call' | 'cancel' | 'skip';
  waiting: WaitingItem;
}

const ACTION_CONFIRM_META: Record<
  ActionConfirmState['type'],
  { title: string; desc: string; confirmLabel: string; danger?: boolean }
> = {
  call: {
    title: '호출하시겠어요?',
    desc: '해당 팀에게 SMS가 발송돼요.',
    confirmLabel: '호출하기',
  },
  cancel: {
    title: '대기를 취소할까요?',
    desc: '취소하면 대기열에서 제거되며, 되돌릴 수 없어요.',
    confirmLabel: '대기 취소',
    danger: true,
  },
  skip: {
    title: '미방문으로 처리할까요?',
    desc: '호출했지만 오지 않은 팀을 다음 순번으로 넘겨요.',
    confirmLabel: '미방문 처리',
  },
};

export default function WaitingListPage() {
  const boothId = useAuthStore((s) => s.boothId);

  const [actionConfirm, setActionConfirm] = useState<ActionConfirmState | null>(null);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  const [insertOpen, setInsertOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

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

  const actions = useWaitingActions({
    boothId: boothId as number,
    onError: (msg) => showToast('error', msg),
    onSuccess: (msg) => showToast('success', msg),
  });

  const allWaitings = useMemo(() => waitingsQuery.data ?? [], [waitingsQuery.data]);

  const handleAction = useCallback(
    (type: WaitingActionType, waiting: WaitingItem) => {
      if (type === 'call' || type === 'cancel' || type === 'skip') {
        setActionConfirm({ type, waiting });
        return;
      }
      if (type === 'enter') {
        actions.enter.mutate(waiting.waitingId);
        return;
      }
      if (type === 'resend') {
        actions.resend.mutate(waiting.waitingId);
        return;
      }
      if (type === 'moveToTop') {
        actions.reorder.mutate({ waitingId: waiting.waitingId, newSortOrder: 1 });
        return;
      }
    },
    [actions],
  );

  const handleReorder = useCallback(
    (waitingId: number, newSortOrder: number) => {
      actions.reorder.mutate({ waitingId, newSortOrder });
    },
    [actions],
  );

  const handleActionConfirm = () => {
    if (!actionConfirm) return;
    const id = actionConfirm.waiting.waitingId;
    if (actionConfirm.type === 'call') actions.call.mutate(id);
    else if (actionConfirm.type === 'cancel') actions.cancel.mutate(id);
    else if (actionConfirm.type === 'skip') actions.skip.mutate(id);
    setActionConfirm(null);
  };

  const handleCloseConfirm = () => {
    actions.toggle.mutate(false);
    setCloseConfirmOpen(false);
  };

  if (boothId === null) return null;

  const isOpen = myBooth?.waitingOpen ?? false;
  const togglePending = actions.toggle.isPending;
  const pendingCount = allWaitings.filter(
    (w) => w.status === 'WAITING' || w.status === 'CALLED',
  ).length;

  return (
    <div className="flex flex-col gap-3">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'rounded-xl px-3 py-2 text-[13px] font-medium',
            toast.type === 'success'
              ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
              : 'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]',
          ].join(' ')}
        >
          {toast.message}
        </div>
      )}

      {!isOpen && !waitingsQuery.isLoading && (
        <ClosedView
          pendingCount={pendingCount}
          onStart={() => actions.toggle.mutate(true)}
          starting={togglePending}
        />
      )}

      {isOpen && (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCloseConfirmOpen(true)}
              disabled={togglePending}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--admin-success-soft)] px-3 text-[13px] font-semibold text-[var(--admin-success)] ring-1 ring-[var(--admin-success)]/30 transition-colors hover:bg-[var(--admin-success-soft)]/70 disabled:opacity-60"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--admin-success)] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--admin-success)]" />
              </span>
              접수중
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setInsertOpen(true)}
                className="flex h-9 items-center gap-1 rounded-lg bg-[var(--admin-surface)] px-3 text-[13px] font-semibold text-[var(--admin-text)] ring-1 ring-[var(--admin-border)] hover:bg-[var(--admin-surface-hover)]"
              >
                <Plus size={14} />
                중간 삽입
              </button>
              <button
                type="button"
                onClick={() => setPastOpen(true)}
                className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)]"
                aria-label="지난 기록 보기"
              >
                <History size={14} />
                <span className="hidden sm:inline">지난 기록</span>
              </button>
            </div>
          </div>

          {waitingsQuery.isError && (
            <div
              role="alert"
              className="rounded-xl bg-[var(--admin-danger-soft)] px-3 py-2 text-[13px] text-[var(--admin-danger)]"
            >
              {waitingsQuery.error instanceof ApiClientError
                ? waitingsQuery.error.message
                : '대기 목록을 불러오지 못했어요.'}
            </div>
          )}

          {waitingsQuery.data && (
            <KanbanBoard
              boothId={boothId}
              waitings={allWaitings}
              onAction={handleAction}
              onReorder={handleReorder}
            />
          )}
        </>
      )}

      {waitingsQuery.isLoading && (
        <div className="grid gap-2 md:grid-cols-3">
          {[0, 1, 2].map((c) => (
            <div
              key={c}
              className="flex flex-col gap-1.5 rounded-2xl bg-[var(--admin-surface-hover)]/60 p-2"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--admin-surface)]" />
              ))}
            </div>
          ))}
        </div>
      )}

      <PastRecordsSheet open={pastOpen} onClose={() => setPastOpen(false)} waitings={allWaitings} />

      <WaitingInsertSheet
        open={insertOpen}
        onClose={() => setInsertOpen(false)}
        boothId={boothId}
        waitings={allWaitings}
        onSuccess={(msg) => showToast('success', msg)}
        onError={(msg) => showToast('error', msg)}
      />

      <BottomSheet
        open={actionConfirm !== null}
        onClose={() => setActionConfirm(null)}
        title={
          actionConfirm
            ? `#${actionConfirm.waiting.waitingNumber} ${actionConfirm.waiting.name}`
            : undefined
        }
      >
        {actionConfirm && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[var(--admin-text)]">
                {ACTION_CONFIRM_META[actionConfirm.type].title}
              </p>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                {ACTION_CONFIRM_META[actionConfirm.type].desc}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActionConfirm(null)}
                disabled={actions.anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3 text-[15px] font-semibold text-[var(--admin-text)]"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleActionConfirm}
                disabled={actions.anyPending}
                className={[
                  'flex-1 rounded-xl py-3 text-[15px] font-semibold text-white disabled:opacity-60',
                  ACTION_CONFIRM_META[actionConfirm.type].danger
                    ? 'bg-[var(--admin-danger)]'
                    : 'bg-[var(--admin-primary)]',
                ].join(' ')}
              >
                {actions.anyPending
                  ? '처리 중...'
                  : ACTION_CONFIRM_META[actionConfirm.type].confirmLabel}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        title="접수를 중단할까요?"
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[15px] font-semibold text-[var(--admin-text)]">
              새 손님은 더 이상 줄을 설 수 없어요
            </p>
            <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
              {pendingCount > 0
                ? `이미 대기 중인 ${pendingCount}팀은 다시 접수를 시작하면 계속 처리할 수 있어요.`
                : '필요할 때 다시 접수를 시작할 수 있어요.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCloseConfirmOpen(false)}
              disabled={togglePending}
              className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3 text-[15px] font-semibold text-[var(--admin-text)]"
            >
              계속 받기
            </button>
            <button
              type="button"
              onClick={handleCloseConfirm}
              disabled={togglePending}
              className="flex-1 rounded-xl bg-[var(--admin-danger)] py-3 text-[15px] font-semibold text-white disabled:opacity-60"
            >
              {togglePending ? '중단 중...' : '접수 중단'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

interface ClosedViewProps {
  pendingCount: number;
  onStart: () => void;
  starting: boolean;
}

function ClosedView({ pendingCount, onStart, starting }: ClosedViewProps) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 rounded-2xl bg-[var(--admin-surface)] px-6 py-12 text-center ring-1 ring-[var(--admin-border)]">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--admin-surface-hover)]">
        <PowerOff size={40} className="text-[var(--admin-text-faint)]" strokeWidth={1.6} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[20px] font-bold text-[var(--admin-text)]">
          지금은 접수를 받지 않고 있어요
        </h2>
        <p className="text-[14px] text-[var(--admin-text-muted)]">
          접수를 시작하면 손님이 줄을 서서 등록할 수 있어요.
        </p>
      </div>

      {pendingCount > 0 && (
        <p className="max-w-md rounded-xl bg-[var(--admin-warn-soft)] px-4 py-2.5 text-[13px] text-[var(--admin-warn)]">
          아직 처리하지 못한 <strong>{pendingCount}팀</strong>이 있어요. 접수를 시작하면 계속 처리할
          수 있어요.
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={starting}
        className="flex h-12 items-center gap-2 rounded-xl bg-[var(--admin-success)] px-6 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Power size={18} />
        {starting ? '시작하는 중...' : '접수 시작하기'}
      </button>
    </div>
  );
}
