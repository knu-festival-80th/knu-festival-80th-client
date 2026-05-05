import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiClientError, authApi } from '@/apis';
import { Button, Field, Input } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

export default function ConsoleLoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.role !== 'SUPER_ADMIN') {
        setErrorMessage(
          '이 페이지는 최고 관리자 전용입니다. 주막 운영진은 부스 운영 페이지로 이동해 주세요.',
        );
        return;
      }
      setSession(response.role, response.boothId);
      navigate('/console', { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.message
          : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!password.trim()) {
      setErrorMessage('마스터 비밀번호를 입력해 주세요.');
      return;
    }
    loginMutation.mutate({ boothId: null, password });
  };

  return (
    <div data-admin-theme="console" className="admin-frame admin-grain">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8 sm:px-10 sm:py-12">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow text-[var(--admin-primary)]">KNU·80</span>
          <Link
            to="/booth/manage/login"
            className="text-caption text-[var(--admin-text-muted)] underline-offset-4 transition hover:text-[var(--admin-text)] hover:underline"
          >
            주막 운영진은 여기 →
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <h1 className="text-display1 leading-[1.05] font-bold tracking-tight text-[var(--admin-text)] sm:text-hero sm:leading-[0.95]">
              운영 콘솔에
              <br />
              <span className="text-[var(--admin-primary)]">접속합니다.</span>
            </h1>
            <p className="max-w-md text-body1 text-[var(--admin-text-muted)]">
              경북대학교 80주년 대동제 운영 권한이 부여된 최고 관리자만 접근할 수 있습니다. 부스
              등록·정보 수정·비밀번호 발급 등 모든 행정 작업은 이곳에서 시작됩니다.
            </p>
            <ul className="flex flex-wrap gap-4 text-caption text-[var(--admin-text-faint)]">
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[var(--admin-primary)]" />
                감사 로그 자동 기록
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[var(--admin-primary)]" />
                세션 만료 시 즉시 차단
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[var(--admin-primary)]" />
                마스터 키 단일 인증
              </li>
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] p-7 shadow-[var(--admin-shadow-card)] backdrop-blur sm:p-9"
          >
            <div className="mb-6 flex items-center gap-2 text-caption">
              <Lock size={14} className="text-[var(--admin-primary)]" />
              <span className="eyebrow text-[var(--admin-text-muted)]">최고 관리자 인증</span>
            </div>

            <Field label="마스터 비밀번호" required error={errorMessage} htmlFor="console-password">
              <Input
                id="console-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                disabled={loginMutation.isPending}
                placeholder="•••••••••••••••"
                invalid={Boolean(errorMessage)}
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              block
              disabled={loginMutation.isPending}
              className="mt-6"
              iconRight={<ArrowRight size={16} />}
            >
              {loginMutation.isPending ? '인증 중…' : '콘솔 접속'}
            </Button>

            <p className="mt-5 text-caption text-[var(--admin-text-faint)]">
              비밀번호는 운영 책임자에게 직접 전달받은 마스터 키만 유효합니다.
            </p>
          </form>
        </div>

        <p className="eyebrow text-[var(--admin-text-faint)]">
          KNU Festival · Operations Console · v1
        </p>
      </div>
    </div>
  );
}
