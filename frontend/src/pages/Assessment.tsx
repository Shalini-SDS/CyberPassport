import { useState } from 'react'
import type { Page } from '../App'
import { apiFetch, assessmentAnswersToFeatures, getCurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }

const domains = [
  {
    id: 'passwords', icon: '🔑', title: 'Password Security', time: 3,
    questions: [
      { q: 'How do you manage your passwords?', opts: ['Dedicated password manager', 'Browser-saved passwords', 'Written down or notes', 'I remember them'], scores: [10, 4, 2, 5] },
      { q: 'How long are your typical passwords?', opts: ['16+ characters', '12–15 characters', '8–11 characters', 'Under 8 characters'], scores: [10, 7, 3, 0] },
      { q: 'Do you reuse passwords across sites?', opts: ['Never — all unique', 'Rarely (critical sites only)', 'Sometimes', 'Yes, frequently'], scores: [10, 7, 3, 0] },
    ],
  },
  {
    id: 'mfa', icon: '🛡️', title: 'Multi-Factor Authentication', time: 2,
    questions: [
      { q: 'Is MFA enabled on your primary email?', opts: ['Yes — hardware key', 'Yes — authenticator app', 'Yes — SMS only', 'No'], scores: [10, 9, 5, 0] },
      { q: 'What percentage of accounts have MFA?', opts: ['All accounts', 'Most (>75%)', 'Some (25–75%)', 'Few or none'], scores: [10, 7, 3, 0] },
    ],
  },
  {
    id: 'device', icon: '💻', title: 'Device Security', time: 3,
    questions: [
      { q: 'Is your device storage encrypted?', opts: ['Yes — verified encryption', 'Yes — I believe so', 'Unsure', 'No'], scores: [10, 7, 2, 0] },
      { q: 'How up-to-date is your operating system?', opts: ['Auto-updates enabled', 'Updated within 30 days', 'Updated within 6 months', 'Older than 6 months'], scores: [10, 8, 3, 0] },
      { q: 'Do you use antivirus / endpoint protection?', opts: ['Yes — paid professional tool', 'Yes — built-in OS protection', 'Unsure', 'No'], scores: [10, 7, 3, 0] },
    ],
  },
  {
    id: 'network', icon: '🌐', title: 'Network Security', time: 2,
    questions: [
      { q: 'Do you use a VPN for sensitive tasks?', opts: ['Always (paid reputable VPN)', 'Sometimes', 'Rarely', 'Never'], scores: [10, 6, 2, 0] },
      { q: 'How often do you use public WiFi?', opts: ['Never', 'With VPN always', 'Occasionally unprotected', 'Frequently unprotected'], scores: [10, 9, 3, 0] },
    ],
  },
  {
    id: 'awareness', icon: '🧠', title: 'Security Awareness', time: 3,
    questions: [
      { q: 'Can you identify a phishing email?', opts: ['Always, with high confidence', 'Usually yes', 'Sometimes uncertain', 'Often uncertain'], scores: [10, 7, 3, 0] },
      { q: 'Have you completed security training?', opts: ['Yes, within 12 months', 'Yes, 1–3 years ago', 'Yes, over 3 years ago', 'Never'], scores: [10, 6, 3, 0] },
      { q: 'Do you check HTTPS before entering data?', opts: ['Always', 'Usually', 'Sometimes', 'Never considered it'], scores: [10, 7, 3, 0] },
    ],
  },
  {
    id: 'backup', icon: '☁️', title: 'Backup & Monitoring', time: 2,
    questions: [
      { q: 'Do you have regular backups of important data?', opts: ['Yes — automated cloud + local', 'Yes — cloud backup only', 'Yes — manual occasionally', 'No backups'], scores: [10, 8, 4, 0] },
      { q: 'Do you monitor for account breach notifications?', opts: ['Yes — active monitoring service', 'Yes — check manually sometimes', 'Rarely', 'Never'], scores: [10, 7, 3, 0] },
    ],
  },
]

