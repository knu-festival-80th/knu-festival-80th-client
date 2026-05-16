import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, LayoutList, LogOut, MapPin, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { authApi } from '@/apis';
import { Button } from '@/components/admin/ui';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { to: '/console', label: '부스 목록', Icon: LayoutList, end: true },
  { to: '/console/booths/new', label: '신규 등록', Icon: Plus },
  { to: '/console/map-editor', label: '위치 편집', Icon: MapPin },
  { to: '/console/matching', label: '인스타팅', Icon: Heart },
  { to: '/console/canvas', label: '롤링페이퍼', Icon: MessageSquare },
];

export default function ConsoleShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        '--console-header-h',
        `${entry.borderBoxSize[0].blockSize}px`,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      <header
        ref={headerRef}
        className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <span className="font-wanted-sans text-base font-bold tracking-tight text-[var(--admin-text)]">
            KNU Console
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
        <nav aria-label="콘솔 메뉴" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-[var(--admin-primary)] text-[var(--admin-text)]'
                    : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]',
                ].join(' ')
              }
            >
              <item.Icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
