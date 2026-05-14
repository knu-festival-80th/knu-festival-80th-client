import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, matchingApi } from '@/apis';
import type {
  MatchingGender,
  MatchingParticipantAdmin,
  MatchingParticipantStatus,
  MatchingParticipantsAdminResponse,
} from '@/apis';
import { Button, Card, OverflowMenu, SegmentedTabs } from '@/components/admin/ui';

type StatusFilter = 'ALL' | MatchingParticipantStatus;
type GenderFilter = 'ALL' | MatchingGender;

export default function MatchingParticipantsPage() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['admin', 'matchings', 'status'],
    queryFn: matchingApi.getStatus,
  });
  const festivalDays = useMemo(
    () => statusQuery.data?.festivalDays ?? [],
    [statusQuery.data?.festivalDays],
  );

  const [festivalDay, setFestivalDay] = useState<string>('');
  const [prevFirstDay, setPrevFirstDay] = useState<string>('');
  const firstDay = festivalDays[0] ?? '';
  if (firstDay !== prevFirstDay) {
    setPrevFirstDay(firstDay);
    if (!festivalDays.includes(festivalDay)) {
      setFestivalDay(firstDay);
    }
  }

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('ALL');
  const [search, setSearch] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const queryKey = [
    'admin',
    'matchings',
    'participants',
    { festivalDay, statusFilter, genderFilter, search: debouncedSearch.trim() },
  ] as const;

  const participantsQuery = useQuery({
    queryKey,
    queryFn: () =>
      matchingApi.listParticipants({
        festivalDay,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        gender: genderFilter === 'ALL' ? undefined : genderFilter,
        search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      }),
    enabled: Boolean(festivalDay),
  });

  const data: MatchingParticipantsAdminResponse | undefined = participantsQuery.data;
  const participants = useMemo(() => data?.participants ?? [], [data?.participants]);

  const deleteMutation = useMutation({
    mutationFn: matchingApi.deleteParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] });
    },
    onError: (error: unknown) => {
      setErrorBanner(error instanceof ApiClientError ? error.message : '삭제에 실패했습니다.');
    },
  });

  const resetMutation = useMutation({
    mutationFn: matchingApi.resetParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] });
    },
    onError: (error: unknown) => {
      setErrorBanner(error instanceof ApiClientError ? error.message : '리셋에 실패했습니다.');
    },
  });

  const counts = useMemo(() => {
    const pending = participants.filter((p) => p.status === 'PENDING').length;
    const matched = participants.filter((p) => p.status === 'MATCHED').length;
    const unmatched = participants.filter((p) => p.status === 'UNMATCHED').length;
    return { all: participants.length, pending, matched, unmatched };
  }, [participants]);

  const handleDelete = (participant: MatchingParticipantAdmin) => {
    if (
      !window.confirm(
        `@${participant.instagramId} 신청자를 삭제할까요?\n삭제 후 같은 인스타그램 ID로 재신청이 가능합니다.`,
      )
    )
      return;
    setErrorBanner(null);
    deleteMutation.mutate(participant.participantId);
  };

  const handleReset = (participant: MatchingParticipantAdmin) => {
    if (
      !window.confirm(
        `@${participant.instagramId} 신청자의 매칭 결과를 초기화(PENDING)할까요?\n다음 매칭 실행에서 다시 매칭됩니다.`,
      )
    )
      return;
    setErrorBanner(null);
    resetMutation.mutate(participant.participantId);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/console/matching"
            className="inline-flex items-center gap-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          >
            <ArrowLeft size={14} />
            인스타팅 개요
          </Link>
          <span className="text-[var(--admin-text-faint)]">/</span>
          <span className="text-[var(--admin-text-muted)]">신청자 관리</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--admin-text)]">신청자 관리</h1>
      </div>

      <Card padding="md">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--admin-text-muted)]">축제 일자</span>
            {festivalDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setFestivalDay(day)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  day === festivalDay
                    ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]'
                    : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                ].join(' ')}
              >
                {day}
              </button>
            ))}
          </div>

          <SegmentedTabs<StatusFilter>
            value={statusFilter}
            onChange={setStatusFilter}
            size="sm"
            items={[
              { value: 'ALL', label: '전체', count: counts.all },
              { value: 'PENDING', label: '대기', count: counts.pending },
              {
                value: 'MATCHED',
                label: '매칭',
                count: counts.matched,
                accentVar: '--admin-success',
              },
              {
                value: 'UNMATCHED',
                label: '미매칭',
                count: counts.unmatched,
                accentVar: '--admin-danger',
              },
            ]}
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-md bg-[var(--admin-surface-hover)] p-0.5 text-xs">
              {[
                { value: 'ALL' as const, label: '전체' },
                { value: 'MALE' as const, label: '남' },
                { value: 'FEMALE' as const, label: '여' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGenderFilter(opt.value)}
                  className={[
                    'rounded-sm px-2.5 py-1 font-medium transition-colors',
                    genderFilter === opt.value
                      ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm'
                      : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="relative ml-auto flex-1 sm:max-w-xs">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--admin-text-faint)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="instagramId 검색"
                className="h-9 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] pr-3 pl-8 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-faint)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20"
              />
            </div>
          </div>
        </div>
      </Card>

      {errorBanner && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          <AlertCircle size={14} />
          <span>{errorBanner}</span>
        </div>
      )}

      {participantsQuery.isError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          <AlertCircle size={14} />
          <span>
            {participantsQuery.error instanceof ApiClientError
              ? participantsQuery.error.message
              : '신청자 목록을 불러오지 못했습니다.'}
          </span>
        </div>
      )}

      {participantsQuery.isLoading && (
        <Card padding="sm">
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <li
                key={idx}
                className="h-12 animate-pulse rounded bg-[var(--admin-surface-hover)]"
              />
            ))}
          </ul>
        </Card>
      )}

      {participantsQuery.data && participants.length === 0 && (
        <Card padding="lg">
          <p className="text-center text-sm text-[var(--admin-text-muted)]">
            조건에 맞는 신청자가 없습니다.
          </p>
        </Card>
      )}

      {participantsQuery.data && participants.length > 0 && (
        <Card padding="none">
          <div className="hidden border-b border-[var(--admin-border)] px-5 py-2.5 text-xs font-medium text-[var(--admin-text-muted)] sm:grid sm:grid-cols-[1.5rem_1fr_5rem_6rem_7rem_8rem_7rem] sm:items-center sm:gap-3">
            <div></div>
            <div>Instagram ID</div>
            <div>성별</div>
            <div>상태</div>
            <div>매칭 상대</div>
            <div>휴대폰</div>
            <div className="text-right">액션</div>
          </div>
          <ul>
            {participants.map((participant, idx) => (
              <ParticipantRow
                key={participant.participantId}
                participant={participant}
                even={idx % 2 === 1}
                onDelete={() => handleDelete(participant)}
                onReset={() => handleReset(participant)}
                busy={deleteMutation.isPending || resetMutation.isPending}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

interface ParticipantRowProps {
  participant: MatchingParticipantAdmin;
  even: boolean;
  onDelete: () => void;
  onReset: () => void;
  busy: boolean;
}

function ParticipantRow({ participant, even, onDelete, onReset, busy }: ParticipantRowProps) {
  const genderLabel = participant.gender === 'MALE' ? '남' : '여';
  const genderTone =
    participant.gender === 'MALE' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700';
  const statusBadge = (() => {
    switch (participant.status) {
      case 'PENDING':
        return 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]';
      case 'MATCHED':
        return 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]';
      case 'UNMATCHED':
        return 'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]';
    }
  })();
  const statusLabel =
    participant.status === 'PENDING'
      ? '대기'
      : participant.status === 'MATCHED'
        ? '매칭'
        : '미매칭';

  return (
    <li
      className={[
        'group border-b border-[var(--admin-border)] last:border-b-0',
        even ? 'bg-[var(--admin-surface-hover)]/40' : '',
        'hover:bg-[var(--admin-surface-hover)]',
      ].join(' ')}
    >
      <div className="hidden px-5 py-3 sm:grid sm:grid-cols-[1.5rem_1fr_5rem_6rem_7rem_8rem_7rem] sm:items-center sm:gap-3 sm:text-sm">
        <div className="tabular text-[11px] text-[var(--admin-text-faint)]">
          #{participant.participantId}
        </div>
        <div className="min-w-0 truncate">
          <a
            href={`https://instagram.com/${participant.instagramId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--admin-text)] hover:underline"
          >
            @{participant.instagramId}
          </a>
        </div>
        <div>
          <span
            className={[
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              genderTone,
            ].join(' ')}
          >
            {genderLabel}
          </span>
        </div>
        <div>
          <span
            className={[
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              statusBadge,
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>
        <div className="min-w-0 truncate text-[var(--admin-text-muted)]">
          {participant.matchedInstagramId ? `@${participant.matchedInstagramId}` : '-'}
        </div>
        <div className="tabular text-[var(--admin-text-muted)]">{participant.maskedPhone}</div>
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={busy || participant.status === 'PENDING'}
            iconLeft={<RotateCcw size={12} />}
          >
            리셋
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onDelete}
            disabled={busy}
            iconLeft={<Trash2 size={12} />}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-3 py-2.5 sm:hidden">
        <div className="flex items-center gap-2">
          <a
            href={`https://instagram.com/${participant.instagramId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--admin-text)] hover:underline"
          >
            @{participant.instagramId}
          </a>
          <span
            className={[
              'shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
              genderTone,
            ].join(' ')}
          >
            {genderLabel}
          </span>
          <span
            className={[
              'shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
              statusBadge,
            ].join(' ')}
          >
            {statusLabel}
          </span>
          <OverflowMenu
            items={[
              {
                label: '리셋 (PENDING)',
                onClick: onReset,
                disabled: busy || participant.status === 'PENDING',
              },
              { label: '삭제', onClick: onDelete, danger: true, disabled: busy },
            ]}
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--admin-text-muted)]">
          <span className="tabular">{participant.maskedPhone}</span>
          {participant.matchedInstagramId && (
            <span className="truncate">→ @{participant.matchedInstagramId}</span>
          )}
        </div>
      </div>
    </li>
  );
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
