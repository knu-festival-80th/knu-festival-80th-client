import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import { Button, Card, Field, Input, Textarea } from '@/components/admin/ui';

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
      navigate('/console', { replace: true });
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
          eyebrow="신규 부스"
          title="신규 부스 등록"
          description="기본 정보와 운영진 비밀번호를 설정합니다."
          padding="lg"
        >
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5">
              <span className="eyebrow text-[var(--admin-text-faint)]">기본 정보</span>

              <Field label="부스 이름" required htmlFor="booth-name">
                <Input
                  id="booth-name"
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  maxLength={100}
                  required
                  placeholder="예: 컴퓨터학부 주막"
                />
              </Field>

              <Field label="설명" htmlFor="booth-description">
                <Textarea
                  id="booth-description"
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="부스 소개 문구"
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
                    placeholder="35.8889"
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
                    placeholder="128.6105"
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
                  placeholder="https://..."
                />
              </Field>
            </section>

            <hr className="my-2 border-[var(--admin-border)]" />

            <section className="flex flex-col gap-5">
              <span className="eyebrow text-[var(--admin-text-faint)]">운영진 인증</span>

              <Field
                label="관리 비밀번호"
                required
                hint="부스 운영진에게 직접 전달"
                htmlFor="booth-password"
              >
                <Input
                  id="booth-password"
                  type="password"
                  value={form.adminPassword}
                  onChange={handleChange('adminPassword')}
                  autoComplete="new-password"
                  required
                  placeholder="•••••••••••"
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
              <Button type="submit" variant="primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? '등록 중…' : '등록'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/console')}
                disabled={createMutation.isPending}
              >
                취소
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
