import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import type { Page } from '../App'
import { apiFetch, assetUrl, downloadPassportImage, downloadPassportPdf, getCurrentUser } from '../lib/api'
import './passport.css'

interface Props { navigate: (p: Page) => void }

type PassportData = {
  user_name: string
  passport_id: string
  country: string
  occupation: string
  issued_date: string
  assessment_date?: string
  expiry_date: string
  cyber_trust_score: number
  risk_level: string
  security_status: string
  status: string
  verification_url: string
  issuing_authority: string
  digital_signature: string
  integrity_hash: string
  photo_url?: string
  qr_svg: string
  top_recommendations: string[]
  security_badges: Array<{ label: string; status: string; score?: string }>
}

const fallback = (value: unknown, text = 'Not Provided') => {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return text
}

const normalizeUrl = (url: string) => url?.startsWith('http') ? url : `https://${url}`

function PassportPhoto({ passport }: { passport: PassportData }) {
  if (passport.photo_url) {
    return <img className="cp-photo" src={assetUrl(passport.photo_url)} alt="Profile" />
  }
  return (
    <div className="cp-photo cp-photoFallback" aria-hidden="true">
      <div className="cp-avatarHead" />
      <div className="cp-avatarBody" />
    </div>
  )
}

function Badge({ badge }: { badge: PassportData['security_badges'][number] }) {
  const status = badge.status?.toLowerCase() || 'fair'
  return (
    <div className={`cp-badge cp-badge-${status}`}>
      <span className="cp-badgeMark" />
      <span>{badge.label}</span>
    </div>
  )
}

function PassportDocument({ passport }: { passport: PassportData }) {
  const score = Math.max(0, Math.min(100, Number(passport.cyber_trust_score || 0)))
  const recommendations = passport.top_recommendations?.length
    ? passport.top_recommendations.slice(0, 5)
    : ['Complete a cybersecurity assessment']
  const badges = passport.security_badges?.length ? passport.security_badges.slice(0, 5) : []

  return (
    <section className="cp-document" aria-label="CyberPassport digital identity card">
      <article className="cp-panel cp-front">
        <div className="cp-header">
          <div className="cp-emblem">CP</div>
          <div>
            <div className="cp-brand">CyberPassport</div>
            <div className="cp-subtitle">Digital Identity Passport</div>
          </div>
          <div className="cp-globe">ID</div>
        </div>

        <div className="cp-frontBody">
          <PassportPhoto passport={passport} />
          <div className="cp-fields">
            <div>
              <span>Passport No.</span>
              <strong>{fallback(passport.passport_id)}</strong>
            </div>
            <div>
              <span>Name</span>
              <strong>{fallback(passport.user_name)}</strong>
            </div>
            <div>
              <span>Country</span>
              <strong>{fallback(passport.country)}</strong>
            </div>
            <div>
              <span>Occupation</span>
              <strong>{fallback(passport.occupation)}</strong>
            </div>
            <div>
              <span>Issued</span>
              <strong>{fallback(passport.issued_date || passport.assessment_date)}</strong>
            </div>
            <div>
              <span>Expires</span>
              <strong>{fallback(passport.expiry_date)}</strong>
            </div>
          </div>
        </div>

        <div className="cp-scoreBand">
          <div>
            <span>Cyber Trust Score</span>
            <strong>{score} / 100</strong>
          </div>
          <div>
            <span>Risk Level</span>
            <strong>{fallback(passport.risk_level, 'Unknown')}</strong>
          </div>
          <div>
            <span>Security Status</span>
            <strong>{fallback(passport.security_status)}</strong>
          </div>
        </div>

        <div className="cp-badges">
          {badges.map((badge) => <Badge key={badge.label} badge={badge} />)}
        </div>

        <div className="cp-footer">
          <span>Secure Identity</span>
          <span>Verified Security</span>
          <span>Authority Seal</span>
        </div>
      </article>

      <article className="cp-panel cp-back">
        <div className="cp-header cp-authorityHeader">
          <div>
            <div className="cp-brandSmall">CyberPassport Authority</div>
            <div className="cp-authorityText">This passport certifies the holder has completed a cybersecurity assessment and contains a scannable public verification URL.</div>
          </div>
          <div className="cp-seal">SHA</div>
        </div>

        <div className="cp-backBody">
          <div className="cp-recommendations">
            <h2>Top Recommendations</h2>
            {recommendations.map((item, index) => (
              <div className="cp-rec" key={`${item}-${index}`}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="cp-verification">
            <div className="cp-qr" dangerouslySetInnerHTML={{ __html: passport.qr_svg }} />
            <span>Scan to Verify</span>
            <dl>
              <dt>Passport No.</dt>
              <dd>{fallback(passport.passport_id)}</dd>
              <dt>Status</dt>
              <dd>{fallback(passport.status, 'Active')}</dd>
              <dt>Verification URL</dt>
              <dd className="cp-url">{normalizeUrl(passport.verification_url)}</dd>
              <dt>Integrity</dt>
              <dd>{fallback(passport.digital_signature)}</dd>
            </dl>
          </div>
        </div>

        <div className="cp-footer cp-footerGold">
          <span>Verified</span>
          <span>Authority Sealed</span>
          <span>Tamper-Evident</span>
        </div>
      </article>
    </section>
  )
}

export default function Passport({ navigate }: Props) {
  const [passport, setPassport] = useState<PassportData | null>(null)
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const user = useMemo(() => getCurrentUser(), [])

  useEffect(() => {
    if (!user) {
      navigate('login')
      return
    }
    apiFetch<PassportData>('/api/passport/me')
      .then(setPassport)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load passport'))
  }, [navigate, user])

  const runAction = async (label: string, action: () => Promise<void> | void) => {
    setActionStatus(label)
    try {
      await action()
    } catch (err) {
      setActionStatus(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const sharePassport = async () => {
    if (!passport) return
    const url = normalizeUrl(passport.verification_url)
    if (navigator.share) {
      await navigator.share({ title: 'CyberPassport', text: `Verify CyberPassport ${passport.passport_id}`, url })
      setActionStatus('Verification link shared')
      return
    }
    await navigator.clipboard.writeText(url)
    setActionStatus('Verification link copied')
  }

  return (
    <AppShell navigate={navigate} current="passport">
      <main className="cp-page">
        <div className="cp-pageHeader">
          <div>
            <div className="cp-kicker">CyberPassport</div>
            <h1>Digital Identity Passport</h1>
          </div>
          {passport && <div className="cp-statusPill">{passport.security_status}</div>}
        </div>

        {error ? (
          <div className="cp-message cp-error">{error}</div>
        ) : !passport ? (
          <div className="cp-message">Loading passport details...</div>
        ) : (
          <>
            <PassportDocument passport={passport} />

            <div className="cp-actions">
              <button onClick={() => runAction('Downloading PDF...', () => downloadPassportPdf())}>Download PDF</button>
              <button onClick={() => runAction('Downloading image...', () => downloadPassportImage())}>Download Image</button>
              <button onClick={() => runAction('Sharing passport...', sharePassport)}>Share</button>
              <button onClick={() => window.print()}>Print</button>
            </div>

            {actionStatus && <div className="cp-actionStatus">{actionStatus}</div>}
          </>
        )}
      </main>
    </AppShell>
  )
}
