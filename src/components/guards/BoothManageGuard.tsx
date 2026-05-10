import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

interface BoothManageGuardProps {
  children: ReactNode;
}

export default function BoothManageGuard({ children }: BoothManageGuardProps) {
  const role = useAuthStore((s) => s.role);
  const boothId = useAuthStore((s) => s.boothId);

  if (role === 'BOOTH_ADMIN' && boothId !== null) {
    return <>{children}</>;
  }

  if (role === 'SUPER_ADMIN') {
    return <Navigate to="/console" replace />;
  }

  return <Navigate to="/booth/manage/login" replace />;
}
