import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './Layout'
import { ErrorBoundary, Skeleton, FeaturedCardSkeleton, CardSkeleton } from '@/components/ui'

// Lazy load all pages
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const BuilderPage = lazy(() => import('@/pages/BuilderPage'))
const PlayerPage = lazy(() => import('@/pages/PlayerPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const InsightsPage = lazy(() => import('@/pages/InsightsPage'))

// Loading fallback with skeleton layout
function PageLoader() {
  return (
    <div className="min-h-screen p-6 lg:p-8 animate-page-enter">
      <div className="mb-10">
        <Skeleton className="h-9 w-48 mb-3" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <FeaturedCardSkeleton className="mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
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