export default function Assessment({ navigate }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [phase, setPhase] = useState<'assess' | 'summary' | 'processing'>('assess')
  const [error, setError] = useState('')

  const domain = domains[step]
  const stepAnswers = answers[domain.id] || []
  const allAnswered = stepAnswers.length === domain.questions.length

  const totalTime = domains.slice(step).reduce((s, d) => s + d.time, 0)
  const progress = (step / domains.length) * 100

  const setAnswer = (qIdx: number, optIdx: number) => {
    setAnswers(prev => {
      const cur = [...(prev[domain.id] || [])]
      cur[qIdx] = optIdx
      return { ...prev, [domain.id]: cur }
    })
  }

  const handleNext = () => {
    if (step < domains.length - 1) {
      setStep(prev => prev + 1)
    } else {
      setPhase('summary')
    }
  }

  const handleSubmit = async () => {
    const user = getCurrentUser()
    if (!user) {
      navigate('login')
      return
    }
    setPhase('processing')
    setError('')
    try {
      await apiFetch('/api/assessment', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, profile: user.profile || {}, answers, features: assessmentAnswersToFeatures(answers) }),
      })
      navigate('dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit assessment')
      setPhase('summary')
    }
  }

  if (phase === 'processing') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ width: 72, height: 72, background: 'var(--emerald-light)', border: '3px solid var(--emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px' }}>⬡</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)', margin: '0 0 10px' }}>Calculating Your Score</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>Our AI is analysing your responses across all 6 security domains…</p>
      </div>
    </div>
  )

  if (phase === 'summary') {
    const domainSummaries = domains.map((d) => {
      const domAnswers = answers[d.id] || []
      const scored = domAnswers.reduce((sum, optIdx, qIdx) => sum + (d.questions[qIdx]?.scores[optIdx] ?? 0), 0)
      const maxScore = d.questions.length * 10
      const pct = maxScore > 0 ? Math.round((scored / maxScore) * 100) : 0
      return { ...d, pct, scored, maxScore }
    })

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', padding: '0 0 60px' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, background: 'var(--emerald)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>CP</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>CyberPassport</span>
        </div>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 10 }}>ASSESSMENT COMPLETE</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: '0 0 10px' }}>Review Your Results</h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Submit to generate your Cyber Trust Score and issue your passport.</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--shadow-md)' }}>
            {domainSummaries.map((d, i) => (
              <div key={d.id} style={{ padding: '16px 24px', borderBottom: i < domainSummaries.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.pct >= 80 ? 'var(--success)' : d.pct >= 60 ? 'var(--warning)' : 'var(--risk)' }}>{d.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${d.pct}%`, height: '100%', background: d.pct >= 80 ? 'var(--success)' : d.pct >= 60 ? 'var(--warning)' : 'var(--risk)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} style={{ width: '100%', background: 'var(--emerald)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '16px', boxShadow: '0 4px 16px rgba(11,77,67,0.25)' }}>
            Submit & Generate Passport →
          </button>
          <button onClick={() => setPhase('assess')} style={{ width: '100%', background: 'none', border: '1px solid var(--border-2)', borderRadius: 12, color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '13px', marginTop: 10 }}>
            ← Revise Answers
          </button>
          {error && <div style={{ marginTop: 12, background: 'var(--risk-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--risk)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--emerald)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>CP</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Cyber Assessment</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>~{totalTime} min remaining</span>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--emerald)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 60px' }}>
        {/* Domain header */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'var(--emerald-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{domain.icon}</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 3 }}>Domain {step + 1} of {domains.length} · ~{domain.time} min</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{domain.title}</h1>
          </div>
        </div>

        {/* Domain indicators */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {domains.map((d, i) => (
            <div key={d.id} title={d.title} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i < step ? 'var(--emerald)' : i === step ? 'var(--gold)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {domain.questions.map((question, qIdx) => {
            const selected = stepAnswers[qIdx]
            return (
              <div key={qIdx} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '22px', boxShadow: 'var(--shadow)' }}>
                <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500, margin: '0 0 16px', lineHeight: 1.5 }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--emerald)', marginRight: 8 }}>{qIdx + 1}.</span>
                  {question.q}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {question.opts.map((opt, optIdx) => {
                    const isSelected = selected === optIdx
                    return (
                      <button key={optIdx} onClick={() => setAnswer(qIdx, optIdx)} style={{
                        background: isSelected ? 'var(--emerald-light)' : 'var(--bg)',
                        border: isSelected ? '1.5px solid var(--emerald)' : '1px solid var(--border-2)',
                        borderRadius: 8, color: isSelected ? 'var(--emerald)' : 'var(--text)',
                        cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif',
                        fontWeight: isSelected ? 600 : 400,
                        padding: '11px 16px', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--emerald)' : 'var(--border-2)'}`, background: isSelected ? 'var(--emerald)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button onClick={() => step > 0 && setStep(prev => prev - 1)} disabled={step === 0} style={{
            background: 'none', border: '1px solid var(--border-2)', borderRadius: 10,
            color: step === 0 ? 'var(--text-3)' : 'var(--text)',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 500, padding: '11px 24px',
          }}>← Previous</button>
          <button onClick={handleNext} disabled={!allAnswered} style={{
            background: allAnswered ? 'var(--emerald)' : 'var(--border)',
            border: 'none', borderRadius: 10,
            color: allAnswered ? '#fff' : 'var(--text-3)',
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, padding: '11px 28px',
            boxShadow: allAnswered ? '0 4px 16px rgba(11,77,67,0.2)' : 'none',
          }}>
            {step < domains.length - 1 ? 'Continue →' : 'Review Summary →'}
          </button>
        </div>
      </div>
    </div>
  )
}
