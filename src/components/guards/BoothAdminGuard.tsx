import { type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

interface BoothAdminGuardProps {
  children: ReactNode;
}

export default function BoothAdminGuard({ children }: BoothAdminGuardProps) {
  const role = useAuthStore((state) => state.role);
  const myBoothId = useAuthStore((state) => state.boothId);
  const { boothId: paramBoothId } = useParams<{ boothId: string }>();

  if (role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (role === 'BOOTH_ADMIN') {
    const targetBoothId = paramBoothId ? Number(paramBoothId) : null;
    if (myBoothId !== null && targetBoothId === myBoothId) {
      return <>{children}</>;
    }
    if (myBoothId !== null) {
      return <Navigate to={`/admin/booth/${myBoothId}`} replace />;
    }
  }

  return <Navigate to="/admin/login" replace />;
}
