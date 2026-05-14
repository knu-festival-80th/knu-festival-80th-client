import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Pause,
  Play,
  PlayCircle,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, matchingApi } from '@/apis';
import type { MatchingOperationStatus, MatchingStatusResponse } from '@/apis';
import { Button, Card } from '@/components/admin/ui';

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
          사용자가 보는 화면과 동일한 미리보기를 옆에 두고 운영 상태/매칭 잡을 관리합니다.
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
            <StatusToggleCard
              status={statusQuery.data}
              onChange={() => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] });
              }}
            />

            <ScheduleCard status={statusQuery.data} />

            <JobsCard
              festivalDays={statusQuery.data.festivalDays}
              onJobRun={() => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'matchings'] });
              }}
            />

            <Card padding="md">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
                    <Users size={16} />
                    신청자 관리
                  </h2>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    검색·필터·삭제·리셋이 가능한 신청자 목록으로 이동
                  </p>
                </div>
                <Link to="/console/matching/participants">
                  <Button variant="secondary" size="sm">
                    신청자 목록 열기
                  </Button>
                </Link>
              </div>
            </Card>
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

interface StatusToggleCardProps {
  status: MatchingStatusResponse;
  onChange: () => void;
}

function StatusToggleCard({ status, onChange }: StatusToggleCardProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(0);

  const updateMutation = useMutation({
    mutationFn: (next: MatchingOperationStatus) => matchingApi.updateStatus({ status: next }),
    onSuccess: () => {
      setSavedTick((tick) => tick + 1);
      onChange();
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '상태 변경에 실패했습니다.',
      );
    },
  });

  const handleToggle = (next: MatchingOperationStatus) => {
    setErrorMessage(null);
    updateMutation.mutate(next);
  };

  const isOpen = status.status === 'OPEN';

  return (
    <Card padding="md" borderLeft={isOpen ? 'var(--admin-success)' : '#b45309'}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--admin-text)]">운영 상태</h2>
            <p className="text-xs text-[var(--admin-text-muted)]">
              {isOpen ? '신청 접수 활성' : '신청 접수 중단'}
              {!status.registrationOpen && isOpen && ' · 신청창 외 시간이라 실제 접수는 비활성'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isOpen ? 'primary' : 'secondary'}
              size="sm"
              disabled={updateMutation.isPending || isOpen}
              onClick={() => handleToggle('OPEN')}
              iconLeft={<Play size={13} />}
            >
              OPEN
            </Button>
            <Button
              variant={!isOpen ? 'primary' : 'secondary'}
              size="sm"
              disabled={updateMutation.isPending || !isOpen}
              onClick={() => handleToggle('PAUSED')}
              iconLeft={<Pause size={13} />}
            >
              PAUSE
            </Button>
          </div>
        </div>

        {savedTick > 0 && !updateMutation.isPending && (
          <span
            key={savedTick}
            className="inline-flex items-center gap-1 text-xs text-[var(--admin-success)]"
          >
            <CheckCircle2 size={12} /> 적용됨
          </span>
        )}
        {errorMessage && <ErrorBanner message={errorMessage} />}
      </div>
    </Card>
  );
}

