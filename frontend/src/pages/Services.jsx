import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'

const iconLibrary = {
  code: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  tool: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  video: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  support: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
}

const accentByCategory = (category = '') => {
  const normalized = category.toLowerCase()

  if (normalized.includes('dev')) {
    return {
      iconBg: 'from-sky-500 to-blue-600',
      badge: 'bg-sky-50 text-sky-700 border-sky-100',
      action: 'from-sky-600 to-blue-600',
    }
  }

  if (normalized.includes('support') || normalized.includes('repair')) {
    return {
      iconBg: 'from-indigo-500 to-violet-600',
      badge: 'bg-violet-50 text-violet-700 border-violet-100',
      action: 'from-indigo-600 to-violet-600',
    }
  }

  if (normalized.includes('creative') || normalized.includes('edit')) {
    return {
      iconBg: 'from-rose-500 to-orange-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-100',
      action: 'from-rose-600 to-orange-500',
    }
  }

  return {
    iconBg: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    action: 'from-amber-500 to-orange-500',
  }
}

const routeForService = (title = '') => {
  const normalized = title.toLowerCase()
  if (normalized.includes('web')) return '/services/web-development'
  if (normalized.includes('repair')) return '/services/repair'
  if (normalized.includes('edit')) return '/services/editing'
  if (normalized.includes('support')) return '/services/tech-support'
  return '/contact'
}

const featuresForService = (category = '') => {
  const normalized = category.toLowerCase()
  if (normalized.includes('dev')) return ['Responsive design', 'SEO-friendly structure', 'Fast deployment']
  if (normalized.includes('support') || normalized.includes('repair')) return ['Issue diagnosis', 'System cleanup', 'Practical support']
  if (normalized.includes('creative') || normalized.includes('edit')) return ['Video polish', 'Visual cleanup', 'Brand-ready output']
  return ['Flexible scope', 'Professional guidance', 'Reliable delivery']
}

const TabIcon = ({ name, size = 16, color = 'currentColor', strokeWidth = 2 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' }
  if (name === 'message') return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M20 14a3 3 0 0 1-3 3H9l-5 4V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7Z" /></svg>
  return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7" width="17" height="11" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M3.5 11.5h17" /></svg>
}

const Services = () => {
  const { services, loading } = useStore()

  const activeServices = services
    .filter((service) => service.active !== false)
    .map((service) => ({
      id: service.id,
      title: service.name,
      description: service.description,
      icon: iconLibrary[service.icon] || (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: accentByCategory(service.category),
      features: featuresForService(service.category),
      path: service.path || routeForService(service.name),
      category: service.category,
    }))

  const stats = [
    { value: `${activeServices.length}+`, label: 'Active Services' },
    { value: '24/7', label: 'Support Availability' },
    { value: 'Mobile', label: 'Friendly Contact Flow' },
  ]

  return (
    <>
      <SEO
        title="Our Services | AmitSolutionHub"
        description="Explore web development, technical support, repair, and creative services with a cleaner public presentation."
      />

      <PublicPageShell
        badge="Premium Solution Stack"
        title={
          <>
            Services that look
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> polished on every device </span>
            and explain value clearly
          </>
        }
        description="This page now uses a softer white-glow layout so service categories, trust cues, and contact paths feel more professional when someone reviews your company online."
        actions={[
          { label: 'Discuss a Requirement', to: '/contact', icon: <TabIcon name="message" /> },
          { label: 'See Projects', to: '/projects', variant: 'secondary', icon: <TabIcon name="briefcase" /> },
        ]}
        pills={['White-glow presentation', 'Trust-first service cards', 'Easy mobile browsing', 'Clear contact handoff']}
        stats={stats}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Client Impression</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">A cleaner services page makes the business feel more established</h3>
            </div>
            <div className="space-y-3">
              {[
                'Shorter, easier-to-scan service descriptions',
                'Consistent card layout for desktop and mobile',
                'Direct path from service interest to contact request',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-3xl border border-slate-200/80 bg-white/90 p-4">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm leading-6 text-slate-600">{point}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-bold text-slate-900">Good for AICTE review context</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Transparent service copy, support access, and visible company structure help the site appear more serious and organized.
              </p>
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          <PublicGlassCard className="space-y-5">
            <PublicSectionHeading
              badge="Service Catalogue"
              title="Choose the right support lane"
              description="Each service card focuses on what you offer, who it helps, and where the next action goes."
            />
          </PublicGlassCard>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-72 animate-pulse rounded-[30px] border border-white/80 bg-white/70" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeServices.map((service) => (
                <PublicGlassCard key={service.id} className="group flex h-full flex-col p-7">
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br text-white shadow-[0_18px_35px_-18px_rgba(15,23,42,0.45)] ${service.accent.iconBg}`}>
                      {service.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${service.accent.badge}`}>
                        {service.category || 'Professional Service'}
                      </div>
                      <h3 className="mt-3 text-2xl font-black text-slate-900">{service.title}</h3>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600">{service.description}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span key={feature} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Professional delivery</div>
                    <Link
                      to={service.path}
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 ${service.accent.action}`}
                    >
                      View Details
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </PublicGlassCard>
              ))}
            </div>
          )}

          <PublicGlassCard className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 p-7 sm:p-9">
                <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Custom Scope
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900">Need a tailored package instead of a standard service?</h3>
                <p className="text-sm leading-7 text-slate-600">
                  Share your requirement and we can shape a custom solution with the same structured, mobile-friendly presentation style.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.85)]">
                    Contact Us
                  </Link>
                  <Link to="/projects" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                    Explore Projects
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-7 sm:p-9">
                <div className="rounded-[28px] border border-white/90 bg-white/85 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)]">
                  <div className="text-sm font-bold text-slate-900">What clients usually expect</div>
                  <div className="mt-4 space-y-3">
                    {[
                      'Clear deliverables and practical timelines',
                      'Professional communication on mobile and desktop',
                      'Fast move from enquiry to execution',
                    ].map((point) => (
                      <div key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-sky-500" />
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
