import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import TavernMapPage from '@/pages/TavernMapPage';
import GoogleAnalytics from '@/utils/GoogleAnalytics';

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="map" element={<TavernMapPage />} />
          <Route path="taverns" element={<TavernMapPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}
