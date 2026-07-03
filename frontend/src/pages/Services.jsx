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
  cloud: (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-5.834-2.554A6.75 6.75 0 005.25 9a4.5 4.5 0 00-3 6z" />
    </svg>
  ),
}

const accentByCategory = (category = '') => {
  const n = category.toLowerCase()
  if (n.includes('dev') || n.includes('web') || n.includes('mobile') || n.includes('app')) return {
    iconBg: 'from-blue-500 to-indigo-600',
    iconGlow: 'rgba(99,102,241,0.4)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    action: 'from-blue-600 to-indigo-600',
    dot: 'bg-blue-500',
    icon: '💻',
  }
  if (n.includes('design') || n.includes('creative') || n.includes('edit')) return {
    iconBg: 'from-rose-500 to-orange-500',
    iconGlow: 'rgba(244,63,94,0.4)',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    action: 'from-rose-600 to-orange-500',
    dot: 'bg-rose-500',
    icon: '🎨',
  }
  if (n.includes('cloud') || n.includes('devops') || n.includes('security') || n.includes('monitor')) return {
    iconBg: 'from-indigo-500 to-purple-600',
    iconGlow: 'rgba(99,102,241,0.4)',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    action: 'from-indigo-600 to-purple-600',
    dot: 'bg-indigo-500',
    icon: '☁️',
  }
  if (n.includes('market') || n.includes('seo') || n.includes('smm') || n.includes('ppc') || n.includes('content')) return {
    iconBg: 'from-amber-500 to-orange-500',
    iconGlow: 'rgba(245,158,11,0.4)',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    action: 'from-amber-500 to-orange-500',
    dot: 'bg-amber-500',
    icon: '📈',
  }
  if (n.includes('support') || n.includes('repair')) return {
    iconBg: 'from-violet-500 to-purple-600',
    iconGlow: 'rgba(139,92,246,0.4)',
    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
    action: 'from-violet-600 to-purple-600',
    dot: 'bg-violet-500',
    icon: '🛠️',
  }
  if (n.includes('manage') || n.includes('data') || n.includes('entry') || n.includes('analysis')) return {
    iconBg: 'from-teal-500 to-emerald-600',
    iconGlow: 'rgba(20,184,166,0.4)',
    badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
    action: 'from-teal-500 to-emerald-600',
    dot: 'bg-teal-500',
    icon: '📊',
  }
  if (n.includes('consult') || n.includes('business') || n.includes('technical') || n.includes('growth') || n.includes('audit') || n.includes('research')) return {
    iconBg: 'from-cyan-500 to-blue-600',
    iconGlow: 'rgba(6,182,212,0.4)',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20',
    action: 'from-cyan-500 to-blue-600',
    dot: 'bg-cyan-500',
    icon: '💡',
  }
  return {
    iconBg: 'from-slate-500 to-slate-600',
    iconGlow: 'rgba(100,116,139,0.4)',
    badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20',
    action: 'from-slate-500 to-slate-600',
    dot: 'bg-slate-500',
    icon: '📋',
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
  if (n.includes('dev') || n.includes('web') || n.includes('mobile') || n.includes('app')) return ['Responsive Design', 'SEO Optimized', 'Fast Deployment', 'Scalable Architecture']
  if (n.includes('design') || n.includes('creative') || n.includes('edit')) return ['Video Polish', 'Visual Cleanup', 'Brand Ready Output', 'Creative Excellence']
  if (n.includes('cloud') || n.includes('devops') || n.includes('security') || n.includes('monitor')) return ['Issue Diagnosis', 'System Cleanup', 'Practical Support', '24/7 Monitoring']
  if (n.includes('market') || n.includes('seo') || n.includes('smm') || n.includes('ppc') || n.includes('content')) return ['SEO Optimization', 'Social Media Management', 'Content Strategy', 'Performance Tracking']
  if (n.includes('support') || n.includes('repair')) return ['Issue Diagnosis', 'System Cleanup', 'Practical Support', 'Quick Response']
  if (n.includes('manage') || n.includes('data') || n.includes('entry') || n.includes('analysis')) return ['Website Management', 'Data Analysis', 'Research Support', 'Process Automation']
  if (n.includes('consult') || n.includes('business') || n.includes('technical') || n.includes('growth') || n.includes('audit') || n.includes('research')) return ['Business Consultation', 'Technical Architecture', 'Growth Hacking', 'Market Research']
  return ['Flexible Scope', 'Professional Guidance', 'Reliable Delivery', 'Quality Assured']
}

const processSteps = [
  { step: '01', title: 'Discovery', desc: 'We analyze your requirements, goals, and objectives to understand your vision.', icon: '🔍' },
  { step: '02', title: 'Strategy', desc: 'We create a detailed roadmap and technical architecture for your project.', icon: '📋' },
  { step: '03', title: 'Development', desc: 'Our expert team builds your solution using cutting-edge technologies.', icon: '⚙️' },
  { step: '04', title: 'Delivery', desc: 'We deploy, test, and launch your project with ongoing support.', icon: '🚀' },
]

const Services = () => {
  const { services, courses, courseCategories, loading } = useStore()

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
            Comprehensive IT Solutions for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Modern Business
            </span>
          </>
        }
        description="End-to-end software solutions, digital marketing, managed services, and strategic consultation — all under one roof. We transform ideas into powerful digital realities."
        actions={[
          { label: 'Start Your Project', to: '/contact' },
          { label: 'View Our Work', to: '/projects', variant: 'secondary' },
        ]}
        pills={['Web Development', 'Mobile Apps', 'Cloud & DevOps', 'Digital Marketing', 'Internships', 'Managed Services']}
        stats={stats}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">Why Choose Us</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
                Your trusted partner for digital transformation
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: '⚡', text: 'Fast turnaround with no compromise on quality' },
                { icon: '🎯', text: '360° solutions — design, develop, deploy, support' },
                { icon: '🔒', text: 'Transparent pricing with no hidden costs' },
                { icon: '📱', text: 'Mobile-first approach for modern audiences' },
                { icon: '🏢', text: 'MSME registered with in-house infrastructure' },
                { icon: '✅', text: 'AICTE approved with certified processes' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-white/8 dark:bg-white/4">
                  <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 dark:border-indigo-500/15 dark:from-indigo-500/8 dark:to-blue-500/5">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Internship & Training</div>
              <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                AICTE-approved internship programs with verified certificates, expert mentorship, and placement support.
              </p>
              <Link to="/courses" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Explore Programs →
              </Link>
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          {/* Hero Stats Banner */}
          <PublicGlassCard className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-violet-600/5 dark:from-blue-400/5 dark:via-indigo-400/5 dark:to-violet-400/5" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200/50 dark:divide-white/5">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 sm:p-8 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </PublicGlassCard>

          {/* Service Categories Overview */}
          <PublicGlassCard className="p-7 sm:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span>📋</span> What We Do
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                End-to-End Business Solutions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                To create impactful software and solutions used by global customers. We are also embracing Web 3.0 technologies to maintain best-in-class standards for our products.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  title: 'Design', 
                  items: ['Layout', 'Graphics Design', 'Logo & Branding', 'Product Design', 'Prototype', 'Video'],
                  icon: '🎨', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50 dark:bg-pink-500/5', border: 'border-pink-200/70 dark:border-pink-500/15'
                },
                { 
                  title: 'Development', 
                  items: ['Website', 'Mobile App', 'Browser Extension', 'Custom Scripts', 'Automation'],
                  icon: '💻', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-500/5', border: 'border-blue-200/70 dark:border-blue-500/15'
                },
                { 
                  title: 'DevOps & Cloud', 
                  items: ['DevOps', 'Cloud Management', 'Security Monitoring', 'Deployment', 'AWS', 'Kubernetes', 'Docker'],
                  icon: '☁️', color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 dark:bg-indigo-500/5', border: 'border-indigo-200/70 dark:border-indigo-500/15'
                },
                { 
                  title: 'Marketing', 
                  items: ['SEO', 'SMM', 'PPC', 'Content Writing', 'Email Marketing'],
                  icon: '📈', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/5', border: 'border-amber-200/70 dark:border-amber-500/15'
                },
                { 
                  title: 'Managed Services', 
                  items: ['Website Management', 'Affiliate Management', 'Web Research', 'Data Entry', 'Data Analysis'],
                  icon: '⚙️', color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50 dark:bg-teal-500/5', border: 'border-teal-200/70 dark:border-teal-500/15'
                },
                { 
                  title: 'Consultation', 
                  items: ['Business Consultation', 'Technical Architecture', 'Growth Hacking', 'Security Audits', 'Market Research'],
                  icon: '💡', color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50 dark:bg-cyan-500/5', border: 'border-cyan-200/70 dark:border-cyan-500/15'
                },
              ].map((cat, idx) => (
                <div key={idx} className={`rounded-2xl border ${cat.border} ${cat.bg} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{cat.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className={`h-1 w-1 rounded-full bg-gradient-to-r ${cat.color} shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PublicGlassCard>
          {/* Service Cards */}
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span>🛠️</span> Service Catalogue
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                Explore Our Services
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Each service is crafted to solve real problems. Click any card to learn more or get started right away.
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-[28px] border border-white/60 bg-white/50 dark:border-white/5 dark:bg-white/3" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {activeServices.map((service) => (
                  <PublicGlassCard
                    key={service.id}
                    className="group flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(99,102,241,0.25)]"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${service.accent.iconBg}`}
                        style={{ boxShadow: `0 12px 30px -8px ${service.accent.iconGlow}` }}
                      >
                        <span className="text-2xl">{service.accent.icon}</span>
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${service.accent.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${service.accent.dot}`} />
                          {service.category || 'Professional Service'}
                        </span>
                        <h3 className="mt-2.5 text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300 flex-1">
                      {service.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/8 dark:bg-white/4 dark:text-slate-400"
                        >
                          <span className={`h-1 w-1 rounded-full ${service.accent.dot}`} />
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100/80 pt-5 dark:border-white/6">
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
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
          </div>

          {/* How We Work */}
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span>🔄</span> Our Process
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                How We Deliver Excellence
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Our proven 4-step process ensures every project is delivered on time, on budget, and exceeds expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((item, idx) => (
                <div key={idx} className="relative text-center p-6">
                  {idx < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800" />
                  )}
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg mb-4 text-xl font-black">
                    {item.step}
                  </div>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Company Environment Section */}
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span>🏢</span> Our Environment
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                Built for Excellence
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Our in-house infrastructure is designed to foster innovation, collaboration, and delivery of world-class solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '🖥️',
                  title: 'High-Performance Workstations',
                  desc: 'Latest multi-core processors, DDR5 RAM, NVIDIA RTX GPUs, and ultrawide monitors for seamless development.',
                  color: 'from-blue-500 to-indigo-600'
                },
                {
                  icon: '☁️',
                  title: 'Cloud & Server Infrastructure',
                  desc: 'AWS-powered scalable servers with Kubernetes orchestration, automated CI/CD pipelines, and 99.99% uptime SLA.',
                  color: 'from-indigo-500 to-purple-600'
                },
                {
                  icon: '🔒',
                  title: 'Enterprise Security',
                  desc: 'Biometric access, E2E encryption, 24/7 security operations center, and intrusion detection systems.',
                  color: 'from-rose-500 to-red-600'
                },
                {
                  icon: '🌐',
                  title: 'Redundant High-Speed Network',
                  desc: 'Gigabit fiber-optic links, low-latency routing, global CDN, and enterprise VPN for seamless collaboration.',
                  color: 'from-teal-500 to-emerald-600'
                },
                {
                  icon: '📹',
                  title: 'Smart Conference Rooms',
                  desc: '4K video conferencing, interactive smart boards, wireless screen sharing, and HD audio for client demos.',
                  color: 'from-violet-500 to-purple-600'
                },
                {
                  icon: '🧪',
                  title: 'Testing & QA Labs',
                  desc: 'Dedicated testing environments, automated testing pipelines, and performance benchmarking tools.',
                  color: 'from-amber-500 to-orange-600'
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-slate-950/30 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg mb-4 text-xl`}>
                    {item.icon}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/infrastructure"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>View Full Infrastructure</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Technology Stack */}
          <PublicGlassCard className="p-7 sm:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span>⚡</span> Technology Stack
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                Cutting-Edge Technologies
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                We leverage modern, battle-tested technologies to build scalable, secure, and high-performance solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  category: 'Front End',
                  color: 'from-blue-500 to-indigo-600',
                  techs: ['Angular JS', 'TypeScript', 'React JS', 'Next JS', 'Vue JS', 'Tailwind CSS', 'Bootstrap', 'HTML5']
                },
                {
                  category: 'Backend',
                  color: 'from-emerald-500 to-teal-600',
                  techs: ['Node.js', 'Python', 'Java', 'PHP', 'MySQL', 'MongoDB', 'PostgreSQL', 'Firebase']
                },
                {
                  category: 'Mobile',
                  color: 'from-violet-500 to-purple-600',
                  techs: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS']
                },
                {
                  category: 'DevOps & Cloud',
                  color: 'from-indigo-500 to-blue-600',
                  techs: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Terraform']
                },
                {
                  category: 'CMS & E-Commerce',
                  color: 'from-pink-500 to-rose-600',
                  techs: ['WordPress', 'Shopify', 'WooCommerce', 'Magento', 'Strapi', 'Contentful']
                },
                {
                  category: 'Third Party Integrations',
                  color: 'from-amber-500 to-orange-500',
                  techs: ['REST APIs', 'GraphQL', 'WebSocket', 'OAuth', 'Stripe', 'Twilio', 'Socket.io']
                },
              ].map((stack, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-slate-950/30 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${stack.color}`} />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{stack.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.techs.map((tech, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-lg border border-slate-200/70 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-200 dark:hover:border-white/20 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PublicGlassCard>

          {/* CTA Banner */}
          <PublicGlassCard className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-[0.06] dark:opacity-[0.12]" />
            <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5 p-8 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Let's Build Together
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Ready to transform your business with technology?
                </h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                  From concept to deployment, our end-to-end services ensure your project is delivered with excellence. Let's discuss your requirements today.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span>Start a Project</span>
                    <span>→</span>
                  </Link>
                  <Link
                    to="/infrastructure"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-6 py-3 text-sm font-bold text-slate-700 hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    Our Infrastructure
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 via-indigo-50/50 to-white p-8 sm:p-10 dark:from-slate-900/50 dark:via-slate-900/30 dark:to-slate-900/50">
                <div className="rounded-2xl border border-white/90 bg-white/85 p-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.3)] dark:border-white/8 dark:bg-white/4 dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">What makes us different</div>
                  <div className="space-y-3">
                    {[
                      '360° in-house capabilities — no outsourcing',
                      'MSME registered with AICTE approved processes',
                      'End-to-end project ownership from design to deployment',
                      'Dedicated support teams for every service vertical',
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
