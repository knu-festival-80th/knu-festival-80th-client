import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, authApi } from '@/apis';
import { Button, Card, Field, Input } from '@/components/admin/ui';
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
        setErrorMessage('해당 계정에는 콘솔 권한이 없습니다.');
        return;
      }
      setSession(response.role, response.boothId);
      navigate('/console', { replace: true });
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
      setErrorMessage('마스터 비밀번호를 입력해 주세요.');
      return;
    }
    loginMutation.mutate({ boothId: null, password });
  };

  return (
    <div
      data-admin-theme="console"
      className="flex min-h-dvh items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col gap-1.5 text-center">
          <h1 className="text-2xl font-semibold text-[var(--admin-text)]">KNU 운영 콘솔</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            최고 관리자 마스터 비밀번호로 로그인합니다.
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="마스터 비밀번호" htmlFor="console-password">
              <Input
                id="console-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                disabled={loginMutation.isPending}
                invalid={Boolean(errorMessage)}
              />
            </Field>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" size="lg" block disabled={loginMutation.isPending}>
              {loginMutation.isPending ? '인증 중…' : '로그인'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
