import type { Page } from '../App'

interface Props { navigate: (p: Page) => void }

const features = [
  { icon: '◈', title: 'Cyber Trust Score', desc: 'A verified 0–100 score reflecting your digital security posture.' },
  { icon: '⬡', title: 'Digital Passport', desc: 'An official credential verifying your cyber identity and reputation.' },
  { icon: '◆', title: 'AI Recommendations', desc: 'Personalised weekly action plans to improve your security.' },
  { icon: '◷', title: 'Weekly Reports', desc: 'Track improvement and risk trends over time.' },
]

export default function Landing({ navigate }: Props) {
  return (
    <div style={{ background: 'var(--bg)', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(245,244,238,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--emerald)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 13, color: '#fff' }}>CP</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>CyberPassport</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => navigate('login')} style={{ background: 'none', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '7px 18px' }}>
              Sign In
            </button>
            <button onClick={() => navigate('register')} style={{ background: 'var(--emerald)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 20px', boxShadow: '0 2px 8px rgba(11,77,67,0.2)' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        paddingTop: 140, paddingBottom: 100,
        background: 'linear-gradient(160deg, #F5F4EE 0%, #EAF4F2 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gold-light)', border: '1px solid rgba(198,161,91,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.06em' }}>CYBERPASSPORT AUTHORITY</span>
            </div>
            <h1 style={{
              fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 4vw, 54px)',
              fontWeight: 700, lineHeight: 1.12, color: 'var(--text)', margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}>
              Protect Your<br />
              <span style={{ color: 'var(--emerald)' }}>Digital Identity</span><br />
              Before Threats<br />Find You
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 440 }}>
              The AI-powered Digital Identity Reputation Passport. Know your Cyber Trust Score, verify your digital credentials, and improve your security reputation.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => navigate('register')} style={{
                background: 'var(--emerald)', border: 'none', borderRadius: 10,
                color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                padding: '14px 32px', boxShadow: '0 4px 20px rgba(11,77,67,0.25)',
              }}>Issue My Passport</button>
              <button onClick={() => navigate('login')} style={{
                background: '#fff', border: '1px solid var(--border-2)', borderRadius: 10,
                color: 'var(--text)', cursor: 'pointer', fontSize: 15, fontWeight: 500,
                padding: '14px 28px',
              }}>Sign In</button>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 44, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
              {[{ v: '127K+', l: 'Passports Issued' }, { v: '100', l: 'Max Trust Score' }, { v: '99.7%', l: 'Accuracy' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--emerald)' }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Passport preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 320, background: '#fff',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
              border: '1px solid var(--border)',
            }}>
              {/* Passport header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--emerald) 0%, #136F63 100%)',
                padding: '24px 24px 20px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', fontWeight: 500, marginBottom: 16 }}>CYBERPASSPORT AUTHORITY</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <div style={{ width: 52, height: 52, background: 'rgba(198,161,91,0.2)', border: '2px solid rgba(198,161,91,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⬡</div>
                </div>
                <div style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>DIGITAL IDENTITY PASSPORT</div>
              </div>
              {/* Body */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--emerald)', fontWeight: 700, flexShrink: 0 }}>A</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Playfair Display, serif' }}>Alexandra Chen</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>CP-2024-00891</div>
                  </div>
                </div>
                <div style={{ background: 'var(--emerald-light)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--emerald-mid)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>CYBER TRUST SCORE</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: 'var(--emerald)' }}>84</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-2)' }}>out of 100</div>
                      <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 2 }}>● LOW RISK</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'rgba(11,77,67,0.12)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, var(--emerald), var(--gold))', borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['PWD', 'MFA', 'DEV', 'NET'].map((d) => (
                    <div key={d} style={{ flex: 1, background: 'var(--success-bg)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 6, padding: '5px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'var(--success)', fontWeight: 600 }}>✓</div>
                      <div style={{ fontSize: 8, color: 'var(--text-2)', marginTop: 1 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 28px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 12 }}>CAPABILITIES</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Everything Your Digital Identity Needs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '28px 24px',
              }}>
                <div style={{ width: 44, height: 44, background: 'var(--emerald-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--emerald)', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 28px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 12 }}>PROCESS</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 22, left: '12%', right: '12%', height: 1, background: 'linear-gradient(90deg, var(--emerald), var(--gold), var(--emerald))', opacity: 0.3, zIndex: 0 }} />
            {[
              { n: '01', title: 'Register', desc: 'Create your account and set up your identity profile.' },
              { n: '02', title: 'Assess', desc: 'Complete the comprehensive cyber hygiene assessment.' },
              { n: '03', title: 'Score', desc: 'Receive your Cyber Trust Score and risk profile.' },
              { n: '04', title: 'Passport', desc: 'Your official CyberPassport is issued and verified.' },
            ].map((s, i) => (
              <div key={s.n} style={{ textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? 'var(--emerald)' : '#fff', border: `2px solid ${i === 0 ? 'var(--emerald)' : 'var(--border-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 13, fontWeight: 700, color: i === 0 ? '#fff' : 'var(--text-2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{s.n}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 28px', background: 'var(--emerald)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>Your Digital Identity Deserves Official Protection</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.7 }}>Join over 127,000 individuals who have secured their cyber reputation.</p>
          <button onClick={() => navigate('register')} style={{
            background: 'var(--gold)', border: 'none', borderRadius: 10,
            color: 'var(--text)', cursor: 'pointer', fontSize: 15, fontWeight: 700,
            padding: '16px 40px', boxShadow: '0 4px 20px rgba(198,161,91,0.35)',
          }}>Issue My Passport Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '36px 28px', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'var(--emerald)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>CP</div>
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>© 2024 CyberPassport Authority</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['ISO 27001', 'SOC 2', 'GDPR', 'FIDO2'].map((b) => (
              <span key={b} style={{ fontSize: 10, color: 'var(--text-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 4 }}>{b}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
