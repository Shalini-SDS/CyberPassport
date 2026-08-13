import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import AppShell from '../components/AppShell'
import type { Page } from '../App'

interface Props { navigate: (p: Page) => void }

const trendData = [
  { w: 'W1', score: 618 }, { w: 'W2', score: 634 }, { w: 'W3', score: 651 },
  { w: 'W4', score: 680 }, { w: 'W5', score: 695 }, { w: 'W6', score: 712 },
  { w: 'W7', score: 730 }, { w: 'W8', score: 742 },
]

const improvements = [
  { icon: '🛡️', text: 'Enabled MFA on all primary accounts', date: 'Jul 8' },
  { icon: '💻', text: 'Updated device to latest OS version', date: 'Jul 5' },
  { icon: '🔑', text: 'Migrated to password manager', date: 'Jul 1' },
  { icon: '☁️', text: 'Enabled automated cloud backups', date: 'Jun 28' },
]

const riskAreas = [
  { icon: '🌐', text: 'Occasional public WiFi without VPN', level: 'Medium' },
  { icon: '💻', text: 'Firmware update pending on secondary device', level: 'Low' },
  { icon: '🛡️', text: 'MFA not yet enabled on 3 accounts', level: 'High' },
]

const history = [
  { period: 'Week 8 · Jul 8', score: 742, prev: 730, risk: 'LOW', change: +12 },
  { period: 'Week 7 · Jul 1', score: 730, prev: 712, risk: 'LOW', change: +18 },
  { period: 'Week 6 · Jun 24', score: 712, prev: 695, risk: 'LOW', change: +17 },
  { period: 'Week 5 · Jun 17', score: 695, prev: 680, risk: 'LOW', change: +15 },
  { period: 'Week 4 · Jun 10', score: 680, prev: 651, risk: 'MED', change: +29 },
  { period: 'Week 3 · Jun 3', score: 651, prev: 634, risk: 'MED', change: +17 },
  { period: 'Week 2 · May 27', score: 634, prev: 618, risk: 'MED', change: +16 },
  { period: 'Week 1 · May 20', score: 618, prev: 618, risk: 'MED', change: 0 },
]

export default function WeeklyReport({ navigate }: Props) {
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
            { label: 'Current Score', value: '742', sub: 'This week', color: 'var(--emerald)' },
            { label: 'Previous Score', value: '730', sub: 'Last week', color: 'var(--text)' },
            { label: 'Improvement', value: '+12', sub: 'Points gained', color: 'var(--success)' },
            { label: 'Risk Trend', value: '↓ Declining', sub: 'Improving', color: 'var(--success)' },
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
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>+124 pts in 8 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B4D43" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0B4D43" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="w" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[580, 780]} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#weekGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Improvements + Risk Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Security Improvements */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 22px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Security Improvements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {improvements.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--success-bg)', borderRadius: 10, border: '1px solid rgba(22,163,74,0.12)' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{item.date}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✓</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Areas */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 22px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Risk Areas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {riskAreas.map((item, i) => {
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
