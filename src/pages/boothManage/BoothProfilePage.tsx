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
  locationLat: string;
  locationLng: string;
  imageUrl: string;
}

function toFormState(booth: BoothListItem): FormState {
  return {
    name: booth.name,
    description: booth.description ?? '',
    locationLat: booth.locationLat?.toString() ?? '',
    locationLng: booth.locationLng?.toString() ?? '',
    imageUrl: booth.imageUrl ?? '',
  };
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

    const lat = form.locationLat.trim() ? Number(form.locationLat) : undefined;
    const lng = form.locationLng.trim() ? Number(form.locationLng) : undefined;
    if (lat !== undefined && Number.isNaN(lat)) {
      setErrorMessage('위도 형식이 올바르지 않습니다.');
      return;
    }
    if (lng !== undefined && Number.isNaN(lng)) {
      setErrorMessage('경도 형식이 올바르지 않습니다.');
      return;
    }

    updateMutation.mutate({
      name: form.name.trim() || undefined,
      description: form.description.trim() || undefined,
      locationLat: lat,
      locationLng: lng,
      imageUrl: form.imageUrl.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card
        eyebrow="내 주막"
        title="부스 정보"
        description="손님에게 노출되는 주막 이름·설명·위치를 관리합니다."
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
            <Field label="위도" hint="latitude" htmlFor="booth-lat">
              <Input
                id="booth-lat"
                type="text"
                inputMode="decimal"
                numericMono
                value={form.locationLat}
                onChange={handleChange('locationLat')}
                placeholder="35.8888"
              />
            </Field>
            <Field label="경도" hint="longitude" htmlFor="booth-lng">
              <Input
                id="booth-lng"
                type="text"
                inputMode="decimal"
                numericMono
                value={form.locationLng}
                onChange={handleChange('locationLng')}
                placeholder="128.6111"
              />
            </Field>
          </div>
          <p className="-mt-2 inline-flex items-center gap-1 text-caption text-[var(--admin-text-faint)]">
            <MapPin size={12} />
            지도 핀 위치는 두 값이 모두 채워졌을 때만 표시됩니다.
          </p>

          {form.imageUrl.trim() ? (
            <div className="flex flex-col gap-2">
              <span className="eyebrow">이미지 미리보기</span>
              <img
                src={form.imageUrl}
                alt={`${form.name || '부스'} 미리보기`}
                className="h-32 w-full max-w-sm rounded-md border border-[var(--admin-border)] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex h-32 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]">
              <ImageIcon size={28} />
              <span className="text-caption">이미지 URL을 입력하면 미리보기가 표시됩니다.</span>
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
