import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, fetchCurrentUser, getCurrentUser, updateCurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }

export default function ProfileSettings({ navigate }: Props) {
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications' | 'privacy'>('profile')
  const [form, setForm] = useState({
    name: '', email: '',
    occupation: '', country: 'GB', phone: '',
    currentPass: '', newPass: '', confirmPass: '',
  })
  const [notifs, setNotifs] = useState({ weekly: true, breach: true, score: true, tips: false })

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
    borderRadius: 10, color: 'var(--text)', fontSize: 14, fontFamily: 'Inter, sans-serif',
    padding: '12px 16px', outline: 'none', transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }

  useEffect(() => {
    fetchCurrentUser().then((fetched) => {
      setForm({
        name: fetched.name || '',
        email: fetched.email || '',
        occupation: String((fetched.profile as any)?.occupation || ''),
        country: String((fetched.profile as any)?.country || 'GB'),
        phone: String((fetched.profile as any)?.phone || ''),
        currentPass: '',
        newPass: '',
        confirmPass: '',
      })
    }).catch(() => {
      const stored = getCurrentUser()
      if (stored) {
        setForm((prev) => ({ ...prev, name: stored.name, email: stored.email }))
      }
    })
  }, [])

  const tabs = [
    { k: 'profile', l: 'Personal Information' },
    { k: 'password', l: 'Password & Security' },
    { k: 'notifications', l: 'Notifications' },
    { k: 'privacy', l: 'Privacy & Data' },
  ] as const

  return (
    <AppShell navigate={navigate} current="settings">
      <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>ACCOUNT</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Profile Settings</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
          {/* Sidebar tabs */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '8px', boxShadow: 'var(--shadow)', height: 'fit-content' }}>
            {/* Avatar */}
            <div style={{ padding: '16px 12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff', fontWeight: 700, flexShrink: 0 }}>A</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Alexandra Chen</div>
                  <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 1 }}>CP-2024-00891</div>
                </div>
              </div>
            </div>
            {tabs.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                width: '100%', textAlign: 'left', padding: '9px 12px',
                background: tab === t.k ? 'var(--emerald-light)' : 'none',
                border: 'none', borderRadius: 8,
                color: tab === t.k ? 'var(--emerald)' : 'var(--text-2)',
                cursor: 'pointer', fontSize: 13, fontWeight: tab === t.k ? 600 : 400,
                marginBottom: 2,
              }}>{t.l}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '26px 28px', boxShadow: 'var(--shadow)' }}>
            {tab === 'profile' && (
              <>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: '0 0 24px' }}>Personal Information</h2>
                {/* Photo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 22, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', fontWeight: 700 }}>A</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Profile Photo</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '6px 14px' }}>Upload New</button>
                      <button style={{ background: 'none', border: 'none', color: 'var(--risk)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '6px' }}>Remove</button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 24 }}>
                  {[
                    { id: 'name', l: 'Full Name', type: 'text' },
                    { id: 'email', l: 'Email Address', type: 'email' },
                    { id: 'occupation', l: 'Occupation', type: 'text' },
                    { id: 'phone', l: 'Phone Number', type: 'tel' },
                  ].map((f) => (
                    <div key={f.id}>
                      <label style={labelStyle}>{f.l}</label>
                      <input type={f.type} value={form[f.id as keyof typeof form] as string} onChange={(e) => setForm(p => ({ ...p, [f.id]: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Country</label>
                    <select value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} style={inputStyle}>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
                <button onClick={async () => {
                  try {
                    const user = getCurrentUser()
                    if (!user) {
                      navigate('login')
                      return
                    }
                    const body = {
                      name: form.name,
                      email: form.email,
                      occupation: form.occupation,
                      country: form.country,
                      phone: form.phone,
                    }
                    const updated = await apiFetch<any>(`/api/users/${user.id}`, { method: 'PUT', body: JSON.stringify(body) })
                    updateCurrentUser(updated)
                    setForm((prev) => ({ ...prev, currentPass: '', newPass: '', confirmPass: '' }))
                    alert('Profile updated')
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Could not update profile')
                  }
                }} style={{ background: 'var(--emerald)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '12px 28px', boxShadow: '0 2px 8px rgba(11,77,67,0.2)' }}>Save Changes</button>
              </>
            )}

            {tab === 'password' && (
              <>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: '0 0 24px' }}>Password & Security</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, marginBottom: 28 }}>
                  {[{ id: 'currentPass', l: 'Current Password' }, { id: 'newPass', l: 'New Password' }, { id: 'confirmPass', l: 'Confirm New Password' }].map((f) => (
                    <div key={f.id}>
                      <label style={labelStyle}>{f.l}</label>
                      <input type="password" value={form[f.id as keyof typeof form] as string} onChange={(e) => setForm(p => ({ ...p, [f.id]: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
                    </div>
                  ))}
                  <button style={{ background: 'var(--emerald)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '12px', boxShadow: '0 2px 8px rgba(11,77,67,0.2)' }}>Update Password</button>
                </div>
                <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>Two-Factor Authentication</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--success-bg)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, maxWidth: 400 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Authenticator App</div>
                      <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>● Enabled</div>
                    </div>
                    <button style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '6px 14px' }}>Manage</button>
                  </div>
                </div>
              </>
            )}

            {tab === 'notifications' && (
              <>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: '0 0 24px' }}>Notification Preferences</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { k: 'weekly', l: 'Weekly Security Reports', sub: 'Receive your weekly cyber security summary.' },
                    { k: 'breach', l: 'Breach Alerts', sub: 'Immediate alerts when your data is found in a breach.' },
                    { k: 'score', l: 'Score Updates', sub: 'Notifications when your Trust Score changes.' },
                    { k: 'tips', l: 'Security Tips', sub: 'Weekly tips to improve your cyber hygiene.' },
                  ].map((item, i) => {
                    const checked = notifs[item.k as keyof typeof notifs]
                    return (
                      <div key={item.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{item.l}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.sub}</div>
                        </div>
                        <button onClick={() => setNotifs(p => ({ ...p, [item.k]: !checked }))} style={{
                          width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none',
                          background: checked ? 'var(--emerald)' : 'var(--border)',
                          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                        }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {tab === 'privacy' && (
              <>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: '0 0 24px' }}>Privacy & Data</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {[
                    { l: 'Profile Visibility', sub: 'Control who can view your passport.', action: 'Manage' },
                    { l: 'Data Sharing', sub: 'Control anonymous data sharing for research.', action: 'Review' },
                  ].map((item) => (
                    <div key={item.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.l}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.sub}</div>
                      </div>
                      <button style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '6px 14px' }}>{item.action}</button>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>Data Controls</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '10px 18px' }}>Export My Data</button>
                    <button style={{ background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, color: 'var(--risk)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '10px 18px' }}>Delete Account</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
