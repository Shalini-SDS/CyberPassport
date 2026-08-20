import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, getCurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: 'var(--risk-bg)', text: 'var(--risk)', border: 'rgba(220,38,38,0.2)' },
  High: { bg: 'var(--warning-bg)', text: 'var(--warning)', border: 'rgba(245,158,11,0.2)' },
  Medium: { bg: '#F0F9FF', text: '#0369A1', border: 'rgba(3,105,161,0.2)' },
  Low: { bg: 'var(--bg)', text: 'var(--text-2)', border: 'var(--border)' },
}

export default function Recommendations({ navigate }: Props) {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All')
  const [items, setItems] = useState<any[]>([])
  const [done, setDone] = useState<Set<number | string>>(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate('login')
      return
    }
    apiFetch<any[]>('/api/recommendations/me').then(data => {
      const mapped = data.map((r) => ({ ...r, icon: '◆', desc: r.reason || r.recommendation || r.issue, done: r.completed }))
      setItems(mapped)
      setDone(new Set(mapped.filter(r => r.completed).map(r => r.id)))
    }).catch(err => setError(err instanceof Error ? err.message : 'Could not load recommendations'))
  }, [])

  const toggleDone = async (rec: any) => {
    const next = !done.has(rec.id)
    setDone(prev => { const n = new Set(prev); next ? n.add(rec.id) : n.delete(rec.id); return n })
    if (typeof rec.id === 'string') {
      try {
        await apiFetch(`/api/recommendations/${rec.id}`, { method: 'PATCH', body: JSON.stringify({ completed: next }) })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update recommendation')
      }
    }
  }

  const filtered = items.filter(r => filter === 'All' || r.priority === filter)
  const totalPts = items.filter(r => done.has(r.id)).reduce((s, r) => s + parseInt(r.impact || '+0'), 0)

  return (
    <AppShell navigate={navigate} current="recommendations">
      <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>AI GUIDANCE</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Recommendations</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--emerald)' }}>{done.size}/{items.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>completed · +{totalPts} pts secured</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${items.length ? (done.size / items.length) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--emerald), var(--gold))', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{Math.round(items.length ? (done.size / items.length) * 100 : 0)}% complete</span>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Potential: +{items.reduce((s, r) => s + parseInt(r.impact || '+0'), 0)} pts</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((f) => {
            const active = filter === f
            const style = f !== 'All' && active ? priorityColors[f] : null
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: active ? (style ? style.bg : 'var(--emerald-light)') : '#fff',
                border: `1px solid ${active ? (style ? style.border : 'rgba(11,77,67,0.25)') : 'var(--border)'}`,
                borderRadius: 8, color: active ? (style ? style.text : 'var(--emerald)') : 'var(--text-2)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '7px 16px',
              }}>
                {f} <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 3 }}>{f === 'All' ? items.length : items.filter(r => r.priority === f).length}</span>
              </button>
            )
          })}
        </div>
        {error && <div style={{ marginBottom: 12, color: 'var(--risk)', fontSize: 12 }}>{error}</div>}

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((rec) => {
            const isDone = done.has(rec.id)
            const pStyle = priorityColors[rec.priority]
            return (
              <div key={rec.id} style={{
                background: isDone ? 'var(--bg)' : '#fff',
                border: `1px solid ${isDone ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: 14, padding: '18px 20px',
                boxShadow: isDone ? 'none' : 'var(--shadow)',
                opacity: isDone ? 0.7 : 1,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Checkbox */}
                  <button onClick={() => toggleDone(rec)} style={{
                    width: 22, height: 22, flexShrink: 0, borderRadius: 6,
                    background: isDone ? 'var(--emerald)' : 'none',
                    border: `2px solid ${isDone ? 'var(--emerald)' : 'var(--border-2)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, marginTop: 1,
                  }}>{isDone ? '✓' : ''}</button>

                  {/* Icon */}
                  <div style={{ width: 42, height: 42, background: pStyle.bg, border: `1px solid ${pStyle.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{rec.icon}</div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: isDone ? 'var(--text-2)' : 'var(--text)', margin: 0, textDecoration: isDone ? 'line-through' : 'none' }}>{rec.title}</h3>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pStyle.text, background: pStyle.bg, border: `1px solid ${pStyle.border}`, borderRadius: 5, padding: '2px 8px' }}>{rec.priority}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 10px' }}>{rec.desc}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Impact:</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>{rec.impact}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Effort:</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{rec.effort}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  {!isDone && (
                    <button style={{ background: 'var(--emerald)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '8px 16px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
