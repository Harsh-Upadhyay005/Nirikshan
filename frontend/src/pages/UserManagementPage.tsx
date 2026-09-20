import { useState, useEffect } from 'react'
import { Bell, Trash2, Plus, RefreshCw, User, CheckCircle2, BellOff } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', green: '#22c55e', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

interface Subscription {
  id: number
  ministry_filter: string | null
  state_filter: string | null
  min_risk_score: string | null
}

interface Notification {
  id: number
  project_code: number
  message: string
  sent_at: string
  read_at: string | null
}

export function UserManagementPage() {
  const [subs,          setSubs]          = useState<Subscription[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [ministries,    setMinistries]    = useState<{id:number;name:string}[]>([])
  const [states,        setStates]        = useState<{id:number;name:string}[]>([])
  const [loading,       setLoading]       = useState(true)
  const [tab,           setTab]           = useState<'subscriptions'|'notifications'>('subscriptions')
  const [newMin,        setNewMin]        = useState('')
  const [newState,      setNewState]      = useState('')
  const [newScore,      setNewScore]      = useState('0.6')
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState<string|null>(null)

  const stored = localStorage.getItem('nirikshan_user')
  const user   = stored ? JSON.parse(stored) : null
  const token  = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(null), 3000) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/subscriptions',           { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/notifications?limit=50',  { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/ministries',              { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/states',                  { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([s,n,m,st]) => { setSubs(s); setNotifications(n); setMinistries(m); setStates(st) })
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function addSubscription() {
    if (!newMin && !newState) { showToast('Select at least a ministry or state filter.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/v1/subscriptions', {
        method: 'POST', headers,
        body: JSON.stringify({ ministry_filter: newMin || null, state_filter: newState || null, min_risk_score: parseFloat(newScore) })
      })
      if (res.ok) { setNewMin(''); setNewState(''); setNewScore('0.6'); load(); showToast('Subscription added!') }
      else showToast('Failed to add subscription.')
    } finally { setSaving(false) }
  }

  async function deleteSubscription(id: number) {
    await fetch(`/api/v1/subscriptions/${id}`, { method: 'DELETE', headers })
    setSubs(prev => prev.filter(s => s.id !== id))
    showToast('Subscription removed.')
  }

  async function markAllRead() {
    await fetch('/api/v1/notifications/mark-all-read', { method: 'POST', headers })
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    showToast('All notifications marked as read.')
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#1e293b', color: 'white', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={15} color={WARM.orange} /> {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>User Management</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>Manage alert subscriptions and view notification history</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* User profile card */}
      {user && (
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '16px' }}>{user.email?.slice(0,2).toUpperCase()}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: WARM.text }}>{user.email}</div>
            <div style={{ fontSize: '12px', color: WARM.muted, marginTop: '2px' }}>
              Role: <strong style={{ color: WARM.orange }}>{user.role}</strong>
              {user.ministry_name && <span> · Ministry: <strong>{user.ministry_name}</strong></span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: '#fff7ed', borderRadius: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: WARM.orange }}>{subs.length}</div>
              <div style={{ fontSize: '10.5px', color: WARM.muted }}>Subscriptions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: unreadCount > 0 ? '#fee2e2' : '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: unreadCount > 0 ? WARM.red : WARM.green }}>{unreadCount}</div>
              <div style={{ fontSize: '10.5px', color: WARM.muted }}>Unread</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {([['subscriptions','Alert Subscriptions'],['notifications','Notifications']] as const).map(([k,label]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '7px 16px', fontSize: '12.5px', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', background: tab===k ? WARM.orange : 'white', color: tab===k ? 'white' : WARM.muted, transition: 'all .15s' }}>
            {label}
            {k === 'notifications' && unreadCount > 0 && (
              <span style={{ marginLeft: '6px', padding: '1px 6px', background: WARM.red, color: 'white', borderRadius: '10px', fontSize: '10px' }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Subscriptions tab */}
      {tab === 'subscriptions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '12px' }}>
          {/* Existing subscriptions */}
          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${WARM.border}`, fontSize: '13px', fontWeight: 700, color: WARM.text }}>
              Active Subscriptions ({subs.length})
            </div>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
            ) : subs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <BellOff size={32} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: WARM.muted }}>No subscriptions yet</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Add a subscription to receive risk alerts by email</div>
              </div>
            ) : (
              <div>
                {subs.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: i>0 ? `1px solid #f1f5f9` : 'none', background: i%2===0 ? 'white' : '#fafafa' }}>
                    <div style={{ padding: '6px', background: '#fff7ed', borderRadius: '6px' }}>
                      <Bell size={14} color={WARM.orange} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: WARM.text }}>
                        {s.ministry_filter ? `Ministry: ${s.ministry_filter}` : s.state_filter ? `State: ${s.state_filter}` : 'All Projects'}
                      </div>
                      <div style={{ fontSize: '11px', color: WARM.muted, marginTop: '2px' }}>
                        Min. risk score: <strong style={{ color: WARM.orange }}>{s.min_risk_score ? `${Math.round(+s.min_risk_score * 100)}%` : 'Any'}</strong>
                        {s.state_filter && <span> · State: {s.state_filter}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteSubscription(s.id)}
                      style={{ padding: '5px', background: '#fee2e2', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={13} color={WARM.red} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add subscription */}
          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px', alignSelf: 'start' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} color={WARM.orange} /> Add Subscription
            </div>

            {[
              { label: 'Ministry Filter', val: newMin, setter: setNewMin, options: ministries.map(m=>m.name), placeholder: 'All ministries' },
              { label: 'State Filter',    val: newState, setter: setNewState, options: states.map(s=>s.name), placeholder: 'All states' },
            ].map(({ label, val, setter, options, placeholder }) => (
              <label key={label} style={{ display: 'block', marginBottom: '12px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.muted, marginBottom: '5px' }}>{label}</div>
                <select value={val} onChange={e => setter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', background: 'white', color: val ? WARM.text : '#94a3b8', outline: 'none', cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor=WARM.orange}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}>
                  <option value="">{placeholder}</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            ))}

            <label style={{ display: 'block', marginBottom: '14px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.muted, marginBottom: '5px' }}>
                Min. Risk Score Threshold: <strong style={{ color: WARM.orange }}>{Math.round(+newScore*100)}%</strong>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={newScore} onChange={e => setNewScore(e.target.value)}
                style={{ width: '100%', accentColor: WARM.orange }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                <span>0% (All)</span><span>50%</span><span>100% (Critical)</span>
              </div>
            </label>

            <button onClick={addSubscription} disabled={saving || loading}
              style={{ width: '100%', padding: '9px', background: saving ? '#f1f5f9' : 'linear-gradient(135deg,#f97316,#fb923c)', color: saving ? '#94a3b8' : 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Plus size={14} /> {saving ? 'Saving…' : 'Add Subscription'}
            </button>

            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', lineHeight: 1.5 }}>
              You will receive email alerts via Brevo when the ML scheduler detects new risks matching your subscription.
            </p>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${WARM.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: WARM.text }}>Notifications ({notifications.length})</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: '#f0fdf4', color: WARM.green, border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                <CheckCircle2 size={12} /> Mark All Read
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Bell size={32} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: WARM.muted }}>No notifications yet</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Alerts will appear here when the ML scheduler detects risks</div>
            </div>
          ) : notifications.map((n, i) => (
            <div key={n.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', borderTop: i > 0 ? `1px solid #f1f5f9` : 'none', background: n.read_at ? (i%2===0?'white':'#fafafa') : '#fffbf5' }}>
              <div style={{ padding: '6px', background: n.read_at ? '#f1f5f9' : '#fff7ed', borderRadius: '6px', flexShrink: 0, marginTop: '1px' }}>
                <Bell size={13} color={n.read_at ? '#94a3b8' : WARM.orange} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: n.read_at ? 500 : 700, color: WARM.text }}>{n.message}</div>
                <div style={{ fontSize: '11px', color: WARM.muted, marginTop: '3px', display: 'flex', gap: '12px' }}>
                  <span>Project #{n.project_code}</span>
                  <span>{new Date(n.sent_at).toLocaleString('en-IN')}</span>
                  {!n.read_at && <span style={{ color: WARM.orange, fontWeight: 700 }}>● Unread</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
