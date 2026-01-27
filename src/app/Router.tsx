import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './Layout'
import { ErrorBoundary } from '@/components/ui'

// Lazy load all pages
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const BuilderPage = lazy(() => import('@/pages/BuilderPage'))
const PlayerPage = lazy(() => import('@/pages/PlayerPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const InsightsPage = lazy(() => import('@/pages/InsightsPage'))

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  )
}

// Wrap pages with Suspense and ErrorBoundary
function withSuspense(Component: React.ComponentType) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: withSuspense(ExplorePage),
      },
      {
        path: 'builder',
        element: withSuspense(BuilderPage),
      },
      {
        path: 'builder/:sessionId',
        element: withSuspense(BuilderPage),
      },
      {
        path: 'player/:sessionId',
        element: withSuspense(PlayerPage),
      },
      {
        path: 'library',
        element: withSuspense(LibraryPage),
      },
      {
        path: 'insights',
        element: withSuspense(InsightsPage),
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
