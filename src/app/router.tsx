import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppShell } from './layout/app-shell'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: '/dashboard',
        lazy: async () => ({ Component: (await import('../pages/dashboard-page')).DashboardPage }),
      },
      {
        path: '/cases',
        lazy: async () => ({ Component: (await import('../pages/cases-page')).CasesPage }),
      },
      {
        path: '/map',
        lazy: async () => ({ Component: (await import('../pages/map-page')).MapPage }),
      },
      {
        path: '/ahp',
        lazy: async () => ({ Component: (await import('../pages/ahp-page')).AhpPage }),
      },
      {
        path: '/sources',
        lazy: async () => ({ Component: (await import('../pages/sources-page')).SourcesPage }),
      },
      {
        path: '/dispatch',
        lazy: async () => ({ Component: (await import('../pages/dispatch-page')).DispatchPage }),
      },
      {
        path: '/analytics',
        lazy: async () => ({ Component: (await import('../pages/analytics-page')).AnalyticsPage }),
      },
      {
        path: '/settings',
        lazy: async () => ({ Component: (await import('../pages/settings-page')).SettingsPage }),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
