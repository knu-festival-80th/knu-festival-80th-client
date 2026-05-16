import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Eye,
  PlayCircle,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ApiClientError, matchingApi } from '@/apis';
import type {
  MatchingGender,
  MatchingParticipantAdmin,
  MatchingParticipantStatus,
  MatchingParticipantsAdminResponse,
  MatchingStatusResponse,
} from '@/apis';
import { Button, Card, OverflowMenu, SegmentedTabs } from '@/components/admin/ui';

function formatIso(iso: string | null | undefined): string {
  if (!iso) return '-';
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return iso;
  }
}

type StatusFilter = 'ALL' | MatchingParticipantStatus;
type GenderFilter = 'ALL' | MatchingGender;

export default function MatchingOverviewPage() {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: ['admin', 'matchings', 'status'],
    queryFn: matchingApi.getStatus,
    refetchInterval: 10_000,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">인스타팅</h1>
        <p className="text-sm text-[var(--admin-text-muted)]">
          현황 확인, 매칭 실행, 신청자 관리를 한 화면에서 처리합니다.
        </p>
      </div>

      {statusQuery.isLoading && (
        <Card padding="lg">
          <p className="text-sm text-[var(--admin-text-muted)]">불러오는 중...</p>
        </Card>
      )}

      {statusQuery.isError && (
        <ErrorBanner
          message={
            statusQuery.error instanceof ApiClientError
              ? statusQuery.error.message
              : '상태를 불러오지 못했습니다.'
          }
        />
      )}

      {statusQuery.data && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-5">
            <ScheduleCard status={statusQuery.data} />

            <JobsCard
              onJobRun={() => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] });
              }}
            />

            <ParticipantsSection festivalDays={statusQuery.data.festivalDays} />
          </div>

          <UserPreviewColumn status={statusQuery.data} />
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
    >
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}

function ScheduleCard({ status }: { status: MatchingStatusResponse }) {
  return (
    <Card padding="md" borderLeft={status.status === 'OPEN' ? 'var(--admin-success)' : '#b45309'}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--admin-text)]">현황</h2>
          <Pill on={status.status === 'OPEN'} onLabel="OPEN" offLabel="PAUSED" />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-[var(--admin-text-muted)]">신청창 마감</dt>
          <dd className="tabular text-right text-[var(--admin-text)]">
            {formatIso(status.registrationDeadline)}
          </dd>
          <dt className="text-[var(--admin-text-muted)]">결과창 오픈</dt>
          <dd className="tabular text-right text-[var(--admin-text)]">
            {formatIso(status.resultOpenAt)}
          </dd>
          <dt className="text-[var(--admin-text-muted)]">신청창 활성</dt>
          <dd className="text-right">
            <Pill on={status.registrationOpen} onLabel="진행 중" offLabel="닫힘" />
          </dd>
          <dt className="text-[var(--admin-text-muted)]">결과창 공개</dt>
          <dd className="text-right">
            <Pill on={status.resultOpen} onLabel="공개 중" offLabel="닫힘" />
          </dd>
          <dt className="text-[var(--admin-text-muted)]">대기 / 매칭 / 미매칭</dt>
          <dd className="tabular text-right text-[var(--admin-text)]">
            {status.pendingCount} / {status.matchedCount} / {status.unmatchedCount}
          </dd>
          <dt className="text-[var(--admin-text-muted)]">신청 (남 / 여)</dt>
          <dd className="tabular text-right text-[var(--admin-text)]">
            {status.malePendingCount} / {status.femalePendingCount}
          </dd>
        </dl>
      </div>
    </Card>
  );
}

function Pill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        on
          ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
          : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]',
      ].join(' ')}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}

interface JobsCardProps {
  onJobRun: () => void;
}

function JobsCard({ onJobRun }: JobsCardProps) {
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runNowMutation = useMutation({
    mutationFn: matchingApi.runJob,
    onSuccess: (data) => {
      setErrorMessage(null);
      setResultMessage(`${data.matchedPairCount}쌍 매칭, ${data.unmatchedCount}명 미매칭`);
      onJobRun();
    },
    onError: (error: unknown) => {
      setResultMessage(null);
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '매칭 실행에 실패했습니다.',
      );
    },
  });

  const handleRunNow = () => {
    if (!window.confirm('매칭 잡을 실행합니다. 계속할까요?')) return;
    runNowMutation.mutate();
  };

  return (
    <Card padding="md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
            <PlayCircle size={16} />
            매칭 실행
          </h2>
          <p className="text-xs text-[var(--admin-text-muted)]">
            21:00~22:00 자동 실행. 수동 실행이 필요한 경우만 사용하세요.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleRunNow}
          disabled={runNowMutation.isPending}
          iconLeft={<PlayCircle size={13} />}
        >
          {runNowMutation.isPending ? '실행 중...' : '지금 실행'}
        </Button>
      </div>

      {resultMessage && (
        <div
          role="status"
          className="mt-3 flex items-center gap-2 rounded-md border border-[var(--admin-success)]/30 bg-[var(--admin-success-soft)] px-3 py-2 text-sm text-[var(--admin-success)]"
        >
          <CheckCircle2 size={14} />
          <span>{resultMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mt-3">
          <ErrorBanner message={errorMessage} />
        </div>
      )}
    </Card>
  );
}

