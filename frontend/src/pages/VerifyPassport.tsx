import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import './passport.css'

type Verification = {
  valid: boolean
  status: string
  reason?: string
  passport_id?: string
  holder_name?: string
  issued_date?: string
  expiry_date?: string
  cyber_trust_score?: number
  risk_level?: string
  issuing_authority?: string
  verification_time: string
  tamper_status?: string
  expired?: boolean
  active?: boolean
}

export default function VerifyPassport() {
  const passportId = useMemo(() => decodeURIComponent(window.location.pathname.split('/verify/')[1] || ''), [])
  const [data, setData] = useState<Verification | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!passportId) {
      setError('Missing passport ID')
      return
    }
    apiFetch<Verification>(`/api/passport/verify/${passportId}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not verify passport'))
  }, [passportId])

  const rows = data ? [
    ['Passport No.', data.passport_id || passportId],
    ['Holder Name', data.holder_name || 'Not Provided'],
    ['Issued Date', data.issued_date || 'Not Provided'],
    ['Expiry Date', data.expiry_date || 'Not Provided'],
    ['Cyber Trust Score', typeof data.cyber_trust_score === 'number' ? `${data.cyber_trust_score} / 100` : 'Not Provided'],
    ['Risk Level', data.risk_level || 'Unknown'],
    ['Issuing Authority', data.issuing_authority || 'CyberPassport Authority'],
    ['Tamper Status', data.tamper_status || 'Unknown'],
    ['Verification Time', data.verification_time],
  ] : []

  return (
    <main className="cp-verifyPage">
      <section className="cp-verifyCard">
        <div className="cp-verifyHeader">
          <div>
            <div className="cp-kicker">CyberPassport Authority</div>
            <h1>Verify CyberPassport</h1>
          </div>
          {data && <div className={`cp-verifyMark ${data.valid ? 'is-valid' : 'is-invalid'}`}>{data.valid ? 'Valid' : 'Invalid'}</div>}
        </div>

        {error ? (
          <div className="cp-message cp-error">{error}</div>
        ) : !data ? (
          <div className="cp-message">Checking passport authenticity...</div>
        ) : (
          <>
            <div className={`cp-result ${data.valid ? 'is-valid' : 'is-invalid'}`}>
              <strong>{data.status}</strong>
              <span>{data.reason || (data.valid ? 'This CyberPassport is active, unexpired, and hash verified.' : 'This CyberPassport could not be validated.')}</span>
            </div>

            <dl className="cp-verifyRows">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
    </main>
  )
}
