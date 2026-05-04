import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import type { BoothListItem, BoothUpdateRequest } from '@/apis';

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

export default function BoothEditPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });

  if (boothsQuery.isLoading) {
    return <p className="text-body2 text-text-muted">불러오는 중…</p>;
  }
  if (boothsQuery.isError) {
    return (
      <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">
        {boothsQuery.error instanceof ApiClientError
          ? boothsQuery.error.message
          : '부스 정보를 불러오지 못했습니다.'}
      </p>
    );
  }

  const booth = boothsQuery.data?.find((b) => b.boothId === boothId);
  if (!booth) {
    return <p className="text-body2 text-text-muted">해당 부스를 찾을 수 없습니다.</p>;
  }

  return <BoothEditForm key={boothId} boothId={boothId} initial={toFormState(booth)} />;
}

interface BoothEditFormProps {
  boothId: number;
  initial: FormState;
}

function BoothEditForm({ boothId, initial }: BoothEditFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: BoothUpdateRequest) => boothApi.updateBooth(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
      navigate('/admin/super', { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof ApiClientError ? error.message : '수정에 실패했습니다.');
    },
  });

  const handleChange =
    (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-subheading font-semibold text-text">부스 #{boothId} 정보 수정</h2>

      <Field label="부스 이름">
        <input
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          maxLength={100}
        />
      </Field>

      <Field label="설명">
        <textarea
          value={form.description}
          onChange={handleChange('description')}
          className="min-h-24 rounded-md border border-border bg-surface px-3 py-2 text-body1"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="위도 (locationLat)">
          <input
            type="text"
            inputMode="decimal"
            value={form.locationLat}
            onChange={handleChange('locationLat')}
            className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          />
        </Field>
        <Field label="경도 (locationLng)">
          <input
            type="text"
            inputMode="decimal"
            value={form.locationLng}
            onChange={handleChange('locationLng')}
            className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          />
        </Field>
      </div>

      <Field label="대표 이미지 URL">
        <input
          type="text"
          value={form.imageUrl}
          onChange={handleChange('imageUrl')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          maxLength={500}
        />
      </Field>

      {errorMessage && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-body1 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
        >
          {updateMutation.isPending ? '저장 중…' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/super')}
          className="rounded-md border border-border bg-surface px-4 py-2 text-body1 text-text"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-body2 text-text">
      <span>{label}</span>
      {children}
    </label>
  );
}
