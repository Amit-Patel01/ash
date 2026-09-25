'use client'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'
import {
  Code2,
  Laptop,
  Palette,
  CloudLightning,
  TrendingUp,
  Wrench,
  BarChart3,
  Lightbulb,
  Layers,
  ShieldCheck,
  Cpu,
  Globe,
  Rocket,
  Zap,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Monitor,
  Server,
  Lock,
  Headphones,
  FileCheck2
} from 'lucide-react'

// Category accents with crisp SVG icon components instead of emojis
const accentByCategory = (category = '') => {
  const n = category.toLowerCase()
  if (n.includes('dev') || n.includes('web') || n.includes('mobile') || n.includes('app')) return {
    iconBg: 'from-blue-500 to-indigo-600',
    iconGlow: 'rgba(99,102,241,0.4)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    action: 'from-blue-600 to-indigo-600',
    dot: 'bg-blue-500',
    Icon: Laptop,
  }
  if (n.includes('design') || n.includes('creative') || n.includes('edit')) return {
    iconBg: 'from-rose-500 to-orange-500',
    iconGlow: 'rgba(244,63,94,0.4)',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    action: 'from-rose-600 to-orange-500',
    dot: 'bg-rose-500',
    Icon: Palette,
  }
  if (n.includes('cloud') || n.includes('devops') || n.includes('security') || n.includes('monitor')) return {
    iconBg: 'from-indigo-500 to-purple-600',
    iconGlow: 'rgba(99,102,241,0.4)',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    action: 'from-indigo-600 to-purple-600',
    dot: 'bg-indigo-500',
    Icon: CloudLightning,
  }
  if (n.includes('market') || n.includes('seo') || n.includes('smm') || n.includes('ppc') || n.includes('content')) return {
    iconBg: 'from-amber-500 to-orange-500',
    iconGlow: 'rgba(245,158,11,0.4)',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    action: 'from-amber-500 to-orange-500',
    dot: 'bg-amber-500',
    Icon: TrendingUp,
  }
  if (n.includes('support') || n.includes('repair')) return {
    iconBg: 'from-violet-500 to-purple-600',
    iconGlow: 'rgba(139,92,246,0.4)',
    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
    action: 'from-violet-600 to-purple-600',
    dot: 'bg-violet-500',
    Icon: Wrench,
  }
  if (n.includes('manage') || n.includes('data') || n.includes('entry') || n.includes('analysis')) return {
    iconBg: 'from-teal-500 to-emerald-600',
    iconGlow: 'rgba(20,184,166,0.4)',
    badge: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
    action: 'from-teal-500 to-emerald-600',
    dot: 'bg-teal-500',
    Icon: BarChart3,
  }
  if (n.includes('consult') || n.includes('business') || n.includes('technical') || n.includes('growth') || n.includes('audit') || n.includes('research')) return {
    iconBg: 'from-cyan-500 to-blue-600',
    iconGlow: 'rgba(6,182,212,0.4)',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20',
    action: 'from-cyan-500 to-blue-600',
    dot: 'bg-cyan-500',
    Icon: Lightbulb,
  }
  return {
    iconBg: 'from-slate-500 to-slate-600',
    iconGlow: 'rgba(100,116,139,0.4)',
    badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20',
    action: 'from-slate-500 to-slate-600',
    dot: 'bg-slate-500',
    Icon: Layers,
  }
}

// 4-Step Process with SVG icons
const processSteps = [
  {
    step: '01',
    Icon: Search,
    title: 'Requirement Analysis',
    desc: 'We map your goals, define scope, select tech stack & outline clear deliverables.',
  },
  {
    step: '02',
    Icon: Code2,
    title: 'Agile Architecture & Dev',
    desc: 'Modular development using React, Node.js, and cloud native microservices.',
  },
  {
    step: '03',
    Icon: ShieldCheck,
    title: 'QA & Security Testing',
    desc: 'Automated test pipelines, performance auditing & vulnerability scans.',
  },
  {
    step: '04',
    Icon: Rocket,
    title: 'Deployment & Support',
    desc: 'Seamless cloud deployment, monitoring & round-the-clock maintenance.',
  },
]

