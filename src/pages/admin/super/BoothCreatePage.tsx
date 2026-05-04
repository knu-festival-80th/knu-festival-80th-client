import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';

interface FormState {
  name: string;
  description: string;
  locationLat: string;
  locationLng: string;
  imageUrl: string;
  adminPassword: string;
}

const INITIAL_STATE: FormState = {
  name: '',
  description: '',
  locationLat: '',
  locationLng: '',
  imageUrl: '',
  adminPassword: '',
};

export default function BoothCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: boothApi.createBooth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
      navigate('/admin/super', { replace: true });
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : '부스 등록에 실패했습니다.',
      );
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

    if (!form.name.trim()) {
      setErrorMessage('부스 이름은 필수입니다.');
      return;
    }
    if (!form.adminPassword.trim()) {
      setErrorMessage('관리 비밀번호는 필수입니다.');
      return;
    }

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

    createMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      locationLat: lat,
      locationLng: lng,
      imageUrl: form.imageUrl.trim() || undefined,
      adminPassword: form.adminPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-subheading font-semibold text-text">신규 부스 등록</h2>

      <Field label="부스 이름" required>
        <input
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          maxLength={100}
          required
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
            placeholder="예: 35.8889"
          />
        </Field>
        <Field label="경도 (locationLng)">
          <input
            type="text"
            inputMode="decimal"
            value={form.locationLng}
            onChange={handleChange('locationLng')}
            className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
            placeholder="예: 128.6105"
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

      <Field label="부스 관리 비밀번호" required>
        <input
          type="password"
          value={form.adminPassword}
          onChange={handleChange('adminPassword')}
          className="rounded-md border border-border bg-surface px-3 py-2 text-body1"
          autoComplete="new-password"
          required
        />
      </Field>

      {errorMessage && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-body1 font-semibold text-surface transition hover:opacity-90 disabled:opacity-60"
        >
          {createMutation.isPending ? '등록 중…' : '등록'}
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
