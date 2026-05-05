import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { authApi } from '@/apis';
import { Button } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { to: '/console', label: '부스', end: true },
  { to: '/console/booths/new', label: '신규 등록' },
];

export default function ConsoleShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate('/console/login', { replace: true });
    },
  });

  return (
    <div data-admin-theme="console" className="admin-frame admin-grain">
      <header className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="eyebrow text-[var(--admin-primary)]">KNU·80</span>
            <h1 className="text-subheading font-semibold tracking-tight text-[var(--admin-text)]">
              축제 운영 콘솔
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[var(--admin-primary)]/35 bg-[var(--admin-primary-soft)] px-3 py-1 text-caption font-semibold text-[var(--admin-primary)] sm:inline-flex">
              최고 관리자
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              iconLeft={<LogOut size={14} />}
            >
              {logoutMutation.isPending ? '로그아웃 중' : '로그아웃'}
            </Button>
          </div>
        </div>

        <nav
          aria-label="콘솔 메뉴"
          className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 pb-3 sm:px-8"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-1.5 text-body2 font-medium whitespace-nowrap',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]'
                    : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <p className="eyebrow text-[var(--admin-text-faint)]">
          KNU Festival · Operations Console · 2026
        </p>
      </footer>
    </div>
  );
}
