import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

interface ConsoleGuardProps {
  children: ReactNode;
}

export default function ConsoleGuard({ children }: ConsoleGuardProps) {
  const role = useAuthStore((s) => s.role);

  if (role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (role === 'BOOTH_ADMIN') {
    return <Navigate to="/booth/manage" replace />;
  }

  return <Navigate to="/console/login" replace />;
}
