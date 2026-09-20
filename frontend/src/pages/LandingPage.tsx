import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  LockKeyhole,
  Server,
  CheckCircle2,
  ChevronRight,
  Radar,
  X,
  Send,
  Building2,
  Train,
  Zap,
  Clock,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react'
import '../landing.css'

export function LandingPage() {
  const [briefingModalOpen, setBriefingModalOpen] = useState(false)
  const [briefingEmail, setBriefingEmail] = useState('')
  const [briefingSubmitted, setBriefingSubmitted] = useState(false)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBriefingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (briefingEmail.trim()) {
      setBriefingSubmitted(true)
      setTimeout(() => {
        setBriefingModalOpen(false)
        setBriefingSubmitted(false)
        setBriefingEmail('')
      }, 2000)
    }
  }

  return (
    <div className="warm-landing" id="top">
      {/* Top Sovereign Bar */}
      <div className="warm-top-bar">
        <div className="warm-container warm-top-bar-inner">
          <div className="warm-top-left">
            <span className="warm-flag-strip" aria-label="Indian Tricolor">
              <span className="saffron" />
              <span className="white" />
              <span className="green" />
            </span>
            <span>Government of India · Ministry of Statistics and Programme Implementation (MoSPI)</span>
          </div>

          <div className="warm-top-status">
            <span className="warm-pulse-dot" />
            <span>Infrastructure Surveillance Active · 1,600+ Central Projects · ₹22 Lakh Cr Portfolio</span>
          </div>
        </div>
      </div>

      {/* Warm Cream Navigation Bar */}
      <header className="warm-navbar">
        <div className="warm-container warm-nav-inner">
          {/* Brand Logo */}
          <Link to="/" className="warm-brand-link" aria-label="Nirikshan Home">
            <div className="warm-brand-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19h16M7 16V11M12 16V6M17 16V10" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="17" cy="6.5" r="2" fill="#d97706" />
              </svg>
            </div>
            <div className="warm-brand-title">
              <div className="warm-brand-main">
                <span>Nirikshan</span>
                <span className="warm-brand-devanagari">निरीक्षण</span>
              </div>
              <span className="warm-brand-sub">AI Infrastructure Intelligence</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="warm-nav-links">
            <button onClick={() => scrollTo('capabilities')}>Capabilities</button>
            <button onClick={() => scrollTo('architecture')}>Architecture</button>
            <button onClick={() => scrollTo('sovereignty')}>Sovereignty & Trust</button>
            <button onClick={() => setBriefingModalOpen(true)}>Executive Briefing</button>
          </nav>

          {/* Nav Actions */}
          <div className="warm-nav-actions">
            <Link to="/login" className="btn-warm-secondary">
              Officer Login
            </Link>
            <Link to="/dashboard" className="btn-warm-primary">
              <span>Command Centre</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ==================================================================
            1. HERO SECTION: WARM CREAM, EDITORIAL, UNCLUTTERED
            (No heavy map or blue gradient)
            ================================================================== */}
        <section className="warm-hero-section">
          <div className="warm-container">
            <div className="warm-hero-grid">
              {/* Left Column: Editorial Headline & Narrative */}
              <div className="warm-hero-left">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="warm-kicker"
                >
                  <span>SOVEREIGN INFRASTRUCTURE INTELLIGENCE · MoSPI</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="warm-hero-headline"
                >
                  Predicting delays.
                  <br />
                  <em>Protecting public capital.</em>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="warm-hero-sub"
                >
                  Nirikshan continuously analyses monthly Flash Reports across <strong>1,600+ central sector projects
                  worth ₹22 lakh crore</strong> under MoSPI — predicting cost escalations and schedule slippages
                  before they compound, with automated alerts every <strong>15 minutes</strong>.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="warm-hero-actions"
                >
                  <Link to="/dashboard" className="btn-hero-solid">
                    <span>Enter Command Centre</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="btn-hero-outline">
                    <span>Official Officer Portal</span>
                  </Link>
                </motion.div>
              </div>

              {/* Right Column: Clean Corridor Surveillance Matrix (Replacing the heavy map) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="warm-visual-card"
              >
                <div className="warm-card-chrome">
                  <div className="warm-chrome-dots">
                    <span className="dot-a" />
                    <span className="dot-b" />
                    <span className="dot-c" />
                  </div>
                  <div className="warm-card-caption">
                    <span className="warm-pulse-dot" />
                    <span>Real-time National Surveillance Streams</span>
                  </div>
                  <Link
                    to="/dashboard"
                    style={{
                      fontSize: '11px',
                      color: '#b45309',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    View All 1,981 <ChevronRight size={13} />
                  </Link>
                </div>

                <div className="warm-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
                  {[
                    {
                      name: 'Delhi–Meerut RRTS Corridor',
                      ministry: 'MoRTH / Railways',
                      state: 'NCR & Uttar Pradesh',
                      badge: 'Geotechnical Watch',
                      badgeColor: '#dc2626',
                      badgeBg: '#fee2e2',
                      risk: '92 / 100',
                      icon: Train
                    },
                    {
                      name: 'Kudankulam Nuclear Power Expansion',
                      ministry: 'Ministry of Power',
                      state: 'Tamil Nadu',
                      badge: 'Milestone Synchronized',
                      badgeColor: '#d97706',
                      badgeBg: '#fef3c7',
                      risk: '88 / 100',
                      icon: Zap
                    },
                    {
                      name: 'Mumbai Coastal Road Project',
                      ministry: 'MoRTH / Urban Development',
                      state: 'Maharashtra',
                      badge: 'Intervention Active',
                      badgeColor: '#c2410c',
                      badgeBg: '#ffedd5',
                      risk: '85 / 100',
                      icon: Building2
                    },
                    {
                      name: 'Western Dedicated Freight Corridor',
                      ministry: 'Ministry of Railways',
                      state: 'Multi-State Logistics',
                      badge: 'On Schedule',
                      badgeColor: '#16a34a',
                      badgeBg: '#dcfce7',
                      risk: 'Safe Variance',
                      icon: Clock
                    }
                  ].map((corridor, idx) => {
                    const Icon = corridor.icon
                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#faf8f5',
                          border: '1px solid #e7e2d7',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#ffffff',
                              border: '1px solid #d6d0c4',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#78716c',
                              flexShrink: 0
                            }}
                          >
                            <Icon size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1c1917' }}>{corridor.name}</div>
                            <div style={{ fontSize: '11px', color: '#78716c', marginTop: '1px' }}>
                              {corridor.ministry} · {corridor.state}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: corridor.badgeColor,
                              background: corridor.badgeBg
                            }}
                          >
                            {corridor.badge}
                          </span>
                          <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', color: '#44403c', marginTop: '2px' }}>
                            {corridor.risk}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* Key Metrics Ribbon */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="warm-stats-strip"
            >
              <div className="warm-stat-box">
                <span className="warm-stat-value">1,600+</span>
                <span className="warm-stat-sub">Central Sector Projects</span>
              </div>
              <div className="warm-stat-box">
                <span className="warm-stat-value">₹22 Lakh Cr</span>
                <span className="warm-stat-sub">Infrastructure Portfolio</span>
              </div>
              <div className="warm-stat-box">
                <span className="warm-stat-value">15 min</span>
                <span className="warm-stat-sub">Automated Alert Cadence</span>
              </div>
              <div className="warm-stat-box">
                <span className="warm-stat-value">85%+</span>
                <span className="warm-stat-sub">Delay Prediction Accuracy</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            2. THE PROBLEM vs SOLUTION (KEY DEMO TALKING POINT)
            ================================================================== */}
        <section className="warm-section" style={{ background: '#fffbf5' }}>
          <div className="warm-container">
            <div className="warm-section-intro">
              <span className="warm-eyebrow">The Problem We Solve</span>
              <h2 className="warm-section-title">
                Officers find out about delays <em>after they happen.</em>
                <br />We predict them before.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
              {/* Before */}
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '14px', padding: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#dc2626', marginBottom: '14px' }}>❌ Without Nirikshan</div>
                {[
                  'Monthly PDF Flash Reports reviewed manually',
                  'Cost overruns discovered after crores are spent',
                  'Delays flagged only at missed milestones',
                  'No cross-ministry visibility or coordination',
                  '50-field tables with no anomaly ranking',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', fontSize: '13px', color: '#7f1d1d' }}>
                    <span style={{ flexShrink: 0, marginTop: '2px' }}>✗</span> {t}
                  </div>
                ))}
              </div>

              {/* After */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#16a34a', marginBottom: '14px' }}>✅ With Nirikshan</div>
                {[
                  'ML model predicts delays 6 months in advance',
                  'Cost overrun probability scored 0–100 per project',
                  'Automated alerts every 15 minutes via email',
                  'Role-based dashboard for all 17 ministries',
                  'Actionable risk rankings, not raw data tables',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', fontSize: '13px', color: '#14532d' }}>
                    <span style={{ flexShrink: 0, marginTop: '2px' }}>✓</span> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. THREE CORE CAPABILITIES (WARM CREAM PALETTE)
            ================================================================== */}
        <section className="warm-section alt-bg" id="capabilities">
          <div className="warm-container">
            <div className="warm-section-intro">
              <span className="warm-eyebrow">Core Capabilities</span>
              <h2 className="warm-section-title">
                Proactive intelligence for <em>sovereign governance.</em>
              </h2>
              <p className="warm-section-desc">
                Designed to move civil servants and ministry leadership from retrospective monthly reviews
                to continuous, predictive intervention.
              </p>
            </div>

            <div className="warm-pillars-grid">
              {/* Pillar 1 */}
              <div className="warm-pillar-card">
                <div className="warm-pillar-icon">
                  <BrainCircuit size={22} />
                </div>
                <span className="warm-pillar-tag">Machine Learning</span>
                <h3>Predictive Cost & Schedule Risk</h3>
                <p>
                  Trained on multi-decade PAIMANA infrastructure datasets to predict budget escalations
                  and schedule slippages up to 6 months before milestone breaches occur.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="warm-pillar-card">
                <div className="warm-pillar-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <Radar size={22} />
                </div>
                <span className="warm-pillar-tag">Field Telemetry</span>
                <h3>Corridor & Telemetry Integration</h3>
                <p>
                  Harmonizes geotechnical slope sensors, drone LiDAR surveillance feeds, and meteorological
                  flood warnings into a single sovereign operational picture.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="warm-pillar-card">
                <div className="warm-pillar-icon" style={{ background: '#ffedd5', color: '#c2410c' }}>
                  <ShieldCheck size={22} />
                </div>
                <span className="warm-pillar-tag">Accountability</span>
                <h3>Verifiable Nodal Directives</h3>
                <p>
                  Translates detected bottlenecks into accountable escalation directives with assigned
                  ministry nodal officers, resolution SLAs, and tamper-evident audit logs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. HOW IT WORKS (ARCHITECTURE)
            ================================================================== */}
        <section className="warm-section" id="architecture">
          <div className="warm-container">
            <div className="warm-section-intro">
              <span className="warm-eyebrow">Architecture Workflow</span>
              <h2 className="warm-section-title">
                From weak signals to <em>decisive interventions.</em>
              </h2>
              <p className="warm-section-desc">
                A closed-loop system connecting project field data, AI inference models, and ministry
                policymakers.
              </p>
            </div>

            <div className="warm-steps-row">
              <div className="warm-step-card">
                <div className="warm-step-num">01</div>
                <h4>Continuous Ingestion</h4>
                <p>
                  Milestone reports, contractor billing records, weather alerts, and geotechnical IoT
                  telemetry are continuously synchronized across all 17 central ministries.
                </p>
              </div>

              <div className="warm-step-card">
                <div className="warm-step-num">02</div>
                <h4>Predictive Risk Modeling</h4>
                <p>
                  LightGBM algorithms evaluate physical vs financial progress divergence, contractor
                  dispute indicators, and material inflation to compute real-time risk scores (0–100).
                </p>
              </div>

              <div className="warm-step-card">
                <div className="warm-step-num">03</div>
                <h4>Targeted Action Directives</h4>
                <p>
                  Automated escalation notices and inter-ministerial clearance requests are dispatched
                  directly to responsible nodal officers, reducing decision latency by 3.2×.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. SOVEREIGN SECURITY & COMPLIANCE
            ================================================================== */}
        <section className="warm-section alt-bg" id="sovereignty">
          <div className="warm-container">
            <div className="warm-section-intro">
              <span className="warm-eyebrow">Sovereign Assurance</span>
              <h2 className="warm-section-title">
                Built for national scale and <em>public trust.</em>
              </h2>
              <p className="warm-section-desc">
                Engineered to comply with stringent government data governance, cybersecurity, and
                sovereignty mandates.
              </p>
            </div>

            <div className="warm-security-grid">
              <div className="warm-security-box">
                <div className="warm-sec-icon">
                  <Server size={20} />
                </div>
                <div className="warm-sec-text">
                  <h4>MeitY-Empanelled Cloud</h4>
                  <p>100% data residency within India, hosted on certified sovereign cloud infrastructure with AES-256 encryption.</p>
                </div>
              </div>

              <div className="warm-security-box">
                <div className="warm-sec-icon">
                  <LockKeyhole size={20} />
                </div>
                <div className="warm-sec-text">
                  <h4>Role-Based Access Control</h4>
                  <p>Granular multi-tenant permissions tailored for MoSPI leadership, ministry mission directors, and field engineers.</p>
                </div>
              </div>

              <div className="warm-security-box">
                <div className="warm-sec-icon">
                  <CheckCircle2 size={20} />
                </div>
                <div className="warm-sec-text">
                  <h4>Audit-Ready Logging</h4>
                  <p>Immutable, cryptographically verifiable audit logs for all risk assessments, field remarks, and executive directives.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            6. EXECUTIVE CALL TO ACTION
            ================================================================== */}
        <section className="warm-cta-section">
          <div className="warm-container">
            <div className="warm-cta-card">
              <div className="warm-cta-glow" />
              <div className="warm-cta-content">
                <h2 className="warm-cta-title">
                  Ready to inspect national infrastructure in real time?
                </h2>
                <p className="warm-cta-desc">
                  Access live project maps, predictive risk rankings, expenditure variance analysis,
                  and state-wise infrastructure intelligence across all 1,600+ central sector projects
                  worth ₹22 lakh crore.
                </p>
                <div className="warm-cta-buttons">
                  <Link to="/dashboard" className="btn-cta-warm">
                    <span>Enter Command Centre</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link to="/login" className="btn-cta-ghost">
                    <span>Official Officer Portal</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================
          6. WARM SOVEREIGN FOOTER
          ================================================================== */}
      <footer className="warm-footer">
        <div className="warm-container">
          <div className="warm-footer-top">
            <div className="warm-footer-gov">
              <div className="warm-brand-logo" style={{ width: '30px', height: '30px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19h16M7 16V11M12 16V6M17 16V10" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <strong style={{ color: '#1c1917', fontSize: '13px' }}>NIRIKSHAN (निरीक्षण)</strong>
                <div style={{ fontSize: '11px', color: '#78716c' }}>
                  Ministry of Statistics and Programme Implementation, Government of India
                </div>
              </div>
            </div>

            <div className="warm-footer-links">
              <button onClick={() => scrollTo('capabilities')}>Capabilities</button>
              <button onClick={() => scrollTo('architecture')}>Architecture</button>
              <button onClick={() => scrollTo('sovereignty')}>Sovereignty</button>
              <Link to="/dashboard">Command Centre</Link>
              <Link to="/login">Officer Login</Link>
            </div>
          </div>

          <div className="warm-footer-bottom">
            <span>© 2026 NIRIKSHAN. Central Infrastructure Intelligence System.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="warm-flag-strip">
                <span className="saffron" />
                <span className="white" />
                <span className="green" />
              </span>
              <span>Data for a Developed India</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Request Briefing Modal */}
      <AnimatePresence>
        {briefingModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(28, 25, 23, 0.55)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setBriefingModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e7e2d7',
                padding: '28px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setBriefingModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#78716c'
                }}
              >
                <X size={18} />
              </button>

              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#c2410c', letterSpacing: '0.05em' }}>
                Executive Briefing Request
              </span>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1c1917', margin: '6px 0 10px' }}>
                Schedule a Nirikshan Walkthrough
              </h3>
              <p style={{ fontSize: '13px', color: '#78716c', lineHeight: 1.5, margin: '0 0 20px' }}>
                Provide your official ministry or department email address to receive an executive
                walkthrough dossier and API staging credentials.
              </p>

              {briefingSubmitted ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917', margin: '0 0 4px' }}>Request Recorded</h4>
                  <p style={{ fontSize: '12px', color: '#78716c', margin: 0 }}>
                    Our government solutions liaison will contact {briefingEmail}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBriefingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#44403c', marginBottom: '6px' }}>
                      Official Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="officer@nic.in or name@ministry.gov.in"
                      value={briefingEmail}
                      onChange={e => setBriefingEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d6d0c4',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-hero-solid"
                    style={{ justifyContent: 'center', width: '100%', padding: '11px' }}
                  >
                    <span>Submit Briefing Request</span>
                    <Send size={13} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandingPage
