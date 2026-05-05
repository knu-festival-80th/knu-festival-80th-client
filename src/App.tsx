import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import DefaultLayout from '@/components/layouts/DefaultLayout';
import MainLayout from '@/components/layouts/MainLayout';
import CongratVideoPage from '@/pages/CongratVideoPage';
import GoodsPage from '@/pages/GoodsPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import TimeTablePage from '@/pages/TimeTablePage';
import GoogleAnalytics from '@/utils/GoogleAnalytics';

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<DefaultLayout />}>
          <Route path="/timetable" element={<TimeTablePage />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/congrat-video" element={<CongratVideoPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}
