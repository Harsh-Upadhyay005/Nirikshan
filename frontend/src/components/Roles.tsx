const roles = [
  {
    role: 'Admin',
    code: 'admin',
    access: 'Create projects, trigger predictions, full registry, all alerts.',
  },
  {
    role: 'Ministry officer',
    code: 'ministry_officer',
    access: 'Scoped to ministry_name. Own portfolio, own notes, own subscriptions.',
  },
  {
    role: 'Auditor',
    code: 'auditor',
    access: 'Read-only across projects and risk predictions. No writes on the registry.',
  },
]

export function Roles() {
  return (
    <section className="section" id="roles">
      <div className="section-head">
        <p className="eyebrow">RBAC</p>
        <h2>Three roles. Data filtered at the query, not the UI.</h2>
      </div>
      <div className="role-grid">
        {roles.map((item) => (
          <article key={item.code}>
            <p className="artifact">{item.code}</p>
            <h3>{item.role}</h3>
            <p>{item.access}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
