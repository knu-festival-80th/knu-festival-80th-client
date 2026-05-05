import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Hash, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiClientError, authApi } from '@/apis';
import { Button, Field, Input } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

export default function BoothManageLoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [boothId, setBoothId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.role === 'SUPER_ADMIN') {
        setSession(response.role, response.boothId);
        navigate('/console', { replace: true });
        return;
      }
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

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }
    const parsed = Number(boothId);
    if (!boothId.trim() || !Number.isInteger(parsed) || parsed <= 0) {
      setErrorMessage('부스 번호는 1 이상의 정수여야 합니다.');
      return;
    }

    loginMutation.mutate({ boothId: parsed, password });
  };

  return (
    <div data-admin-theme="booth" className="admin-frame">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-5 pt-10 pb-8 sm:max-w-lg sm:pt-14">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-[var(--admin-primary)]">KNU·80 · 주막</span>
          <Link
            to="/console/login"
            className="text-caption text-[var(--admin-text-muted)] underline-offset-4 transition hover:text-[var(--admin-text)] hover:underline"
          >
            최고 관리자 →
          </Link>
        </div>

        <div className="flex flex-col gap-7">
          <header className="flex flex-col gap-2">
            <span className="eyebrow text-[var(--admin-text-muted)]">부스 운영진 로그인</span>
            <h1 className="text-heading1 font-bold tracking-tight text-[var(--admin-text)] sm:text-display1 sm:leading-[1.05]">
              당신의 주막을
              <br />
              <span className="text-[var(--admin-primary)]">운영합니다.</span>
            </h1>
            <p className="text-body2 text-[var(--admin-text-muted)]">
              부스 번호와 운영진 비밀번호를 입력하면 메뉴 관리·대기열·호출 SMS까지 한 화면에서
              처리할 수 있습니다.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-card)] sm:p-7"
          >
            <Field label="부스 번호" required htmlFor="booth-id">
              <div className="relative">
                <Hash
                  size={18}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--admin-text-faint)]"
                />
                <Input
                  id="booth-id"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={boothId}
                  onChange={(e) => setBoothId(e.target.value)}
                  className="h-14 pl-10 text-display1 leading-none font-bold tabular"
                  placeholder="12"
                  disabled={loginMutation.isPending}
                  invalid={Boolean(errorMessage)}
                  autoFocus
                />
              </div>
            </Field>

            <Field label="운영진 비밀번호" required htmlFor="booth-password">
              <div className="relative">
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--admin-text-faint)]"
                />
                <Input
                  id="booth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-10"
                  disabled={loginMutation.isPending}
                  invalid={Boolean(errorMessage)}
                  placeholder="••••••••"
                />
              </div>
            </Field>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-caption text-[var(--admin-danger)]"
              >
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              block
              disabled={loginMutation.isPending}
              iconRight={<ArrowRight size={16} />}
            >
              {loginMutation.isPending ? '입장 중…' : '주막 운영 시작'}
            </Button>
          </form>

          <p className="text-caption text-[var(--admin-text-faint)]">
            비밀번호는 최고 관리자가 발급한 부스 전용 키입니다. 분실 시 운영본부에 문의해 주세요.
          </p>
        </div>

        <p className="eyebrow text-[var(--admin-text-faint)]">KNU Festival · Booth Manager</p>
      </div>
    </div>
  );
}
