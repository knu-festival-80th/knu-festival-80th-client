import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import { Button, Card, Field, ImageUploadField, Input, Textarea } from '@/components/admin/ui';

interface FormState {
  name: string;
  description: string;
  xRatio: string;
  yRatio: string;
  imageUrl: string;
  menuBoardImageUrl: string;
  adminPassword: string;
}

const INITIAL_STATE: FormState = {
  name: '',
  description: '',
  xRatio: '',
  yRatio: '',
  imageUrl: '',
  menuBoardImageUrl: '',
  adminPassword: '',
};

function parseRatio(raw: string): { value: number | undefined; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: undefined, error: null };
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return { value: undefined, error: '숫자만 입력해 주세요.' };
  if (num < 0 || num > 1) return { value: undefined, error: '0과 1 사이의 값이어야 합니다.' };
  return { value: num, error: null };
}

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

    createMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      xRatio: x.value,
      yRatio: y.value,
      imageUrl: form.imageUrl.trim() || undefined,
      menuBoardImageUrl: form.menuBoardImageUrl.trim() || undefined,
      adminPassword: form.adminPassword,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/console"
            className="inline-flex items-center gap-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          >
            <ArrowLeft size={14} />
            부스 목록
          </Link>
          <span className="text-[var(--admin-text-faint)]">/</span>
          <span className="text-[var(--admin-text-muted)]">신규 부스 등록</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--admin-text)]">신규 부스</h1>
        <p className="text-sm text-[var(--admin-text-muted)]">
          부스 정보와 운영진 비밀번호를 설정합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Card padding="md">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--admin-text)]">기본 정보</h2>
            <p className="text-sm text-[var(--admin-text-muted)]">
              지도와 안내 페이지에 노출되는 정보입니다.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-4">
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="X 좌표" hint="0 ~ 1" htmlFor="booth-x-ratio">
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
              <Field label="Y 좌표" hint="0 ~ 1" htmlFor="booth-y-ratio">
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
              onChange={(next) => setForm((prev) => ({ ...prev, imageUrl: next }))}
              emptyMessage="부스 대표 이미지를 업로드하세요."
            />

            <ImageUploadField
              label="메뉴판 이미지"
              hint="부스당 1장"
              value={form.menuBoardImageUrl}
              onChange={(next) => setForm((prev) => ({ ...prev, menuBoardImageUrl: next }))}
              emptyMessage="메뉴판 사진을 업로드하세요."
              previewClassName="max-h-72 w-full max-w-sm object-contain"
            />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--admin-text)]">운영진 인증</h2>
            <p className="text-sm text-[var(--admin-text-muted)]">
              부스 운영진에게 별도 채널로 안전하게 전달하세요.
            </p>
          </div>

          <div className="mt-5">
            <Field
              label="관리 비밀번호"
              required
              hint="운영진에게 직접 전달"
              htmlFor="booth-password"
            >
              <Input
                id="booth-password"
                type="password"
                value={form.adminPassword}
                onChange={handleChange('adminPassword')}
                autoComplete="new-password"
                required
                placeholder="..........."
              />
            </Field>
          </div>
        </Card>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
          >
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? '등록 중...' : '등록'}
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
      </form>
    </div>
  );
}
