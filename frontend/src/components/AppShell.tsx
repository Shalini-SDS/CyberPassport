import { useEffect, useState, type ReactNode } from 'react'
import type { Page } from '../App'
import { apiFetch, assetUrl, fetchCurrentUser, getCurrentUser } from '../lib/api'

interface Props {
  navigate: (p: Page) => void
  current: Page
  children: ReactNode
}

const navItems: { label: string; page: Page; icon: string }[] = [
  { label: 'Dashboard', page: 'dashboard', icon: '⊞' },
  { label: 'My Passport', page: 'passport', icon: '⬡' },
  { label: 'Assessment', page: 'assessment', icon: '◎' },
  { label: 'Weekly Report', page: 'weekly', icon: '◷' },
  { label: 'Recommendations', page: 'recommendations', icon: '◆' },
  { label: 'Profile Settings', page: 'settings', icon: '◉' },
]

export default function AppShell({ navigate, current, children }: Props) {
  const [user, setUser] = useState(getCurrentUser())
  const [score, setScore] = useState(0)
  const [risk, setRisk] = useState('Unknown')

  useEffect(() => {
    async function loadUser() {
      const currentUser = getCurrentUser()
      if (!currentUser) return
      try {
        const freshUser = await fetchCurrentUser()
        setUser(freshUser)
        apiFetch<any>('/api/dashboard/me').then(data => {
          setScore(data.cyber_trust_score || 0)
          setRisk(data.risk_level || 'Unknown')
        }).catch(() => {})
      } catch {
        setUser(currentUser)
        apiFetch<any>('/api/dashboard/me').then(data => {
          setScore(data.cyber_trust_score || 0)
          setRisk(data.risk_level || 'Unknown')
        }).catch(() => {})
      }
    }
    loadUser()
  }, [current])

  const displayName = user?.name || 'CyberPassport User'
  const initials = displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#fff',
        borderRight: '1px solid var(--border)',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => navigate('landing')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}
          >
            <div style={{
              width: 36, height: 36,
              background: 'var(--emerald)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, color: '#fff',
              boxShadow: '0 2px 8px rgba(11,77,67,0.25)',
            }}>CP</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>CyberPassport</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>AUTHORITY</div>
            </div>
          </button>
        </div>

        {/* User card */}
        <div style={{ padding: '16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            background: 'var(--emerald-light)',
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user?.profile_photo_url ? <img src={assetUrl(user.profile_photo_url)} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--emerald)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#fff', fontWeight: 600, flexShrink: 0,
              }}>{initials || 'CP'}</div>}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                <div style={{ fontSize: 10, color: 'var(--emerald-mid)', fontFamily: 'Inter, sans-serif', fontWeight: 500, marginTop: 1 }}>Trust Score: {score}</div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('cp_token')
                localStorage.removeItem('cp_user')
                navigate('login')
              }}
              style={{
                background: 'none', border: '1px solid var(--border-2)', borderRadius: 8,
                color: 'var(--text-2)', cursor: 'pointer', fontSize: 12,
                padding: '8px 12px', fontWeight: 600,
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map((item) => {
            const active = current === item.page
            return (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  background: active ? 'var(--emerald-light)' : 'none',
                  border: 'none',
                  borderRadius: 8, color: active ? 'var(--emerald)' : 'var(--text-2)',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif',
                  fontWeight: active ? 600 : 400,
                  padding: '9px 12px', textAlign: 'left',
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'none' }}
              >
                <span style={{ fontSize: 16, width: 18, textAlign: 'center', flexShrink: 0, color: active ? 'var(--emerald)' : 'var(--text-3)' }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom trust bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>Cyber Trust Score</div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
            <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald), var(--gold))', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{score} / 100</span>
            <span style={{ fontSize: 11, color: risk === 'High' ? 'var(--risk)' : risk === 'Medium' ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{risk.toUpperCase()}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
