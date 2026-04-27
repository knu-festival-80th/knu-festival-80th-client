import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '@/components/layouts/MainLayout';
import GuestbookPage from '@/pages/GuestbookPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { GlobalStyles } from '@/styles/global';
import GoogleAnalytics from '@/utils/GoogleAnalytics';

export default function App() {
  return (
    <>
      <GlobalStyles />
      <GoogleAnalytics />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/guestbook" replace />} />
          <Route path="guestbook" element={<GuestbookPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}
