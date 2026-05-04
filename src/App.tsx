import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminShell from '@/components/layouts/AdminShell';
import MainLayout from '@/components/layouts/MainLayout';
import AuthGuard from '@/components/guards/AuthGuard';
import BoothAdminGuard from '@/components/guards/BoothAdminGuard';
import SuperAdminGuard from '@/components/guards/SuperAdminGuard';
import AdminEntryPage from '@/pages/admin/AdminEntryPage';
import LoginPage from '@/pages/admin/LoginPage';
import BoothLayout from '@/pages/admin/booth/BoothLayout';
import BoothProfilePage from '@/pages/admin/booth/BoothProfilePage';
import MenuFormPage from '@/pages/admin/booth/MenuFormPage';
import MenuListPage from '@/pages/admin/booth/MenuListPage';
import WaitingInsertPage from '@/pages/admin/booth/WaitingInsertPage';
import WaitingListPage from '@/pages/admin/booth/WaitingListPage';
import BoothCreatePage from '@/pages/admin/super/BoothCreatePage';
import BoothEditPage from '@/pages/admin/super/BoothEditPage';
import BoothListPage from '@/pages/admin/super/BoothListPage';
import BoothPasswordPage from '@/pages/admin/super/BoothPasswordPage';
import SuperLayout from '@/pages/admin/super/SuperLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import TimeTablePage from '@/pages/TimeTablePage';
import GoogleAnalytics from '@/utils/GoogleAnalytics';

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="timetable" element={<TimeTablePage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminShell />
            </AuthGuard>
          }
        >
          <Route index element={<AdminEntryPage />} />
          <Route
            path="super"
            element={
              <SuperAdminGuard>
                <SuperLayout />
              </SuperAdminGuard>
            }
          >
            <Route index element={<BoothListPage />} />
            <Route path="booths/new" element={<BoothCreatePage />} />
            <Route path="booths/:boothId/edit" element={<BoothEditPage />} />
            <Route path="booths/:boothId/password" element={<BoothPasswordPage />} />
          </Route>
          <Route
            path="booth/:boothId"
            element={
              <BoothAdminGuard>
                <BoothLayout />
              </BoothAdminGuard>
            }
          >
            <Route index element={<BoothProfilePage />} />
            <Route path="menus" element={<MenuListPage />} />
            <Route path="menus/new" element={<MenuFormPage />} />
            <Route path="menus/:menuId/edit" element={<MenuFormPage />} />
            <Route path="waitings" element={<WaitingListPage />} />
            <Route path="waitings/insert" element={<WaitingInsertPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}
