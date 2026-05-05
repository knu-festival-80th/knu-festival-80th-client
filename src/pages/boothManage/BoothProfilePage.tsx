import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ImageIcon, MapPin, Save } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { ApiClientError, boothApi } from '@/apis';
import type { BoothListItem, BoothUpdateRequest } from '@/apis';
import { Button, Card, Field, Input, Textarea } from '@/components/admin/ui';
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
    imageUrl: booth.imageUrl ?? '',
    menuBoardImageUrl: booth.menuBoardImageUrl ?? '',
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

  if (boothsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-32 animate-pulse rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
        <div className="h-64 animate-pulse rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
      </div>
    );
  }
  if (boothsQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
      >
        {boothsQuery.error instanceof ApiClientError
          ? boothsQuery.error.message
          : '부스 정보를 불러오지 못했습니다.'}
      </div>
    );
  }

  const booth = boothsQuery.data?.find((b) => b.boothId === boothId);
  if (!booth) {
    return (
      <p className="text-body2 text-[var(--admin-text-muted)]">해당 부스를 찾을 수 없습니다.</p>
    );
  }

  return <BoothProfileForm key={boothId} boothId={boothId} initial={toFormState(booth)} />;
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
      setSuccessMessage('부스 정보가 저장되었습니다.');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card
        eyebrow="내 주막"
        title="부스 정보"
        description="손님에게 노출되는 주막 이름·설명·위치·메뉴판을 관리합니다."
        padding="lg"
      >
        <div className="flex flex-col gap-5">
          {successMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-md border border-[var(--admin-success)]/35 bg-[var(--admin-success-soft)] px-3 py-2 text-body2 text-[var(--admin-success)]"
            >
              <Check size={16} />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="X 좌표" hint="0 ~ 1 (가로 비율)" htmlFor="booth-x-ratio">
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
            <Field label="Y 좌표" hint="0 ~ 1 (세로 비율)" htmlFor="booth-y-ratio">
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
          <p className="-mt-2 inline-flex items-center gap-1 text-caption text-[var(--admin-text-faint)]">
            <MapPin size={12} />
            축제 지도 이미지에서의 비율 좌표. 두 값이 모두 채워져야 지도에 핀이 표시됩니다.
          </p>

          {form.imageUrl.trim() ? (
            <div className="flex flex-col gap-2">
              <span className="eyebrow">대표 이미지 미리보기</span>
              <img
                src={form.imageUrl}
                alt={`${form.name || '부스'} 대표 이미지`}
                className="h-32 w-full max-w-sm rounded-md border border-[var(--admin-border)] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex h-32 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]">
              <ImageIcon size={28} />
              <span className="text-caption">
                대표 이미지 URL을 입력하면 미리보기가 표시됩니다.
              </span>
            </div>
          )}

          <Field label="대표 이미지 URL" htmlFor="booth-image">
            <Input
              id="booth-image"
              type="text"
              value={form.imageUrl}
              onChange={handleChange('imageUrl')}
              maxLength={500}
              placeholder="https://"
            />
          </Field>

          {form.menuBoardImageUrl.trim() ? (
            <div className="flex flex-col gap-2">
              <span className="eyebrow">메뉴판 미리보기</span>
              <img
                src={form.menuBoardImageUrl}
                alt={`${form.name || '부스'} 메뉴판`}
                className="max-h-80 w-full max-w-sm rounded-md border border-[var(--admin-border)] object-contain bg-[var(--admin-surface-hover)]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex h-32 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]">
              <ImageIcon size={28} />
              <span className="text-caption">
                메뉴판 이미지 URL을 입력하면 미리보기가 표시됩니다.
              </span>
            </div>
          )}

          <Field label="메뉴판 이미지 URL" hint="부스당 1장" htmlFor="booth-menu-board">
            <Input
              id="booth-menu-board"
              type="text"
              value={form.menuBoardImageUrl}
              onChange={handleChange('menuBoardImageUrl')}
              maxLength={500}
              placeholder="https://"
            />
          </Field>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={updateMutation.isPending}
              iconLeft={<Save size={18} />}
            >
              {updateMutation.isPending ? '저장 중…' : '저장하기'}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
