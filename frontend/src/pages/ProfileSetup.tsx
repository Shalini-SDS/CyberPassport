import { useEffect, useState } from 'react'
import type { Page } from '../App'
import { apiFetch, assetUrl, fetchCurrentUser, getCurrentUser, setSession, uploadProfilePhoto } from '../lib/api'

interface Props { navigate: (p: Page) => void }

export default function ProfileSetup({ navigate }: Props) {
  const [form, setForm] = useState({
    name: '', dob: '', gender: '', country: '', occupation: '',
    email: '', phone: '', linkedin: '', bio: '', photoUrl: '',
  })
  const [photoHover, setPhotoHover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate('login')
      return
    }

    fetchCurrentUser().then((fetched) => {
      setForm({
        name: fetched.name || '',
        dob: String((fetched.profile as any)?.dob || ''),
        gender: String((fetched.profile as any)?.gender || ''),
        country: String((fetched.profile as any)?.country || ''),
        occupation: String((fetched.profile as any)?.occupation || ''),
        email: fetched.email || '',
        phone: String((fetched.profile as any)?.phone || ''),
        linkedin: String((fetched.profile as any)?.linkedin || ''),
        bio: String((fetched.profile as any)?.bio || ''),
        photoUrl: fetched.profile_photo_url || '',
      })
    }).catch(() => {})
  }, [])

  const saveProfile = async () => {
    const user = getCurrentUser()
    if (!user) {
      navigate('login')
      return false
    }
    setSaving(true)
    setMessage('')
    try {
      if (!form.name.trim() || !form.dob || !form.country || !form.occupation.trim() || !form.email.trim()) {
        setMessage('Complete all required fields before saving')
        return false
      }
      const updated = await apiFetch<any>('/api/users/me', { method: 'PATCH', body: JSON.stringify({ name: form.name, dob: form.dob, gender: form.gender, country: form.country, occupation: form.occupation, email: form.email, phone: form.phone, linkedin: form.linkedin, bio: form.bio }) })
      setSession(localStorage.getItem('cp_token') || '', updated)
      setMessage('Profile saved')
      return true
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save profile')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handlePhoto = async (file?: File) => {
    if (!file) return
    setMessage('Uploading...')
    try {
      const result = await uploadProfilePhoto(file)
      setForm((previous) => ({ ...previous, photoUrl: result.profile_photo_url }))
      setSession(localStorage.getItem('cp_token') || '', result.user)
      setMessage('Profile photo updated successfully.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not upload photo')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
    borderRadius: 10, color: 'var(--text)', fontSize: 14, fontFamily: 'Inter, sans-serif',
    padding: '12px 16px', outline: 'none', transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', padding: '0 0 60px' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--emerald)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>CP</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>CyberPassport</span>
        </div>
        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[{ n: 1, l: 'Register' }, { n: 2, l: 'Profile' }, { n: 3, l: 'Assess' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.n <= 2 ? 'var(--emerald)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: s.n <= 2 ? '#fff' : 'var(--text-3)', fontWeight: 700 }}>{s.n}</div>
              <span style={{ fontSize: 12, color: s.n === 2 ? 'var(--emerald)' : 'var(--text-2)', fontWeight: s.n === 2 ? 600 : 400 }}>{s.l}</span>
              {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 4px' }} />}
            </div>
          ))}
        </div>
        <div style={{ width: 120 }} />
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 10 }}>STEP 2 OF 3</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>Build Your Identity Profile</h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>This information will appear on your official CyberPassport credential.</p>
        </div>

        {/* Profile card */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 32px', boxShadow: 'var(--shadow-md)', marginBottom: 20 }}>
          {/* Photo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div
              onMouseEnter={() => setPhotoHover(true)}
              onMouseLeave={() => setPhotoHover(false)}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: photoHover ? 'var(--emerald)' : 'var(--emerald-light)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                border: `2px solid ${photoHover ? 'var(--emerald)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
                {form.photoUrl ? <img src={assetUrl(form.photoUrl)} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill={photoHover ? 'rgba(255,255,255,0.6)' : 'var(--emerald)'} fillOpacity={0.6} />
                <path d="M4 20 Q4 14 12 14 Q20 14 20 20" fill={photoHover ? 'rgba(255,255,255,0.5)' : 'var(--emerald)'} fillOpacity={0.4} />
                </svg>}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Profile Photo</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Upload a clear photo for your passport.</div>
              <label style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 7, color: 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '6px 14px', display: 'inline-block' }}>Upload Photo<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => handlePhoto(event.target.files?.[0])} /></label>
            </div>
          </div>

          {/* Form fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input type="date" value={form.dob} onChange={(e) => setForm(p => ({ ...p, dob: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))} style={inputStyle}>
                <option value="">Select…</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Country *</label>
              <select value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} style={inputStyle}>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="SG">Singapore</option>
                <option value="DE">Germany</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Occupation *</label>
              <input type="text" value={form.occupation} onChange={(e) => setForm(p => ({ ...p, occupation: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" placeholder="+44 7700 900000" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span></label>
              <input type="url" placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={(e) => setForm(p => ({ ...p, linkedin: e.target.value }))} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Bio <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span></label>
              <textarea placeholder="A short description about you..." value={form.bio} onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', minHeight: 88 }} onFocus={(e) => e.target.style.borderColor = 'var(--emerald)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-2)'} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={saveProfile} disabled={saving} style={{ flex: 1, background: '#fff', border: '1px solid var(--border-2)', borderRadius: 12, color: 'var(--text)', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, padding: '14px' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button onClick={async () => { if (await saveProfile()) navigate('assessment') }} style={{ flex: 2, background: 'var(--emerald)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '14px', boxShadow: '0 4px 16px rgba(11,77,67,0.25)' }}>
            Continue to Assessment →
          </button>
        </div>
        {message && <div style={{ marginTop: 12, fontSize: 12, color: message === 'Profile saved' ? 'var(--success)' : 'var(--risk)' }}>{message}</div>}
      </div>
    </div>
  )
}
