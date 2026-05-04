import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { ApiClientError, menuApi } from '@/apis';

export default function MenuListPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);
  const queryClient = useQueryClient();

  const menusQuery = useQuery({
    queryKey: ['admin', 'booth', boothId, 'menus'],
    queryFn: () => menuApi.listMenus(boothId),
    enabled: Number.isInteger(boothId) && boothId > 0,
  });

  const toggleMutation = useMutation({
    mutationFn: (menuId: number) => menuApi.toggleMenuSoldOut(boothId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'menus'] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiClientError ? error.message : '품절 상태 변경에 실패했습니다.';
      alert(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (menuId: number) => menuApi.deleteMenu(boothId, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'menus'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : '메뉴 삭제에 실패했습니다.';
      alert(message);
    },
  });

  const handleDelete = (menuId: number, name: string) => {
    if (window.confirm(`"${name}" 메뉴를 삭제할까요?`)) {
      deleteMutation.mutate(menuId);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-subheading font-semibold text-text">메뉴</h2>
        <Link
          to={`/admin/booth/${boothId}/menus/new`}
          className="rounded-md bg-primary px-3 py-1.5 text-body2 font-semibold text-surface transition hover:opacity-90"
        >
          + 메뉴 추가
        </Link>
      </div>

      {menusQuery.isLoading && <p className="text-body2 text-text-muted">불러오는 중…</p>}

      {menusQuery.isError && (
        <p className="rounded-md bg-knu-red/10 px-3 py-2 text-body2 text-knu-red">
          {menusQuery.error instanceof ApiClientError
            ? menusQuery.error.message
            : '메뉴를 불러오지 못했습니다.'}
        </p>
      )}

      {menusQuery.data && menusQuery.data.length === 0 && (
        <p className="text-body2 text-text-muted">등록된 메뉴가 없습니다.</p>
      )}

      {menusQuery.data && menusQuery.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {menusQuery.data.map((menu) => (
            <li
              key={menu.menuId}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-body1 font-semibold text-text">
                  {menu.name}
                  {menu.soldOut && (
                    <span className="ml-2 rounded-full bg-knu-red/10 px-2 py-0.5 text-caption text-knu-red">
                      품절
                    </span>
                  )}
                </span>
                <span className="text-caption text-text-muted">
                  {menu.price.toLocaleString()}원{menu.description ? ` · ${menu.description}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(menu.menuId)}
                  disabled={toggleMutation.isPending}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background disabled:opacity-60"
                >
                  {menu.soldOut ? '판매 재개' : '품절 처리'}
                </button>
                <Link
                  to={`/admin/booth/${boothId}/menus/${menu.menuId}/edit`}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(menu.menuId, menu.name)}
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
