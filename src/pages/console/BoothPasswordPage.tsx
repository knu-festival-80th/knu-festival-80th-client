import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import { Button, Card, Field, Input } from '@/components/admin/ui';

export default function BoothPasswordPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });

  const booth = boothsQuery.data?.find((b) => b.boothId === boothId);
  const boothName = booth?.name ?? `부스 #${Number.isFinite(boothId) ? boothId : ''}`;

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/console"
            className="inline-flex items-center gap-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          >
            <ArrowLeft size={14} />
            부스 목록
          </Link>
          <span className="text-[var(--admin-text-faint)]">/</span>
          <span className="truncate text-[var(--admin-text-muted)]">비밀번호 변경</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Lock size={20} className="text-[var(--admin-text-muted)]" />
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">비밀번호 변경</h1>
        </div>
        <p className="text-sm text-[var(--admin-text-muted)]">{boothName}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {successMessage && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-md border border-[var(--admin-success)]/30 bg-[var(--admin-success-soft)] px-3 py-2 text-sm text-[var(--admin-success)]"
          >
            <CheckCircle2 size={14} />
            <span>{successMessage}</span>
          </div>
        )}

        <Card padding="md">
          <div className="flex flex-col gap-4">
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-[var(--admin-warn)]/30 bg-[var(--admin-warn-soft)] px-3 py-2 text-sm text-[var(--admin-warn)]"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>비밀번호를 변경하면 기존 부스 운영진 로그인은 즉시 차단됩니다.</span>
            </div>

            <Field label="새 비밀번호" required htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="..........."
              />
            </Field>

            <Field label="새 비밀번호 확인" required htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                placeholder="..........."
              />
            </Field>
          </div>
        </Card>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
          >
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/console')}
            disabled={passwordMutation.isPending}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
