import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, assetUrl, fetchCurrentUser, setSession, uploadProfilePhoto, type CurrentUser } from '../lib/api'

interface Props { navigate: (p: Page) => void }
type Tab = 'profile' | 'security' | 'notifications' | 'privacy'

const tabs: Array<{ key: Tab; label: string; path: string }> = [
  { key: 'profile', label: 'Personal Information', path: '/settings/profile' },
  { key: 'security', label: 'Password & Security', path: '/settings/security' },
  { key: 'notifications', label: 'Notifications', path: '/settings/notifications' },
  { key: 'privacy', label: 'Privacy & Data', path: '/settings/privacy' },
]

const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: 10, color: 'var(--text)', fontSize: 14, padding: '12px 16px', outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }

function selectedTab(): Tab {
  const key = window.location.pathname.split('/')[2] as Tab
  return tabs.some((tab) => tab.key === key) ? key : 'profile'
}

export default function ProfileSettings({ navigate }: Props) {
  const [tab, setTab] = useState<Tab>(selectedTab)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [form, setForm] = useState({ name: '', email: '', occupation: '', country: '', dob: '', gender: '', phone: '', linkedin: '', bio: '' })
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' })
  const [notifications, setNotifications] = useState({ security_alerts: true, weekly_report: true, recommendation_updates: true, passport_notifications: true, assessment_reminders: false })
  const [privacy, setPrivacy] = useState({ visibility: 'verification_only', anonymous_data_sharing: false })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    const onPopState = () => setTab(selectedTab())
    window.addEventListener('popstate', onPopState)
    Promise.all([fetchCurrentUser(), apiFetch<typeof notifications>('/api/users/me/notifications'), apiFetch<typeof privacy>('/api/users/me/privacy')]).then(([freshUser, freshNotifications, freshPrivacy]) => {
      setUser(freshUser)
      const profile = freshUser.profile || {}
      setForm({ name: freshUser.name || '', email: freshUser.email || '', occupation: String(profile.occupation || ''), country: String(profile.country || ''), dob: String(profile.dob || ''), gender: String(profile.gender || ''), phone: String(profile.phone || ''), linkedin: String(profile.linkedin || ''), bio: String(profile.bio || '') })
      setNotifications(freshNotifications)
      setPrivacy(freshPrivacy)
    }).catch((err) => setMessage(err instanceof Error ? err.message : 'Could not load settings')).finally(() => setLoading(false))
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const selectTab = (next: Tab) => {
    const path = `/settings/${next}`
    window.history.pushState({}, '', path)
    setTab(next)
  }

  const saveProfile = async () => {
    setSaving(true); setMessage('')
    try {
      const updated = await apiFetch<CurrentUser>('/api/users/me', { method: 'PATCH', body: JSON.stringify(form) })
      setUser(updated); setSession(localStorage.getItem('cp_token') || '', updated); setMessage('Profile updated successfully.')
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not update profile') } finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!passwords.current_password || !passwords.new_password || !passwords.confirm) { setMessage('Enter your current password and complete both new password fields'); return }
    if (passwords.new_password !== passwords.confirm) { setMessage('New passwords do not match'); return }
    if (passwords.new_password.length < 8 || !/[A-Z]/.test(passwords.new_password) || !/[0-9]/.test(passwords.new_password)) { setMessage('New password must be at least 8 characters and include an uppercase letter and a number'); return }
    setSaving(true); setMessage('')
    try { await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: passwords.current_password, new_password: passwords.new_password }) }); setPasswords({ current_password: '', new_password: '', confirm: '' }); setMessage('Password changed successfully.') }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Could not change password') } finally { setSaving(false) }
  }

  const saveNotifications = async (next: typeof notifications) => {
    setNotifications(next); setMessage('')
    try { await apiFetch('/api/users/me/notifications', { method: 'PATCH', body: JSON.stringify(next) }); setMessage('Notification preferences updated.') }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Could not update notifications') }
  }

  const savePrivacy = async (next: typeof privacy) => {
    setPrivacy(next); setMessage('')
    try { await apiFetch('/api/users/me/privacy', { method: 'PATCH', body: JSON.stringify(next) }); setMessage('Privacy settings updated.') }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Could not update privacy settings') }
  }

  const exportData = async () => {
    const data = await apiFetch<Record<string, unknown>>('/api/users/me/export')
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'CyberPassport_Data.json'; link.click(); URL.revokeObjectURL(url); setMessage('Your data export is ready.')
  }

  const deleteAccount = async () => {
    setSaving(true)
    try { await apiFetch('/api/users/me', { method: 'DELETE' }); localStorage.removeItem('cp_token'); localStorage.removeItem('cp_user'); navigate('login') }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Could not delete account'); setSaving(false) }
  }

  if (loading) return <AppShell navigate={navigate} current="settings"><div style={{ padding: 36 }}>Loading profile...</div></AppShell>
  const photo = assetUrl(user?.profile_photo_url)

  return <AppShell navigate={navigate} current="settings">
    <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
      <div style={{ marginBottom: 28 }}><div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>ACCOUNT</div><h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text)', margin: 0 }}>Profile Settings</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 8, height: 'fit-content' }}>
          <div style={{ padding: '16px 12px 14px', borderBottom: '1px solid var(--border)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            {photo ? <img src={photo} alt="Profile" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{(user?.name || 'CP').slice(0, 1).toUpperCase()}</div>}
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || 'Profile'}</div><div style={{ fontSize: 10, color: 'var(--text-2)' }}>{user?.passport_id || 'Passport not issued'}</div></div>
          </div>
          {tabs.map((item) => <button key={item.key} onClick={() => selectTab(item.key)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: tab === item.key ? 'var(--emerald-light)' : 'none', border: 0, borderRadius: 8, color: tab === item.key ? 'var(--emerald)' : 'var(--text-2)', cursor: 'pointer', fontSize: 13, marginBottom: 2 }}>{item.label}</button>)}
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '26px 28px' }}>
          {message && <div style={{ marginBottom: 18, padding: '10px 12px', background: message.includes('successfully') || message.includes('ready') ? 'var(--success-bg)' : 'var(--risk-bg)', color: message.includes('successfully') || message.includes('ready') ? 'var(--success)' : 'var(--risk)', borderRadius: 8, fontSize: 13 }}>{message}</div>}
          {tab === 'profile' && <>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, margin: '0 0 22px' }}>Personal Information</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}><div>{photo ? <img src={photo} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 25 }}>{(user?.name || 'CP').slice(0, 1).toUpperCase()}</div>}</div><label style={{ border: '1px solid var(--border-2)', borderRadius: 7, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Upload New Photo<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setMessage('Uploading...'); try { const result = await uploadProfilePhoto(file); setUser(result.user); setSession(localStorage.getItem('cp_token') || '', result.user); setMessage('Profile photo updated successfully.') } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not upload photo') } }} /></label></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>{([['name', 'Full Name', 'text'], ['email', 'Email Address', 'email'], ['occupation', 'Occupation', 'text'], ['phone', 'Phone Number', 'tel'], ['country', 'Country', 'text'], ['dob', 'Date of Birth', 'date'], ['gender', 'Gender', 'text'], ['linkedin', 'LinkedIn URL', 'url']] as const).map(([key, label, type]) => <div key={key}><label style={labelStyle}>{label}</label><input type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} style={inputStyle} /></div>)}<div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Bio</label><textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} /></div></div>
            <button disabled={saving} onClick={saveProfile} style={{ marginTop: 24, background: 'var(--emerald)', color: '#fff', border: 0, borderRadius: 10, padding: '12px 26px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </>}
          {tab === 'security' && <><h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, margin: '0 0 22px' }}>Password & Security</h2>{([['current_password', 'Current Password'], ['new_password', 'New Password'], ['confirm', 'Confirm New Password']] as const).map(([key, label]) => <div key={key} style={{ maxWidth: 420, marginBottom: 16 }}><label style={labelStyle}>{label}</label><input type="password" value={passwords[key]} onChange={(event) => setPasswords({ ...passwords, [key]: event.target.value })} style={inputStyle} /></div>)}<button disabled={saving} onClick={changePassword} style={{ background: 'var(--emerald)', color: '#fff', border: 0, borderRadius: 10, padding: '12px 26px', fontWeight: 700 }}>{saving ? 'Saving...' : 'Update Password'}</button></>}
          {tab === 'notifications' && <><h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, margin: '0 0 12px' }}>Notification Preferences</h2>{([['security_alerts', 'Security Alerts'], ['weekly_report', 'Weekly Security Report'], ['recommendation_updates', 'Recommendation Updates'], ['passport_notifications', 'Passport Notifications'], ['assessment_reminders', 'Assessment Reminders']] as const).map(([key, label]) => <label key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}><span>{label}</span><input type="checkbox" checked={notifications[key]} onChange={(event) => saveNotifications({ ...notifications, [key]: event.target.checked })} /></label>)}</>}
          {tab === 'privacy' && <><h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, margin: '0 0 22px' }}>Privacy & Data</h2><label style={labelStyle}>Profile Visibility</label><select value={privacy.visibility} onChange={(event) => savePrivacy({ ...privacy, visibility: event.target.value })} style={{ ...inputStyle, maxWidth: 360, marginBottom: 20 }}><option value="public">Public</option><option value="verification_only">Verification Only</option><option value="private">Private</option></select><label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, marginBottom: 30 }}><input type="checkbox" checked={privacy.anonymous_data_sharing} onChange={(event) => savePrivacy({ ...privacy, anonymous_data_sharing: event.target.checked })} />Allow anonymous data sharing</label><div style={{ borderTop: '1px solid var(--border)', paddingTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}><button onClick={() => exportData().catch((err) => setMessage(err instanceof Error ? err.message : 'Could not export data'))} style={{ border: '1px solid var(--border-2)', background: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>Export My Data</button><button onClick={() => setDeleteOpen(true)} style={{ border: '1px solid rgba(220,38,38,.3)', color: 'var(--risk)', background: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>Delete Account</button></div></>}
        </div>
      </div>
    </div>
    {deleteOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', zIndex: 100 }}><div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 420, margin: 20 }}><h2 style={{ marginTop: 0 }}>Delete your account?</h2><p>This action is permanent and cannot be undone. Your profile, assessment history, recommendations and passport data will be deleted.</p><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button onClick={() => setDeleteOpen(false)} style={{ padding: '10px 16px' }}>Cancel</button><button disabled={saving} onClick={deleteAccount} style={{ padding: '10px 16px', background: 'var(--risk)', color: '#fff', border: 0, borderRadius: 7 }}>{saving ? 'Deleting...' : 'Delete My Account'}</button></div></div></div>}
  </AppShell>
}
