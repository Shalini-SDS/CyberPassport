import { useState } from 'react'
import type { Page } from '../App'
import { apiFetch, setSession } from '../lib/api'

interface Props { navigate: (p: Page) => void }

export default function Register({ navigate }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ access_token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      setSession(data.access_token, data.user)
      navigate('profile-setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg)',
    border: '1px solid var(--border-2)', borderRadius: 10,
    color: 'var(--text)', fontSize: 14, fontFamily: 'Inter, sans-serif',
    padding: '13px 16px', outline: 'none', transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'var(--text)', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div style={{
        width: '42%', background: 'var(--emerald)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, background: 'rgba(198,161,91,0.08)', borderRadius: '50%' }} />

        <button onClick={() => navigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 13, color: '#fff' }}>CP</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: '#fff', fontWeight: 600 }}>CyberPassport</span>
        </button>

        <div style={{ position: 'relative' }}>
          <div style={{ width: 60, height: 60, background: 'rgba(198,161,91,0.2)', border: '2px solid rgba(198,161,91,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 28 }}>⬡</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 14px', lineHeight: 1.2 }}>Establish Your Digital Identity</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 32px' }}>Your CyberPassport is an official credential that certifies your cyber security reputation and digital identity posture.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Official verifiable cyber credential', 'AI-powered Trust Score assessment', 'Weekly security monitoring', 'Cryptographic passport verification'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, background: 'rgba(198,161,91,0.2)', border: '1px solid rgba(198,161,91,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gold)', flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', position: 'relative' }}>ISO 27001 · SOC 2 · GDPR Compliant</div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 52px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 10 }}>CREATE ACCOUNT</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Apply for Your Passport</h1>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>Already have an account? <button onClick={() => navigate('login')} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>Sign in</button></p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ background: 'var(--risk-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--risk)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}
            <div>
              <label style={labelStyle}>Full Legal Name</label>
              <input type="text" placeholder="Alexandra Chen" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Minimum 12 characters" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required style={{ ...inputStyle, paddingRight: 44 }} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }}>{showPass ? '●' : '○'}</button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" required style={{ marginTop: 3, accentColor: 'var(--emerald)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>I consent to the CyberPassport Authority processing my data for identity verification and cyber risk assessment.</span>
            </label>
            <button type="submit" disabled={loading} style={{
              background: loading ? '#6B7280' : 'var(--emerald)', border: 'none', borderRadius: 10,
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 700, padding: '14px',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(11,77,67,0.25)',
              marginTop: 4,
            }}>
              {loading ? 'Creating Account…' : 'Create Passport Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
