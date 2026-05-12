import { useQuery } from '@tanstack/react-query';
import { History, Plus, Power, PowerOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, boothApi, waitingApi } from '@/apis';
import type { WaitingItem } from '@/apis';
import { BottomSheet } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

import KanbanBoard from './waiting/KanbanBoard';
import PastRecordsSheet from './waiting/PastRecordsSheet';
import { useWaitingActions } from './waiting/useWaitingActions';
import type { WaitingActionType } from './waiting/WaitingCard';

interface ConfirmState {
  type: 'call' | 'cancel' | 'skip';
  waiting: WaitingItem;
}

const CONFIRM_META: Record<
  ConfirmState['type'],
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

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [pastOpen, setPastOpen] = useState(false);
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
        setConfirm({ type, waiting });
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

  const handleConfirm = () => {
    if (!confirm) return;
    const id = confirm.waiting.waitingId;
    if (confirm.type === 'call') actions.call.mutate(id);
    else if (confirm.type === 'cancel') actions.cancel.mutate(id);
    else if (confirm.type === 'skip') actions.skip.mutate(id);
    setConfirm(null);
  };

  if (boothId === null) return null;

  const isOpen = myBooth?.waitingOpen ?? false;
  const togglePending = actions.toggle.isPending;

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

      <div className="flex items-center gap-2">
        {myBooth && (
          <button
            type="button"
            onClick={() => actions.toggle.mutate(!isOpen)}
            disabled={togglePending}
            className={[
              'flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors disabled:opacity-60',
              isOpen
                ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)] ring-1 ring-[var(--admin-success)]/30'
                : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)] ring-1 ring-[var(--admin-border)]',
            ].join(' ')}
            aria-pressed={isOpen}
          >
            {isOpen ? <Power size={14} /> : <PowerOff size={14} />}
            {isOpen ? '접수중' : '중단'}
          </button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/booth/manage/waitings/insert"
            className="flex h-9 items-center gap-1 rounded-lg bg-[var(--admin-surface)] px-3 text-[13px] font-semibold text-[var(--admin-text)] ring-1 ring-[var(--admin-border)] hover:bg-[var(--admin-surface-hover)]"
          >
            <Plus size={14} />
            중간 삽입
          </Link>
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

      {waitingsQuery.data && (
        <KanbanBoard
          boothId={boothId}
          waitings={allWaitings}
          onAction={handleAction}
          onReorder={handleReorder}
        />
      )}

      <PastRecordsSheet open={pastOpen} onClose={() => setPastOpen(false)} waitings={allWaitings} />

      <BottomSheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm ? `#${confirm.waiting.waitingNumber} ${confirm.waiting.name}` : undefined}
      >
        {confirm && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[var(--admin-text)]">
                {CONFIRM_META[confirm.type].title}
              </p>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                {CONFIRM_META[confirm.type].desc}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                disabled={actions.anyPending}
                className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3 text-[15px] font-semibold text-[var(--admin-text)]"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={actions.anyPending}
                className={[
                  'flex-1 rounded-xl py-3 text-[15px] font-semibold text-white disabled:opacity-60',
                  CONFIRM_META[confirm.type].danger
                    ? 'bg-[var(--admin-danger)]'
                    : 'bg-[var(--admin-primary)]',
                ].join(' ')}
              >
                {actions.anyPending ? '처리 중...' : CONFIRM_META[confirm.type].confirmLabel}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