function ScheduleCard({ status }: { status: MatchingStatusResponse }) {
  return (
    <Card padding="md">
      <h2 className="mb-3 text-base font-semibold text-[var(--admin-text)]">스케줄</h2>
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
      </dl>
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
  festivalDays: string[];
  onJobRun: () => void;
}

function JobsCard({ festivalDays, onJobRun }: JobsCardProps) {
  const [festivalDay, setFestivalDay] = useState<string>(festivalDays[0] ?? '');
  const [prevFirstDay, setPrevFirstDay] = useState<string>(festivalDays[0] ?? '');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const firstDay = festivalDays[0] ?? '';
  if (firstDay !== prevFirstDay) {
    setPrevFirstDay(firstDay);
    if (!festivalDays.includes(festivalDay)) {
      setFestivalDay(firstDay);
    }
  }

  const runNowMutation = useMutation({
    mutationFn: matchingApi.runJob,
    onSuccess: (data) => {
      setErrorMessage(null);
      setResultMessage(
        `즉시 실행: ${data.matchedPairCount}쌍 매칭, ${data.unmatchedCount}명 미매칭`,
      );
      onJobRun();
    },
    onError: (error: unknown) => {
      setResultMessage(null);
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '매칭 실행에 실패했습니다.',
      );
    },
  });

  const runDayMutation = useMutation({
    mutationFn: (day: string) => matchingApi.runJobForDay(day),
    onSuccess: (data, day) => {
      setErrorMessage(null);
      setResultMessage(
        `${day} 실행: ${data.matchedPairCount}쌍 매칭, ${data.unmatchedCount}명 미매칭`,
      );
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
    if (!window.confirm('대상 일자를 자동으로 추정해 매칭 잡을 실행합니다. 계속할까요?')) return;
    runNowMutation.mutate();
  };

  const handleRunDay = () => {
    if (!festivalDay) return;
    if (!window.confirm(`${festivalDay} 일자의 매칭 잡을 실행할까요?`)) return;
    runDayMutation.mutate(festivalDay);
  };

  const busy = runNowMutation.isPending || runDayMutation.isPending;

  return (
    <Card padding="md">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--admin-text)]">
        <PlayCircle size={16} />
        매칭 잡 실행
      </h2>
      <p className="mb-4 text-xs text-[var(--admin-text-muted)]">
        21:00~22:00 사이에는 자동 스케줄러가 동작합니다. 수동 실행이 필요한 경우만 사용하세요.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg border border-[var(--admin-border)] p-3">
          <div className="text-sm font-medium text-[var(--admin-text)]">즉시 실행</div>
          <div className="text-xs text-[var(--admin-text-muted)]">
            서버가 추정한 대상 일자에 대해 실행
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleRunNow}
            disabled={busy}
            iconLeft={<PlayCircle size={13} />}
          >
            {runNowMutation.isPending ? '실행 중...' : '지금 실행'}
          </Button>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[var(--admin-border)] p-3">
          <div className="text-sm font-medium text-[var(--admin-text)]">특정 일자 실행</div>
          <div className="flex flex-wrap gap-1.5">
            {festivalDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setFestivalDay(day)}
                className={[
                  'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                  day === festivalDay
                    ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]'
                    : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                ].join(' ')}
              >
                {day.slice(5)}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRunDay}
            disabled={busy || !festivalDay}
            iconLeft={<RefreshCw size={13} />}
          >
            {runDayMutation.isPending ? '실행 중...' : `${festivalDay} 실행`}
          </Button>
        </div>
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
  const isPaused = status.status === 'PAUSED';
  return (
    <div className="flex flex-col">
      <nav className="flex gap-7 border-b border-border bg-white px-5">
        {['소개', '신청', '결과'].map((label, i) => (
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

      {isPaused && (
        <div className="border-b border-border bg-[#fff7f8] px-5 py-3">
          <p className="font-wanted-sans text-[13px] leading-[1.4] tracking-tight text-sub-red">
            매칭 신청이 일시중단되었습니다.
          </p>
        </div>
      )}

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
          <ApplicantPreviewCard
            label="남성"
            count={status.malePendingCount}
            colorClass="text-[#1893ff]"
          />
          <ApplicantPreviewCard
            label="여성"
            count={status.femalePendingCount}
            colorClass="text-[#ff6568]"
          />
        </div>
      </div>
    </div>
  );
}

function ApplicantPreviewCard({
  label,
  count,
  colorClass,
}: {
  label: string;
  count: number;
  colorClass: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-lg bg-[#f9f9f9] p-3">
      <p className="font-wanted-sans text-[12px] tracking-tight text-[#808080]">{label}</p>
      <p className={`font-wanted-sans text-[18px] font-bold tabular-nums ${colorClass}`}>
        {count}명
      </p>
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
