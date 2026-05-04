import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, authApi } from '@/apis';
import { useAuthStore } from '@/stores/authStore';

type LoginMode = 'super' | 'booth';

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [mode, setMode] = useState<LoginMode>('super');
  const [boothId, setBoothId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setSession(response.role, response.boothId);
      if (response.role === 'SUPER_ADMIN') {
        navigate('/admin/super', { replace: true });
      } else if (response.boothId !== null) {
        navigate(`/admin/booth/${response.boothId}`, { replace: true });
      }
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
        return;
      }
      setErrorMessage('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'booth') {
      const parsedBoothId = Number(boothId);
      if (!boothId.trim() || !Number.isInteger(parsedBoothId) || parsedBoothId <= 0) {
        setErrorMessage('올바른 부스 ID를 입력해주세요.');
        return;
      }
      loginMutation.mutate({ boothId: parsedBoothId, password });
      return;
    }

    loginMutation.mutate({ boothId: null, password });
  };

  return (
    <div className="page-frame flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-md">
        <h1 className="mb-1 text-heading1 text-text">관리자 로그인</h1>
        <p className="mb-6 text-body2 text-text-muted">
          최고 관리자 또는 주막 운영진 계정으로 로그인하세요.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-md border border-border bg-background p-1 text-body2">
          <button
            type="button"
            onClick={() => setMode('super')}
            className={`rounded px-3 py-2 transition ${
              mode === 'super' ? 'bg-surface font-semibold text-text shadow-sm' : 'text-text-muted'
            }`}
          >
            최고 관리자
          </button>
          <button
            type="button"
            onClick={() => setMode('booth')}
            className={`rounded px-3 py-2 transition ${
              mode === 'booth' ? 'bg-surface font-semibold text-text shadow-sm' : 'text-text-muted'
            }`}
          >
            주막 운영진
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'booth' && (
            <label className="flex flex-col gap-1 text-body2 text-text">
              부스 ID
              <input
                type="number"
                inputMode="numeric"
                value={boothId}
                onChange={(event) => setBoothId(event.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-body1 text-text outline-none focus:border-primary"
                placeholder="예: 12"
                disabled={loginMutation.isPending}
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-body2 text-text">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-body1 text-text outline-none focus:border-primary"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
            />
          </label>

          {errorMessage && (
            <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 rounded-md bg-primary px-4 py-2.5 text-body1 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
          >
            {loginMutation.isPending ? '로그인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
