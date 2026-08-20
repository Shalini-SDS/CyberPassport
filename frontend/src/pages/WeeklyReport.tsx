import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, getCurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }

const normalizeScore = (value: unknown) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(100, numeric))
}

export default function WeeklyReport({ navigate }: Props) {
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate('login')
      return
    }

    apiFetch<any>('/api/dashboard/me')
      .then(setDashboardData)
      .catch(() => setDashboardData(null))
  }, [navigate])

  const trend = useMemo(() => {
    const source = dashboardData?.risk_trend || []
    return source.map((item: any) => ({ ...item, score: normalizeScore(item.score) }))
  }, [dashboardData])

  const history = useMemo(() => {
    const source = Array.isArray(dashboardData?.history) && dashboardData.history.length > 0 ? dashboardData.history : []
    return source.map((row: any, index: number) => {
      const score = normalizeScore(row.trust_score)
      const prev = index === 0 ? score : normalizeScore(source[index - 1]?.trust_score ?? score)
      const change = score - prev
      return {
        period: row.date ? row.date : `Week ${index + 1}`,
        score,
        prev,
        risk: (row.risk_level || 'Unknown').toUpperCase(),
        change,
      }
    })
  }, [dashboardData])

  const currentScore = normalizeScore(dashboardData?.cyber_trust_score ?? trend[trend.length - 1]?.score ?? 0)
  const previousScore = normalizeScore(history.length > 1 ? history[history.length - 2]?.score : currentScore)
  const scoreDelta = currentScore - previousScore

  const riskSummary = dashboardData?.top_risk_factors?.length ? dashboardData.top_risk_factors.map((factor: any, index: number) => ({
    icon: ['🌐', '💻', '🛡️'][index % 3],
    text: typeof factor === 'string' ? factor : factor?.issue || factor?.label || 'Security concern',
    level: dashboardData.risk_level || 'Medium',
  })) : []

  const reportImprovements = dashboardData?.recommendations?.length ? dashboardData.recommendations.slice(0, 4).map((item: any, index: number) => ({
    icon: ['🛡️', '💻', '🔑', '☁️'][index % 4],
    text: item.title || item.message || item.recommendation || 'Updated recommendation',
    date: item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today',
  })) : []

  return (
    <AppShell navigate={navigate} current="weekly">
      <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>PROGRESS TRACKING</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Weekly Report</h1>
        </div>

        {/* Score summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Current Score', value: String(currentScore), sub: 'This week', color: 'var(--emerald)' },
            { label: 'Previous Score', value: String(previousScore), sub: 'Last week', color: 'var(--text)' },
            { label: 'Improvement', value: `${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`, sub: 'Points gained', color: 'var(--success)' },
            { label: 'Risk Trend', value: scoreDelta >= 0 ? '↓ Declining' : '↑ Rising', sub: scoreDelta >= 0 ? 'Improving' : 'Needs attention', color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Trend graph */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', marginBottom: 20, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Score Trend</h2>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{trend.length > 1 ? `${trend[trend.length - 1].score - trend[0].score >= 0 ? '+' : ''}${trend[trend.length - 1].score - trend[0].score} pts in ${trend.length} periods` : 'Live trend data'}</span>
          </div>
          {trend.length ? <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B4D43" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0B4D43" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="w" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#weekGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer> : <div style={{ height: 160, display: 'grid', placeItems: 'center', color: 'var(--text-2)', fontSize: 13 }}>Your score trend will appear after your first assessment.</div>}
        </div>

        {/* Improvements + Risk Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Security Improvements */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 22px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Security Improvements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reportImprovements.length ? reportImprovements.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--success-bg)', borderRadius: 10, border: '1px solid rgba(22,163,74,0.12)' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{item.date}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✓</span>
                </div>
              )) : <div style={{ padding: '18px 0', color: 'var(--text-2)', fontSize: 13 }}>Complete an assessment to see security improvements here.</div>}
            </div>
          </div>

          {/* Risk Areas */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 22px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Risk Areas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {riskSummary.map((item, i) => {
                const color = item.level === 'High' ? 'var(--risk)' : item.level === 'Medium' ? 'var(--warning)' : 'var(--text-2)'
                const bg = item.level === 'High' ? 'var(--risk-bg)' : item.level === 'Medium' ? 'var(--warning-bg)' : 'var(--bg)'
                const border = item.level === 'High' ? 'rgba(220,38,38,0.12)' : item.level === 'Medium' ? 'rgba(245,158,11,0.15)' : 'var(--border)'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: bg, borderRadius: 10, border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.text}</div>
                    </div>
                    <span style={{ fontSize: 10, color, fontWeight: 700, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 5, padding: '2px 8px' }}>{item.level}</span>
                  </div>
                )
              })}
            </div>
            <button onClick={() => navigate('recommendations')} style={{ marginTop: 14, width: '100%', background: 'none', border: '1px solid var(--border-2)', borderRadius: 10, color: 'var(--emerald)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '10px' }}>
              View All Recommendations →
            </button>
          </div>
        </div>

        {/* Assessment History */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Assessment History</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Period', 'Score', 'Previous', 'Change', 'Risk Level'].map((h) => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none', background: i === 0 ? 'rgba(11,77,67,0.03)' : 'transparent' }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text)' }}>
                      {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--emerald)', background: 'var(--emerald-light)', padding: '2px 7px', borderRadius: 4, marginRight: 8 }}>CURRENT</span>}
                      {row.period}
                    </td>
                    <td style={{ padding: '13px 20px', fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{row.score}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-2)' }}>{row.prev}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: row.change > 0 ? 'var(--success)' : 'var(--text-2)' }}>{row.change > 0 ? `+${row.change}` : row.change === 0 ? '—' : row.change}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: row.risk === 'LOW' ? 'var(--success)' : 'var(--warning)', background: row.risk === 'LOW' ? 'var(--success-bg)' : 'var(--warning-bg)', border: `1px solid ${row.risk === 'LOW' ? 'rgba(22,163,74,0.2)' : 'rgba(245,158,11,0.2)'}`, padding: '2px 10px', borderRadius: 6 }}>
                        {row.risk === 'LOW' ? 'Low Risk' : 'Medium Risk'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
