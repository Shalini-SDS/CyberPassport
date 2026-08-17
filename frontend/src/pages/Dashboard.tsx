import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, downloadPassportPdf, getCurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }

const normalizeScore = (value: unknown) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(100, numeric))
}

const weeklyData = [
  { w: 'W1', score: 48 }, { w: 'W2', score: 52 }, { w: 'W3', score: 58 },
  { w: 'W4', score: 62 }, { w: 'W5', score: 66 }, { w: 'W6', score: 72 },
  { w: 'W7', score: 78 }, { w: 'W8', score: 84 },
]

const securityHealth = [
  { label: 'Password Security', icon: '🔑', status: 'good', score: 87 },
  { label: 'MFA Coverage', icon: '🛡️', status: 'good', score: 90 },
  { label: 'Device Protection', icon: '💻', status: 'fair', score: 78 },
  { label: 'Network Safety', icon: '🌐', status: 'fair', score: 72 },
  { label: 'Backup Health', icon: '☁️', status: 'good', score: 83 },
]

const activity = [
  { icon: '✓', text: 'Assessment completed', time: 'recently', color: 'var(--success)' },
  { icon: '⬡', text: 'Passport generated', time: 'recently', color: 'var(--emerald)' },
  { icon: '↑', text: 'Trust score updated', time: 'recently', color: 'var(--gold)' },
  { icon: '◆', text: 'Recommendations refreshed', time: 'recently', color: 'var(--emerald-mid)' },
]

function ScoreGauge({ score }: { score: number }) {
  const max = 100
  const pct = score / max
  const r = 72
  const circ = Math.PI * r
  const dash = circ * pct
  const gap = circ - dash

  return (
    <svg width={180} height={100} viewBox="0 0 180 100">
      <path d={`M 18 90 A ${r} ${r} 0 0 1 162 90`} fill="none" stroke="#F3F4F6" strokeWidth={12} strokeLinecap="round" />
      <path d={`M 18 90 A ${r} ${r} 0 0 1 162 90`} fill="none" stroke="url(#gaugeGrad)" strokeWidth={12} strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`} style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--emerald)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <text x="90" y="82" textAnchor="middle" fill="var(--text)" fontSize="28" fontFamily="Playfair Display, serif" fontWeight="700">{score}</text>
    </svg>
  )
}

export default function Dashboard({ navigate }: Props) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate('login')
      return
    }
    apiFetch<any>(`/api/dashboard/${user.id}`).then(setData).catch(err => setError(err instanceof Error ? err.message : 'Could not load dashboard'))
  }, [])

  const score = normalizeScore(data?.cyber_trust_score)
  const risk = data?.risk_level ?? 'Unknown'
  const chartData = data?.risk_trend?.length ? data.risk_trend.map((item: any) => ({ ...item, score: normalizeScore(item.score) })) : weeklyData
  const health = data?.security_category_status?.length ? data.security_category_status : securityHealth
  const userName = data?.user?.name || getCurrentUser()?.name || 'CyberPassport User'

  const thisMonthDelta = useMemo(() => {
    if (!Array.isArray(data?.history) || data.history.length < 2) return 0
    const latest = normalizeScore(data.history[data.history.length - 1]?.trust_score ?? 0)
    const previous = normalizeScore(data.history[data.history.length - 2]?.trust_score ?? 0)
    return latest - previous
  }, [data])

  return (
    <AppShell navigate={navigate} current="dashboard">
      <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Welcome back, {userName.split(' ')[0]}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>Here's your digital identity overview.</p>
          {error && <p style={{ fontSize: 12, color: 'var(--risk)', marginTop: 8 }}>{error}</p>}
        </div>

        {/* Hero Score Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--emerald) 0%, #136F63 100%)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 20,
          boxShadow: '0 8px 32px rgba(11,77,67,0.2)',
          display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, right: 120, width: 160, height: 160, background: 'rgba(198,161,91,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Gauge */}
          <div style={{ textAlign: 'center' }}>
            <ScoreGauge score={score} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: -4 }}>out of 100</div>
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>CYBER TRUST SCORE</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{score}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#86efac', fontWeight: 600 }}>● {risk.toUpperCase()} RISK</div>
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Future risk {data?.future_risk_score ?? 0}</div>
            </div>
          </div>

          {/* Trend */}
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 24px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>This Month</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#86efac' }}>{thisMonthDelta >= 0 ? `+${thisMonthDelta}` : thisMonthDelta}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>points</div>
          </div>
        </div>

        {/* Security Health + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>
          {/* Security Health */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Security Health</h2>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>All Domains</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {health.map((item: any) => {
                const color = item.status === 'good' ? 'var(--success)' : item.status === 'fair' ? 'var(--warning)' : 'var(--risk)'
                const bg = item.status === 'good' ? 'var(--success-bg)' : item.status === 'fair' ? 'var(--warning-bg)' : 'var(--risk-bg)'
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.label}</span>
                    <div style={{ width: 80, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ width: `${item.score}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                    <div style={{ background: bg, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: color, fontWeight: 600, flexShrink: 0, minWidth: 50, textAlign: 'center' }}>
                      {item.score}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 20px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Take Assessment', icon: '◎', page: 'assessment' as Page, primary: false },
                { label: 'View Passport', icon: '⬡', page: 'passport' as Page, primary: true },
                { label: 'Download PDF', icon: '↓', page: 'passport' as Page, primary: false, download: true },
                { label: 'Recommendations', icon: '◆', page: 'recommendations' as Page, primary: false },
                { label: 'Update Profile', icon: '◉', page: 'settings' as Page, primary: false },
              ].map((action) => (
                <button key={action.label} onClick={() => action.download ? downloadPassportPdf(getCurrentUser()?.id || '') : navigate(action.page)} style={{
                  background: action.primary ? 'var(--emerald)' : 'var(--bg)',
                  border: action.primary ? 'none' : '1px solid var(--border)',
                  borderRadius: 10, color: action.primary ? '#fff' : 'var(--text)',
                  cursor: 'pointer', fontSize: 13, fontWeight: action.primary ? 600 : 500,
                  padding: '11px 16px', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: action.primary ? '0 2px 8px rgba(11,77,67,0.2)' : 'none',
                }}>
                  <span style={{ fontSize: 16, width: 18, textAlign: 'center', color: action.primary ? '#fff' : 'var(--text-2)' }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Score trend + Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Trend chart */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Score Trend</h2>
              <button onClick={() => navigate('weekly')} style={{ background: 'none', border: 'none', color: 'var(--emerald)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Weekly Report →</button>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B4D43" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0B4D43" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="w" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--emerald)" strokeWidth={2} fill="url(#grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 20px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activity.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < activity.length - 1 ? 14 : 0, marginBottom: i < activity.length - 1 ? 14 : 0, borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: item.color, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
