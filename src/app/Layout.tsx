import { Outlet, NavLink } from 'react-router-dom'
import { Compass, Library, BarChart2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InstallBanner } from '@/components/InstallBanner'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
]

function UserMenu() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="btn btn-sm btn-primary"
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-8 rounded-full">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} referrerPolicy="no-referrer" />
          ) : (
            <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-sm font-bold rounded-full">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-200 border border-white/10 rounded-box z-50 w-52 p-2 shadow-lg mt-2">
        <li className="menu-title px-4 py-2">
          <span className="text-xs text-base-content/60">{user.email}</span>
        </li>
        <li>
          <button onClick={signOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </li>
      </ul>
    </div>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-base-100 flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Main content area */}
      <main id="main-content" className="flex-1 pb-20 sm:pb-16 md:pb-0 lg:pl-20" tabIndex={-1}>
        <Outlet />
      </main>

      {/* PWA Install Banner */}
      <InstallBanner />

      {/* Bottom navigation for mobile/tablet — glassmorphism */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-row items-center justify-around glass-nav border-t border-white/5 safe-area-inset-bottom h-16" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all',
                isActive
                  ? 'text-primary'
                  : 'text-base-content/40 hover:text-base-content/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200', isActive && 'scale-110')} />
                <span className="text-xs">{label}</span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary nav-indicator-active" />
                )}
              </>
            )}
          </NavLink>
        ))}
        <UserMenu />
      </nav>

      {/* Side navigation for desktop — dark gradient */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-base-200 to-base-100 border-r border-white/5 flex-col items-center py-6 gap-2 z-50" role="navigation" aria-label="Main navigation">
        <div className="text-2xl font-bold text-primary mb-6">B</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-16',
                'hover:bg-white/5',
                isActive ? 'bg-primary/10 text-primary' : 'text-base-content/40'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110')} />
                <span className="text-xs">{label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-primary nav-indicator-active" />
                )}
              </>
            )}
          </NavLink>
        ))}
        <div className="mt-auto mb-4">
          <UserMenu />
        </div>
      </aside>
    </div>
  )
}
