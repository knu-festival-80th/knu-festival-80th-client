import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { ApiClientError, boothApi, imageUrlToPath } from '@/apis';
import type { BoothListItem, BoothUpdateRequest } from '@/apis';
import { Button, Card, Field, ImageUploadField, Input, Textarea } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

interface FormState {
  name: string;
  description: string;
  xRatio: string;
  yRatio: string;
  imageUrl: string;
  menuBoardImageUrl: string;
}

function toFormState(booth: BoothListItem): FormState {
  return {
    name: booth.name,
    description: booth.description ?? '',
    xRatio: booth.xRatio?.toString() ?? '',
    yRatio: booth.yRatio?.toString() ?? '',
    imageUrl: imageUrlToPath(booth.imageUrl),
    menuBoardImageUrl: imageUrlToPath(booth.menuBoardImageUrl),
  };
}

function parseRatio(raw: string): { value: number | undefined; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: undefined, error: null };
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return { value: undefined, error: '숫자만 입력해 주세요.' };
  if (num < 0 || num > 1) return { value: undefined, error: '0과 1 사이의 값이어야 합니다.' };
  return { value: num, error: null };
}

export default function BoothProfilePage() {
  const boothId = useAuthStore((s) => s.boothId);

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });

  if (boothId === null) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold text-[var(--admin-text)]">부스 정보</h1>
        <p className="text-sm text-[var(--admin-text-muted)]">
          손님에게 노출되는 정보를 관리합니다.
        </p>
      </div>

      {boothsQuery.isLoading && (
        <div className="h-64 animate-pulse rounded-md bg-[var(--admin-surface-hover)]" />
      )}

      {boothsQuery.isError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          {boothsQuery.error instanceof ApiClientError
            ? boothsQuery.error.message
            : '부스 정보를 불러오지 못했습니다.'}
        </div>
      )}

      {boothsQuery.data &&
        (() => {
          const booth = boothsQuery.data.find((b) => b.boothId === boothId);
          if (!booth) {
            return (
              <p className="text-sm text-[var(--admin-text-muted)]">
                해당 부스를 찾을 수 없습니다.
              </p>
            );
          }
          return <BoothProfileForm key={boothId} boothId={boothId} initial={toFormState(booth)} />;
        })()}
    </div>
  );
}

interface BoothProfileFormProps {
  boothId: number;
  initial: FormState;
}

function BoothProfileForm({ boothId, initial }: BoothProfileFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: BoothUpdateRequest) => boothApi.updateBooth(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
      setSuccessMessage('저장되었습니다.');
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof ApiClientError ? error.message : '저장에 실패했습니다.');
    },
  });

  const handleChange =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      if (successMessage) setSuccessMessage(null);
    };

  const setField = (key: keyof FormState) => (next: string) => {
    setForm((prev) => ({ ...prev, [key]: next }));
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const x = parseRatio(form.xRatio);
    const y = parseRatio(form.yRatio);
    if (x.error) {
      setErrorMessage(`X 좌표: ${x.error}`);
      return;
    }
    if (y.error) {
      setErrorMessage(`Y 좌표: ${y.error}`);
      return;
    }

    updateMutation.mutate({
      name: form.name.trim() || undefined,
      description: form.description.trim() || undefined,
      xRatio: x.value,
      yRatio: y.value,
      imageUrl: form.imageUrl.trim() || undefined,
      menuBoardImageUrl: form.menuBoardImageUrl.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card padding="md">
        <div className="flex flex-col gap-4">
          {successMessage && (
            <div
              role="status"
              className="rounded-md border border-[var(--admin-success)]/35 bg-[var(--admin-success-soft)] px-3 py-2 text-sm text-[var(--admin-success)]"
            >
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
            >
              {errorMessage}
            </div>
          )}

          <Field label="부스 이름" htmlFor="booth-name">
            <Input
              id="booth-name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              maxLength={100}
              placeholder="예: 80주년 주막"
            />
          </Field>

          <Field label="설명" hint={`${form.description.length}자`} htmlFor="booth-description">
            <Textarea
              id="booth-description"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="대표 메뉴, 분위기, 운영 시간 등을 짧게 소개해 주세요."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="X 좌표" hint="0.0 ~ 1.0 비율" htmlFor="booth-x-ratio">
              <Input
                id="booth-x-ratio"
                type="text"
                inputMode="decimal"
                numericMono
                value={form.xRatio}
                onChange={handleChange('xRatio')}
                placeholder="0.42"
              />
            </Field>
            <Field label="Y 좌표" hint="0.0 ~ 1.0 비율" htmlFor="booth-y-ratio">
              <Input
                id="booth-y-ratio"
                type="text"
                inputMode="decimal"
                numericMono
                value={form.yRatio}
                onChange={handleChange('yRatio')}
                placeholder="0.18"
              />
            </Field>
          </div>

          <ImageUploadField
            label="대표 이미지"
            value={form.imageUrl}
            onChange={setField('imageUrl')}
            emptyMessage="부스 대표 이미지를 업로드하세요."
          />

          <ImageUploadField
            label="메뉴판 이미지"
            hint="부스당 1장"
            value={form.menuBoardImageUrl}
            onChange={setField('menuBoardImageUrl')}
            emptyMessage="메뉴판 사진을 업로드하세요."
            previewClassName="max-h-80 w-full max-w-sm object-contain"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? '저장 중…' : '저장'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
