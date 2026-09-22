import { useState } from 'react'
import type { Page } from '../App'
import { apiFetch, setSession } from '../lib/api'

interface Props { navigate: (p: Page) => void }

export default function Login({ navigate }: Props) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [resetCode, setResetCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [resetStep, setResetStep] = useState<'login' | 'request' | 'reset' | 'verify'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ access_token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSession(data.access_token, data.user)
      navigate('dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      if (message.toLowerCase().includes('verify your email')) {
        setResetStep('verify')
        try {
          await apiFetch('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email: form.email }) })
          setError('A new verification code was sent. It expires in 10 minutes.')
        } catch (resendErr) {
          setError(resendErr instanceof Error ? resendErr.message : message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: form.email }) })
      setResetStep('reset')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset code')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email: form.email, code: resetCode, new_password: form.password }) })
      setResetStep('login')
      setError('Password reset. You can now sign in.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!form.email) {
      setError('Enter your email first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await apiFetch('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email: form.email }) })
      setResetStep('verify')
      setError('A new verification code was sent. It expires in 10 minutes.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification code')
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ access_token: string; user: any }>('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, code: verificationCode }),
      })
      setSession(data.access_token, data.user)
      navigate('dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
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

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: '40px 20px',
    }}>
      {/* Logo */}
      <button onClick={() => navigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 52, height: 52, background: 'var(--emerald)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: '#fff', boxShadow: '0 4px 20px rgba(11,77,67,0.25)' }}>CP</div>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>CyberPassport Authority</span>
      </button>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--emerald)', padding: '20px 28px', borderBottom: '3px solid var(--gold)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', fontWeight: 600, marginBottom: 4 }}>SECURE ACCESS PORTAL</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>Identity Verification</div>
        </div>

        <div style={{ padding: '28px' }}>
          {/* Trust indicator */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'var(--success-bg)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>256-bit encrypted secure session</span>
          </div>

          {resetStep === 'request' ? (
            <form onSubmit={requestReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: 'var(--risk-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--risk)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>Enter your account email and we will send a password reset code.</p>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} />
              <button type="submit" disabled={loading} style={{ background: 'var(--gold)', border: 'none', borderRadius: 10, color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, padding: '14px' }}>{loading ? 'Sending…' : 'Send Reset Code'}</button>
              <button type="button" onClick={() => setResetStep('login')} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: 'pointer', fontSize: 12 }}>Back to sign in</button>
            </form>
          ) : resetStep === 'reset' ? (
            <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: 'var(--risk-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--risk)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>Enter the code sent to {form.email}, then choose a new password.</p>
              <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Reset code" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))} required style={inputStyle} />
              <input type="password" placeholder="New password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required style={inputStyle} />
              <button type="submit" disabled={loading} style={{ background: 'var(--gold)', border: 'none', borderRadius: 10, color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, padding: '14px' }}>{loading ? 'Resetting…' : 'Reset Password'}</button>
            </form>
          ) : resetStep === 'verify' ? (
            <form onSubmit={verifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: 'var(--risk-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--risk)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>Enter the 6-digit verification code sent to {form.email || 'your email'}.</p>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} />
              <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Verification code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} required style={inputStyle} />
              <button type="submit" disabled={loading} style={{ background: 'var(--gold)', border: 'none', borderRadius: 10, color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, padding: '14px' }}>{loading ? 'Verifying...' : 'Verify Email'}</button>
              <button type="button" disabled={loading} onClick={resendVerification} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 12 }}>Send verification code again</button>
              <button type="button" onClick={() => { setError(''); setResetStep('login') }} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: 'pointer', fontSize: 12 }}>Back to sign in</button>
            </form>
          ) : <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ background: 'var(--risk-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--risk)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Password</label>
                <button type="button" onClick={() => { setError(''); setResetStep('request') }} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Forgot password?</button>
              </div>
              <input type="password" placeholder="Your password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <button type="button" disabled={loading} onClick={resendVerification} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--emerald)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, padding: 0 }}>Need a new verification code?</button>
            <button type="submit" disabled={loading} style={{
              background: loading ? '#6B7280' : 'var(--gold)', border: 'none', borderRadius: 10,
              color: loading ? '#fff' : 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 700, padding: '14px',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(198,161,91,0.3)',
              marginTop: 4,
            }}>
              {loading ? 'Authenticating…' : 'Access Portal →'}
            </button>
          </form>}

          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>No passport? </span>
            <button onClick={() => navigate('register')} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Apply now</button>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['ISO 27001', 'SOC 2 TYPE II', 'GDPR', 'FIDO2'].map((b) => (
          <span key={b} style={{ fontSize: 10, color: 'var(--text-2)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 4 }}>{b}</span>
        ))}
      </div>
    </div>
  )
}
