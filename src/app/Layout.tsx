import { Outlet, NavLink } from 'react-router-dom'
import { Compass, PenTool, Library, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InstallBanner } from '@/components/InstallBanner'

const navItems = [
  { to: '/', icon: Compass, label: 'Explore' },
  { to: '/builder', icon: PenTool, label: 'Builder' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Main content area */}
      <main id="main-content" className="flex-1 pb-16 md:pb-0 md:pl-20" tabIndex={-1}>
        <Outlet />
      </main>

      {/* PWA Install Banner */}
      <InstallBanner />

      {/* Bottom navigation for mobile */}
      <nav className="btm-nav btm-nav-sm md:hidden" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(isActive && 'active text-primary')
            }
          >
            <Icon className="h-5 w-5" />
            <span className="btm-nav-label text-xs">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Side navigation for desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-base-200 flex-col items-center py-6 gap-2" role="navigation" aria-label="Main navigation">
        <div className="text-2xl font-bold text-primary mb-6">B</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg transition-colors w-16',
                'hover:bg-base-300',
                isActive && 'bg-primary/10 text-primary'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </aside>
    </div>
  )
}
