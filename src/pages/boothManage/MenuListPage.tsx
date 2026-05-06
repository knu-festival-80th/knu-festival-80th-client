import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ApiClientError, imagePathToSrc, menuApi } from '@/apis';
import type { MenuItem } from '@/apis';
import { Button, Card } from '@/components/admin/ui';
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold text-[var(--admin-text)]">메뉴</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            <span className="tabular">{count}</span>개 메뉴
          </p>
        </div>
        <Link to="/booth/manage/menus/new">
          <Button variant="primary" size="md" iconLeft={<Plus size={14} />}>
            메뉴 추가
          </Button>
        </Link>
      </div>

      {menusQuery.isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-md bg-[var(--admin-surface-hover)]"
            />
          ))}
        </div>
      )}

      {menusQuery.isError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--admin-danger)]/35 bg-[var(--admin-danger-soft)] px-3 py-2 text-sm text-[var(--admin-danger)]"
        >
          {menusQuery.error instanceof ApiClientError
            ? menusQuery.error.message
            : '메뉴를 불러오지 못했습니다.'}
        </div>
      )}

      {menusQuery.data && count === 0 && (
        <Card padding="md">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-[var(--admin-text-muted)]">등록된 메뉴가 없습니다.</p>
            <Link to="/booth/manage/menus/new">
              <Button variant="primary" size="md" iconLeft={<Plus size={14} />}>
                메뉴 추가
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {menusQuery.data && count > 0 && (
        <ul className="flex flex-col gap-2">
          {menus.map((menu) => (
            <li key={menu.menuId}>
              <MenuRow
                menu={menu}
                togglePending={toggleMutation.isPending}
                deletePending={deleteMutation.isPending}
                onToggle={() => toggleMutation.mutate(menu.menuId)}
                onDelete={() => handleDelete(menu.menuId, menu.name)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface MenuRowProps {
  menu: MenuItem;
  togglePending: boolean;
  deletePending: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function MenuRow({ menu, togglePending, deletePending, onToggle, onDelete }: MenuRowProps) {
  const thumbSrc = imagePathToSrc(menu.imageUrl ?? '');

  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={menu.name}
            className="h-14 w-14 shrink-0 rounded-md border border-[var(--admin-border)] object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]">
            <ImageIcon size={20} />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-[var(--admin-text)]">{menu.name}</span>
          {menu.description && (
            <span className="line-clamp-1 text-xs text-[var(--admin-text-muted)]">
              {menu.description}
            </span>
          )}
          <span className="tabular text-sm font-semibold text-[var(--admin-text)]">
            {menu.price.toLocaleString()}
            <span className="ml-0.5 text-xs font-normal text-[var(--admin-text-muted)]">원</span>
          </span>
        </div>

        {menu.soldOut && (
          <span className="shrink-0 rounded-full bg-[var(--admin-surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--admin-text-muted)]">
            품절
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-[var(--admin-border)] pt-3">
        {menu.soldOut ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onToggle}
            disabled={togglePending}
            className="min-h-9"
          >
            판매 재개
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            disabled={togglePending}
            className="min-h-9"
          >
            품절 처리
          </Button>
        )}
        <Link to={`/booth/manage/menus/${menu.menuId}/edit`}>
          <Button variant="ghost" size="sm" iconLeft={<Pencil size={14} />} className="min-h-9">
            수정
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={deletePending}
          iconLeft={<Trash2 size={14} />}
          className="ml-auto min-h-9 text-[var(--admin-danger)] hover:text-[var(--admin-danger)]"
        >
          삭제
        </Button>
      </div>
    </Card>
  );
}
