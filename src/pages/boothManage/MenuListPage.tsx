import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ApiClientError, menuApi } from '@/apis';
import { Button, Card, StatusBadge } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

export default function MenuListPage() {
  const boothId = useAuthStore((s) => s.boothId);
  const queryClient = useQueryClient();

  const menusQuery = useQuery({
    queryKey: ['admin', 'booth', boothId, 'menus'],
    queryFn: () => menuApi.listMenus(boothId as number),
    enabled: boothId !== null && Number.isInteger(boothId) && boothId > 0,
  });

  const toggleMutation = useMutation({
    mutationFn: (menuId: number) => menuApi.toggleMenuSoldOut(boothId as number, menuId),
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
    mutationFn: (menuId: number) => menuApi.deleteMenu(boothId as number, menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'menus'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : '메뉴 삭제에 실패했습니다.';
      alert(message);
    },
  });

  if (boothId === null) return null;

  const handleDelete = (menuId: number, name: string) => {
    if (window.confirm(`"${name}" 메뉴를 삭제할까요?`)) {
      deleteMutation.mutate(menuId);
    }
  };

  const menus = menusQuery.data ?? [];
  const count = menus.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">메뉴</span>
          <h2 className="text-heading2 font-semibold text-[var(--admin-text)]">
            <span className="tabular">{count}</span>개 메뉴
          </h2>
        </div>
        <Link to="/booth/manage/menus/new">
          <Button variant="primary" size="md" iconLeft={<Plus size={18} />}>
            메뉴 추가
          </Button>
        </Link>
      </div>

      {menusQuery.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)]"
            />
          ))}
        </div>
      )}

      {menusQuery.isError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-body2 text-[var(--admin-danger)]"
        >
          {menusQuery.error instanceof ApiClientError
            ? menusQuery.error.message
            : '메뉴를 불러오지 못했습니다.'}
        </div>
      )}

      {menusQuery.data && count === 0 && (
        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]">
              <ImageIcon size={28} />
            </div>
            <p className="text-body1 font-semibold text-[var(--admin-text)]">
              아직 등록된 메뉴가 없습니다
            </p>
            <p className="max-w-xs text-body2 text-[var(--admin-text-muted)]">
              첫 메뉴를 등록하면 손님에게 가격과 사진이 노출됩니다.
            </p>
            <Link to="/booth/manage/menus/new" className="mt-2">
              <Button variant="primary" size="md" iconLeft={<Plus size={18} />}>
                첫 메뉴 추가하기
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {menusQuery.data && count > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menus.map((menu) => (
            <li
              key={menu.menuId}
              className="relative flex flex-col gap-3 rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-[var(--admin-shadow-card)]"
            >
              {menu.soldOut && (
                <div className="absolute right-3 top-3">
                  <StatusBadge tone="cancelled">품절</StatusBadge>
                </div>
              )}

              <div className="flex items-start gap-3">
                {menu.imageUrl ? (
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="h-16 w-16 flex-shrink-0 rounded-md border border-[var(--admin-border)] object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]">
                    <ImageIcon size={22} />
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate pr-16 text-subheading font-semibold text-[var(--admin-text)]">
                    {menu.name}
                  </span>
                  {menu.description && (
                    <span className="line-clamp-2 text-caption text-[var(--admin-text-muted)]">
                      {menu.description}
                    </span>
                  )}
                  <span className="tabular text-heading2 font-bold text-[var(--admin-text)]">
                    {menu.price.toLocaleString()}
                    <span className="ml-1 text-body2 font-medium text-[var(--admin-text-muted)]">
                      원
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[var(--admin-border)] pt-3">
                <Button
                  variant={menu.soldOut ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => toggleMutation.mutate(menu.menuId)}
                  disabled={toggleMutation.isPending}
                >
                  {menu.soldOut ? '판매 재개' : '품절 처리'}
                </Button>
                <Link to={`/booth/manage/menus/${menu.menuId}/edit`}>
                  <Button variant="ghost" size="sm" iconLeft={<Pencil size={14} />}>
                    수정
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(menu.menuId, menu.name)}
                  disabled={deleteMutation.isPending}
                  iconLeft={<Trash2 size={14} />}
                  className="ml-auto"
                >
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
