import { Link } from 'react-router-dom'

const joinClasses = (...parts) => parts.filter(Boolean).join(' ')
const NAVBAR_SHELL_OFFSET = '-mt-20 pt-20 lg:-mt-24 lg:pt-24'

function ActionButton({ action }) {
  const isPrimary = action.variant !== 'secondary'
  const classes = joinClasses(
    'inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold transition-all duration-300 group',
    isPrimary
      ? 'relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_16px_40px_-12px_rgba(99,102,241,0.55)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.65)]'
      : 'border border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:bg-white hover:border-indigo-200 hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:border-indigo-500/30 dark:hover:text-indigo-300'
  )

  const content = (
    <>
      {action.icon && <span className="text-base leading-none">{action.icon}</span>}
      <span>{action.label}</span>
      {isPrimary && (
        <span className="group-hover:translate-x-0.5 transition-transform duration-300">→</span>
      )}
      {/* Shimmer effect for primary */}
      {isPrimary && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}
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
        'rounded-[28px] border backdrop-blur-2xl',
        'border-white/70 bg-white/80 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]',
        'dark:border-white/8 dark:bg-slate-900/75 dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]',
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
        <div className={joinClasses(
          'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]',
          aligned ? 'mx-auto' : '',
          'border-indigo-200/80 bg-indigo-50/90 text-indigo-700',
          'dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300'
        )}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)] animate-pulse" />
          <span>{badge}</span>
        </div>
      )}
      <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl leading-tight">{title}</h2>
      {description && <p className="text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">{description}</p>}
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
    <div
      className={joinClasses(
        'relative min-h-screen overflow-hidden text-slate-900 dark:text-white',
        // Light mode: rich mesh gradient
        'bg-[#F8FBFF]',
        // Dark mode: deep navy
        'dark:bg-[#030712]',
        NAVBAR_SHELL_OFFSET
      )}
    >
      {/* === Light mode mesh gradient === */}
      <div className="pointer-events-none absolute inset-0 dark:hidden">
        <div style={{background: 'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(59,130,246,0.14), transparent)'}} className="absolute inset-0" />
        <div style={{background: 'radial-gradient(ellipse 60% 50% at 85% 5%, rgba(99,102,241,0.12), transparent)'}} className="absolute inset-0" />
        <div style={{background: 'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(139,92,246,0.07), transparent)'}} className="absolute inset-0" />
      </div>

      {/* === Dark mode glow === */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div style={{background: 'radial-gradient(ellipse 70% 50% at 10% 5%, rgba(59,130,246,0.1), transparent)'}} className="absolute inset-0" />
        <div style={{background: 'radial-gradient(ellipse 55% 45% at 90% 0%, rgba(99,102,241,0.08), transparent)'}} className="absolute inset-0" />
        <div style={{background: 'radial-gradient(ellipse 45% 35% at 50% 95%, rgba(139,92,246,0.06), transparent)'}} className="absolute inset-0" />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] [background-size:64px_64px] dark:[background-image:linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)] dark:opacity-50" />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute left-[-6%] top-20 h-80 w-80 rounded-full bg-blue-400/25 blur-[80px] dark:bg-blue-600/12 animate-float-slow" />
      <div className="pointer-events-none absolute right-[-4%] top-10 h-96 w-96 rounded-full bg-indigo-400/20 blur-[90px] dark:bg-indigo-600/10 animate-float-slow" style={{ animationDelay: '-4s' }} />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-violet-300/20 blur-[70px] dark:bg-violet-600/8 animate-float-slow" style={{ animationDelay: '-8s' }} />

      <PublicSection className={compact ? 'pt-24 sm:pt-28 lg:pt-32' : 'pt-28 sm:pt-32 lg:pt-36'}>
        <div className={compact
          ? 'grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_320px] lg:items-start'
          : 'grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_370px] lg:items-start'
        }>
          {/* === HERO CARD === */}
          <PublicGlassCard className={compact ? 'relative overflow-hidden p-7 sm:p-8' : 'relative overflow-hidden p-8 sm:p-10'}>
            {/* Card inner glow */}
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-gradient-to-bl from-indigo-300/25 to-transparent blur-2xl dark:from-indigo-500/10" />
            <div className="pointer-events-none absolute left-0 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-300/20 to-transparent blur-2xl dark:from-blue-500/8" />

            <div className={joinClasses('relative', compact ? 'space-y-5' : 'space-y-7')}>
              {badge && (
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700 shadow-[0_4px_16px_-4px_rgba(99,102,241,0.25)] dark:border-indigo-500/25 dark:from-indigo-500/12 dark:to-blue-500/8 dark:text-indigo-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)] animate-pulse" />
                  <span>{badge}</span>
                </div>
              )}

              <div className={compact ? 'space-y-3' : 'space-y-4'}>
                <h1 className={compact
                  ? 'max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-[3.1rem] lg:text-[3.3rem] leading-[1.05]'
                  : 'max-w-3xl text-[2.6rem] font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.7rem] lg:leading-[1.03]'
                }>
                  {title}
                </h1>
                <p className={compact
                  ? 'max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-[15px]'
                  : 'max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-lg sm:leading-8'
                }>{description}</p>
              </div>

              {actions.length > 0 && (
                <div className={compact ? 'flex flex-wrap gap-2.5' : 'flex flex-wrap gap-3'}>
                  {actions.map((action) => (
                    <ActionButton key={`${action.label}-${action.to || action.href || 'action'}`} action={action} />
                  ))}
                </div>
              )}

              {pills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pills.map((pill) => (
                    <div
                      key={pill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/8 dark:bg-white/4 dark:text-slate-400"
                    >
                      <span className="h-1 w-1 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                      {pill}
                    </div>
                  ))}
                </div>
              )}

              {stats.length > 0 && (
                <div className={compact ? 'grid gap-2.5 sm:grid-cols-3' : 'grid gap-3 sm:grid-cols-3'}>
                  {stats.map((stat) => (
                    <div key={stat.label} className={joinClasses(
                      'group rounded-2xl border px-5 py-4 transition-all duration-300 cursor-default',
                      'border-white/80 bg-white/85 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)] hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.2)] hover:-translate-y-0.5',
                      'dark:border-white/8 dark:bg-white/4 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.15)]'
                    )}>
                      <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{stat.value}</div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PublicGlassCard>

          {/* === ASIDE CARD === */}
          <PublicGlassCard className={joinClasses(
            'h-full',
            compact ? 'p-5 sm:p-6' : 'p-6 sm:p-7'
          )}>
            {aside}
          </PublicGlassCard>
        </div>
      </PublicSection>

      <div className={compact ? 'relative z-10 pb-16 pt-8 sm:pb-20 sm:pt-10' : 'relative z-10 pb-20 pt-10 sm:pb-24 sm:pt-14'}>
        {children}
      </div>
    </div>
  )
}