// Environment features with SVG icons
const environmentFeatures = [
  {
    Icon: Monitor,
    title: 'High-Performance Workstations',
    desc: 'Multi-core processors, DDR5 RAM, NVIDIA RTX GPUs, and ultrawide displays for engineering excellence.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    Icon: Server,
    title: 'Hybrid Cloud Infrastructure',
    desc: 'High-speed fiber connectivity, dedicated local dev servers, and automated cloud backup pipelines.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    Icon: Lock,
    title: 'Enterprise Security Protocols',
    desc: 'Biometric access control, encrypted storage, isolated network zones, and continuous monitoring.',
    color: 'from-emerald-500 to-teal-600',
  },
]

export default function Services() {
  const { services, loading } = useStore()
  const activeServices = (services || []).map((s) => ({
    ...s,
    accent: accentByCategory(s.category || s.title || ''),
  }))

  return (
    <PublicPageShell hideHeader>
      <SEO 
        title="Our Services - Web Development, Cloud & Tech Solutions | Ashnexa Systems" 
        description="Explore end-to-end software development, UI/UX design, cloud infrastructure, and technical consulting services delivered by Ashnexa Systems." 
      />
      
      {/* ── TOP HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-200/80 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Enterprise Digital & Tech Services</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Build, Scale & Innovate With <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Ashnexa Systems</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto mt-6">
            From custom web applications to scalable cloud infrastructure, we deliver high-impact software solutions tailored for modern businesses.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/custom-project"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:scale-105 transition-all cursor-pointer"
            >
              <span>Request Custom Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-indigo-500" />
              <span>Free Tech Consultation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <PublicSection className="py-12">
        <div className="space-y-16">
          <PublicSectionHeading
            badge="Solutions Catalog"
            title="Our Specialized Engineering Services"
            description="High-performance technical capabilities designed to solve complex business problems with speed and precision."
          />

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-[28px] border border-white/60 bg-white/50 dark:border-white/5 dark:bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {activeServices.map((service) => {
                const IconComponent = service.accent.Icon
                return (
                  <PublicGlassCard
                    key={service.id}
                    className="group relative flex flex-col justify-between p-8 rounded-[32px] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500/30"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div
                          className={`relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${service.accent.iconBg}`}
                          style={{ boxShadow: `0 12px 30px -8px ${service.accent.iconGlow}` }}
                        >
                          <IconComponent className="w-7 h-7" />
                          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${service.accent.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${service.accent.dot}`} />
                          {service.category || 'Professional Service'}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {service.title}
                      </h3>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">
                        {service.description}
                      </p>

                      {/* Feature Pills */}
                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                          {service.features.map((feat) => (
                            <span
                              key={feat}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between mt-auto">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Production Ready
                      </span>
                      <Link
                        to={service.path || '/custom-project'}
                        className={`group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 ${service.accent.action}`}
                        style={{ boxShadow: `0 8px 20px -6px ${service.accent.iconGlow}` }}
                      >
                        <span>Explore Service</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </PublicGlassCard>
                )
              })}
            </div>
          )}
        </div>
      </PublicSection>

      {/* 4-Step Delivery Process */}
      <PublicSection className="py-16 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="space-y-16">
          <PublicSectionHeading
            badge="Engineering Methodology"
            title="How We Deliver Excellence"
            description="A structured, transparent engineering process designed to take your ideas from concept to live production smoothly."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {processSteps.map((item, idx) => {
              const StepIcon = item.Icon
              return (
                <div key={idx} className="relative text-center p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10 shadow-lg">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl mb-6">
                    <StepIcon className="w-8 h-8" />
                    <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-white/20">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </PublicSection>

      {/* Tech Infrastructure Section */}
      <PublicSection className="py-16">
        <div className="space-y-12">
          <PublicSectionHeading
            badge="Infrastructure & Reliability"
            title="Built for Enterprise Scale"
            description="Our engineering environment and cloud architecture ensure high availability, data privacy, and rapid deployment."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {environmentFeatures.map((feat, idx) => {
              const FeatIcon = feat.Icon
              return (
                <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10 shadow-lg hover:shadow-xl transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shadow-md mb-6`}>
                    <FeatIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </PublicSection>

    </PublicPageShell>
  )
}
