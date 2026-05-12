import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

import { ApiClientError, waitingApi } from '@/apis';
import type { WaitingInsertRequest, WaitingItem } from '@/apis';
import { BottomSheet, Button, Field, Input } from '@/components/admin/ui';

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

interface FormState {
  name: string;
  partySize: string;
  phoneNumber: string;
  insertAfterSortOrder: string;
}

interface WaitingInsertSheetProps {
  open: boolean;
  onClose: () => void;
  boothId: number;
  waitings: WaitingItem[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function WaitingInsertSheet(props: WaitingInsertSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} title="대기 중간 삽입">
      {props.open && <WaitingInsertSheetBody {...props} />}
    </BottomSheet>
  );
}

function WaitingInsertSheetBody({
  onClose,
  boothId,
  waitings,
  onSuccess,
  onError,
}: WaitingInsertSheetProps) {
  const queryClient = useQueryClient();

  const waitingItems = useMemo(
    () => waitings.filter((w) => w.status === 'WAITING').sort((a, b) => a.sortOrder - b.sortOrder),
    [waitings],
  );

  const lastSortOrder = waitingItems.at(-1)?.sortOrder ?? null;

  const [form, setForm] = useState<FormState>({
    name: '',
    partySize: '',
    phoneNumber: '',
    insertAfterSortOrder: lastSortOrder !== null ? String(lastSortOrder) : '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insertMutation = useMutation({
    mutationFn: (payload: WaitingInsertRequest) => waitingApi.insertWaiting(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'waitings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
      onSuccess?.('대기를 등록했어요');
      onClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : '대기 등록에 실패했습니다.';
      setErrorMessage(message);
      onError?.(message);
    },
  });

  const handleChange =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (waitingItems.length === 0) {
      setErrorMessage('현재 대기 중인 팀이 없어 중간 삽입을 사용할 수 없어요.');
      return;
    }
    if (!form.name.trim()) {
      setErrorMessage('이름을 입력해 주세요.');
      return;
    }
    const partySize = Number(form.partySize);
    if (!form.partySize.trim() || !Number.isInteger(partySize) || partySize < 1) {
      setErrorMessage('인원수는 1 이상의 정수여야 해요.');
      return;
    }
    if (!PHONE_REGEX.test(form.phoneNumber.trim())) {
      setErrorMessage('전화번호 형식이 올바르지 않아요. (예: 010-1234-5678)');
      return;
    }
    const insertAfterSortOrder = Number(form.insertAfterSortOrder);
    if (
      !form.insertAfterSortOrder.trim() ||
      !Number.isInteger(insertAfterSortOrder) ||
      insertAfterSortOrder < 1
    ) {
      setErrorMessage('삽입 위치를 선택해 주세요.');
      return;
    }

    insertMutation.mutate({
      name: form.name.trim(),
      partySize,
      phoneNumber: form.phoneNumber.trim(),
      insertAfterSortOrder,
    });
  };

  const isPending = insertMutation.isPending;
  const noWaiting = waitingItems.length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-xl bg-[var(--admin-warn-soft)] px-3.5 py-2.5 text-xs text-[var(--admin-warn)]">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>오프라인 등록 등 특수 상황에서만 사용해 주세요.</span>
      </div>

      {noWaiting && (
        <div className="rounded-xl bg-[var(--admin-surface-hover)] px-3.5 py-2.5 text-sm text-[var(--admin-text-muted)]">
          지금 대기 중인 팀이 없어요. 일반 등록을 안내해 주세요.
        </div>
      )}

      <Field label="이름" required htmlFor="insert-name">
        <Input
          id="insert-name"
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          maxLength={50}
          required
          placeholder="예: 홍길동"
          disabled={isPending || noWaiting}
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="인원수" required htmlFor="insert-party">
          <Input
            id="insert-party"
            type="number"
            inputMode="numeric"
            numericMono
            min={1}
            value={form.partySize}
            onChange={handleChange('partySize')}
            required
            placeholder="2"
            disabled={isPending || noWaiting}
          />
        </Field>

        <Field label="전화번호" required htmlFor="insert-phone">
          <Input
            id="insert-phone"
            type="tel"
            inputMode="tel"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            placeholder="010-1234-5678"
            required
            numericMono
            disabled={isPending || noWaiting}
          />
        </Field>
      </div>

      <Field
        label="삽입 위치"
        hint="선택한 팀 바로 뒤에 등록되며, 이후 드래그로 자유롭게 조정할 수 있어요."
        required
        htmlFor="insert-position"
      >
        <div className="relative">
          <select
            id="insert-position"
            value={form.insertAfterSortOrder}
            onChange={handleChange('insertAfterSortOrder')}
            disabled={isPending || noWaiting}
            className="h-11 w-full appearance-none rounded-xl bg-[var(--admin-surface-hover)] px-3.5 pr-9 text-[15px] text-[var(--admin-text)] outline-none ring-1 ring-transparent transition-colors focus:bg-[var(--admin-surface)] focus:ring-[var(--admin-primary)] disabled:opacity-60"
          >
            <option value="" disabled>
              {noWaiting ? '대기 팀이 없어요' : '위치를 선택하세요'}
            </option>
            {waitingItems.map((item, idx) => {
              const isLast = idx === waitingItems.length - 1;
              return (
                <option key={item.waitingId} value={String(item.sortOrder)}>
                  #{item.waitingNumber} {item.name} 뒤{isLast ? ' (맨 뒤)' : ''}
                </option>
              );
            })}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--admin-text-faint)]"
            aria-hidden
          />
        </div>
      </Field>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl bg-[var(--admin-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--admin-danger)]"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 rounded-xl bg-[var(--admin-surface-hover)] py-3 text-[15px] font-semibold text-[var(--admin-text)] disabled:opacity-60"
        >
          닫기
        </button>
        <Button type="submit" size="lg" block className="flex-1" disabled={isPending || noWaiting}>
          {isPending ? '등록 중...' : '삽입 등록'}
        </Button>
      </div>
    </form>
  );
}
