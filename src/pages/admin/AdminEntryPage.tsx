import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

export default function AdminEntryPage() {
  const role = useAuthStore((state) => state.role);
  const boothId = useAuthStore((state) => state.boothId);

  if (role === 'SUPER_ADMIN') {
    return <Navigate to="/admin/super" replace />;
  }

  if (role === 'BOOTH_ADMIN' && boothId !== null) {
    return <Navigate to={`/admin/booth/${boothId}`} replace />;
  }

  return <Navigate to="/admin/login" replace />;
}
