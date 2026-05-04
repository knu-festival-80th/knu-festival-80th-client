import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiClientError, boothApi } from '@/apis';
import type { BoothSort } from '@/apis';

export default function BoothListPage() {
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<BoothSort>('likes');

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort }],
    queryFn: () => boothApi.listAdminBooths(sort),
  });

  const deleteMutation = useMutation({
    mutationFn: boothApi.deleteBooth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : '부스 삭제에 실패했습니다.';
      alert(message);
    },
  });

  const handleDelete = (boothId: number, name: string) => {
    if (window.confirm(`"${name}" 부스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteMutation.mutate(boothId);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-subheading font-semibold text-text">전체 부스</h2>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as BoothSort)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text"
        >
          <option value="likes">좋아요 순</option>
          <option value="waiting-asc">대기 적은 순</option>
        </select>
      </div>

      {boothsQuery.isLoading && <p className="text-body2 text-text-muted">불러오는 중…</p>}

      {boothsQuery.isError && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">
          {boothsQuery.error instanceof ApiClientError
            ? boothsQuery.error.message
            : '목록을 불러오지 못했습니다.'}
        </p>
      )}

      {boothsQuery.data && boothsQuery.data.length === 0 && (
        <p className="text-body2 text-text-muted">등록된 부스가 없습니다.</p>
      )}

      {boothsQuery.data && boothsQuery.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {boothsQuery.data.map((booth) => (
            <li
              key={booth.boothId}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-body1 font-semibold text-text">
                  #{booth.boothId} · {booth.name}
                </span>
                <span className="text-caption text-text-muted">
                  좋아요 {booth.likeCount} · 대기 {booth.currentWaitingTeams}팀 ·{' '}
                  {booth.waitingOpen ? '접수중' : '접수중단'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/admin/booth/${booth.boothId}`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background"
                >
                  운영 화면
                </Link>
                <Link
                  to={`/admin/super/booths/${booth.boothId}/edit`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background"
                >
                  정보 수정
                </Link>
                <Link
                  to={`/admin/super/booths/${booth.boothId}/password`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background"
                >
                  비밀번호 변경
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(booth.boothId, booth.name)}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-knu-red/30 bg-knu-red/5 px-3 py-1.5 text-body2 text-knu-red transition hover:bg-knu-red/10 disabled:opacity-60"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
