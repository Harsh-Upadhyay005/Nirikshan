import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { signup, storeSession } from '../api'
import type { UserRole } from '../types'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('ministry_officer')
  const [ministry, setMinistry] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setPending(true)
    try {
      const auth = await signup({
        email,
        password,
        role,
        ministry_name: role === 'ministry_officer' ? ministry : undefined,
      })
      storeSession(auth)
      setSuccess(`Welcome ${auth.user.email}. Redirecting to dashboard...`)
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setPending(false)
    }
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
        left: '-20%',
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
        maxWidth: '480px',
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

        {/* Signup Card */}
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
              New Registration
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 900, 
              color: 'var(--text-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Create Account
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              Request platform access with role-based authentication. Ministry officers must specify their ministry.
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
                Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min. 8 characters)</span>
              </span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
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

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--text-primary)'
              }}>
                Role
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid rgba(77, 58, 173, 0.2)',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(77, 58, 173, 0.2)'}
              >
                <option value="ministry_officer">Ministry Officer</option>
                <option value="auditor">CAG Auditor</option>
                <option value="admin">MoSPI Administrator</option>
              </select>
            </label>

            {role === 'ministry_officer' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)'
                }}>
                  Ministry Name <span style={{ color: 'var(--danger)' }}>*</span>
                </span>
                <input
                  required
                  placeholder="e.g. Ministry of Railways"
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
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
            )}

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
              {pending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center', 
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            Already provisioned?{' '}
            <Link to="/login" style={{ 
              color: 'var(--primary)', 
              fontWeight: 700,
              textDecoration: 'none'
            }}>
              Sign in
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
          🔒 Passwords are bcrypt-hashed. Rate limited to 3 signups/minute. Welcome emails sent via Brevo.
        </div>
      </div>
    </div>
  )
}
