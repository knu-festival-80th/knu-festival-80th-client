import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { authApi } from '@/apis';
import { Button } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { to: '/console', label: '부스 목록', end: true },
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
    <div data-admin-theme="console" className="min-h-dvh">
      <header className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-[var(--admin-text)]">KNU 운영 콘솔</span>
            <span className="hidden rounded-full bg-[var(--admin-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--admin-primary)] sm:inline-flex">
              최고 관리자
            </span>
          </div>
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
        <nav
          aria-label="콘솔 메뉴"
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-[var(--admin-primary)] text-[var(--admin-text)]'
                    : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
