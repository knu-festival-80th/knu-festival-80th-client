import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Store } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div
      data-admin-theme="booth"
      className="flex min-h-dvh items-center justify-center bg-[var(--admin-bg)] px-5 py-8"
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)]">
            <Store size={28} className="text-[var(--admin-primary)]" />
          </div>
          <div>
            <h1 className="font-wanted-sans text-[22px] font-bold text-[var(--admin-text)]">
              주막 운영
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
              부스 번호와 비밀번호로 로그인
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="부스 번호" htmlFor="booth-id">
            <Input
              id="booth-id"
              type="number"
              inputMode="numeric"
              min={1}
              value={boothId}
              onChange={(e) => setBoothId(e.target.value)}
              placeholder="예: 12"
              disabled={loginMutation.isPending}
              invalid={Boolean(errorMessage)}
              autoFocus
              numericMono
            />
          </Field>

          <Field label="비밀번호" htmlFor="booth-password">
            <Input
              id="booth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              invalid={Boolean(errorMessage)}
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

          <Button type="submit" size="lg" block disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
