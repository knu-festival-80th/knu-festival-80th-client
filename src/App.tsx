import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import BoothManageShell from '@/components/layouts/BoothManageShell';
import ConsoleShell from '@/components/layouts/ConsoleShell';
import MainLayout from '@/components/layouts/MainLayout';
import BoothManageGuard from '@/components/guards/BoothManageGuard';
import ConsoleGuard from '@/components/guards/ConsoleGuard';
import BoothManageLoginPage from '@/pages/boothManage/BoothManageLoginPage';
import BoothProfilePage from '@/pages/boothManage/BoothProfilePage';
import MenuFormPage from '@/pages/boothManage/MenuFormPage';
import MenuListPage from '@/pages/boothManage/MenuListPage';
import WaitingInsertPage from '@/pages/boothManage/WaitingInsertPage';
import WaitingListPage from '@/pages/boothManage/WaitingListPage';
import BoothCreatePage from '@/pages/console/BoothCreatePage';
import BoothEditPage from '@/pages/console/BoothEditPage';
import BoothListPage from '@/pages/console/BoothListPage';
import BoothPasswordPage from '@/pages/console/BoothPasswordPage';
import ConsoleLoginPage from '@/pages/console/ConsoleLoginPage';
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

        <Route path="/console/login" element={<ConsoleLoginPage />} />
        <Route
          path="/console"
          element={
            <ConsoleGuard>
              <ConsoleShell />
            </ConsoleGuard>
          }
        >
          <Route index element={<BoothListPage />} />
          <Route path="booths/new" element={<BoothCreatePage />} />
          <Route path="booths/:boothId/edit" element={<BoothEditPage />} />
          <Route path="booths/:boothId/password" element={<BoothPasswordPage />} />
        </Route>

        <Route path="/booth/manage/login" element={<BoothManageLoginPage />} />
        <Route
          path="/booth/manage"
          element={
            <BoothManageGuard>
              <BoothManageShell />
            </BoothManageGuard>
          }
        >
          <Route index element={<BoothProfilePage />} />
          <Route path="menus" element={<MenuListPage />} />
          <Route path="menus/new" element={<MenuFormPage />} />
          <Route path="menus/:menuId/edit" element={<MenuFormPage />} />
          <Route path="waitings" element={<WaitingListPage />} />
          <Route path="waitings/insert" element={<WaitingInsertPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}