// ---- Participants Section (inlined from MatchingParticipantsPage) ----

function ParticipantsSection({ festivalDays }: { festivalDays: string[] }) {
  const queryClient = useQueryClient();

  const [festivalDay, setFestivalDay] = useState<string>(festivalDays[0] ?? '');
  const [prevFirstDay, setPrevFirstDay] = useState<string>(festivalDays[0] ?? '');
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

  const participantsQuery = useQuery({
    queryKey: [
      'admin',
      'matchings',
      'participants',
      { festivalDay, statusFilter, genderFilter, search: debouncedSearch.trim() },
    ],
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] }),
    onError: (error: unknown) => {
      setErrorBanner(error instanceof ApiClientError ? error.message : '삭제에 실패했습니다.');
    },
  });

  const resetMutation = useMutation({
    mutationFn: matchingApi.resetParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] }),
    onError: (error: unknown) => {
      setErrorBanner(error instanceof ApiClientError ? error.message : '리셋에 실패했습니다.');
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, matchedInstagramId }: { id: number; matchedInstagramId: string }) =>
      matchingApi.updateMatch(id, { matchedInstagramId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] }),
    onError: (error: unknown) => {
      setErrorBanner(error instanceof ApiClientError ? error.message : '매칭 변경에 실패했습니다.');
    },
  });

  const counts = useMemo(() => {
    const pending = participants.filter((p) => p.status === 'PENDING').length;
    const matched = participants.filter((p) => p.status === 'MATCHED').length;
    const unmatched = participants.filter((p) => p.status === 'UNMATCHED').length;
    return { all: participants.length, pending, matched, unmatched };
  }, [participants]);

  const handleDelete = (p: MatchingParticipantAdmin) => {
    if (!window.confirm(`@${p.instagramId} 삭제할까요? 같은 ID로 재신청 가능해집니다.`)) return;
    setErrorBanner(null);
    deleteMutation.mutate(p.participantId);
  };

  const handleReset = (p: MatchingParticipantAdmin) => {
    if (!window.confirm(`@${p.instagramId}을(를) PENDING으로 초기화할까요?`)) return;
    setErrorBanner(null);
    resetMutation.mutate(p.participantId);
  };

  const busy = deleteMutation.isPending || resetMutation.isPending || updateMatchMutation.isPending;

  return (
    <div className="flex flex-col gap-3">
      <Card padding="md">
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
            <Users size={16} />
            신청자 관리
          </h2>

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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="instagramId 검색"
                className="h-9 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] pr-3 pl-8 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-faint)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20"
              />
            </div>
          </div>
        </div>
      </Card>

      {errorBanner && <ErrorBanner message={errorBanner} />}

      {participantsQuery.isError && (
        <ErrorBanner
          message={
            participantsQuery.error instanceof ApiClientError
              ? participantsQuery.error.message
              : '신청자 목록을 불러오지 못했습니다.'
          }
        />
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
                onUpdateMatch={(matchedId) =>
                  updateMatchMutation.mutate({
                    id: participant.participantId,
                    matchedInstagramId: matchedId,
                  })
                }
                busy={busy}
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
  onUpdateMatch: (matchedInstagramId: string) => void;
  busy: boolean;
}

function ParticipantRow({
  participant,
  even,
  onDelete,
  onReset,
  onUpdateMatch,
  busy,
}: ParticipantRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(participant.matchedInstagramId ?? '');

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

  const handleEditSubmit = () => {
    const trimmed = editValue.trim().replace(/^@/, '');
    if (!trimmed) return;
    onUpdateMatch(trimmed);
    setEditing(false);
  };

  const matchCell = editing ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleEditSubmit();
      }}
      className="flex items-center gap-1"
    >
      <input
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="h-6 w-24 rounded border border-[var(--admin-primary)] bg-white px-1.5 text-xs outline-none"
        placeholder="instagram ID"
      />
      <button
        type="submit"
        className="text-[var(--admin-success)] hover:opacity-70"
        disabled={busy}
      >
        <CheckCircle2 size={14} />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-[var(--admin-text-muted)] hover:opacity-70"
      >
        <X size={14} />
      </button>
    </form>
  ) : (
    <div className="flex items-center gap-1 min-w-0">
      <span className="truncate text-[var(--admin-text-muted)]">
        {participant.matchedInstagramId ? `@${participant.matchedInstagramId}` : '-'}
      </span>
      {participant.status === 'MATCHED' && (
        <button
          type="button"
          onClick={() => {
            setEditValue(participant.matchedInstagramId ?? '');
            setEditing(true);
          }}
          className="shrink-0 text-[var(--admin-text-faint)] hover:text-[var(--admin-primary)]"
        >
          <Edit3 size={11} />
        </button>
      )}
    </div>
  );

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
        <div>{matchCell}</div>
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
              {
                label: '매칭 상대 변경',
                onClick: () => {
                  setEditValue(participant.matchedInstagramId ?? '');
                  setEditing(true);
                },
                disabled: participant.status !== 'MATCHED',
              },
              { label: '삭제', onClick: onDelete, danger: true, disabled: busy },
            ]}
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--admin-text-muted)]">
          <span className="tabular">{participant.maskedPhone}</span>
          {editing
            ? matchCell
            : participant.matchedInstagramId && (
                <span className="truncate">→ @{participant.matchedInstagramId}</span>
              )}
        </div>
      </div>
    </li>
  );
}

