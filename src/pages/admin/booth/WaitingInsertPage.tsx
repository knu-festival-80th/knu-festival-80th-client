import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, waitingApi } from '@/apis';
import type { WaitingInsertRequest } from '@/apis';

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

interface FormState {
  name: string;
  partySize: string;
  phoneNumber: string;
  insertAfterSortOrder: string;
}

const EMPTY: FormState = { name: '', partySize: '', phoneNumber: '', insertAfterSortOrder: '' };

export default function WaitingInsertPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insertMutation = useMutation({
    mutationFn: (payload: WaitingInsertRequest) => waitingApi.insertWaiting(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'waitings'] });
      navigate(`/admin/booth/${boothId}/waitings`, { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '대기 등록에 실패했습니다.',
      );
    },
  });

  const handleChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
      setErrorMessage('삽입 위치(이 순번 뒤에 삽입)는 1 이상의 정수여야 합니다.');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-subheading font-semibold text-text">대기열 중간 삽입</h2>
      <p className="text-body2 text-text-muted">
        오프라인 등 특수 상황에서만 사용하세요. 입력한 sortOrder 뒤에 새 팀이 삽입됩니다.
      </p>

      <Field label="이름" required>
        <input
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          maxLength={50}
          required
        />
      </Field>

      <Field label="인원수" required>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={form.partySize}
          onChange={handleChange('partySize')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          required
        />
      </Field>

      <Field label="전화번호" required>
        <input
          type="tel"
          value={form.phoneNumber}
          onChange={handleChange('phoneNumber')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          placeholder="010-1234-5678"
          required
        />
      </Field>

      <Field label="삽입 위치 (이 순번 뒤에 삽입)" required>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={form.insertAfterSortOrder}
          onChange={handleChange('insertAfterSortOrder')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          required
        />
      </Field>

      {errorMessage && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={insertMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-body1 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
        >
          {insertMutation.isPending ? '등록 중…' : '삽입 등록'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/booth/${boothId}/waitings`)}
          className="rounded-md border border-border bg-surface px-4 py-2 text-body1 text-text"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-body2 text-text">
      <span>
        {label}
        {required && <span className="ml-1 text-knu-red">*</span>}
      </span>
      {children}
    </label>
  );
}
