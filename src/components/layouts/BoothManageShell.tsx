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
    <div data-admin-theme="booth" className="admin-frame flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-3.5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="eyebrow text-[var(--admin-text-faint)]">
                {boothId ? `BOOTH #${boothId}` : '주막 운영진'}
              </span>
              <h1 className="truncate text-subheading font-bold tracking-tight text-[var(--admin-text)]">
                {myBooth?.name ?? (boothsQuery.isLoading ? '불러오는 중…' : '내 주막')}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {myBooth && (
                <span
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold',
                    myBooth.waitingOpen
                      ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                      : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-muted)]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'h-1.5 w-1.5 rounded-full',
                      myBooth.waitingOpen
                        ? 'animate-pulse bg-[var(--admin-success)]'
                        : 'bg-[var(--admin-text-muted)]',
                    ].join(' ')}
                  />
                  {myBooth.waitingOpen ? '접수중' : '접수중단'}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                iconLeft={<LogOut size={14} />}
              >
                <span className="hidden sm:inline">
                  {logoutMutation.isPending ? '로그아웃 중' : '로그아웃'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pb-8">
        <Outlet />
      </main>

      <nav
        aria-label="부스 운영 탭"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--admin-border)] bg-[var(--admin-surface)]/95 backdrop-blur sm:relative sm:border-0 sm:bg-transparent"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-3 sm:flex sm:gap-2 sm:px-6 sm:pb-4">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center justify-center gap-1.5 py-3 text-caption font-semibold',
                  'transition-colors duration-150',
                  'sm:rounded-full sm:px-4 sm:py-2 sm:text-body2',
                  isActive
                    ? 'text-[var(--admin-primary)] sm:bg-[var(--admin-primary)] sm:text-[var(--admin-primary-fg)]'
                    : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] sm:hover:bg-[var(--admin-surface-hover)]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} className="sm:hidden" />
                  <Icon size={15} strokeWidth={2} className="hidden sm:inline" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
