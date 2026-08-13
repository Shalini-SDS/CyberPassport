import { useState } from 'react'
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

export type Page =
  | 'landing'
  | 'register'
  | 'login'
  | 'profile-setup'
  | 'assessment'
  | 'dashboard'
  | 'passport'
  | 'weekly'
  | 'recommendations'
  | 'settings'

export default function App() {
  const [page, setPage] = useState<Page>('landing')

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo(0, 0)
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
