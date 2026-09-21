import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Eye, EyeOff } from 'lucide-react'
import { getGoogleAuthUrl, login, storeSession } from '../api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)
  const [pending,  setPending]  = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null); setPending(true)
    try {
      const auth = await login(email, password)
      storeSession(auth)
      setSuccess(`Signed in as ${auth.user.email}. Redirecting…`)
      setTimeout(() => navigate('/dashboard'), 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally { setPending(false) }
  }

  async function onGoogle() {
    setError(null)
    try {
      const { authorization_url } = await getGoogleAuthUrl()
      window.location.assign(authorization_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google OAuth not configured')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* ── Left branding panel ── */}
      <div style={{
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        padding: '48px 52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(249,115,22,.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(20,184,166,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '40px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.3px' }}>Nirikshan</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>निरीक्षण · MoSPI</div>
            </div>
          </Link>

          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            India's Infrastructure<br />Early Warning System
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.65, marginBottom: '32px', maxWidth: '340px' }}>
            Monitoring <strong style={{ color: '#fb923c' }}>1,600+ central sector projects</strong> worth{' '}
            <strong style={{ color: '#fb923c' }}>₹22 lakh crore</strong>. Automated ML alerts every{' '}
            <strong style={{ color: '#fb923c' }}>15 minutes</strong>.
          </p>

          {/* Security badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '36px' }}>
            {['🔒 JWT Authentication', '🔑 bcrypt Hashing', '⚡ Rate Limited (5/min)', '🛡️ Role-Based Access'].map(b => (
              <span key={b} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '20px', color: '#cbd5e1' }}>
                {b}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Projects Monitored', value: '1,600+' },
              { label: 'Alert Cadence',       value: '15 min' },
              { label: 'Ministries',          value: '17' },
              { label: 'Prediction Accuracy', value: '85%+' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fb923c' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          <img src="/emblem-of-india.svg" alt="GoI" style={{ width: '22px', opacity: .5 }} onError={e => { e.currentTarget.style.display = 'none' }} />
          Ministry of Statistics &amp; Programme Implementation · Govt. of India
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 52px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', marginBottom: '6px', letterSpacing: '-0.5px' }}>Officer Sign In</h1>
            <p style={{ fontSize: '13.5px', color: '#64748b' }}>Access your IPMD command centre dashboard</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Email Address</span>
              <input
                type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="officer@ministry.gov.in"
                style={{ padding: '11px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: 'white', color: '#1e293b', outline: 'none', transition: 'border .15s' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Password</span>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 40px 11px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: 'white', color: '#1e293b', outline: 'none', transition: 'border .15s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', fontWeight: 600 }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={pending} style={{
              padding: '12px', fontSize: '14.5px', fontWeight: 800, color: 'white',
              background: pending ? '#94a3b8' : 'linear-gradient(135deg,#f97316,#fb923c)',
              border: 'none', borderRadius: '9px', cursor: pending ? 'not-allowed' : 'pointer',
              boxShadow: pending ? 'none' : '0 4px 14px rgba(249,115,22,.35)', transition: 'all .15s',
            }}
              onMouseEnter={e => { if (!pending) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { if (!pending) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {pending ? 'Authenticating…' : 'Sign In Securely →'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <button type="button" onClick={onGoogle} style={{
              padding: '11px', fontSize: '13.5px', fontWeight: 600, color: '#374151',
              background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '9px', cursor: 'pointer', transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.background = '#fffbf5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white' }}
            >
              Continue with Google OAuth
            </button>

            <button type="button" onClick={() => navigate('/dashboard')} style={{
              padding: '11px', fontSize: '13.5px', fontWeight: 600, color: '#f97316',
              background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '9px', cursor: 'pointer', transition: 'all .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
            >
              Skip Login → Enter Demo Dashboard
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            New to IPMD access?{' '}
            <Link to="/signup" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </p>

          <div style={{ marginTop: '20px', padding: '12px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
            🔒 JWT sessions · bcrypt passwords · 5 login attempts/min rate limit · Google OAuth 2.0
          </div>
        </div>
      </div>
    </div>
  )
}
