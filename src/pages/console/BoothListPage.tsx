import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, KeyRound, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import type { BoothListItem, BoothSort } from '@/apis';
import { Button } from '@/components/admin/ui';

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

  const booths = boothsQuery.data ?? [];
  const activeCount = booths.filter((b) => b.waitingOpen).length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 border-b border-[var(--admin-border)] pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="flex flex-col gap-3">
          <span className="eyebrow text-[var(--admin-primary)]">Booth Registry</span>
          <h1 className="text-display1 leading-[1.05] font-bold tracking-tight text-[var(--admin-text)]">
            부스
          </h1>
          {boothsQuery.data && (
            <p className="text-body2 text-[var(--admin-text-muted)]">
              <span className="tabular text-[var(--admin-text)]">{booths.length}</span>개 등록됨 ·{' '}
              <span className="tabular text-[var(--admin-text)]">{activeCount}</span>개 접수중
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedSort value={sort} onChange={setSort} />
          <Button
            type="button"
            onClick={() => navigate('/console/booths/new')}
            iconLeft={<Plus size={16} strokeWidth={2.25} />}
          >
            신규 등록
          </Button>
        </div>
      </header>

      {boothsQuery.isError && (
        <p
          role="alert"
          className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
        >
          {boothsQuery.error instanceof ApiClientError
            ? boothsQuery.error.message
            : '목록을 불러오지 못했습니다.'}
        </p>
      )}

      {boothsQuery.isLoading && <SkeletonRows />}

      {boothsQuery.data && booths.length === 0 && <EmptyState />}

      {boothsQuery.data && booths.length > 0 && (
        <ul className="flex flex-col">
          {booths.map((booth, index) => (
            <BoothRow
              key={booth.boothId}
              booth={booth}
              isFirst={index === 0}
              isPending={deleteMutation.isPending}
              onEdit={() => navigate(`/console/booths/${booth.boothId}/edit`)}
              onChangePassword={() => navigate(`/console/booths/${booth.boothId}/password`)}
              onDelete={() => handleDelete(booth.boothId, booth.name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SegmentedSortProps {
  value: BoothSort;
  onChange: (value: BoothSort) => void;
}

function SegmentedSort({ value, onChange }: SegmentedSortProps) {
  const options: { value: BoothSort; label: string }[] = [
    { value: 'likes', label: '좋아요 순' },
    { value: 'waiting-asc', label: '대기 적은 순' },
  ];
  return (
    <div
      role="tablist"
      aria-label="정렬 기준"
      className="inline-flex items-center gap-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={[
              'rounded-sm px-3 py-1.5 text-body2 transition-colors duration-150',
              active
                ? 'bg-[var(--admin-primary)] font-semibold text-[var(--admin-primary-fg)]'
                : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface BoothRowProps {
  booth: BoothListItem;
  isFirst: boolean;
  isPending: boolean;
  onEdit: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
}

function BoothRow({
  booth,
  isFirst,
  isPending,
  onEdit,
  onChangePassword,
  onDelete,
}: BoothRowProps) {
  return (
    <li
      className={[
        'group grid grid-cols-1 gap-4 py-5 sm:grid-cols-12 sm:items-center sm:gap-6',
        'border-b border-[var(--admin-border)]',
        isFirst ? 'border-t' : '',
      ].join(' ')}
    >
      <div className="flex flex-col gap-1.5 sm:col-span-6">
        <div className="flex items-baseline gap-3">
          <span className="eyebrow tabular text-[var(--admin-primary)]">
            #{booth.boothId.toString().padStart(2, '0')}
          </span>
          <span className="text-subheading font-semibold text-[var(--admin-text)]">
            {booth.name}
          </span>
        </div>
        {booth.description && (
          <p className="line-clamp-1 text-body2 text-[var(--admin-text-muted)]">
            {booth.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:col-span-3 sm:flex-nowrap">
        <Metric icon={<Heart size={14} strokeWidth={2} />} value={booth.likeCount} />
        <Metric
          icon={<Users size={14} strokeWidth={2} />}
          value={booth.currentWaitingTeams}
          suffix="팀"
        />
      </div>

      <div className="sm:col-span-3 sm:justify-self-start">
        <WaitingPill open={booth.waitingOpen} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:col-span-12 sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          iconLeft={<Pencil size={13} />}
        >
          정보 수정
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onChangePassword}
          iconLeft={<KeyRound size={13} />}
        >
          비번 변경
        </Button>
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
    </li>
  );
}

function Metric({
  icon,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-body2 text-[var(--admin-text-muted)]">
      <span className="text-[var(--admin-text-faint)]">{icon}</span>
      <span className="tabular text-[var(--admin-text)]">{value.toLocaleString()}</span>
      {suffix && <span className="text-caption text-[var(--admin-text-faint)]">{suffix}</span>}
    </span>
  );
}

function WaitingPill({ open }: { open: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-body2 text-[var(--admin-text-muted)]">
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          open ? 'bg-[var(--admin-success)]' : 'bg-[var(--admin-text-faint)]',
        ].join(' ')}
      />
      <span className={open ? 'text-[var(--admin-text)]' : 'text-[var(--admin-text-muted)]'}>
        {open ? '접수중' : '접수중단'}
      </span>
    </span>
  );
}

function SkeletonRows() {
  return (
    <ul className="flex flex-col">
      {Array.from({ length: 3 }).map((_, idx) => (
        <li
          key={idx}
          className={[
            'grid grid-cols-12 items-center gap-6 py-5',
            'border-b border-[var(--admin-border)]',
            idx === 0 ? 'border-t' : '',
          ].join(' ')}
        >
          <div className="col-span-6 flex flex-col gap-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--admin-surface-strong)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--admin-surface-strong)]" />
          </div>
          <div className="col-span-3 h-4 w-24 animate-pulse rounded bg-[var(--admin-surface-strong)]" />
          <div className="col-span-3 h-4 w-20 animate-pulse rounded bg-[var(--admin-surface-strong)]" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-4 rounded-[14px] border border-dashed border-[var(--admin-border-strong)] py-20 text-center">
      <span className="eyebrow text-[var(--admin-text-faint)]">Empty Registry</span>
      <p className="max-w-xs text-body1 text-[var(--admin-text-muted)]">
        아직 등록된 부스가 없습니다. 첫 부스를 등록해 주세요.
      </p>
      <Button
        type="button"
        onClick={() => navigate('/console/booths/new')}
        iconLeft={<Plus size={16} />}
        className="mt-2"
      >
        신규 등록
      </Button>
    </div>
  );
}
