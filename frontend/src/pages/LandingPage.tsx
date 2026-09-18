import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import {
  ArrowRight,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleCheck,
  Code2,
  Database,
  Eye,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Play,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
  Copy,
  CheckCheck,
} from 'lucide-react'
import { InteractiveIndiaMap } from '../components/InteractiveIndiaMap'

const navItems = ['Platform', 'How it works', 'Security', 'Developers']

const features = [
  {
    icon: Radar,
    tone: 'saffron',
    title: 'Early signal detection',
    body: 'Ingest live feeds, field reports and open data to spot weak signals before they become public incidents.',
    tag: 'Predict',
  },
  {
    icon: Bell,
    tone: 'mint',
    title: 'Contextual alerts',
    body: 'Route the right alert to the right team with severity, confidence and the evidence behind every signal.',
    tag: 'Alert',
  },
  {
    icon: Route,
    tone: 'violet',
    title: 'Action orchestration',
    body: 'Turn intelligence into accountable workflows with owners, SLAs and a verifiable intervention trail.',
    tag: 'Intervene',
  },
  {
    icon: Network,
    tone: 'blue',
    title: 'One operational picture',
    body: 'Bring districts, departments and partners into one shared view without breaking existing systems.',
    tag: 'Unify',
  },
  {
    icon: Database,
    tone: 'green',
    title: 'Evidence-ready data',
    body: 'Keep a tamper-evident record of decisions, source data and outcomes for better governance over time.',
    tag: 'Record',
  },
  {
    icon: TrendingUp,
    tone: 'coral',
    title: 'Learning loops',
    body: 'Measure what changed after an intervention and continuously improve your response playbooks.',
    tag: 'Improve',
  },
]

const steps = [
  ['01', 'Observe', 'Connect the signals already flowing through your state, district or department.'],
  ['02', 'Understand', 'NIRIKSHAN enriches raw inputs with context, confidence and local patterns.'],
  ['03', 'Prioritise', 'Teams see what needs attention now, with an explanation they can trust.'],
  ['04', 'Act', 'Launch an accountable workflow across the people and systems best placed to respond.'],
  ['05', 'Learn', 'Close the loop with outcomes, feedback and better decisions next time.'],
]

const testimonials = [
  {
    quote:
      'We moved from weekly review meetings to a shared operational picture that updates while the work is happening.',
    name: 'District programme lead',
    role: 'Public service delivery · Road Transport',
    initials: 'DP',
  },
  {
    quote:
      'The useful part is not another dashboard. It is knowing which signal deserves an immediate response, and why.',
    name: 'State control room',
    role: 'Emergency & Flood Response · Assam',
    initials: 'SC',
  },
  {
    quote:
      'Every action has an assigned owner and an audit trail. That changes the quality of decisions across the ministry.',
    name: 'Mission director',
    role: 'Infrastructure & Project Monitoring (MoSPI)',
    initials: 'MD',
  },
]

const CODE_SNIPPETS = {
  curl: `curl -X POST https://api.nirikshan.gov.in/v1/signals \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "field-report",
    "severity": "high",
    "location": "27.18, 94.91",
    "ministry": "Jal Shakti",
    "anomaly_pct": 32.4
  }'`,

  python: `import httpx

headers = {"Authorization": "Bearer $TOKEN"}
payload = {
    "source": "field-report",
    "severity": "high",
    "location": "27.18, 94.91",
    "ministry": "Jal Shakti",
    "anomaly_pct": 32.4
}

response = httpx.post("https://api.nirikshan.gov.in/v1/signals", json=payload, headers=headers)
data = response.json()
print("Signal created:", data["signal_id"])`,

  typescript: `const response = await fetch('https://api.nirikshan.gov.in/v1/signals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source: 'field-report',
    severity: 'high',
    location: '27.18, 94.91',
    ministry: 'Jal Shakti',
    anomaly_pct: 32.4
  })
});

const result = await response.json();`,
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      to="/"
      className={`logo lockup ${inverse ? 'logo-inverse' : ''}`}
      aria-label="NIRIKSHAN home"
    >
      <span className="logo-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="logo-words">
        <strong>निरीक्षण</strong>
        <em>NIRIKSHAN</em>
      </span>
    </Link>
  )
}

