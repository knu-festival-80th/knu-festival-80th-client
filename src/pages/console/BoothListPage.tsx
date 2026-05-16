import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import type { BoothListItem, BoothSort } from '@/apis';
import { Button, Card, OverflowMenu } from '@/components/admin/ui';

export default function BoothListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<BoothSort>('likes');

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort }],
    queryFn: () => boothApi.listAdminBooths(sort),
  });

  const deleteMutation = useMutation({
    mutationFn: boothApi.deleteBooth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : '부스 삭제에 실패했습니다.';
      alert(message);
    },
  });

  const handleDelete = (boothId: number, name: string) => {
    if (window.confirm(`"${name}" 부스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteMutation.mutate(boothId);
    }
  };

  const booths = [...(boothsQuery.data ?? [])].sort((a, b) => a.boothId - b.boothId);
  const activeCount = booths.filter((b) => b.waitingOpen).length;
  const totalWaiting = booths.reduce((sum, b) => sum + b.currentWaitingTeams, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">부스</h1>
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate('/console/booths/new')}
          iconLeft={<Plus size={14} />}
        >
          신규 등록
        </Button>
      </div>

      {boothsQuery.data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            <p className="text-xs text-[var(--admin-text-muted)]">총 부스</p>
            <p className="tabular mt-0.5 text-xl font-bold text-[var(--admin-text)]">
              {booths.length}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            <p className="text-xs text-[var(--admin-text-muted)]">접수중</p>
            <p className="tabular mt-0.5 text-xl font-bold text-[var(--admin-success)]">
              {activeCount}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            <p className="text-xs text-[var(--admin-text-muted)]">총 대기</p>
            <p className="tabular mt-0.5 text-xl font-bold text-[var(--admin-text)]">
              {totalWaiting}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            <p className="text-xs text-[var(--admin-text-muted)]">접수중단</p>
            <p className="tabular mt-0.5 text-xl font-bold text-[var(--admin-text-muted)]">
              {booths.length - activeCount}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <label htmlFor="booth-sort" className="text-xs text-[var(--admin-text-muted)]">
          정렬
        </label>
        <select
          id="booth-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as BoothSort)}
          className="h-9 rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-2.5 text-sm text-[var(--admin-text)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20"
        >
          <option value="likes">좋아요 순</option>
          <option value="waiting-asc">대기 적은 순</option>
        </select>
      </div>

      {boothsQuery.isError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          <AlertCircle size={14} />
          <span>
            {boothsQuery.error instanceof ApiClientError
              ? boothsQuery.error.message
              : '목록을 불러오지 못했습니다.'}
          </span>
        </div>
      )}

      {boothsQuery.isLoading && <SkeletonList />}

      {boothsQuery.data && booths.length === 0 && <EmptyState />}

      {boothsQuery.data && booths.length > 0 && (
        <Card padding="none">
          <div className="hidden border-b border-[var(--admin-border)] px-5 py-2.5 text-xs font-medium text-[var(--admin-text-muted)] sm:grid sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_11rem] sm:items-center sm:gap-4">
            <div>ID</div>
            <div>이름</div>
            <div className="text-right tabular">좋아요</div>
            <div className="text-right tabular">대기</div>
            <div>상태</div>
            <div className="text-right">액션</div>
          </div>
          <ul>
            {booths.map((booth, idx) => (
              <BoothRow
                key={booth.boothId}
                booth={booth}
                even={idx % 2 === 1}
                isPending={deleteMutation.isPending}
                onEdit={() => navigate(`/console/booths/${booth.boothId}/edit`)}
                onChangePassword={() => navigate(`/console/booths/${booth.boothId}/password`)}
                onDelete={() => handleDelete(booth.boothId, booth.name)}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

interface BoothRowProps {
  booth: BoothListItem;
  even: boolean;
  isPending: boolean;
  onEdit: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
}

function BoothRow({ booth, even, isPending, onEdit, onChangePassword, onDelete }: BoothRowProps) {
  const idLabel = `#${booth.boothId.toString().padStart(2, '0')}`;
  const open = booth.waitingOpen;

  return (
    <li
      className={[
        'group border-b border-[var(--admin-border)] last:border-b-0',
        even ? 'bg-[var(--admin-surface-hover)]/50' : '',
        'hover:bg-[var(--admin-surface-hover)]',
      ].join(' ')}
    >
      <div className="hidden px-5 py-3 sm:grid sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_11rem] sm:items-center sm:gap-4 sm:text-sm">
        <div className="tabular text-[var(--admin-text-muted)]">{idLabel}</div>
        <div className="min-w-0">
          <div className="truncate font-medium text-[var(--admin-text)]">{booth.name}</div>
          {booth.department && (
            <div className="hidden truncate text-xs text-[var(--admin-text-muted)] sm:block">
              {booth.department}
            </div>
          )}
        </div>
        <div className="text-right tabular text-[var(--admin-text)]">
          {booth.likeCount.toLocaleString()}
        </div>
        <div className="text-right tabular text-[var(--admin-text)]">
          {booth.currentWaitingTeams.toLocaleString()}
        </div>
        <div>
          <span
            className={[
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              open
                ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]',
            ].join(' ')}
          >
            {open ? '접수중' : '중단'}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1 text-sm opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded px-2 py-1 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]"
          >
            수정
          </button>
          <span className="text-[var(--admin-text-faint)]">·</span>
          <button
            type="button"
            onClick={onChangePassword}
            className="rounded px-2 py-1 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]"
          >
            비번
          </button>
          <span className="text-[var(--admin-text-faint)]">·</span>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onDelete}
            disabled={isPending}
            iconLeft={<Trash2 size={13} />}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3 py-2.5 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="tabular shrink-0 text-[11px] text-[var(--admin-text-faint)]">
            {idLabel}
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-[var(--admin-text)]"
          >
            {booth.name}
          </button>
          <span
            className={[
              'shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
              open
                ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]',
            ].join(' ')}
          >
            {open ? '접수중' : '중단'}
          </span>
          <OverflowMenu
            items={[
              { label: '수정', onClick: onEdit },
              { label: '비밀번호 변경', onClick: onChangePassword },
              { label: '삭제', onClick: onDelete, danger: true, disabled: isPending },
            ]}
          />
        </div>
        <div className="flex items-center gap-3 pl-7 text-[11px] text-[var(--admin-text-muted)]">
          <span className="tabular">
            ♥ <strong className="text-[var(--admin-text)]">{booth.likeCount}</strong>
          </span>
          <span className="tabular">
            대기 <strong className="text-[var(--admin-text)]">{booth.currentWaitingTeams}</strong>팀
          </span>
          {booth.department && (
            <span className="line-clamp-1 min-w-0 flex-1 text-[var(--admin-text-faint)]">
              {booth.department}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function SkeletonList() {
  return (
    <Card padding="sm">
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <li key={idx} className="h-12 animate-pulse rounded bg-[var(--admin-surface-hover)]" />
        ))}
      </ul>
    </Card>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <Card padding="lg">
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-[var(--admin-text-muted)]">등록된 부스가 없습니다.</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => navigate('/console/booths/new')}
          iconLeft={<Plus size={14} />}
        >
          신규 등록
        </Button>
      </div>
    </Card>
  );
}
