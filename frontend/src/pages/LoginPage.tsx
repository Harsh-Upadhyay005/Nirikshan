import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { getGoogleAuthUrl, login, storeSession } from '../api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showQuickLogin, setShowQuickLogin] = useState(false)

  // Quick login credentials for demo
  const quickLogins = [
    { role: 'Ministry Admin', email: 'admin@mospi.gov.in', password: 'admin@123' },
    { role: 'Railway Officer', email: 'railway@ministry.gov.in', password: 'railway@123' },
    { role: 'CAG Auditor', email: 'auditor@cag.gov.in', password: 'auditor@123' }
  ]

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setPending(true)
    try {
      const auth = await login(email, password)
      storeSession(auth)
      setSuccess(`Signed in as ${auth.user.email}. Redirecting to Command Centre...`)
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  async function onGoogle() {
    setError(null)
    try {
      const { authorization_url } = await getGoogleAuthUrl()
      window.location.assign(authorization_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google OAuth is not configured')
    }
  }

  function quickLogin(email: string, password: string) {
    setEmail(email)
    setPassword(password)
    setShowQuickLogin(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background gradient */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '60%',
        height: '100%',
        background: 'var(--gradient-hero)',
        opacity: 0.1,
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        width: '100%', 
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '2rem',
          textDecoration: 'none',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--gradient-button)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 900, 
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              निरीक्षण NIRIKSHAN
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              MoSPI Command Centre
            </div>
          </div>
        </Link>

        {/* Login Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(77, 58, 173, 0.1)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>
              Secure Access Portal
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 900, 
              color: 'var(--text-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Officer Sign In
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              Access IPMD infrastructure monitoring dashboard with role-based authentication.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)'
              }}>
                Email Address
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@ministry.gov.in"
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid rgba(77, 58, 173, 0.2)',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(77, 58, 173, 0.2)'}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)'
              }}>
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid rgba(77, 58, 173, 0.2)',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(77, 58, 173, 0.2)'}
              />
            </label>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                color: 'var(--danger)',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(0, 200, 83, 0.1)',
                border: '1px solid rgba(0, 200, 83, 0.3)',
                borderRadius: '8px',
                color: 'var(--success)',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              style={{
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                color: 'white',
                background: pending ? 'var(--text-muted)' : 'var(--gradient-button)',
                border: 'none',
                borderRadius: '8px',
                cursor: pending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: pending ? 'none' : 'var(--shadow-md)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (!pending) e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                if (!pending) e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {pending ? 'Authenticating...' : 'Sign In Securely'}
            </button>

            <div style={{ position: 'relative', textAlign: 'center', margin: '8px 0' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(77, 58, 173, 0.2)'
              }} />
              <span style={{
                position: 'relative',
                background: 'var(--bg-card)',
                padding: '0 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={onGoogle}
              style={{
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'var(--bg-secondary)',
                border: '2px solid rgba(77, 58, 173, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.background = 'var(--bg-card-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(77, 58, 173, 0.2)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
            >
              Continue with Google OAuth
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'var(--bg-secondary)',
                border: '2px solid rgba(77, 58, 173, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.background = 'var(--bg-card-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(77, 58, 173, 0.2)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
            >
              Enter Demo Dashboard →
            </button>
          </form>

          {/* Quick Login Section */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(77, 58, 173, 0.1)' }}>
            <button
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {showQuickLogin ? '− Hide' : '+ Show'} Test Credentials (Demo)
            </button>

            {showQuickLogin && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {quickLogins.map((cred, idx) => (
                  <button
                    key={idx}
                    onClick={() => quickLogin(cred.email, cred.password)}
                    style={{
                      padding: '12px',
                      fontSize: '12px',
                      textAlign: 'left',
                      background: 'var(--bg-secondary)',
                      border: '1px solid rgba(77, 58, 173, 0.15)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-card-hover)'
                      e.currentTarget.style.borderColor = 'var(--primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                      e.currentTarget.style.borderColor = 'rgba(77, 58, 173, 0.15)'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {cred.role}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {cred.email} / {cred.password}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center', 
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            New to IPMD access?{' '}
            <Link to="/signup" style={{ 
              color: 'var(--primary)', 
              fontWeight: 700,
              textDecoration: 'none'
            }}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div style={{
          marginTop: '1.5rem',
          padding: '12px',
          background: 'rgba(77, 58, 173, 0.05)',
          borderRadius: '8px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          🔒 Secured with JWT authentication, bcrypt password hashing, and rate limiting (5 attempts/min)
        </div>
      </div>
    </div>
  )
}
