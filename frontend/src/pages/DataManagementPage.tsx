import { useState, useEffect } from 'react'
import { Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', green: '#22c55e', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

interface Prediction {
  delay_probability: number
  expected_slippage_months: number
  cost_overrun_probability: number
  expected_overrun_value_cr: number
  risk_segment: string
  needs_attention: boolean
}

export function DataManagementPage() {
  const [ministries,  setMinistries]  = useState<{id:number;name:string}[]>([])
  const [categories,  setCategories]  = useState<{id:number;name:string}[]>([])
  const [agencies,    setAgencies]    = useState<{id:number;name:string}[]>([])
  const [states,      setStates]      = useState<{id:number;name:string}[]>([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<'predict'|'lookups'>('predict')
  const [toast,       setToast]       = useState<{msg:string;type:'ok'|'err'}|null>(null)
  const [predResult,  setPredResult]  = useState<Prediction|null>(null)
  const [predLoading, setPredLoading] = useState(false)

  // Prediction form state
  const [form, setForm] = useState({
    ministry: '', category: '', agency: '', state: '',
    is_multi_state: '0', original_cost_cr: '5000',
    approval_date: '', start_date: '2020-01-01',
    target_doc: '2026-01-01', physical_progress_pct: '30',
    cumulative_expenditure_cr: '1000',
    has_legacy_code: '0', has_pmgid: '0',
  })

  const token   = localStorage.getItem('nirikshan_token') ?? ''
  const user    = JSON.parse(localStorage.getItem('nirikshan_user') || '{}')
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function showToast(msg: string, type: 'ok'|'err' = 'ok') {
    setToast({ msg, type }); setTimeout(()=>setToast(null), 3500)
  }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/ministries', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/categories', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/agencies',   { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/states',     { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([m,c,a,s]) => {
      setMinistries(m); setCategories(c); setAgencies(a); setStates(s)
      if (m.length) setForm(f => ({ ...f, ministry: m[0].name }))
      if (c.length) setForm(f => ({ ...f, category: c[0].name }))
      if (a.length) setForm(f => ({ ...f, agency: a[0].name }))
      if (s.length) setForm(f => ({ ...f, state: s[0].name }))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function runPrediction() {
    if (!['admin','ministry_officer'].includes(user.role ?? '')) {
      showToast('Only admins and ministry officers can run predictions.', 'err'); return
    }
    setPredLoading(true); setPredResult(null)
    try {
      const res = await fetch('/api/v1/predict', {
        method: 'POST', headers,
        body: JSON.stringify({
          ...form,
          is_multi_state: +form.is_multi_state,
          original_cost_cr: +form.original_cost_cr,
          physical_progress_pct: +form.physical_progress_pct,
          cumulative_expenditure_cr: +form.cumulative_expenditure_cr,
          has_legacy_code: +form.has_legacy_code,
          has_pmgid: +form.has_pmgid,
          approval_date: form.approval_date || null,
        }),
      })
      if (res.ok) { setPredResult(await res.json()); showToast('Prediction completed!') }
      else { const b = await res.json(); showToast(b.detail || 'Prediction failed.', 'err') }
    } catch { showToast('Network error.', 'err') }
    finally { setPredLoading(false) }
  }

  const fieldStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', background: 'white', outline: 'none' }

  return (
    <DashboardLayout>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.type==='ok' ? '#1e293b' : '#ef4444', color: 'white', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type==='ok' ? <CheckCircle2 size={15} color={WARM.orange} /> : <AlertTriangle size={15} />} {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Data Management</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>Run ML risk predictions and manage platform lookup data</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh Lookups
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {([['predict','ML Risk Prediction'],['lookups','Platform Lookups']] as const).map(([k,label]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '7px 16px', fontSize: '12.5px', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', background: tab===k ? WARM.orange : 'white', color: tab===k ? 'white' : WARM.muted, transition: 'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ML Prediction tab */}
      {tab === 'predict' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '12px' }}>
          {/* Input form */}
          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '14px' }}>Project Parameters</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Ministry */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Ministry *</div>
                <select value={form.ministry} onChange={e => setForm(f=>({...f,ministry:e.target.value}))} style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'}>
                  {ministries.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </label>

              {/* Category */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Sector / Category *</div>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'}>
                  {categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </label>

              {/* Agency */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Agency *</div>
                <select value={form.agency} onChange={e => setForm(f=>({...f,agency:e.target.value}))} style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'}>
                  {agencies.map(a=><option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </label>

              {/* State */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Primary State *</div>
                <select value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))} style={fieldStyle}
                  onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'}>
                  {states.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </label>

              {/* Original Cost */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Original Cost (Cr) *</div>
                <input type="number" value={form.original_cost_cr} onChange={e=>setForm(f=>({...f,original_cost_cr:e.target.value}))}
                  style={fieldStyle} onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </label>

              {/* Cumulative Expenditure */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Cumulative Expenditure (Cr) *</div>
                <input type="number" value={form.cumulative_expenditure_cr} onChange={e=>setForm(f=>({...f,cumulative_expenditure_cr:e.target.value}))}
                  style={fieldStyle} onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </label>

              {/* Start Date */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Start Date *</div>
                <input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}
                  style={fieldStyle} onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </label>

              {/* Target DOC */}
              <label>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>Target Date of Completion *</div>
                <input type="date" value={form.target_doc} onChange={e=>setForm(f=>({...f,target_doc:e.target.value}))}
                  style={fieldStyle} onFocus={e=>e.target.style.borderColor=WARM.orange} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </label>

              {/* Physical Progress */}
              <label style={{ gridColumn: '1/-1' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, marginBottom: '4px' }}>
                  Physical Progress: <strong style={{ color: WARM.orange }}>{form.physical_progress_pct}%</strong>
                </div>
                <input type="range" min="0" max="100" value={form.physical_progress_pct} onChange={e=>setForm(f=>({...f,physical_progress_pct:e.target.value}))}
                  style={{ width: '100%', accentColor: WARM.orange }} />
              </label>

              {/* Flags */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_multi_state==='1'} onChange={e=>setForm(f=>({...f,is_multi_state:e.target.checked?'1':'0'}))}
                  style={{ accentColor: WARM.orange, width: '14px', height: '14px' }} />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: WARM.text }}>Multi-state project</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.has_pmgid==='1'} onChange={e=>setForm(f=>({...f,has_pmgid:e.target.checked?'1':'0'}))}
                  style={{ accentColor: WARM.orange, width: '14px', height: '14px' }} />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: WARM.text }}>Has PMGID</span>
              </label>
            </div>

            <button onClick={runPrediction} disabled={predLoading || loading}
              style={{ width: '100%', marginTop: '16px', padding: '10px', background: predLoading ? '#f1f5f9' : 'linear-gradient(135deg,#f97316,#fb923c)', color: predLoading ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: 700, cursor: predLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {predLoading ? <><RefreshCw size={14} /> Running ML Model…</> : <><Database size={14} /> Run Risk Prediction</>}
            </button>

            {!['admin','ministry_officer'].includes(user.role ?? '') && (
              <p style={{ fontSize: '11px', color: WARM.red, marginTop: '8px', textAlign: 'center' }}>
                ⚠ Only admins and ministry officers can run predictions.
              </p>
            )}
          </div>

          {/* Prediction result */}
          <div>
            {predResult ? (
              <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color={WARM.green} /> Prediction Result
                </div>

                {/* Risk segment badge */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: '20px', fontSize: '15px', fontWeight: 900,
                    background: predResult.risk_segment === 'Critical Risk' ? '#fee2e2' : predResult.risk_segment === 'High Risk' ? '#ffedd5' : predResult.risk_segment === 'Medium Risk' ? '#fef3c7' : '#f0fdf4',
                    color: predResult.risk_segment === 'Critical Risk' ? WARM.red : predResult.risk_segment === 'High Risk' ? WARM.orange : predResult.risk_segment === 'Medium Risk' ? WARM.amber : WARM.green,
                  }}>
                    {predResult.risk_segment}
                  </div>
                  {predResult.needs_attention && (
                    <div style={{ fontSize: '11.5px', color: WARM.red, fontWeight: 700, marginTop: '6px' }}>
                      ⚠ Needs Immediate Attention
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Delay Probability',           value: `${Math.round(predResult.delay_probability * 100)}%`,             color: predResult.delay_probability > 0.7 ? WARM.red : predResult.delay_probability > 0.5 ? WARM.orange : WARM.amber },
                    { label: 'Expected Slippage',           value: `${predResult.expected_slippage_months.toFixed(1)} months`,        color: WARM.orange },
                    { label: 'Cost Overrun Probability',    value: `${Math.round(predResult.cost_overrun_probability * 100)}%`,       color: predResult.cost_overrun_probability > 0.7 ? WARM.red : WARM.amber },
                    { label: 'Expected Overrun Value',      value: `₹${Math.round(predResult.expected_overrun_value_cr).toLocaleString()} Cr`, color: WARM.red },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: '10px 12px', background: '#fafafa', borderRadius: '7px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: WARM.muted, fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: '15px', fontWeight: 900, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
                <Database size={40} color="#fdba74" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', marginBottom: '6px' }}>ML Risk Predictor</div>
                <p style={{ fontSize: '12px', color: '#9a3412', lineHeight: 1.6, margin: 0 }}>
                  Fill in the project parameters and click <strong>"Run Risk Prediction"</strong> to get the ML model's assessment of delay probability, cost overrun risk, and expected impact.
                </p>
              </div>
            )}

            {/* Info box */}
            <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '14px', marginTop: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: WARM.text, marginBottom: '8px' }}>Model Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: WARM.muted }}>
                <div>• Gradient Boosted Decision Trees (LightGBM)</div>
                <div>• Trained on MoSPI IPMD Flash Reports</div>
                <div>• 1,600+ central sector projects</div>
                <div>• Features: cost, schedule, geography, sector</div>
                <div>• Outputs: delay prob. + cost overrun prob.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lookups tab */}
      {tab === 'lookups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
          {[
            { title: 'Ministries',  items: ministries,  icon: '🏛️' },
            { title: 'Categories',  items: categories,  icon: '📂' },
            { title: 'Agencies',    items: agencies,    icon: '🏗️' },
            { title: 'States',      items: states,      icon: '🗺️' },
          ].map(({ title, items, icon }) => (
            <div key={title} style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${WARM.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: WARM.text }}>{icon} {title} <span style={{ color: WARM.orange }}>({items.length})</span></span>
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '6px' }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
                ) : items.map((item, i) => (
                  <div key={item.id} style={{ padding: '7px 10px', fontSize: '12.5px', color: WARM.text, borderRadius: '5px', background: i%2===0?'#fafafa':'white', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <span style={{ fontSize: '10.5px', color: '#cbd5e1', fontFamily: 'monospace', flexShrink: 0 }}>#{item.id}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
