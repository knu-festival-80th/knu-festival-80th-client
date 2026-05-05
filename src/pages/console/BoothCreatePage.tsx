import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import { Button, Card, Field, Input, Textarea } from '@/components/admin/ui';

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
                <Field label="X 좌표" hint="0 ~ 1 (지도 가로 비율)" htmlFor="booth-x-ratio">
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
                <Field label="Y 좌표" hint="0 ~ 1 (지도 세로 비율)" htmlFor="booth-y-ratio">
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
              <p className="-mt-2 text-caption text-[var(--admin-text-faint)]">
                축제 지도 이미지에서의 비율 좌표입니다. 추후 지도 컴포넌트가 완성되면 클릭으로
                선택할 수 있도록 교체될 예정입니다.
              </p>

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

              <Field label="메뉴판 이미지 URL" hint="부스당 1장" htmlFor="booth-menu-board">
                <Input
                  id="booth-menu-board"
                  type="text"
                  value={form.menuBoardImageUrl}
                  onChange={handleChange('menuBoardImageUrl')}
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
