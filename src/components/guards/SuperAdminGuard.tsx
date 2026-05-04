import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

interface SuperAdminGuardProps {
  children: ReactNode;
}

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const role = useAuthStore((state) => state.role);
  const boothId = useAuthStore((state) => state.boothId);

  if (role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (role === 'BOOTH_ADMIN' && boothId !== null) {
    return <Navigate to={`/admin/booth/${boothId}`} replace />;
  }

  return <Navigate to="/admin/login" replace />;
}
