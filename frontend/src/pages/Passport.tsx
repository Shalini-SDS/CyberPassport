import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, downloadPassportPdf, getCurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }

function QRCode({ seed = 'CP20240089' }: { seed?: string }) {
  const cells: boolean[] = []
  for (let i = 0; i < 196; i++) {
    const c = seed.charCodeAt(i % seed.length)
    cells.push((c * (i + 1) * 31) % 7 > 3)
  }
  const size = 14
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <rect width={100} height={100} fill="white" rx={4} />
      {cells.map((on, i) => {
        const row = Math.floor(i / size)
        const col = i % size
        const x = 4 + col * 6.5
        const y = 4 + row * 6.5
        if ((row < 3 && col < 3) || (row < 3 && col >= size - 3) || (row >= size - 3 && col < 3))
          return <rect key={i} x={x} y={y} width={6} height={6} fill="var(--emerald)" />
        return on ? <rect key={i} x={x} y={y} width={5} height={5} fill="var(--text)" rx={0.5} /> : null
      })}
    </svg>
  )
}

const domainBadges = [
  { label: 'Password Security', icon: '🔑', status: 'Verified' },
  { label: 'MFA Enabled', icon: '🛡️', status: 'Active' },
  { label: 'Device Security', icon: '💻', status: 'Verified' },
  { label: 'Network Security', icon: '🌐', status: 'Good' },
  { label: 'Security Awareness', icon: '🧠', status: 'Certified' },
]

