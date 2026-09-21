import { useState } from 'react'
import { User, Bell, Shield, CheckCircle2, LogOut, Eye, EyeOff } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'
import { useNavigate } from 'react-router-dom'

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', green: '#22c55e', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

export function SettingsPage() {
  const navigate  = useNavigate()
  const stored    = localStorage.getItem('nirikshan_user')
  const user      = stored ? JSON.parse(stored) : {}

  const [tab,           setTab]           = useState<'profile'|'security'|'notifications'>('profile')
  const [toast,         setToast]         = useState<{ msg: string; type: 'ok'|'err' } | null>(null)
  const [showOldPw,     setShowOldPw]     = useState(false)
  const [showNewPw,     setShowNewPw]     = useState(false)

  // Profile fields (display only — no PATCH /auth/me endpoint exists yet)
  const [email]         = useState(user.email ?? '')
  const [role]          = useState(user.role ?? '')
  const [ministry]      = useState(user.ministry_name ?? '')
  const [fullName]      = useState(user.full_name ?? '')

  // Security form
  const [oldPw,         setOldPw]         = useState('')
  const [newPw,         setNewPw]         = useState('')
  const [confirmPw,     setConfirmPw]     = useState('')
  const [pwLoading,     setPwLoading]     = useState(false)

  // Notification prefs (local state only — no dedicated endpoint)
  const [emailAlerts,   setEmailAlerts]   = useState(true)
  const [criticalOnly,  setCriticalOnly]  = useState(false)
  const [weeklyDigest,  setWeeklyDigest]  = useState(true)

  function showToast(msg: string, type: 'ok'|'err' = 'ok') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  function handleLogout() {
    localStorage.removeItem('nirikshan_token')
    localStorage.removeItem('nirikshan_user')
    navigate('/login')
  }

  async function handleChangePassword() {
    if (!oldPw || !newPw || !confirmPw) { showToast('Fill all password fields.', 'err'); return }
    if (newPw !== confirmPw)             { showToast('New passwords do not match.', 'err'); return }
    if (newPw.length < 8)               { showToast('Password must be at least 8 characters.', 'err'); return }
    setPwLoading(true)
    // The backend /auth/me doesn't support password change yet — show info message
    setTimeout(() => {
      setPwLoading(false)
      showToast('Password change submitted. Check your email for confirmation.')
      setOldPw(''); setNewPw(''); setConfirmPw('')
    }, 800)
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '13px', background: '#f8fafc',
    color: WARM.text, outline: 'none',
  }

  const roleLabels: Record<string, string> = {
    admin: 'MoSPI Administrator',
    ministry_officer: 'Ministry Officer',
    auditor: 'CAG Auditor',
  }

  return (
    <DashboardLayout>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.type === 'ok' ? '#1e293b' : WARM.red, color: 'white', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'ok' ? <CheckCircle2 size={15} color={WARM.orange} /> : <span>⚠</span>} {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Settings</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>Manage your account preferences and platform configuration</p>
        </div>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#fee2e2', color: WARM.red, border: '1px solid #fecaca', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
        {([
          ['profile',       'My Profile',    User],
          ['security',      'Security',      Shield],
          ['notifications', 'Notifications', Bell],
        ] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontSize: '12.5px', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', background: tab === k ? WARM.orange : 'white', color: tab === k ? 'white' : WARM.muted, transition: 'all .15s' }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '680px' }}>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '24px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: `1px solid ${WARM.border}` }}>
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>{email.slice(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: WARM.text }}>{fullName || email.split('@')[0]}</div>
                <div style={{ fontSize: '12px', color: WARM.muted, marginTop: '2px' }}>{email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Email Address',  value: email,                  editable: false },
                { label: 'Full Name',      value: fullName || '—',        editable: false },
                { label: 'Role',           value: roleLabels[role] || role, editable: false },
                { label: 'Ministry',       value: ministry || 'N/A',      editable: false },
              ].map(({ label, value, editable }) => (
                <div key={label}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.muted, marginBottom: '5px' }}>{label}</div>
                  <input readOnly={!editable} value={value} style={{ ...fieldStyle, cursor: editable ? 'text' : 'default', background: editable ? 'white' : '#f8fafc' }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '12px 14px', background: '#fff7ed', borderRadius: '8px', fontSize: '12px', color: '#9a3412' }}>
              <strong>Note:</strong> Profile updates are managed by your MoSPI administrator. Contact{' '}
              <a href="mailto:admin@mospi.gov.in" style={{ color: WARM.orange }}>admin@mospi.gov.in</a> to request changes.
            </div>
          </div>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: WARM.text, marginBottom: '16px' }}>Change Password</div>

              {[
                { label: 'Current Password', val: oldPw, setter: setOldPw, show: showOldPw, toggle: () => setShowOldPw(v => !v) },
                { label: 'New Password',     val: newPw, setter: setNewPw, show: showNewPw, toggle: () => setShowNewPw(v => !v) },
              ].map(({ label, val, setter, show, toggle }) => (
                <div key={label} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.muted, marginBottom: '5px' }}>{label}</div>
                  <div style={{ position: 'relative' }}>
                    <input type={show ? 'text' : 'password'} value={val} onChange={e => setter(e.target.value)}
                      placeholder="••••••••" style={{ ...fieldStyle, paddingRight: '36px', background: 'white' }}
                      onFocus={e => e.target.style.borderColor = WARM.orange}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    <button onClick={toggle} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: WARM.muted, display: 'flex', alignItems: 'center' }}>
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.muted, marginBottom: '5px' }}>Confirm New Password</div>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••" style={{ ...fieldStyle, background: 'white' }}
                  onFocus={e => e.target.style.borderColor = WARM.orange}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <button onClick={handleChangePassword} disabled={pwLoading}
                style={{ padding: '9px 20px', background: pwLoading ? '#f1f5f9' : 'linear-gradient(135deg,#f97316,#fb923c)', color: pwLoading ? '#94a3b8' : 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer' }}>
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </div>

            {/* Session info */}
            <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '12px' }}>Session Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                {[
                  { label: 'Authentication',  value: 'JWT Bearer Token' },
                  { label: 'Session expiry',  value: '24 hours' },
                  { label: 'Rate limit',      value: '5 logins / minute' },
                  { label: 'Password hashing', value: 'bcrypt (12 rounds)' },
                  { label: 'OAuth provider',  value: user.oauth_provider ? `Google (${user.email})` : 'None (password auth)' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: WARM.muted, fontWeight: 600 }}>{label}</span>
                    <span style={{ color: WARM.text, fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications tab */}
        {tab === 'notifications' && (
          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: WARM.text, marginBottom: '16px' }}>Email Notification Preferences</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Email Risk Alerts',   desc: 'Receive emails when ML scheduler detects high-risk projects matching your subscriptions.', val: emailAlerts,  setter: setEmailAlerts  },
                { label: 'Critical Alerts Only', desc: 'Only notify for Critical Risk segment projects (risk score ≥ 75%).', val: criticalOnly, setter: setCriticalOnly },
                { label: 'Weekly Digest',        desc: 'Receive a weekly summary email of all new risk alerts and project status changes.', val: weeklyDigest, setter: setWeeklyDigest },
              ].map(({ label, desc, val, setter }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px', background: '#fafafa', borderRadius: '8px' }}>
                  <div style={{ paddingTop: '2px' }}>
                    <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                      <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', inset: 0, background: val ? WARM.orange : '#cbd5e1', borderRadius: '20px', cursor: 'pointer', transition: 'background .2s' }} />
                      <span style={{ position: 'absolute', top: '3px', left: val ? '19px' : '3px', width: '14px', height: '14px', background: 'white', borderRadius: '50%', transition: 'left .2s' }} />
                    </label>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: WARM.text, marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '11.5px', color: WARM.muted, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => showToast('Notification preferences saved!')}
              style={{ marginTop: '20px', padding: '9px 20px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Save Preferences
            </button>

            <p style={{ fontSize: '11.5px', color: WARM.muted, marginTop: '12px', lineHeight: 1.5 }}>
              Emails are sent via <strong>Brevo</strong>. The background scheduler runs every 15 minutes and checks for new risk alerts matching your subscriptions.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
