import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { signup, storeSession } from '../api'
import type { UserRole } from '../types'

export function SignupPage() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<UserRole>('ministry_officer')
  const [ministry, setMinistry] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)
  const [pending,  setPending]  = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null); setPending(true)
    try {
      const auth = await signup({ email, password, role, ministry_name: role === 'ministry_officer' ? ministry : undefined })
      storeSession(auth)
      setSuccess(`Welcome ${auth.user.email}. Redirecting…`)
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally { setPending(false) }
  }

  const ROLE_INFO: Record<UserRole, { label: string; desc: string }> = {
    admin:             { label: 'MoSPI Administrator',       desc: 'Full access across all ministries and projects' },
    ministry_officer:  { label: 'Ministry Officer',          desc: 'Scoped to your ministry\'s projects only' },
    auditor:           { label: 'CAG Auditor',               desc: 'Read-only access for audit and compliance' },
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* ── Left panel ── */}
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

          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: '12px' }}>
            Join the Infrastructure<br />Intelligence Platform
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.65, marginBottom: '32px', maxWidth: '340px' }}>
            Get role-based access to predictive risk dashboards, automated alerts, and real-time project monitoring across India.
          </p>

          {/* Role explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#64748b', marginBottom: '2px' }}>
              Available Roles
            </div>
            {Object.entries(ROLE_INFO).map(([k, v]) => (
              <div key={k} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '9px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{v.label}</div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          <img src="/emblem-of-india.svg" alt="GoI" style={{ width: '22px', opacity: .5 }} onError={e => { e.currentTarget.style.display = 'none' }} />
          Ministry of Statistics &amp; Programme Implementation · Govt. of India
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div style={{
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 52px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', marginBottom: '6px', letterSpacing: '-0.5px' }}>Create Account</h1>
            <p style={{ fontSize: '13.5px', color: '#64748b' }}>Request role-based access to the IPMD platform</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Email Address</span>
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="officer@ministry.gov.in"
                style={{ padding: '11px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: 'white', color: '#1e293b', outline: 'none', transition: 'border .15s' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Password <span style={{ color: '#94a3b8', fontWeight: 400 }}>(min. 8 characters)</span></span>
              <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ padding: '11px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: 'white', color: '#1e293b', outline: 'none', transition: 'border .15s' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Role</span>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)}
                style={{ padding: '11px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: 'white', color: '#1e293b', outline: 'none', cursor: 'pointer', transition: 'border .15s' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                <option value="ministry_officer">Ministry Officer</option>
                <option value="auditor">CAG Auditor</option>
                <option value="admin">MoSPI Administrator</option>
              </select>
            </label>

            {role === 'ministry_officer' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>Ministry Name <span style={{ color: '#ef4444' }}>*</span></span>
                <input required placeholder="e.g. Ministry of Railways" value={ministry} onChange={e => setMinistry(e.target.value)}
                  style={{ padding: '11px 14px', fontSize: '14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: 'white', color: '#1e293b', outline: 'none', transition: 'border .15s' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Your dashboard will be scoped to this ministry's projects only</span>
              </label>
            )}

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
              boxShadow: pending ? 'none' : '0 4px 14px rgba(249,115,22,.35)',
              transition: 'all .15s',
            }}>
              {pending ? 'Creating Account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Already provisioned?{' '}
            <Link to="/login" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>

          <div style={{ marginTop: '20px', padding: '12px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
            🔒 Passwords bcrypt-hashed · Rate limited 3/min · Welcome email via Brevo
          </div>
        </div>
      </div>
    </div>
  )
}