function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}>
      <span className="eyebrow-line" />
      {children}
    </div>
  )
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [activeTimelineStep, setActiveTimelineStep] = useState(2) // 03 Prioritise by default
  const [selectedTechChip, setSelectedTechChip] = useState<string | null>(null)
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'typescript'>('curl')
  const [copiedCode, setCopiedCode] = useState(false)
  const [briefingModalOpen, setBriefingModalOpen] = useState(false)
  const [briefingEmail, setBriefingEmail] = useState('')
  const [briefingSubmitted, setBriefingSubmitted] = useState(false)

  const heroHeadlineRef = useRef<HTMLHeadingElement>(null)

  // GSAP animation for subtle float on hero text
  useEffect(() => {
    if (heroHeadlineRef.current) {
      gsap.fromTo(
        heroHeadlineRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }
      )
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeCodeLang])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleBriefingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (briefingEmail.trim()) {
      setBriefingSubmitted(true)
      setTimeout(() => {
        setBriefingModalOpen(false)
        setBriefingSubmitted(false)
        setBriefingEmail('')
      }, 2200)
    }
  }

  return (
    <div className="site-shell" id="top">
      {/* Top Banner Strip */}
      <div className="top-strip">
        <span>Built for Bharat.</span>
        <span>Smart India Hackathon 2026 · Ministry of Statistics (MoSPI IPMD)</span>
        <span className="top-strip-status">
          <i /> Systems thinking, made visible
        </span>
      </div>

      {/* Navigation Bar */}
      <header className="site-nav">
        <div className="container nav-inner">
          <Logo />

          <nav
            className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() =>
                  scrollTo(
                    item === 'Platform'
                      ? 'platform'
                      : item === 'How it works'
                      ? 'how-it-works'
                      : item === 'Security'
                      ? 'security'
                      : 'developers'
                  )
                }
              >
                {item}
              </button>
            ))}
            <button
              className="nav-cta nav-cta-mobile button button-dark"
              onClick={() => setBriefingModalOpen(true)}
            >
              Request a briefing <ArrowRight size={15} />
            </button>
          </nav>

          <div className="nav-actions">
            <Link to="/dashboard" className="button button-small" style={{ background: '#f3a22f', color: '#182130', fontWeight: 800 }}>
              Command Centre
            </Link>
            <Link to="/login" className="button button-small button-light">
              Officer Login
            </Link>
            <button
              className="button button-small button-dark"
              onClick={() => setBriefingModalOpen(true)}
            >
              Request a briefing <ArrowRight size={14} />
            </button>
            <button
              className="menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ==================================================================
            1. HERO SECTION & INTERACTIVE MAP AREA
            ================================================================== */}
        <section className="hero-section">
          <div className="hero-noise" />
          <div className="hero-glow hero-glow-a" />
          <div className="hero-glow hero-glow-b" />

          <div className="container hero-grid">
            <div className="hero-copy">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="hero-kicker"
              >
                <span className="live-dot" /> NIRIKSHAN / 01 — CIVIC INTELLIGENCE
              </motion.div>

              <h1 ref={heroHeadlineRef}>
                See the signal.
                <br />
                <span>Shape the outcome.</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="hero-lede"
              >
                A trusted intelligence layer for the people solving complex public problems — built
                to move teams from <i>reactive</i> to ready across 1,600+ infrastructure projects.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="hero-actions"
              >
                <Link to="/dashboard" className="button button-dark">
                  Launch Command Centre <ArrowRight size={16} />
                </Link>
                <button className="button button-light" onClick={() => scrollTo('platform')}>
                  Explore Architecture
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="hero-proof"
              >
                <div className="avatar-stack">
                  <span>RK</span>
                  <span>AS</span>
                  <span>NM</span>
                  <span>+</span>
                </div>
                <div>
                  <strong>Designed with public teams</strong>
                  <small>Built for high-stakes, everyday decisions</small>
                </div>
              </motion.div>
            </div>

            {/* Improved, fully interactive Map Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="hero-visual"
            >
              <InteractiveIndiaMap />
            </motion.div>
          </div>

          {/* Hero Stats Bar */}
          <div className="container hero-stats">
            <div>
              <strong>28</strong>
              <span>states ready to connect</span>
            </div>
            <div>
              <strong>04</strong>
              <span>intelligence layers</span>
            </div>
            <div>
              <strong>
                99.9<span>%</span>
              </strong>
              <span>audit-ready availability</span>
            </div>
            <div className="hero-stat-note">
              <span className="stat-bracket">[</span>
              <p>
                Technology should make
                <br />
                <b>good governance easier.</b>
              </p>
              <span className="stat-bracket">]</span>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. THE PROBLEM (VISIBILITY GAP)
            ================================================================== */}
        <section className="section problem-section" id="platform">
          <div className="container problem-grid">
            <div className="section-intro">
              <Eyebrow>The old operating system</Eyebrow>
              <h2>
                Most systems tell you what happened.
                <br />
                <em>Few help you decide what to do next.</em>
              </h2>
              <p>
                Public teams are surrounded by data, yet critical signals still arrive late, in
                silos, and without the context to act with confidence.
              </p>
              <button className="link-button" onClick={() => scrollTo('solution')}>
                See the shift <ArrowRight size={15} />
              </button>
            </div>

            <div className="problem-visual">
              <div className="problem-bg-number">02</div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="signal-thread thread-one cursor-pointer"
              >
                <span>01</span>
                <div>
                  <b>Signal</b>
                  <small>fragmented inputs</small>
                </div>
                <i />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="signal-thread thread-two cursor-pointer"
              >
                <span>02</span>
                <div>
                  <b>Context</b>
                  <small>missing in the moment</small>
                </div>
                <i />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="signal-thread thread-three cursor-pointer"
              >
                <span>03</span>
                <div>
                  <b>Decision</b>
                  <small>slower than the situation</small>
                </div>
                <i />
              </motion.div>

              <div className="signal-core">
                <div className="core-ring animate-pulse" style={{ animationDuration: '3s' }} />
                <span>
                  <Eye size={20} />
                </span>
                <b>
                  the
                  <br />
                  visibility
                  <br />
                  gap
                </b>
              </div>
              <div className="problem-foot">
                <span>Inputs</span>
                <span>Sensemaking</span>
                <span>Action</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. SOLUTION OVERVIEW (ONE LAYER. THREE MOVES.)
            ================================================================== */}
        <section className="section solution-section" id="solution">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <Eyebrow>One layer. Three moves.</Eyebrow>
                <h2>
                  From noise to <em>next.</em>
                </h2>
              </div>
              <p>
                NIRIKSHAN helps teams see the complete picture, move with intent, and learn from what
                happened next.
              </p>
            </div>

            <div className="solution-cards">
              {/* Card 1: Predict */}
              <motion.article
                whileHover={{ y: -6 }}
                className="solution-card card-saffron"
              >
                <div className="card-topline">
                  <span>01 / PREDICT</span>
                  <BrainCircuit size={18} />
                </div>
                <div className="solution-art art-predict">
                  <span className="art-cross cross-a" />
                  <span className="art-cross cross-b" />
                  <div className="art-signal signal-a animate-ping" style={{ animationDuration: '2.5s' }} />
                  <div className="art-signal signal-b" />
                  <div className="art-signal signal-c animate-ping" style={{ animationDuration: '3.2s' }} />
                  <div className="art-target">
                    <Radar size={25} />
                  </div>
                </div>
                <h3>Know what is building.</h3>
                <p>
                  Pattern detection that turns weak signals into a clear, explainable read of what may
                  happen next.
                </p>
                <button className="card-link" onClick={() => scrollTo('how-it-works')}>
                  Explore prediction <ArrowRight size={14} />
                </button>
              </motion.article>

              {/* Card 2: Alert */}
              <motion.article
                whileHover={{ y: -6 }}
                className="solution-card card-mint"
              >
                <div className="card-topline">
                  <span>02 / ALERT</span>
                  <Bell size={18} />
                </div>
                <div className="solution-art art-alert">
                  <div className="alert-panel">
                    <div className="alert-panel-head">
                      <span className="live-dot" /> INCIDENT / 74%
                    </div>
                    <strong>Water level anomaly</strong>
                    <span className="alert-bar">
                      <i />
                    </span>
                    <small>Review recommended · 6 districts</small>
                  </div>
                  <span className="alert-orb" />
                </div>
                <h3>Make the right noise.</h3>
                <p>
                  Prioritised alerts with context, confidence and the shortest path to the people who
                  can respond.
                </p>
                <button className="card-link" onClick={() => scrollTo('how-it-works')}>
                  Explore alerting <ArrowRight size={14} />
                </button>
              </motion.article>

              {/* Card 3: Intervene */}
              <motion.article
                whileHover={{ y: -6 }}
                className="solution-card card-violet"
              >
                <div className="card-topline">
                  <span>03 / INTERVENE</span>
                  <Route size={18} />
                </div>
                <div className="solution-art art-intervene">
                  <div className="intervene-path">
                    <span>Detect</span>
                    <i />
                    <span>Assign</span>
                    <i />
                    <span className="active">Act</span>
                  </div>
                  <div className="intervene-check">
                    <Check size={20} />
                  </div>
                </div>
                <h3>Turn intent into action.</h3>
                <p>
                  Close the loop with accountable workflows, owned interventions and outcomes you can
                  learn from.
                </p>
                <button className="card-link" onClick={() => scrollTo('how-it-works')}>
                  Explore interventions <ArrowRight size={14} />
                </button>
              </motion.article>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. TECH STACK (OPEN BY DESIGN)
            ================================================================== */}
        <section className="section dark-section tech-section">
          <div className="container">
            <div className="tech-head">
              <Eyebrow light>Designed for the real world</Eyebrow>
              <h2>
                Open by design.
                <br />
                <em>Ready for complexity.</em>
              </h2>
              <p>
                Use the tools your teams already know. Add intelligence where it creates leverage, not
                friction.
              </p>
            </div>

            <div className="tech-grid">
              <div className="tech-orbit">
                <div className="orbit-line orbit-line-a" />
                <div className="orbit-line orbit-line-b" />
                <div className="orbit-center">
                  <Layers3 size={24} />
                  <span>
                    your
                    <br />
                    stack
                  </span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="tech-chip chip-python"
                  onClick={() => setSelectedTechChip('Python 3.13 Runtime with LightGBM & NumPy')}
                >
                  <span>Py</span> Python 3.13
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="tech-chip chip-fast"
                  onClick={() => setSelectedTechChip('FastAPI High-Throughput Async REST APIs')}
                >
                  <span>⚡</span> FastAPI
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="tech-chip chip-docker"
                  onClick={() => setSelectedTechChip('Docker Multi-Stage Containerized Deployments')}
                >
                  <span>◈</span> Docker
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="tech-chip chip-post"
                  onClick={() => setSelectedTechChip('PostgreSQL with connection pooling & audit trails')}
                >
                  <span>PG</span> Postgres
                </motion.div>
              </div>

              <div className="tech-note">
                <span className="note-index">03</span>
                <div>
                  <strong>Integration is not a feature.</strong>
                  <p>
                    It is the condition for trust. That is why NIRIKSHAN is modular, API-first and built
                    to meet your existing architecture where it stands.
                  </p>
                  {selectedTechChip && (
                    <div className="mt-3 text-[12px] text-[#bfe8d0] font-mono">
                      Active: {selectedTechChip}
                    </div>
                  )}
                  <button className="outline-light-button" onClick={() => scrollTo('developers')}>
                    View developer tools <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. FEATURE TOOLKIT
            ================================================================== */}
        <section className="section feature-section">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <Eyebrow>The NIRIKSHAN toolkit</Eyebrow>
                <h2>
                  Capability with
                  <br />
                  <em>consequence.</em>
                </h2>
              </div>
              <div className="heading-aside">
                <span className="feature-count">06</span>
                <p>Thoughtful primitives for the people on the ground and the leaders above them.</p>
              </div>
            </div>

            <div className="feature-grid">
              {features.map(({ icon: Icon, tone, title, body, tag }, index) => (
                <motion.article
                  whileHover={{ y: -3 }}
                  className="feature-card"
                  key={title}
                >
                  <div className={`feature-icon icon-${tone}`}>
                    <Icon size={19} />
                  </div>
                  <div className="feature-index">0{index + 1}</div>
                  <span className="feature-tag">{tag}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <ArrowRight className="feature-arrow" size={16} />
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            6. COMMAND CENTRE DASHBOARD PREVIEW
            ================================================================== */}
        <section className="section dashboard-section">
          <div className="container">
            <div className="dashboard-copy">
              <div>
                <Eyebrow>A clearer command centre</Eyebrow>
                <h2>
                  See what matters
                  <br />
                  <em>before it matters.</em>
                </h2>
              </div>
              <p>
                One calm, contextual view for every signal, team and intervention across your
                operating landscape.
              </p>
            </div>

            <div className="dashboard-tabs">
              {['Overview', 'Signals', 'Interventions'].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="dashboard-mockup">
              <div className="dash-chrome">
                <span className="dash-brand">
                  <span className="mini-mark" /> NIRIKSHAN
                </span>
                <span className="dash-breadcrumb">/ Control room / {activeTab}</span>
                <span className="dash-user">
                  RK <span>⌄</span>
                </span>
              </div>

              <div className="dash-body">
                <aside className="dash-side">
                  <span className={activeTab === 'Overview' ? 'side-active' : ''}>
                    <Eye size={14} /> Overview
                  </span>
                  <span className={activeTab === 'Signals' ? 'side-active' : ''}>
                    <Radar size={14} /> Signals
                  </span>
                  <span className={activeTab === 'Interventions' ? 'side-active' : ''}>
                    <Route size={14} /> Actions
                  </span>
                  <span>
                    <ShieldCheck size={14} /> Governance
                  </span>
                  <span>
                    <Code2 size={14} /> API
                  </span>
                </aside>

                <div className="dash-content">
                  <div className="dash-title-row">
                    <div>
                      <span className="dash-overline">GOOD MORNING, RAHUL</span>
                      <h3>Operational overview</h3>
                    </div>
                    <button className="dash-date">
                      Last 30 days <ChevronDown size={13} />
                    </button>
                  </div>

                  <div className="dash-kpis">
                    <div>
                      <span>Active signals</span>
                      <strong>1,284</strong>
                      <small className="positive">↗ 18.4%</small>
                    </div>
                    <div>
                      <span>Interventions</span>
                      <strong>86</strong>
                      <small className="positive">↗ 12.1%</small>
                    </div>
                    <div>
                      <span>Avg. response</span>
                      <strong>
                        02:14<small> hrs</small>
                      </strong>
                      <small className="positive">↓ 31.8%</small>
                    </div>
                  </div>

                  <div className="dash-main-row">
                    <div className="chart-panel">
                      <div className="panel-head">
                        <span>Signal volume</span>
                        <small>
                          BY WEEK <ChevronDown size={11} />
                        </small>
                      </div>
                      <div className="chart">
                        <div className="chart-y">
                          <span>1.6k</span>
                          <span>1.2k</span>
                          <span>800</span>
                          <span>400</span>
                          <span>0</span>
                        </div>
                        <svg viewBox="0 0 580 180" preserveAspectRatio="none" aria-label="Signal volume chart">
                          <defs>
                            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0" stopColor="#d5f1de" stopOpacity=".9" />
                              <stop offset="1" stopColor="#d5f1de" stopOpacity=".05" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,154 C24,145 38,150 58,128 S90,141 113,112 S143,95 162,108 S195,136 219,105 S248,86 273,94 S300,84 327,70 S356,110 381,78 S407,58 432,75 S458,90 480,66 S520,38 550,52 S567,29 580,22 V180 H0 Z"
                            fill="url(#chartFill)"
                          />
                          <path
                            d="M0,154 C24,145 38,150 58,128 S90,141 113,112 S143,95 162,108 S195,136 219,105 S248,86 273,94 S300,84 327,70 S356,110 381,78 S407,58 432,75 S458,90 480,66 S520,38 550,52 S567,29 580,22"
                            fill="none"
                            stroke="#267858"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="chart-x">
                          <span>01 May</span>
                          <span>08 May</span>
                          <span>15 May</span>
                          <span>22 May</span>
                          <span>29 May</span>
                        </div>
                      </div>
                    </div>

                    <div className="status-panel">
                      <div className="panel-head">
                        <span>By status</span>
                        <small>LIVE</small>
                      </div>
                      <div className="status-donut">
                        <div>
                          <strong>1,284</strong>
                          <span>signals</span>
                        </div>
                      </div>
                      <div className="status-legend">
                        <span>
                          <i className="dot-green" /> Resolved <b>62%</b>
                        </span>
                        <span>
                          <i className="dot-saffron" /> Monitoring <b>27%</b>
                        </span>
                        <span>
                          <i className="dot-coral" /> Escalated <b>11%</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-table">
                    <div className="table-head">
                      <span>Priority queue</span>
                      <small>VIEW ALL ↗</small>
                    </div>
                    <div className="table-row">
                      <span className="priority high" />
                      <strong>Water level anomaly</strong>
                      <span>Assam · Dibrugarh</span>
                      <b>High</b>
                      <small>12m ago</small>
                    </div>
                    <div className="table-row">
                      <span className="priority medium" />
                      <strong>School attendance dip</strong>
                      <span>Rajasthan · Barmer</span>
                      <b>Medium</b>
                      <small>34m ago</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            7. IMPACT METRICS (WHAT GOOD LOOKS LIKE)
            ================================================================== */}
        <section className="impact-section">
          <div className="container">
            <div className="impact-head">
              <div>
                <Eyebrow>What good looks like</Eyebrow>
                <h2>
                  Better signals.
                  <br />
                  <em>Better outcomes.</em>
                </h2>
              </div>
              <p>When teams can see clearly, they make room for better work.</p>
            </div>

            <div className="impact-grid">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="impact-metric"
              >
                <div className="impact-circle circle-saffron">
                  <strong>
                    3.2<span>×</span>
                  </strong>
                  <small>faster response</small>
                </div>
                <p>Less time lost between detection and a decision.</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="impact-metric"
              >
                <div className="impact-circle circle-mint">
                  <strong>
                    41<span>%</span>
                  </strong>
                  <small>more signal clarity</small>
                </div>
                <p>More context for the people closest to the issue.</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="impact-metric"
              >
                <div className="impact-circle circle-violet">
                  <strong>
                    100<span>%</span>
                  </strong>
                  <small>traceable action</small>
                </div>
                <p>A stronger trail from intent to outcome.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            8. HOW IT WORKS (FIVE MOVES, ONE LOOP)
            ================================================================== */}
        <section className="section timeline-section" id="how-it-works">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <Eyebrow>Five moves, one loop</Eyebrow>
                <h2>
                  How NIRIKSHAN
                  <br />
                  <em>works with you.</em>
                </h2>
              </div>
              <p>
                Technology should fit the rhythm of work already underway — then make that rhythm
                smarter.
              </p>
            </div>

            <div className="timeline">
              {steps.map(([number, title, body], index) => (
                <div
                  className={`timeline-item ${index === activeTimelineStep ? 'timeline-active' : ''}`}
                  key={number}
                  onClick={() => setActiveTimelineStep(index)}
                >
                  <span className="timeline-number">{number}</span>
                  <div className="timeline-dot" />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                  {index < steps.length - 1 && <div className="timeline-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            9. SECURITY & TRUST (TRUST IS A FEATURE)
            ================================================================== */}
        <section className="section security-section" id="security">
          <div className="container security-grid">
            <div>
              <Eyebrow>Trust is a feature</Eyebrow>
              <h2>
                Built for
                <br />
                <em>responsibility.</em>
              </h2>
              <p>
                Every layer is designed for public-sector realities: many stakeholders, sensitive
                information and decisions that need to stand up to scrutiny.
              </p>
              <button className="link-button" onClick={() => setBriefingModalOpen(true)}>
                Talk to our team <ArrowRight size={15} />
              </button>
            </div>

            <div className="security-cards">
              <div className="security-card">
                <div className="security-icon">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h3>Role-based access</h3>
                  <p>Granular permissions for state, district, department and partner teams.</p>
                </div>
                <span className="security-check">
                  <Check size={13} />
                </span>
              </div>

              <div className="security-card">
                <div className="security-icon green">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3>Audit-ready by default</h3>
                  <p>Immutable logs for evidence, decisions and intervention outcomes.</p>
                </div>
                <span className="security-check">
                  <Check size={13} />
                </span>
              </div>

              <div className="security-card">
                <div className="security-icon blue">
                  <Users size={20} />
                </div>
                <div>
                  <h3>Human in the loop</h3>
                  <p>Explainable recommendations that support judgement, never replace it.</p>
                </div>
                <span className="security-check">
                  <Check size={13} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            10. SMART INDIA HACKATHON 2026 SECTION
            ================================================================== */}
        <section className="hackathon-section">
          <div className="container hack-grid">
            <div className="hack-mark">
              <span>SIH</span>
              <strong>2026</strong>
            </div>
            <div>
              <Eyebrow light>Smart India Hackathon 2026</Eyebrow>
              <h2>
                Built here.
                <br />
                <em>For here.</em>
              </h2>
              <p>
                NIRIKSHAN is an enterprise civic intelligence platform for the Ministry of Statistics
                and Programme Implementation (MoSPI IPMD) — born from the conviction that predictive
                technology should protect public investments and empower civil servants.
              </p>
            </div>
            <div className="hack-stamp">
              <span>SIH</span>
              <small>2026</small>
              <b>
                INNOVATION
                <br />
                FOR IMPACT
              </b>
            </div>
          </div>
        </section>

        {/* ==================================================================
            11. DEVELOPER & API SECTION
            ================================================================== */}
        <section className="section developer-section" id="developers">
          <div className="container developer-grid">
            <div>
              <Eyebrow>For builders</Eyebrow>
              <h2>
                Meet the system
                <br />
                <em>behind the signal.</em>
              </h2>
              <p>
                Connect NIRIKSHAN to the tools, data and workflows your teams already use with an API
                designed for clarity.
              </p>
              <div className="flex gap-2 mt-4">
                {(['curl', 'python', 'typescript'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                      activeCodeLang === lang
                        ? 'bg-[#182130] text-[#fffdf7]'
                        : 'bg-[#e2e0d8] text-[#596372]'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'TypeScript'}
                  </button>
                ))}
              </div>
            </div>

            <div className="code-window">
              <div className="code-top">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <small>POST /v1/signals</small>
                <span className="code-copy flex items-center gap-1" onClick={handleCopyCode}>
                  {copiedCode ? (
                    <>
                      <CheckCheck size={11} /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> COPY
                    </>
                  )}
                </span>
              </div>
              <pre>
                <code>{CODE_SNIPPETS[activeCodeLang]}</code>
              </pre>
              <div className="code-response">
                <span className="response-dot" /> 201 Created{' '}
                <span>signal_id: sig_7f2a9_delhi_ne</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            12. TESTIMONIALS SECTION
            ================================================================== */}
        <section className="section testimonial-section">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <Eyebrow>In their words</Eyebrow>
                <h2>
                  A shared language
                  <br />
                  <em>for progress.</em>
                </h2>
              </div>
              <p>Different roles. Same need: more clarity when it matters.</p>
            </div>

            <div className="testimonial-grid">
              {testimonials.map((testimonial, index) => (
                <article
                  className={`testimonial-card testimonial-${index + 1}`}
                  key={testimonial.name}
                >
                  <div className="quote-mark">“</div>
                  <p>{testimonial.quote}</p>
                  <div className="testimonial-person">
                    <span>{testimonial.initials}</span>
                    <div>
                      <strong>{testimonial.name}</strong>
                      <small>{testimonial.role}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            13. CALL TO ACTION SECTION
            ================================================================== */}
        <section className="cta-section" id="contact">
          <div className="cta-grid-lines" />
          <div className="container cta-inner">
            <div>
              <Eyebrow light>Start with one signal</Eyebrow>
              <h2>
                Ready to make
                <br />
                <em>the next move?</em>
              </h2>
              <p>
                Bring us the problem you are trying to see more clearly. We will bring a point of view,
                a working prototype and a way forward.
              </p>
              <div className="hero-actions">
                <button className="button button-light" onClick={() => setBriefingModalOpen(true)}>
                  Request a briefing <ArrowRight size={16} />
                </button>
                <button className="text-button text-button-light" onClick={() => scrollTo('developers')}>
                  Read the docs <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="cta-figure">
              <div className="cta-orbit orbit-cta-a" />
              <div className="cta-orbit orbit-cta-b" />
              <span className="cta-center">
                <Sparkles size={29} />
              </span>
              <span className="cta-caption">Observe / Predict / Act</span>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================
          14. SITE FOOTER
          ================================================================== */}
      <footer className="site-footer">
        <div className="container footer-top">
          <Logo inverse />
          <p>
            Intelligence for a more
            <br />
            responsive India.
          </p>

          <div className="footer-links">
            <div>
              <strong>Explore</strong>
              <button onClick={() => scrollTo('platform')}>Platform</button>
              <button onClick={() => scrollTo('how-it-works')}>How it works</button>
              <button onClick={() => scrollTo('security')}>Security</button>
            </div>
            <div>
              <strong>Connect</strong>
              <button onClick={() => scrollTo('developers')}>Developers</button>
              <button onClick={() => setBriefingModalOpen(true)}>Briefings</button>
              <Link to="/login" style={{ color: 'rgba(255,253,247,0.6)', fontSize: '11px' }}>
                Officer Login
              </Link>
            </div>
          </div>

          <div className="footer-badge">
            <span>SIH</span>
            <strong>2026</strong>
            <small>Prototype track</small>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 NIRIKSHAN. A Smart India Hackathon concept for MoSPI IPMD.</span>
          <span>
            Made with intent <span className="footer-heart">◆</span> in India
          </span>
          <span className="footer-social">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span>Open-source principles</span>
          </span>
        </div>
      </footer>

      {/* Interactive Request Briefing Modal */}
      <AnimatePresence>
        {briefingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(24,33,48,0.65)] backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-[#fffdf7] border border-[#dfded8] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                className="absolute top-4 right-4 text-[#677080] hover:text-[#182130]"
                onClick={() => setBriefingModalOpen(false)}
              >
                <X size={20} />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2b7656]">
                  Executive Briefing Request
                </span>
                <h3 className="text-xl font-bold text-[#182130] mt-1">
                  Connect with NIRIKSHAN team
                </h3>
                <p className="text-xs text-[#677080] mt-1.5 leading-relaxed">
                  Provide your official ministry or department email address to receive an executive
                  walkthrough dossier and API staging credentials.
                </p>
              </div>

              {briefingSubmitted ? (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#e8f5ed] text-[#2b7656] mx-auto flex items-center justify-center mb-3">
                    <Check size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-[#182130]">Request Logged Successfully</h4>
                  <p className="text-xs text-[#596372] mt-1">
                    A verification link has been queued for {briefingEmail}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBriefingSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#182130] mb-1">
                      Official Work Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="officer@nic.in or name@ministry.gov.in"
                      value={briefingEmail}
                      onChange={(e) => setBriefingEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#f9f7f1] border border-[#dfded8] rounded-lg text-sm text-[#182130] focus:outline-none focus:border-[#2b7656]"
                    />
                  </div>
                  <button type="submit" className="w-full button button-dark py-2.5">
                    Submit Request <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandingPage
