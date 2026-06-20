import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'

const iconLibrary = {
  code: (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  tool: (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  video: (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  support: (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
}

const accentByCategory = (category = '') => {
  const n = category.toLowerCase()
  if (n.includes('dev')) return {
    iconBg: 'from-blue-500 to-indigo-600',
    iconGlow: 'rgba(99,102,241,0.4)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    action: 'from-blue-600 to-indigo-600',
    dot: 'bg-blue-500',
  }
  if (n.includes('support') || n.includes('repair')) return {
    iconBg: 'from-violet-500 to-purple-600',
    iconGlow: 'rgba(139,92,246,0.4)',
    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
    action: 'from-violet-600 to-purple-600',
    dot: 'bg-violet-500',
  }
  if (n.includes('creative') || n.includes('edit')) return {
    iconBg: 'from-rose-500 to-orange-500',
    iconGlow: 'rgba(244,63,94,0.4)',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    action: 'from-rose-600 to-orange-500',
    dot: 'bg-rose-500',
  }
  return {
    iconBg: 'from-amber-500 to-orange-500',
    iconGlow: 'rgba(245,158,11,0.4)',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    action: 'from-amber-500 to-orange-500',
    dot: 'bg-amber-500',
  }
}

const routeForService = (title = '') => {
  const n = title.toLowerCase()
  if (n.includes('web')) return '/services/web-development'
  if (n.includes('repair')) return '/services/repair'
  if (n.includes('edit')) return '/services/editing'
  if (n.includes('support')) return '/services/tech-support'
  return '/contact'
}

const featuresForService = (category = '') => {
  const n = category.toLowerCase()
  if (n.includes('dev')) return ['Responsive Design', 'SEO-Optimized', 'Fast Deployment']
  if (n.includes('support') || n.includes('repair')) return ['Issue Diagnosis', 'System Cleanup', 'Practical Support']
  if (n.includes('creative') || n.includes('edit')) return ['Video Polish', 'Visual Cleanup', 'Brand-Ready Output']
  return ['Flexible Scope', 'Professional Guidance', 'Reliable Delivery']
}

const Services = () => {
  const { services, loading } = useStore()

  const activeServices = services
    .filter((s) => s.active !== false)
    .map((s) => ({
      id: s.id,
      title: s.name,
      description: s.description,
      icon: iconLibrary[s.icon] || (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: accentByCategory(s.category),
      features: featuresForService(s.category),
      path: s.path || routeForService(s.name),
      category: s.category,
    }))

  const stats = [
    { value: `${activeServices.length}+`, label: 'Active Services' },
    { value: '24/7', label: 'Support Available' },
    { value: '100%', label: 'Client Focused' },
  ]

  return (
    <>
      <SEO
        title="Our Services | AmitSolutionHub"
        description="Explore web development, technical support, repair, and creative services from AmitSolutionHub — professional, fast, and mobile-friendly."
      />

      <PublicPageShell
        badge="Professional Service Stack"
        title={
          <>
            Services built for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              real results
            </span>{' '}
            on every device
          </>
        }
        description="From web development to technical support, we deliver professional solutions with a focus on quality, speed, and client satisfaction."
        actions={[
          { label: 'Discuss a Requirement', to: '/contact' },
          { label: 'See Our Projects', to: '/projects', variant: 'secondary' },
        ]}
        pills={['Web Development', 'Tech Support', 'Creative Editing', 'Custom Repairs']}
        stats={stats}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">Why Choose Us</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
                A professional team that delivers, not just promises
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: '⚡', text: 'Fast turnaround with no compromise on quality' },
                { icon: '🎯', text: 'Tailored solutions for your specific needs' },
                { icon: '🔒', text: 'Transparent pricing with no hidden costs' },
                { icon: '📱', text: 'Mobile-first approach for modern audiences' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-white/8 dark:bg-white/4">
                  <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 dark:border-indigo-500/15 dark:from-indigo-500/8 dark:to-blue-500/5">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">MSME Registered Business</div>
              <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Transparent service, visible company structure, and accountable delivery — trusted by clients across India.
              </p>
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          {/* Section Header */}
          <PublicGlassCard className="p-7">
            <PublicSectionHeading
              badge="Service Catalogue"
              title="Choose the right solution for you"
              description="Each service is crafted to solve real problems. Click any card to learn more or get started right away."
            />
          </PublicGlassCard>

          {/* Service Cards */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-[28px] border border-white/60 bg-white/50 dark:border-white/5 dark:bg-white/3" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeServices.map((service) => (
                <PublicGlassCard key={service.id} className="group flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(99,102,241,0.25)]">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`relative inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${service.accent.iconBg}`}
                      style={{ boxShadow: `0 12px 30px -8px ${service.accent.iconGlow}` }}
                    >
                      {service.icon}
                      {/* Shine effect */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${service.accent.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${service.accent.dot}`} />
                        {service.category || 'Professional Service'}
                      </span>
                      <h3 className="mt-2.5 text-xl font-black text-slate-900 dark:text-white leading-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300 flex-1">
                    {service.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span key={feature} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/8 dark:bg-white/4 dark:text-slate-400">
                        <span className={`h-1 w-1 rounded-full ${service.accent.dot}`} />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100/80 pt-5 dark:border-white/6">
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                      Professional Delivery
                    </span>
                    <Link
                      to={service.path}
                      className={`group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 ${service.accent.action}`}
                      style={{ boxShadow: `0 8px 20px -6px ${service.accent.iconGlow}` }}
                    >
                      <span>Explore</span>
                      <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
                      <span className="absolute inset-0 -translate-x-full bg-white/20 group-hover/btn:translate-x-full transition-transform duration-500" />
                    </Link>
                  </div>
                </PublicGlassCard>
              ))}
            </div>
          )}

          {/* CTA Banner */}
          <PublicGlassCard className="relative overflow-hidden p-0">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-[0.06] dark:opacity-[0.12]" />
            <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5 p-8 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Custom Package
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Need a tailored solution instead of a standard service?
                </h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Share your requirement and we'll craft a custom solution — same professional quality, shaped around your specific needs.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span>Contact Us</span>
                    <span>→</span>
                  </Link>
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-6 py-3 text-sm font-bold text-slate-700 hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    View Projects
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 via-indigo-50/50 to-white p-8 sm:p-10 dark:from-slate-900/50 dark:via-slate-900/30 dark:to-slate-900/50">
                <div className="rounded-2xl border border-white/90 bg-white/85 p-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.3)] dark:border-white/8 dark:bg-white/4 dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">What clients typically need</div>
                  <div className="space-y-3">
                    {[
                      'Clear deliverables with realistic timelines',
                      'Professional communication at every step',
                      'Fast move from inquiry to execution',
                    ].map((point) => (
                      <div key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PublicGlassCard>
        </PublicSection>
      </PublicPageShell>
    </>
  )
}

export default Services
