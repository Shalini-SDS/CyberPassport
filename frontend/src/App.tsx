import { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import Assessment from './pages/Assessment'
import Dashboard from './pages/Dashboard'
import Passport from './pages/Passport'
import WeeklyReport from './pages/WeeklyReport'
import Recommendations from './pages/Recommendations'
import ProfileSettings from './pages/ProfileSettings'
import VerifyPassport from './pages/VerifyPassport'

export type Page = 'landing' | 'register' | 'login' | 'profile-setup' | 'assessment' | 'dashboard' | 'passport' | 'weekly' | 'recommendations' | 'settings'

const routeForPage: Record<Page, string> = {
  landing: '/', register: '/register', login: '/login', 'profile-setup': '/profile-setup',
  assessment: '/assessment', dashboard: '/dashboard', passport: '/passport', weekly: '/weekly-report',
  recommendations: '/recommendations', settings: '/settings',
}

function pageForPath(pathname: string): Page {
  if (pathname === '/register') return 'register'
  if (pathname === '/login') return 'login'
  if (pathname === '/profile-setup') return 'profile-setup'
  if (pathname === '/assessment') return 'assessment'
  if (pathname === '/dashboard') return 'dashboard'
  if (pathname === '/passport') return 'passport'
  if (pathname === '/weekly-report') return 'weekly'
  if (pathname === '/recommendations') return 'recommendations'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'landing'
}

const protectedPages = new Set<Page>(['profile-setup', 'assessment', 'dashboard', 'passport', 'weekly', 'recommendations', 'settings'])

export default function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (page: Page) => {
    const target = routeForPage[page]
    if (window.location.pathname !== target) window.history.pushState({}, '', target)
    setPath(target)
    window.scrollTo(0, 0)
  }

  if (path.startsWith('/verify/')) return <VerifyPassport />
  const page = pageForPath(path)
  if (protectedPages.has(page) && !localStorage.getItem('cp_token')) {
    if (path !== '/login') window.history.replaceState({}, '', `/login?returnTo=${encodeURIComponent(path)}`)
    return <Login navigate={navigate} />
  }

  switch (page) {
    case 'landing':        return <Landing navigate={navigate} />
    case 'register':       return <Register navigate={navigate} />
    case 'login':          return <Login navigate={navigate} />
    case 'profile-setup':  return <ProfileSetup navigate={navigate} />
    case 'assessment':     return <Assessment navigate={navigate} />
    case 'dashboard':      return <Dashboard navigate={navigate} />
    case 'passport':       return <Passport navigate={navigate} />
    case 'weekly':         return <WeeklyReport navigate={navigate} />
    case 'recommendations':return <Recommendations navigate={navigate} />
    case 'settings':       return <ProfileSettings navigate={navigate} />
    default:               return <Landing navigate={navigate} />
  }
}
