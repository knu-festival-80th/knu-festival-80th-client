import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Beer, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, authApi, boothApi } from '@/apis';
import type { BoothListItem } from '@/apis';
import { Button, Field, Input } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

function boothLabel(booth: BoothListItem): string {
  const department = booth.department?.trim();
  return department ? `${department} · ${booth.name}` : booth.name;
}

function sortBooths(booths: BoothListItem[]): BoothListItem[] {
  return [...booths].sort((a, b) => {
    const da = a.department?.trim() ?? '';
    const db = b.department?.trim() ?? '';
    if (!da && db) return 1;
    if (da && !db) return -1;
    const byDept = da.localeCompare(db, 'ko');
    if (byDept !== 0) return byDept;
    return a.name.localeCompare(b.name, 'ko');
  });
}

export default function BoothManageLoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [selectedBoothId, setSelectedBoothId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const boothsQuery = useQuery({
    queryKey: ['booths', 'public', { sort: 'likes' }],
    queryFn: () => boothApi.listBooths('likes'),
    staleTime: 60_000,
  });

  const sortedBooths = useMemo(
    () => (boothsQuery.data ? sortBooths(boothsQuery.data) : []),
    [boothsQuery.data],
  );

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.role === 'BOOTH_ADMIN' && response.boothId !== null) {
        setSession(response.role, response.boothId);
        navigate('/booth/manage', { replace: true });
        return;
      }
      setErrorMessage('계정 정보가 올바르지 않습니다. 운영진에게 문의해 주세요.');
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.message
          : '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = Number(selectedBoothId);
    if (!selectedBoothId || !Number.isInteger(parsed) || parsed <= 0) {
      setErrorMessage('주막을 선택해 주세요.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }

    loginMutation.mutate({ boothId: parsed, password });
  };

  const isInvalid = Boolean(errorMessage);
  const boothsLoading = boothsQuery.isLoading;
  const boothsError = boothsQuery.isError;

  return (
    <div
      data-admin-theme="booth"
      className="flex min-h-dvh items-center justify-center bg-[var(--admin-bg)] px-5 py-8"
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)]">
            <Beer size={28} className="text-[var(--admin-primary)]" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="font-wanted-sans text-[22px] font-bold text-[var(--admin-text)]">
              주막 운영
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
              주막을 선택하고 비밀번호로 로그인
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="주막 선택" htmlFor="booth-select">
            <div className="relative">
              <select
                id="booth-select"
                value={selectedBoothId}
                onChange={(e) => setSelectedBoothId(e.target.value)}
                disabled={boothsLoading || boothsError || loginMutation.isPending}
                className={[
                  'h-11 w-full appearance-none rounded-xl bg-[var(--admin-surface)] px-3.5 pr-9 text-[15px] text-[var(--admin-text)] outline-none transition-colors',
                  'ring-1 ring-[var(--admin-border-strong)] focus:ring-2 focus:ring-[var(--admin-primary)]',
                  isInvalid ? 'ring-[var(--admin-danger)]' : '',
                  'disabled:opacity-60',
                ].join(' ')}
                autoFocus
              >
                <option value="" disabled>
                  {boothsLoading
                    ? '주막 목록 불러오는 중...'
                    : boothsError
                      ? '목록을 불러오지 못했어요'
                      : '주막을 선택하세요'}
                </option>
                {sortedBooths.map((booth) => (
                  <option key={booth.boothId} value={String(booth.boothId)}>
                    {boothLabel(booth)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--admin-text-faint)]"
                aria-hidden
              />
            </div>
          </Field>

          <Field label="비밀번호" htmlFor="booth-password">
            <Input
              id="booth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loginMutation.isPending || !selectedBoothId}
              invalid={isInvalid}
              placeholder={selectedBoothId ? '비밀번호 입력' : '주막을 먼저 선택하세요'}
            />
          </Field>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-[var(--admin-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--admin-danger)]"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            block
            disabled={loginMutation.isPending || !selectedBoothId || boothsLoading}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
