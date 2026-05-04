import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';

export default function BoothPasswordPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      boothApi.changeBoothPassword(id, { newPassword }),
    onSuccess: () => {
      setPassword('');
      setConfirm('');
      setSuccessMessage('비밀번호가 변경되었습니다.');
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '비밀번호 변경에 실패했습니다.',
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!Number.isInteger(boothId) || boothId <= 0) {
      setErrorMessage('부스 ID가 올바르지 않습니다.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('새 비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirm) {
      setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    passwordMutation.mutate({ id: boothId, newPassword: password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-subheading font-semibold text-text">부스 #{boothId} 비밀번호 변경</h2>

      <label className="flex flex-col gap-1 text-body2 text-text">
        새 비밀번호
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          autoComplete="new-password"
        />
      </label>

      <label className="flex flex-col gap-1 text-body2 text-text">
        새 비밀번호 확인
        <input
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          autoComplete="new-password"
        />
      </label>

      {errorMessage && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">{errorMessage}</p>
      )}

      {successMessage && (
        <p className="rounded-md bg-secondary-green/10 px-3 py-2 text-body2 text-secondary-green">
          {successMessage}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={passwordMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-body1 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
        >
          {passwordMutation.isPending ? '변경 중…' : '비밀번호 변경'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/super')}
          className="rounded-md border border-border bg-surface px-4 py-2 text-body1 text-text"
        >
          돌아가기
        </button>
      </div>
    </form>
  );
}
