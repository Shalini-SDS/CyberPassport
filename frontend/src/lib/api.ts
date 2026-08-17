const normalizeApiUrl = (value: string) => {
  const raw = value.trim().replace(/\/$/, '')
  if (!raw) return 'http://localhost:8000'

  try {
    const url = new URL(raw)
    if (['0.0.0.0', '::', '[::]'].includes(url.hostname)) {
      url.hostname = 'localhost'
    }
    return url.origin
  } catch {
    return 'http://localhost:8000'
  }
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:8000')
const REQUEST_TIMEOUT_MS = 12000

export type CurrentUser = {
  id: string
  name: string
  email: string
  profile?: Record<string, unknown>
}

export function getToken() {
  return localStorage.getItem('cp_token')
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem('cp_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(token: string, user: CurrentUser) {
  localStorage.setItem('cp_token', token)
  localStorage.setItem('cp_user', JSON.stringify(user))
}

export function updateCurrentUser(user: Partial<CurrentUser>) {
  const current = getCurrentUser()
  if (!current) return
  setSession(getToken() || '', { ...current, ...user })
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const current = getCurrentUser()
  if (!current) throw new Error('No current user')
  return apiFetch<CurrentUser>(`/api/users/${current.id}`)
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Backend did not respond at ${API_URL}. Make sure FastAPI is running and open it as http://127.0.0.1:8000, not http://0.0.0.0:8000.`)
    }
    throw new Error(`Cannot reach backend at ${API_URL}. Start FastAPI on port 8000, then try again.`)
  } finally {
    window.clearTimeout(timeout)
  }

  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = await res.json()
      message = data.detail || message
    } catch {
      message = await res.text()
    }
    throw new Error(message)
  }
  return res.json()
}

export async function downloadPassportPdf(userId: string) {
  await downloadPassportAsset(userId, 'download', 'pdf')
}

export async function downloadPassportImage(userId: string) {
  await downloadPassportAsset(userId, 'image', 'png')
}

async function downloadPassportAsset(identifier: string, endpoint: 'download' | 'image', extension: 'pdf' | 'png') {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${API_URL}/api/passport/${identifier}/${endpoint}`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Backend did not respond at ${API_URL}.`)
    }
    throw new Error(`Cannot reach backend at ${API_URL}.`)
  } finally {
    window.clearTimeout(timeout)
  }

  if (!res.ok) throw new Error(`Could not download passport ${extension.toUpperCase()}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `CyberPassport-${identifier}.${extension}`
  a.click()
  URL.revokeObjectURL(url)
}

export function assessmentAnswersToFeatures(answers: Record<string, number[]>) {
  const pick = (domain: string, idx: number) => answers[domain]?.[idx] ?? 0
  return {
    occupation_category: 'IT Professional',
    password_management: ['Password Manager', 'Browser Storage', 'Written Notes', 'Remember All'][pick('passwords', 0)],
    password_length: ['16+', '12-15', '8-11', 'Under 8'][pick('passwords', 1)],
    password_change_frequency: ['Every 3 Months', 'Every 6 Months', 'Only When Forced', 'Rarely/Never'][pick('passwords', 2)],
    mfa_type: ['Hardware Key', 'Authenticator App', 'SMS Only', 'No MFA'][pick('mfa', 0)],
    mfa_coverage: ['All', 'Most', 'Some', 'Few/None'][pick('mfa', 1)],
    device_encryption: ['Verified', 'Believe So', 'Unsure', 'No'][pick('device', 0)],
    os_update_status: ['Auto Updates', 'Within 30 Days', 'Within 6 Months', 'Rarely Updated'][pick('device', 1)],
    antivirus_status: ['Enterprise', 'Basic OS Protection', 'Consumer', 'Basic OS Protection'][pick('device', 2)],
    vpn_usage: ['Always', 'Sometimes', 'Rarely', 'Never'][pick('network', 0)],
    public_wifi_usage: ['Never', 'Protected Only', 'Occasionally Unprotected', 'Frequently Unprotected'][pick('network', 1)],
    auto_connect_disabled: 'Always',
    phishing_detection: ['Always', 'Usually', 'Sometimes Unsure', 'Often Unsure'][pick('awareness', 0)],
    security_training: ['Within 12 Months', '1-3 Years Ago', '1-3 Years Ago', 'Never'][pick('awareness', 1)],
    https_awareness: ['Always', 'Usually', 'Sometimes', 'Never'][pick('awareness', 2)],
    backup_frequency: ['Automatic', 'Automatic', 'Occasionally', 'Never'][pick('backup', 0)],
    breach_exposure: ['Never', 'Once', '2-5 Times', 'More Than 5 Times'][pick('backup', 1)],
    login_monitoring: ['Monthly', 'Few Months', 'Rarely', 'Never'][pick('backup', 1)],
    browser_password_storage: pick('passwords', 0) === 0 ? 'Password Manager' : 'Browser Storage',
    software_source: 'Official Store',
    account_alerts_enabled: pick('backup', 1) <= 1 ? 'Yes' : 'No',
    cloud_backup_enabled: pick('backup', 0) <= 1 ? 'Yes' : 'No',
    social_media_privacy: 'Moderate',
    shared_device_usage: 'Never',
    email_security_level: pick('mfa', 0) <= 1 ? 'Advanced' : 'Basic',
    past_phishing_clicks: pick('awareness', 0) <= 1 ? '0' : pick('awareness', 0) === 2 ? '1' : '2-5',
  }
}
