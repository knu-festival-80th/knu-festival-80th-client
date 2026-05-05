import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import type { BoothListItem, BoothUpdateRequest } from '@/apis';
import { Button, Card, Field, Input, Textarea } from '@/components/admin/ui';

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

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/console"
        className="inline-flex items-center gap-1.5 self-start text-caption text-[var(--admin-text-muted)] transition hover:text-[var(--admin-text)]"
      >
        <ArrowLeft size={14} />
        부스 목록
      </Link>

      {boothsQuery.isLoading && <PageStatus message="불러오는 중…" />}

      {boothsQuery.isError && (
        <PageStatus
          tone="danger"
          message={
            boothsQuery.error instanceof ApiClientError
              ? boothsQuery.error.message
              : '부스 정보를 불러오지 못했습니다.'
          }
        />
      )}

      {boothsQuery.data &&
        (() => {
          const booth = boothsQuery.data.find((b) => b.boothId === boothId);
          if (!booth) {
            return <PageStatus message="해당 부스를 찾을 수 없습니다." />;
          }
          return (
            <BoothEditForm
              key={boothId}
              boothId={boothId}
              boothName={booth.name}
              initial={toFormState(booth)}
            />
          );
        })()}
    </div>
  );
}

function PageStatus({ message, tone = 'muted' }: { message: string; tone?: 'muted' | 'danger' }) {
  if (tone === 'danger') {
    return (
      <p
        role="alert"
        className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-4 py-12 text-center text-body2 text-[var(--admin-danger)]"
      >
        {message}
      </p>
    );
  }
  return (
    <p className="rounded-[14px] border border-dashed border-[var(--admin-border)] px-4 py-16 text-center text-body2 text-[var(--admin-text-muted)]">
      {message}
    </p>
  );
}

interface BoothEditFormProps {
  boothId: number;
  boothName: string;
  initial: FormState;
}

function BoothEditForm({ boothId, boothName, initial }: BoothEditFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: BoothUpdateRequest) => boothApi.updateBooth(boothId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
      navigate('/console', { replace: true });
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
    <form onSubmit={handleSubmit} noValidate>
      <Card
        eyebrow="정보 수정"
        title={`부스 #${boothId} 수정`}
        description={boothName}
        padding="lg"
      >
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-5">
            <span className="eyebrow text-[var(--admin-text-faint)]">기본 정보</span>

            <Field label="부스 이름" htmlFor="booth-name">
              <Input
                id="booth-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                maxLength={100}
              />
            </Field>

            <Field label="설명" htmlFor="booth-description">
              <Textarea
                id="booth-description"
                value={form.description}
                onChange={handleChange('description')}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="위도" hint="locationLat" htmlFor="booth-lat">
                <Input
                  id="booth-lat"
                  type="text"
                  inputMode="decimal"
                  numericMono
                  value={form.locationLat}
                  onChange={handleChange('locationLat')}
                />
              </Field>
              <Field label="경도" hint="locationLng" htmlFor="booth-lng">
                <Input
                  id="booth-lng"
                  type="text"
                  inputMode="decimal"
                  numericMono
                  value={form.locationLng}
                  onChange={handleChange('locationLng')}
                />
              </Field>
            </div>

            <Field label="대표 이미지 URL" htmlFor="booth-image">
              <Input
                id="booth-image"
                type="text"
                value={form.imageUrl}
                onChange={handleChange('imageUrl')}
                maxLength={500}
              />
            </Field>
          </section>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '저장 중…' : '저장'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/console')}
              disabled={updateMutation.isPending}
            >
              취소
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