function PassportCard({ passport }: { passport: any }) {
  const display = {
    surname: passport?.user_name?.split(' ').slice(-1).join(' ') || 'USER',
    givenNames: passport?.user_name || 'CyberPassport User',
    passportNo: passport?.passport_id || 'CP-XXXX-XXXX',
    country: passport?.country || 'CYBERSPACE',
    occupation: passport?.occupation || 'Security Professional',
    issueDate: passport?.assessment_date || 'N/A',
    expiryDate: passport?.expiry_date || 'N/A',
    trustScore: passport?.cyber_trust_score ?? 0,
    riskLevel: passport?.risk_level || 'Unknown',
    status: passport?.status || 'Active',
    classification: passport?.classification || (passport?.risk_level === 'Low' ? 'Low Risk' : 'Medium Risk'),
    verificationUrl: passport?.verification_url || `verify.cyberpassport.id/${passport?.passport_id?.slice(-4) ?? 'XXXX'}`,
    signature: passport?.digital_signature || `sha256:${passport?.passport_id?.slice(-6) ?? 'xxxxxx'}`,
    authoritySeal: passport?.authority_seal || 'CyberPassport Authority',
    majorRiskFactors: passport?.major_risk_factors || [],
    topRecommendations: passport?.top_recommendations || [],
  }

  return (
    <div style={{
      width: '100%', maxWidth: 600,
      background: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
      border: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--emerald) 0%, #136F63 100%)',
        padding: '24px 28px 20px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '3px solid var(--gold)',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 4 }}>CYBERPASSPORT AUTHORITY</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{passport?.title || 'DIGITAL IDENTITY PASSPORT'}</div>
          </div>
          {/* Emblem */}
          <div style={{ width: 48, height: 48, background: 'rgba(198,161,91,0.2)', border: '2px solid rgba(198,161,91,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⬡</div>
        </div>
      </div>

      {/* Holographic strip */}
      <div style={{
        height: 8,
        background: 'linear-gradient(90deg, rgba(11,77,67,0.7) 0%, rgba(198,161,91,0.8) 20%, rgba(11,77,67,0.5) 40%, rgba(255,255,255,0.5) 50%, rgba(198,161,91,0.6) 60%, rgba(11,77,67,0.7) 80%, rgba(198,161,91,0.8) 100%)',
        backgroundSize: '200% 100%',
        animation: 'holographic 3s linear infinite',
      }} />

      {/* Body */}
      <div style={{ padding: '24px 28px' }}>
        {/* Photo + Identity */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 22 }}>
          {/* Photo */}
          <div style={{
            width: 88, height: 100, borderRadius: 12,
            background: 'var(--emerald-light)',
            border: '2px solid var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="var(--emerald)" fillOpacity={0.4} />
              <path d="M4 20 Q4 14 12 14 Q20 14 20 20" fill="var(--emerald)" fillOpacity={0.3} />
            </svg>
            <div style={{ fontSize: 8, color: 'var(--text-2)', marginTop: 4, letterSpacing: '0.06em' }}>PHOTO</div>
            <div style={{ position: 'absolute', bottom: 0 }} />
          </div>

          {/* Identity fields */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {[
                { l: 'Surname', v: display.surname },
                { l: 'Given Names', v: display.givenNames },
                { l: 'Passport No.', v: display.passportNo },
                { l: 'Country', v: display.country },
                { l: 'Occupation', v: display.occupation },
                { l: 'Issue Date', v: display.issueDate },
                { l: 'Expiry Date', v: display.expiryDate },
                { l: 'Trust Score', v: String(display.trustScore) },
              ].map((f) => (
                <div key={f.l} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }}>{f.l.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Score */}
        <div style={{
          background: 'linear-gradient(135deg, var(--emerald-light), #F0FDF4)',
          border: '1px solid rgba(11,77,67,0.15)',
          borderRadius: 14, padding: '18px 20px', marginBottom: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>CYBER TRUST SCORE</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 700, color: 'var(--emerald)', lineHeight: 1 }}>{display.trustScore}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>out of 850</div>
            <div style={{ height: 5, width: 120, background: 'rgba(11,77,67,0.1)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.max(0, (display.trustScore / 850) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald), var(--gold))', borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--success-bg)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 8, padding: '6px 14px', marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>{display.riskLevel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gold-light)', border: '1px solid rgba(198,161,91,0.3)', borderRadius: 8, padding: '6px 14px' }}>
              <span style={{ fontSize: 12 }}>⬡</span>
              <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>{display.authoritySeal}</span>
            </div>
          </div>
        </div>

        {/* Domain badges */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>SECURITY CERTIFICATIONS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {domainBadges.map((b) => (
              <div key={b.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--success-bg)', border: '1px solid rgba(22,163,74,0.2)',
                borderRadius: 8, padding: '6px 12px',
              }}>
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text)', fontWeight: 600, lineHeight: 1.2 }}>{b.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--success)', fontWeight: 600 }}>✓ {b.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR + Verification */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '18px 20px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ flexShrink: 0 }}>
            <QRCode seed={display.passportNo} />
            <div style={{ fontSize: 8, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>SCAN TO VERIFY</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>VERIFICATION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { l: 'Passport Serial', v: display.passportNo },
                { l: 'Verification URL', v: display.verificationUrl },
                { l: 'Digital Signature', v: display.signature },
                { l: 'Authority Seal', v: display.authoritySeal },
              ].map((f) => (
                <div key={f.l} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, minWidth: 100 }}>{f.l}</span>
                  <span style={{ fontSize: 10, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{f.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {display.majorRiskFactors.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>MAJOR RISK FACTORS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {display.majorRiskFactors.map((factor, idx) => (
                <div key={`${factor}-${idx}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 11, color: 'var(--text)', lineHeight: 1.4 }}>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        )}

        {display.topRecommendations.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>TOP RECOMMENDATIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {display.topRecommendations.map((recommendation, idx) => (
                <div key={`${recommendation}-${idx}`} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 11, color: 'var(--text)', lineHeight: 1.4 }}>
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Passport({ navigate }: Props) {
  const [view, setView] = useState<'inner' | 'cover'>('inner')
  const [passport, setPassport] = useState<any | null>(null)
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('')

  const user = getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('login')
      return
    }
    apiFetch<any>(`/api/passport/${user.id}`)
      .then(setPassport)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load passport')
      })
  }, [navigate, user])

  const handleDownload = async () => {
    if (!user) return
    setActionStatus('Downloading passport...')
    try {
      await downloadPassportPdf(user.id)
      setActionStatus('Passport download started')
    } catch (err) {
      setActionStatus(err instanceof Error ? err.message : 'Failed to download passport')
    }
  }

  const handleShare = async () => {
    if (!passport) return
    const text = `CyberPassport: ${passport.passport_id} – verify at ${passport.verification_url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My CyberPassport', text, url: `https://${passport.verification_url}` })
        setActionStatus('Passport shared successfully')
      } else {
        await navigator.clipboard.writeText(text)
        setActionStatus('Verification link copied to clipboard')
      }
    } catch (err) {
      setActionStatus(err instanceof Error ? err.message : 'Could not share passport')
    }
  }

  const handleVerify = () => {
    if (!passport) return
    const url = passport.verification_url?.startsWith('http') ? passport.verification_url : `https://${passport.verification_url}`
    window.open(url, '_blank')
  }

  return (
    <AppShell navigate={navigate} current="passport">
      <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>OFFICIAL CREDENTIAL</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Digital Identity Passport</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleDownload} style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '8px 16px' }}>Download PDF</button>
            <button onClick={handleShare} style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '8px 16px' }}>Share Passport</button>
            <button onClick={handleVerify} style={{ background: 'var(--emerald)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '8px 18px', boxShadow: '0 2px 8px rgba(11,77,67,0.2)' }}>Verify Passport</button>
          </div>
          {actionStatus && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)' }}>{actionStatus}</div>}
        </div>

        {error ? (
          <div style={{ padding: '24px', background: '#fee', border: '1px solid #f5c2c7', borderRadius: 14, color: '#842029' }}>{error}</div>
        ) : !passport ? (
          <div style={{ padding: '24px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 14, color: 'var(--text-2)' }}>Loading passport details…</div>
        ) : (
          <>
            <div style={{
              display: 'flex', gap: 24, flexWrap: 'wrap',
              padding: '14px 20px', marginBottom: 28,
              background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
              boxShadow: 'var(--shadow)',
            }}>
              {[
                { l: 'Status', v: passport.status || '● Active', c: 'var(--success)' },
                { l: 'Issued', v: passport.assessment_date || 'N/A', c: 'var(--text)' },
                { l: 'Expires', v: passport.expiry_date || 'N/A', c: 'var(--text)' },
                { l: 'Trust Score', v: `${passport.cyber_trust_score ?? 0} / 850`, c: 'var(--emerald)' },
                { l: 'Classification', v: passport.risk_level || 'Unknown', c: 'var(--success)' },
                { l: 'Passport No.', v: passport.passport_id || 'CP-XXXX-XXXX', c: 'var(--text)' },
              ].map((item) => (
                <div key={item.l}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, marginBottom: 2 }}>{item.l}</div>
                  <div style={{ fontSize: 13, color: item.c, fontWeight: 600 }}>{item.v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {[{ k: 'inner', l: 'Passport Open' }, { k: 'cover', l: 'Cover View' }].map((tab) => (
                <button key={tab.k} onClick={() => setView(tab.k as 'inner' | 'cover')} style={{
                  background: view === tab.k ? 'var(--emerald)' : '#fff',
                  border: `1px solid ${view === tab.k ? 'var(--emerald)' : 'var(--border-2)'}`,
                  borderRadius: 8, color: view === tab.k ? '#fff' : 'var(--text)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 20px',
                }}>{tab.l}</button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {view === 'cover' ? (
                <div style={{
                  width: 300, height: 420, background: 'linear-gradient(160deg, var(--emerald) 0%, #136F63 100%)',
                  borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 24px 64px rgba(11,77,67,0.3)', position: 'relative', overflow: 'hidden',
                  border: '1px solid rgba(198,161,91,0.3)', cursor: 'pointer',
                }} onClick={() => setView('inner')}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: 'var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: 'var(--gold)' }} />
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
                  <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 24 }}>CYBERPASSPORT AUTHORITY</div>
                    <div style={{ width: 80, height: 80, background: 'rgba(198,161,91,0.15)', border: '2px solid rgba(198,161,91,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>⬡</div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', marginBottom: 6 }}>DIGITAL IDENTITY</div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', letterSpacing: '0.1em' }}>PASSPORT</div>
                    <div style={{ marginTop: 32, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Click to open</div>
                  </div>
                </div>
              ) : (
                <PassportCard passport={passport} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
              {['Cryptographically Verified', 'Authority Sealed', 'Tamper-Evident', 'AI Validated'].map((b) => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', background: '#fff' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>{b}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}