// ---- User Preview ----

function UserPreviewColumn({ status }: { status: MatchingStatusResponse }) {
  return (
    <div className="lg:sticky lg:top-4 lg:self-start">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text-muted)]">
        <Eye size={12} /> 사용자에게 보이는 화면
      </div>
      <PhoneFrame>
        <UserInstatingPreview status={status} />
      </PhoneFrame>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--admin-border-strong)] bg-white shadow-sm">
      <div className="max-h-[640px] overflow-y-auto">{children}</div>
    </div>
  );
}

function UserInstatingPreview({ status }: { status: MatchingStatusResponse }) {
  return (
    <div className="flex flex-col">
      <nav className="flex gap-7 border-b border-border bg-white px-5">
        {['소개', '인스타팅 신청하기', '결과 조회'].map((label, i) => (
          <span
            key={label}
            className={`relative py-2.5 font-wanted-sans text-[13px] tracking-tight ${
              i === 0 ? 'font-bold text-ink' : 'text-gray'
            }`}
          >
            {label}
            {i === 0 && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-sub-red" />}
          </span>
        ))}
      </nav>

      <div className="relative flex h-[140px] w-full flex-col items-start justify-end overflow-hidden px-5 py-5">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(-55.79deg, rgb(255, 231, 110) 4.74%, rgb(255, 101, 104) 82.48%)',
          }}
        />
        <h2 className="relative font-wanted-sans text-[22px] font-bold leading-[1.3] tracking-tight text-ink">
          두근두근 인스타팅
        </h2>
      </div>

      <PreviewCountDown deadlineIso={status.registrationDeadline} resultOpen={status.resultOpen} />

      <div className="flex w-full flex-col gap-3 bg-white px-5 pb-5">
        <div className="flex flex-col gap-1">
          <p className="font-wanted-sans text-[13px] font-bold tracking-tight text-ink">
            Applicants
          </p>
          <p className="font-wanted-sans text-[15px] font-medium tracking-tight text-ink">
            현재 신청자 현황
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2 rounded-lg bg-[rgba(85,255,150,0.1)] p-3">
            <p className="font-wanted-sans text-[12px] tracking-tight text-[#808080]">남성</p>
            <p className="font-wanted-sans text-[18px] font-bold tabular-nums text-[#0cc493]">
              {status.malePendingCount}명
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-2 rounded-lg bg-[rgba(255,240,101,0.15)] p-3">
            <p className="font-wanted-sans text-[12px] tracking-tight text-[#808080]">여성</p>
            <p className="font-wanted-sans text-[18px] font-bold tabular-nums text-[#f89100]">
              {status.femalePendingCount}명
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCountDown({
  deadlineIso,
  resultOpen,
}: {
  deadlineIso: string | null;
  resultOpen: boolean;
}) {
  const label = resultOpen ? '인스타팅 매칭 공개까지' : '인스타팅 신청 마감까지';
  const timeLeft = useTimeLeft(deadlineIso);

  return (
    <div className="flex w-full flex-col gap-3 bg-white px-5 pb-5 pt-4">
      <div className="flex flex-col gap-1">
        <p className="font-wanted-sans text-[13px] font-bold tracking-tight text-ink">Count Down</p>
        <p className="font-wanted-sans text-[15px] font-medium tracking-tight text-ink">{label}</p>
      </div>
      <div className="flex items-start gap-1.5">
        {[
          { value: timeLeft.days, unit: '일' },
          { value: timeLeft.hours, unit: '시간' },
          { value: timeLeft.minutes, unit: '분' },
          { value: timeLeft.seconds, unit: '초' },
        ].map(({ value, unit }, i, arr) => (
          <div key={unit} className="contents">
            <div className="flex flex-col items-center">
              <span className="font-wanted-sans text-[28px] font-bold leading-tight tracking-tight text-sub-red tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
              <span className="font-wanted-sans text-[11px] leading-none tracking-tight text-text-disabled">
                {unit}
              </span>
            </div>
            {i < arr.length - 1 && (
              <span className="font-wanted-sans text-[26px] font-normal leading-none text-[#ccc]">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function useTimeLeft(deadlineIso: string | null) {
  const target = useMemo(() => {
    if (!deadlineIso) return null;
    const date = new Date(deadlineIso);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [deadlineIso]);

  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(target));
  const [prevTarget, setPrevTarget] = useState(target);

  if (target !== prevTarget) {
    setPrevTarget(target);
    setTimeLeft(calcTimeLeft(target));
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function calcTimeLeft(deadline: Date | null) {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, deadline.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
