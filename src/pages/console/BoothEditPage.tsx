import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, boothApi, imageUrlToPath } from '@/apis';
import type { BoothListItem, BoothUpdateRequest } from '@/apis';
import { Button, Card, Field, ImageUploadField, Input, Textarea } from '@/components/admin/ui';

interface FormState {
  name: string;
  description: string;
  xRatio: string;
  yRatio: string;
  menuBoardImageUrl: string;
}

function toFormState(booth: BoothListItem): FormState {
  return {
    name: booth.name,
    description: booth.description ?? '',
    xRatio: booth.xRatio?.toString() ?? '',
    yRatio: booth.yRatio?.toString() ?? '',
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

export default function BoothEditPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });

  const booth = boothsQuery.data?.find((b) => b.boothId === boothId);

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
          <span className="truncate text-[var(--admin-text-muted)]">
            {booth ? `${booth.name} 수정` : '부스 수정'}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--admin-text)]">
          {booth ? `${booth.name} 수정` : '부스 수정'}
        </h1>
      </div>

      {boothsQuery.isLoading && (
        <div className="py-16 text-center text-sm text-[var(--admin-text-muted)]">
          불러오는 중...
        </div>
      )}

      {boothsQuery.isError && (
        <div className="py-16 text-center text-sm text-[var(--admin-text-muted)]">
          <p className="mb-3">
            {boothsQuery.error instanceof ApiClientError
              ? boothsQuery.error.message
              : '부스 정보를 불러오지 못했습니다.'}
          </p>
          <Link to="/console" className="text-[var(--admin-primary)] hover:underline">
            부스 목록으로 돌아가기
          </Link>
        </div>
      )}

      {boothsQuery.data && !booth && (
        <div className="py-16 text-center text-sm text-[var(--admin-text-muted)]">
          <p className="mb-3">해당 부스를 찾을 수 없습니다.</p>
          <Link to="/console" className="text-[var(--admin-primary)] hover:underline">
            부스 목록으로 돌아가기
          </Link>
        </div>
      )}

      {booth && <BoothEditForm key={boothId} boothId={boothId} initial={toFormState(booth)} />}
    </div>
  );
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
      menuBoardImageUrl: form.menuBoardImageUrl.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[2fr_1fr] md:items-start md:gap-6">
        <Card padding="md">
          <h2 className="mb-4 text-base font-semibold text-[var(--admin-text)]">기본 정보</h2>
          <div className="flex flex-col gap-4">
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="X 좌표" hint="0 ~ 1" htmlFor="booth-x-ratio">
                <Input
                  id="booth-x-ratio"
                  type="text"
                  inputMode="decimal"
                  numericMono
                  value={form.xRatio}
                  onChange={handleChange('xRatio')}
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
                />
              </Field>
            </div>

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

        <div className="hidden md:block">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-[var(--admin-text)]">안내</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-[var(--admin-text-muted)]">
              <li>X/Y 좌표는 지도 위 부스 위치 비율 (0~1)입니다.</li>
              <li>비밀번호는 이 화면에서 변경할 수 없습니다. 부스 목록에서 별도 변경하세요.</li>
              <li>이미지는 정사각형 또는 가로형이 권장됩니다.</li>
            </ul>
          </Card>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-md border border-[var(--admin-danger)]/30 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? '저장 중...' : '저장'}
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
    </form>
  );
}
