import { Link } from 'react-router-dom'

const joinClasses = (...parts) => parts.filter(Boolean).join(' ')

function ActionButton({ action }) {
  const classes = joinClasses(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300',
    action.variant === 'secondary'
      ? 'border border-sky-200 bg-white/80 text-sky-700 shadow-[0_14px_30px_-20px_rgba(14,116,144,0.6)] hover:-translate-y-0.5 hover:bg-white'
      : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-[0_20px_45px_-20px_rgba(37,99,235,0.85)] hover:-translate-y-0.5 hover:shadow-[0_28px_55px_-22px_rgba(37,99,235,0.95)]'
  )

  const content = (
    <>
      {action.icon && <span className="text-base leading-none">{action.icon}</span>}
      <span>{action.label}</span>
    </>
  )

  if (action.href) {
    return (
      <a href={action.href} target={action.target || undefined} rel={action.rel || undefined} className={classes}>
        {content}
      </a>
    )
  }

  return (
    <Link to={action.to || '/'} className={classes}>
      {content}
    </Link>
  )
}

export function PublicGlassCard({ className = '', children }) {
  return (
    <div
      className={joinClasses(
        'rounded-[28px] border border-white/80 bg-white/78 p-6 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-xl',
        className
      )}
    >
      {children}
    </div>
  )
}

export function PublicSection({ className = '', children, ...props }) {
  return (
    <section
      {...props}
      className={joinClasses('relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
    >
      {children}
    </section>
  )
}

export function PublicSectionHeading({ badge, title, description, align = 'left' }) {
  const aligned = align === 'center'

  return (
    <div className={joinClasses('space-y-4', aligned ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl')}>
      {badge && (
        <div className={joinClasses('inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]', aligned ? 'mx-auto' : '', 'border-sky-200 bg-white/80 text-sky-700')}>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.16)]" />
          <span>{badge}</span>
        </div>
      )}
      <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {description && <p className="text-sm leading-7 text-slate-600 sm:text-base">{description}</p>}
    </div>
  )
}

export default function PublicPageShell({
  badge,
  title,
  description,
  actions = [],
  pills = [],
  stats = [],
  aside,
  children,
  compact = false,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.55),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(224,231,255,0.7),_transparent_28%),linear-gradient(180deg,_#f8fcff_0%,_#f4f8ff_52%,_#f8fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(37,99,235,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-16 h-80 w-80 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/30 blur-3xl" />

      <PublicSection className={compact ? 'pt-24 sm:pt-28 lg:pt-32' : 'pt-28 sm:pt-32 lg:pt-36'}>
        <div className={compact ? 'grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_330px] lg:items-stretch' : 'grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_380px] lg:items-stretch'}>
          <PublicGlassCard className={compact ? 'relative overflow-hidden p-6 sm:p-7' : 'relative overflow-hidden p-7 sm:p-9'}>
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
            <div className={joinClasses('relative', compact ? 'space-y-5' : 'space-y-6')}>
              {badge && (
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.18)]" />
                  <span>{badge}</span>
                </div>
              )}

              <div className={compact ? 'space-y-3' : 'space-y-4'}>
                <h1 className={compact ? 'max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-[3.15rem] lg:text-[3.3rem] lg:leading-[1]' : 'max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[3.6rem] lg:leading-[1.04]'}>
                  {title}
                </h1>
                <p className={compact ? 'max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-7' : 'max-w-2xl text-sm leading-7 text-slate-600 sm:text-lg sm:leading-8'}>{description}</p>
              </div>

              {actions.length > 0 && (
                <div className={compact ? 'flex flex-wrap gap-2.5' : 'flex flex-wrap gap-3'}>
                  {actions.map((action) => (
                    <ActionButton key={`${action.label}-${action.to || action.href || 'action'}`} action={action} />
                  ))}
                </div>
              )}

              {pills.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {pills.map((pill) => (
                    <div
                      key={pill}
                      className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/85 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-[0_12px_25px_-20px_rgba(15,23,42,0.45)] sm:text-sm"
                    >
                      {pill}
                    </div>
                  ))}
                </div>
              )}

              {stats.length > 0 && (
                <div className={compact ? 'grid gap-2.5 sm:grid-cols-3' : 'grid gap-3 sm:grid-cols-3'}>
                  {stats.map((stat) => (
                    <div key={stat.label} className={compact ? 'rounded-3xl border border-white/90 bg-white/85 px-4 py-3.5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]' : 'rounded-3xl border border-white/90 bg-white/85 px-5 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]'}>
                      <div className={compact ? 'text-xl font-black text-slate-900 sm:text-2xl' : 'text-2xl font-black text-slate-900'}>{stat.value}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PublicGlassCard>

          <PublicGlassCard className={compact ? 'h-full p-5 sm:p-6' : 'h-full p-6 sm:p-7'}>
            {aside}
          </PublicGlassCard>
        </div>
      </PublicSection>

      <div className={compact ? 'relative z-10 pb-16 pt-8 sm:pb-20 sm:pt-10' : 'relative z-10 pb-20 pt-10 sm:pb-24 sm:pt-14'}>{children}</div>
    </div>
  )
}
