import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Outlet, useNavigate } from 'react-router-dom';

import { authApi } from '@/apis';
import { useAuthStore } from '@/stores/authStore';

export default function AdminShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const boothId = useAuthStore((state) => state.boothId);
  const clearSession = useAuthStore((state) => state.clearSession);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate('/admin/login', { replace: true });
    },
  });

  const roleLabel =
    role === 'SUPER_ADMIN'
      ? '최고 관리자'
      : role === 'BOOTH_ADMIN'
        ? `주막 운영진 (#${boothId ?? '-'})`
        : '비로그인';

  return (
    <div className="page-frame flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-subheading font-semibold text-text">KNU 대동제 운영</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption text-primary">
              {roleLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-body2 text-text transition hover:bg-background disabled:opacity-60"
          >
            {logoutMutation.isPending ? '로그아웃 중…' : '로그아웃'}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
