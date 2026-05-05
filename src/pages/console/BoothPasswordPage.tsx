import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, KeyRound } from 'lucide-react';
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
    <div className="flex flex-col gap-6">
      <Link
        to="/console"
        className="inline-flex items-center gap-1.5 self-start text-caption text-[var(--admin-text-muted)] transition hover:text-[var(--admin-text)]"
      >
        <ArrowLeft size={14} />
        부스 목록
      </Link>

      <form onSubmit={handleSubmit} noValidate>
        <Card
          eyebrow={
            <span className="inline-flex items-center gap-1.5">
              <KeyRound size={11} className="text-[var(--admin-primary)]" />
              자격 증명
            </span>
          }
          title={`부스 #${boothId} 비밀번호 변경`}
          description="비밀번호 변경 후에는 이전 비밀번호를 복구할 수 없습니다. 새 비밀번호는 부스 운영진에게 별도 채널로 안전하게 전달해 주세요."
          padding="lg"
        >
          <div className="flex flex-col gap-5">
            <Field label="새 비밀번호" required htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="•••••••••••"
              />
            </Field>

            <Field label="새 비밀번호 확인" required htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                placeholder="•••••••••••"
              />
            </Field>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p
                role="status"
                className="rounded-md border border-[var(--admin-success)]/35 bg-[var(--admin-success-soft)] px-3 py-2 text-body2 text-[var(--admin-success)]"
              >
                {successMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={passwordMutation.isPending}
                iconLeft={<KeyRound size={14} />}
              >
                {passwordMutation.isPending ? '변경 중…' : '비밀번호 변경'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/console')}
                disabled={passwordMutation.isPending}
              >
                돌아가기
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
