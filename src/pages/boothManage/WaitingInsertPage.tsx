import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiClientError, waitingApi } from '@/apis';
import type { WaitingInsertRequest } from '@/apis';
import { Button, Field, Input } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

interface FormState {
  name: string;
  partySize: string;
  phoneNumber: string;
  insertAfterSortOrder: string;
}

const EMPTY: FormState = { name: '', partySize: '', phoneNumber: '', insertAfterSortOrder: '' };

export default function WaitingInsertPage() {
  const boothId = useAuthStore((s) => s.boothId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insertMutation = useMutation({
    mutationFn: (payload: WaitingInsertRequest) =>
      waitingApi.insertWaiting(boothId as number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'waitings'] });
      navigate('/booth/manage/waitings', { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '대기 등록에 실패했습니다.',
      );
    },
  });

  if (boothId === null) return null;

  const handleChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage('이름은 필수입니다.');
      return;
    }
    const partySize = Number(form.partySize);
    if (!form.partySize.trim() || !Number.isInteger(partySize) || partySize < 1) {
      setErrorMessage('인원수는 1 이상의 정수여야 합니다.');
      return;
    }
    if (!PHONE_REGEX.test(form.phoneNumber.trim())) {
      setErrorMessage('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }
    const insertAfterSortOrder = Number(form.insertAfterSortOrder);
    if (
      !form.insertAfterSortOrder.trim() ||
      !Number.isInteger(insertAfterSortOrder) ||
      insertAfterSortOrder < 1
    ) {
      setErrorMessage('삽입 위치는 1 이상의 정수여야 합니다.');
      return;
    }

    insertMutation.mutate({
      name: form.name.trim(),
      partySize,
      phoneNumber: form.phoneNumber.trim(),
      insertAfterSortOrder,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/booth/manage/waitings"
        className="inline-flex items-center gap-1 text-sm text-[var(--admin-text-muted)]"
      >
        <ArrowLeft size={14} />
        대기열
      </Link>

      <div>
        <h1 className="text-lg font-bold text-[var(--admin-text)]">대기 중간 삽입</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
          오프라인 등록 등 특수 상황에서만 사용하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="rounded-2xl bg-[var(--admin-surface)] p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-xl bg-[var(--admin-warn-soft)] px-3.5 py-2.5 text-xs text-[var(--admin-warn)]">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>입력한 순서 뒤에 새 팀이 삽입됩니다.</span>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-[var(--admin-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--admin-danger)]">
                {errorMessage}
              </div>
            )}

            <Field label="이름" required htmlFor="waiting-name">
              <Input
                id="waiting-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                maxLength={50}
                required
                placeholder="예: 홍길동"
              />
            </Field>

            <Field label="인원수" required htmlFor="waiting-party">
              <Input
                id="waiting-party"
                type="number"
                inputMode="numeric"
                numericMono
                min={1}
                value={form.partySize}
                onChange={handleChange('partySize')}
                required
                placeholder="2"
              />
            </Field>

            <Field label="전화번호" required htmlFor="waiting-phone">
              <Input
                id="waiting-phone"
                type="tel"
                inputMode="tel"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                placeholder="010-1234-5678"
                required
                numericMono
              />
            </Field>

            <Field label="삽입 위치 (이 순번 뒤)" required htmlFor="waiting-after">
              <Input
                id="waiting-after"
                type="number"
                inputMode="numeric"
                numericMono
                min={1}
                value={form.insertAfterSortOrder}
                onChange={handleChange('insertAfterSortOrder')}
                required
                placeholder="3"
              />
            </Field>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/booth/manage/waitings')}
            className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3.5 text-[15px] font-semibold text-[var(--admin-text)]"
          >
            취소
          </button>
          <Button
            type="submit"
            size="lg"
            block
            disabled={insertMutation.isPending}
            className="flex-1"
          >
            {insertMutation.isPending ? '등록 중...' : '삽입 등록'}
          </Button>
        </div>
      </form>
    </div>
  );
}
