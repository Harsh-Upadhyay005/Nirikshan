export function Testimonials() {
  const testimonials = [
    {
      role: 'Line Ministry Officer',
      dept: 'Ministry of Road Transport & Highways (MoRTH)',
      quote:
        '“Nirikshan delivers instant alerts on at-risk highway packages before contractor milestones default. A timely 15-minute alert allowed us to fast-track forest ROW clearances, directly averting a ₹50 crore arbitration penalty on the NH-44 corridor.”',
      name: 'Dr. V. K. Sharma',
      title: 'Chief Engineer, National Highway Works',
      avatarText: '👨‍💼',
    },
    {
      role: 'Statutory Auditor',
      dept: 'Comptroller and Auditor General (CAG) Directorate',
      quote:
        '“The read-only auditor tier provides unassailable visibility across all 1,600+ central sector undertakings. Having immutable timestamps, expenditure velocity ratios, and ML risk predictions simplifies compliance audits and public expenditure reviews.”',
      name: 'R. K. Sundaram',
      title: 'Director of Infrastructure Audit',
      avatarText: '📊',
    },
    {
      role: 'Central Administrator',
      dept: 'Infrastructure and Project Monitoring Division (MoSPI)',
      quote:
        '“Operating as national administrators, having high-accuracy predictive intelligence across ₹22 lakh crore of public projects enables targeted cabinet briefings and strategic capital allocation where intervention is paramount.”',
      name: 'Priyanka Menon',
      title: 'Joint Secretary, IPMD / PAIMANA Operations',
      avatarText: '⚙️',
    },
  ]

  return (
    <section className="section section-subtle" id="testimonials">
      <div className="section-header">
        <span className="eyebrow">Stakeholder Impact</span>
        <h2>Who Benefits from Nirikshan</h2>
        <p>
          Empowering line officers, statutory auditors, and central ministries with unified,
          authoritative risk intelligence.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, idx) => (
          <div className="testimonial-card" key={idx}>
            <div>
              <span className="badge-tag badge-blue" style={{ marginBottom: '1.25rem' }}>
                {t.role}
              </span>
              <p className="testimonial-quote">{t.quote}</p>
            </div>

            <div className="testimonial-author">
              <div className="author-avatar">{t.avatarText}</div>
              <div className="author-info">
                <h4>{t.name}</h4>
                <p>{t.title}</p>
                <p style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 600 }}>{t.dept}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
