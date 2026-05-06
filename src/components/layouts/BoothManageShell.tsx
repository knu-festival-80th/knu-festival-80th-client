import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Store, Utensils, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { authApi, boothApi } from '@/apis';
import { Button } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

const TABS = [
  { to: '/booth/manage', label: '부스 정보', Icon: Store, end: true },
  { to: '/booth/manage/menus', label: '메뉴', Icon: Utensils },
  { to: '/booth/manage/waitings', label: '대기열', Icon: Users },
];

export default function BoothManageShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const boothId = useAuthStore((s) => s.boothId);

  const boothsQuery = useQuery({
    queryKey: ['admin', 'booths', { sort: 'likes' }],
    queryFn: () => boothApi.listAdminBooths('likes'),
  });
  const myBooth = boothsQuery.data?.find((b) => b.boothId === boothId);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate('/booth/manage/login', { replace: true });
    },
  });

  return (
    <div data-admin-theme="booth" className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-2">
            {boothId !== null && (
              <span className="text-xs font-medium text-[var(--admin-text-faint)] tabular">
                #{boothId}
              </span>
            )}
            <h1 className="truncate text-base font-semibold text-[var(--admin-text)]">
              {myBooth?.name ?? (boothsQuery.isLoading ? '불러오는 중…' : '내 주막')}
            </h1>
            {myBooth && (
              <span
                className={[
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  myBooth.waitingOpen
                    ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                    : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]',
                ].join(' ')}
              >
                {myBooth.waitingOpen ? '접수중' : '접수중단'}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            iconLeft={<LogOut size={14} />}
            aria-label="로그아웃"
          >
            <span className="hidden sm:inline">
              {logoutMutation.isPending ? '로그아웃 중' : '로그아웃'}
            </span>
          </Button>
        </div>
        <nav
          aria-label="부스 운영 탭 (데스크톱)"
          className="mx-auto hidden max-w-3xl gap-1 px-4 sm:flex sm:px-6"
        >
          {TABS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[var(--admin-primary)] text-[var(--admin-text)]'
                    : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-10">
        <Outlet />
      </main>

      <nav
        aria-label="부스 운영 탭 (모바일)"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-3">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-[var(--admin-primary)]'
                    : 'text-[var(--admin-text-muted)] active:text-[var(--admin-text)]',
                ].join(' ')
              }
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
