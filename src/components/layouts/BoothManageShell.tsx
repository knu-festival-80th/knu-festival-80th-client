import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Store, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { authApi, boothApi } from '@/apis';
import { useAuthStore } from '@/stores/authStore';

const TABS = [
  { to: '/booth/manage', label: '부스 정보', Icon: Store, end: true },
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
    <div data-admin-theme="booth" className="min-h-dvh bg-[var(--admin-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="truncate text-[17px] font-bold text-[var(--admin-text)]">
              {myBooth?.name ?? (boothsQuery.isLoading ? '...' : '내 주막')}
            </h1>
            {myBooth && (
              <span
                className={[
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                  myBooth.waitingOpen
                    ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                    : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-faint)]',
                ].join(' ')}
              >
                {myBooth.waitingOpen ? '접수중' : '중단'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-text-faint)] transition-colors hover:bg-[var(--admin-surface-hover)] disabled:opacity-50"
            aria-label="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
        <nav
          aria-label="부스 운영 탭 (데스크톱)"
          className="mx-auto hidden max-w-3xl gap-1 px-5 sm:flex"
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
                    ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]'
                    : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pt-5 pb-24 sm:pt-6 sm:pb-10">
        <Outlet />
      </main>

      <nav
        aria-label="부스 운영 탭 (모바일)"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--admin-border)] bg-white sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-2">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'text-[var(--admin-primary)]' : 'text-[var(--admin-text-faint)]',
                ].join(' ')
              }
            >
              <Icon size={22} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
