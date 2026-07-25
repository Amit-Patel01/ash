export function EmployeePageHeader({ eyebrow = 'Employee Panel', title, description, actions = null, stats = [] }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-blue-100/90 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-6 sm:p-8 shadow-sm shadow-blue-500/5 lg:p-8 font-['Outfit',sans-serif]">
      {/* Background Subtle Radial Blue Glows */}
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">{eyebrow}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-2.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">{description}</p>}
          {stats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {stats.map(stat => (
                <div key={`${stat.label}-${stat.value}`} className="rounded-full border border-blue-100 bg-white/90 px-3.5 py-1.5 text-xs text-slate-600 shadow-xs flex items-center gap-2">
                  <span className="font-black text-blue-700">{stat.value}</span>
                  <span className="text-slate-500 font-medium">{stat.label}</span>
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
    <section className={`rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-100">
          <div>
            {title && <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">{description}</p>}
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
    <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ), 
  title, 
  description, 
  action = null, 
  className = '' 
}) {
  return (
    <div className={`rounded-[24px] border-2 border-dashed border-blue-200/80 bg-blue-50/30 px-6 py-10 text-center ${className}`}>
      <div className="flex justify-center text-3xl mb-3">{icon}</div>
      <h3 className="mt-2 text-base font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

export function EmployeeBadge({ children, tone = 'neutral' }) {
  const toneMap = {
    neutral: 'border-slate-200 bg-slate-100 text-slate-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${toneMap[tone] || toneMap.neutral}`}>
      {children}
    </span>
  )
}
