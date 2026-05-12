import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BoothManageShell from '@/components/layouts/BoothManageShell';
import ConsoleShell from '@/components/layouts/ConsoleShell';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import MainLayout from '@/components/layouts/MainLayout';
import BoothManageGuard from '@/components/guards/BoothManageGuard';
import ConsoleGuard from '@/components/guards/ConsoleGuard';
import BoothManageLoginPage from '@/pages/boothManage/BoothManageLoginPage';
import BoothProfilePage from '@/pages/boothManage/BoothProfilePage';
import WaitingListPage from '@/pages/boothManage/WaitingListPage';
import BoothCreatePage from '@/pages/console/BoothCreatePage';
import BoothEditPage from '@/pages/console/BoothEditPage';
import BoothListPage from '@/pages/console/BoothListPage';
import BoothPasswordPage from '@/pages/console/BoothPasswordPage';
import ConsoleLoginPage from '@/pages/console/ConsoleLoginPage';
import CongratVideoPage from '@/pages/CongratVideoPage';
import GoodsPage from '@/pages/GoodsPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import TavernDetailPage from '@/pages/TavernDetailPage';
import TavernMapPage from '@/pages/TavernMapPage';
import TimeTablePage from '@/pages/TimeTablePage';
import GoogleAnalytics from '@/utils/GoogleAnalytics';
import StampTourPage from './pages/stampTour/StampTourPage';
import StampBoothListPage from './pages/stampTour/StampBoothListPage';
import InstatingPage from './pages/InstatingPage';
import InstatingIntroView from './components/instating/views/InstatingIntroView';
import InstatingApplyView from './components/instating/views/InstatingApplyView';
import InstatingResultView from './components/instating/views/InstatingResultView';

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
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
          <Route path="waitings" element={<WaitingListPage />} />
          <Route
            path="waitings/insert"
            element={<Navigate to="/booth/manage/waitings" replace />}
          />
        </Route>

        <Route element={<DefaultLayout />}>
          <Route path="/map" element={<TavernMapPage />} />
          <Route path="/taverns" element={<TavernMapPage />} />
          <Route path="/taverns/:boothId" element={<TavernDetailPage />} />
          <Route path="/timetable" element={<TimeTablePage />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/stamptour" element={<StampTourPage />} />
          <Route path="/stamptour/booths" element={<StampBoothListPage />} />
          <Route path="/instating" element={<InstatingPage />}>
            <Route index element={<InstatingIntroView />} />
            <Route path="apply" element={<InstatingApplyView />} />
            <Route path="result" element={<InstatingResultView />} />
          </Route>
          <Route path="/congrat-video" element={<CongratVideoPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}
