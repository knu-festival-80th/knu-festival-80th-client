import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AdminRole } from '@/apis';

interface AuthState {
  role: AdminRole | null;
  boothId: number | null;
  isAuthenticated: boolean;
  setSession: (role: AdminRole, boothId: number | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      boothId: null,
      isAuthenticated: false,
      setSession: (role, boothId) => set({ role, boothId, isAuthenticated: true }),
      clearSession: () => set({ role: null, boothId: null, isAuthenticated: false }),
    }),
    {
      name: 'knu-festival-admin-session',
      partialize: (state) => ({
        role: state.role,
        boothId: state.boothId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
