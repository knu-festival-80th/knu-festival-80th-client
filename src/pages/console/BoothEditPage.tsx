import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiClientError, boothApi, imageUrlToPath } from '@/apis';
import type { BoothListItem, BoothUpdateRequest, BoothType } from '@/apis';
import { Button } from '@/components/admin/ui';

import BoothFormFields, { type BoothFormState } from './booths/BoothFormFields';

function toFormState(booth: BoothListItem): BoothFormState {
  return {
    name: booth.name,
    department: booth.department ?? '',
    location: booth.location ?? '',
    xRatio: booth.xRatio ?? null,
    yRatio: booth.yRatio ?? null,
    menuBoardImageUrl: imageUrlToPath(booth.menuBoardImageUrl),
  };
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

      {booth && (
        <BoothEditForm
          key={boothId}
          boothId={boothId}
          boothType={(booth.type as BoothType) ?? (boothId <= 38 ? 'TAVERN' : 'BOOTH')}
          initial={toFormState(booth)}
        />
      )}
    </div>
  );
}

interface BoothEditFormProps {
  boothId: number;
  boothType: BoothType;
  initial: BoothFormState;
}

function BoothEditForm({ boothId, boothType, initial }: BoothEditFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BoothFormState>(initial);
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

  const updateForm = (patch: Partial<BoothFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    updateMutation.mutate({
      name: form.name.trim() || undefined,
      xRatio: form.xRatio ?? undefined,
      yRatio: form.yRatio ?? undefined,
      menuBoardImageUrl: form.menuBoardImageUrl.trim() || undefined,
      department: form.department.trim() || undefined,
      location: form.location.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        <BoothFormFields
          form={form}
          onChange={updateForm}
          boothId={boothId}
          boothType={boothType}
        />
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
