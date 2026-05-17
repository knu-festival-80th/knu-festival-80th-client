import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BoothManageShell from '@/components/layouts/BoothManageShell';
import ConsoleShell from '@/components/layouts/ConsoleShell';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import MainLayout from '@/components/layouts/MainLayout';
import BoothManageGuard from '@/components/guards/BoothManageGuard';
import ConsoleGuard from '@/components/guards/ConsoleGuard';
import GoogleAnalytics from '@/utils/GoogleAnalytics';
import PostHogPageView from '@/utils/PostHogPageView';
import PageLoader from '@/components/common/PageLoader';
import { HobanustagramFallback } from '@/components/hobanustagram/HobanustagramFallback';

const BoothManageLoginPage = lazy(() => import('@/pages/boothManage/BoothManageLoginPage'));
const BoothProfilePage = lazy(() => import('@/pages/boothManage/BoothProfilePage'));
const WaitingListPage = lazy(() => import('@/pages/boothManage/WaitingListPage'));
const BoothCreatePage = lazy(() => import('@/pages/console/BoothCreatePage'));
const BoothEditPage = lazy(() => import('@/pages/console/BoothEditPage'));
const BoothListPage = lazy(() => import('@/pages/console/BoothListPage'));
const BulkMapEditorPage = lazy(() => import('@/pages/console/BulkMapEditorPage'));
const BoothPasswordPage = lazy(() => import('@/pages/console/BoothPasswordPage'));
const CanvasAdminPage = lazy(() => import('@/pages/console/CanvasAdminPage'));
const ConsoleLoginPage = lazy(() => import('@/pages/console/ConsoleLoginPage'));
const MatchingOverviewPage = lazy(() => import('@/pages/console/MatchingOverviewPage'));
const CongratVideoPage = lazy(() => import('@/pages/CongratVideoPage'));
const GoodsPage = lazy(() => import('@/pages/GoodsPage'));
const HobanustagramPage = lazy(() => import('@/pages/HobanustagramPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const RollingPaperBoardPage = lazy(() => import('@/pages/RollingPaperBoardPage'));
const RollingPaperCategorySelectPage = lazy(() => import('@/pages/RollingPaperCategorySelectPage'));
const RollingPaperChannelSelectPage = lazy(() => import('@/pages/RollingPaperChannelSelectPage'));
const RollingPaperIntroPage = lazy(() => import('@/pages/RollingPaperIntroPage'));
const TavernDetailPage = lazy(() => import('@/pages/TavernDetailPage'));
const TavernMapPage = lazy(() => import('@/pages/TavernMapPage'));
const TimeTablePage = lazy(() => import('@/pages/TimeTablePage'));
const StampTourPage = lazy(() => import('@/pages/StampTourPage'));
const StampTourIntroView = lazy(() => import('@/components/stampTour/views/StampTourIntroView'));
const StampBoothListView = lazy(() => import('@/components/stampTour/views/StampBoothListView'));
const InstatingPage = lazy(() => import('@/pages/InstatingPage'));
const InstatingIntroView = lazy(() => import('@/components/instating/views/InstatingIntroView'));
const InstatingApplyView = lazy(() => import('@/components/instating/views/InstatingApplyView'));
const InstatingResultView = lazy(() => import('@/components/instating/views/InstatingResultView'));

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <PostHogPageView />
      <Suspense fallback={<PageLoader />}>
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
            <Route path="map-editor" element={<BulkMapEditorPage />} />
            <Route path="booths/:boothId/edit" element={<BoothEditPage />} />
            <Route path="booths/:boothId/password" element={<BoothPasswordPage />} />
            <Route path="matching" element={<MatchingOverviewPage />} />
            <Route path="canvas" element={<CanvasAdminPage />} />
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
            <Route path="/stamptour" element={<StampTourPage />}>
              <Route index element={<StampTourIntroView />} />
              <Route path="booths" element={<StampBoothListView />} />
            </Route>
            <Route
              path="/hobanustagram"
              element={
                <Suspense
                  fallback={<HobanustagramFallback className="min-h-[calc(100dvh-4rem)]" />}
                >
                  <HobanustagramPage />
                </Suspense>
              }
            />
            <Route path="/instating" element={<InstatingPage />}>
              <Route index element={<InstatingIntroView />} />
              <Route path="apply" element={<InstatingApplyView />} />
              <Route path="result" element={<InstatingResultView />} />
            </Route>
            <Route path="/congrat-video" element={<CongratVideoPage />} />
            <Route path="/rolling-paper" element={<RollingPaperIntroPage />} />
            <Route path="/rolling-paper/categories" element={<RollingPaperCategorySelectPage />} />
            <Route
              path="/rolling-paper/categories/:categoryId/channels"
              element={<RollingPaperChannelSelectPage />}
            />
            <Route path="/rolling-paper/board" element={<RollingPaperBoardPage />} />
            <Route
              path="/rolling-paper/board/:categoryId/:channelId"
              element={<RollingPaperBoardPage />}
            />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <Analytics />
    </>
  );
}
