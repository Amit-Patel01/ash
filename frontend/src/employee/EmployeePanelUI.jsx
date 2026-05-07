export function EmployeePageHeader({ eyebrow = 'Employee Panel', title, description, actions = null, stats = [] }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(135deg,_rgba(3,7,18,0.96),_rgba(15,23,42,0.94))] p-6 shadow-2xl shadow-black/20 lg:p-8">
      <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-cyan-300">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>}
          {stats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {stats.map(stat => (
                <div key={`${stat.label}-${stat.value}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                  <span className="font-black text-white">{stat.value}</span>
                  <span className="ml-2 text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </section>
  )
}

export function EmployeeSurface({ title, description, action = null, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/15 backdrop-blur-xl lg:p-6 ${className}`}>
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-black text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmployeeEmptyState({ 
  icon = (
    <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ), 
  title, 
  description, 
  action = null, 
  className = '' 
}) {
  return (
    <div className={`rounded-[26px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center ${className}`}>
      <div className="flex justify-center text-4xl mb-4">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function EmployeeBadge({ children, tone = 'neutral' }) {
  const toneMap = {
    neutral: 'border-white/10 bg-white/5 text-slate-200',
    info: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    warning: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${toneMap[tone] || toneMap.neutral}`}>
      {children}
    </span>
  )
}
