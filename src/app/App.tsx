import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router'
import { Spinner } from '@/components/ui/Spinner'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AppShell } from './AppShell'
import { NotFoundPage } from './NotFoundPage'
import { Providers } from './providers'

/**
 * Mỗi màn là một chunk riêng: dispatcher không tải code tài xế, tablet kho
 * không tải recharts của dashboard, và Three.js chỉ nằm trong màn 3D.
 */
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/features/manager/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const TripListPage = lazy(() => import('@/features/trips/TripListPage').then((m) => ({ default: m.TripListPage })))
const TripFormPage = lazy(() => import('@/features/trips/TripFormPage').then((m) => ({ default: m.TripFormPage })))
const TripDetailPage = lazy(() => import('@/features/trips/TripDetailPage').then((m) => ({ default: m.TripDetailPage })))
const PlanComparisonPage = lazy(() => import('@/features/trips/PlanComparisonPage').then((m) => ({ default: m.PlanComparisonPage })))
const ViewerPage = lazy(() => import('@/features/viewer3d/ViewerPage').then((m) => ({ default: m.ViewerPage })))
const LoadingStepPage = lazy(() => import('@/features/warehouse/LoadingStepPage').then((m) => ({ default: m.LoadingStepPage })))
const DriverStopPage = lazy(() => import('@/features/driver/DriverStopPage').then((m) => ({ default: m.DriverStopPage })))
const FleetPage = lazy(() => import('@/features/fleet/FleetPage').then((m) => ({ default: m.FleetPage })))
const UsersPage = lazy(() => import('@/features/admin/UsersPage').then((m) => ({ default: m.UsersPage })))
const StyleSheetPage = lazy(() => import('./design-system/StyleSheetPage').then((m) => ({ default: m.StyleSheetPage })))
const ComponentSheetPage = lazy(() => import('./design-system/ComponentSheetPage').then((m) => ({ default: m.ComponentSheetPage })))

function SuspenseOutlet() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-8" role="status" aria-label="Đang tải màn hình">
          <Spinner />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      { path: '/dang-nhap', element: <SuspenseOutlet />, children: [{ index: true, element: <LoginPage /> }] },

      {
        element: <RequireAuth />,
        children: [
          // Màn desktop có nav rail.
          {
            element: <AppShell />,
            children: [
              {
                element: <SuspenseOutlet />,
                children: [
                  { path: '/', element: <DashboardPage /> },
                  { path: '/chuyen', element: <TripListPage /> },
                  { path: '/chuyen/moi', element: <TripFormPage /> },
                  { path: '/chuyen/:tripId', element: <TripDetailPage /> },
                  { path: '/chuyen/:tripId/sua', element: <TripFormPage /> },
                  { path: '/chuyen/:tripId/so-sanh', element: <PlanComparisonPage /> },
                  { path: '/doi-xe', element: <FleetPage /> },
                  { path: '/nguoi-dung', element: <UsersPage /> },
                ],
              },
            ],
          },

          // Màn toàn màn hình, không nav rail (theo bản design).
          {
            element: <SuspenseOutlet />,
            children: [
              { path: '/chuyen/:tripId/phuong-an', element: <ViewerPage /> },
              { path: '/kho', element: <LoadingStepPage /> },
              { path: '/tai-xe', element: <Navigate to="/tai-xe/diem-giao" replace /> },
              { path: '/tai-xe/diem-giao', element: <DriverStopPage /> },
              { path: '/tai-xe/:tab', element: <DriverStopPage /> },
            ],
          },
        ],
      },

      // Tài liệu bàn giao cho đội dev/design, dựng từ chính component thật.
      {
        element: <SuspenseOutlet />,
        children: [
          { path: '/kieu-dang', element: <StyleSheetPage /> },
          { path: '/thanh-phan', element: <ComponentSheetPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
