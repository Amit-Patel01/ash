import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Code2,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Video,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'

const getDomainIcon = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('ai') || n.includes('data') || n.includes('ml')) return Sparkles
  if (n.includes('web') || n.includes('develop') || n.includes('code') || n.includes('program')) return Code2
  if (n.includes('trading') || n.includes('stock') || n.includes('market') || n.includes('finance')) return TrendingUp
  if (n.includes('webinar') || n.includes('live') || n.includes('workshop')) return Video
  if (n.includes('certif')) return BadgeCheck
  return BookOpen
}

const GRADIENTS = [
  ['from-violet-500 to-purple-600', 'bg-violet-50 border-violet-200', 'text-violet-700'],
  ['from-blue-500 to-indigo-600', 'bg-blue-50 border-blue-200', 'text-blue-700'],
  ['from-emerald-500 to-teal-600', 'bg-emerald-50 border-emerald-200', 'text-emerald-700'],
  ['from-amber-500 to-orange-600', 'bg-amber-50 border-amber-200', 'text-amber-700'],
  ['from-pink-500 to-rose-600', 'bg-pink-50 border-pink-200', 'text-pink-700'],
  ['from-cyan-500 to-sky-600', 'bg-cyan-50 border-cyan-200', 'text-cyan-700'],
  ['from-lime-500 to-green-600', 'bg-lime-50 border-lime-200', 'text-lime-700'],
  ['from-fuchsia-500 to-pink-600', 'bg-fuchsia-50 border-fuchsia-200', 'text-fuchsia-700'],
]

export default function ProgramsPage() {
  const { courses, courseCategories, loading } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const published = useMemo(() => courses.filter(c => c.published !== false), [courses])

  const domains = useMemo(() => {
    const map = new Map()
    published.forEach(course => {
      const cat = course.category || 'General'
      if (!map.has(cat)) map.set(cat, { count: 0, courses: [] })
      map.get(cat).count++
      map.get(cat).courses.push(course)
    })

    return [...map.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, info], idx) => {
        const meta = courseCategories.find(c => c.name === name)
        return {
          name,
          count: info.count,
          courses: info.courses,
          description: meta?.description || `Explore ${info.count} course${info.count !== 1 ? 's' : ''} in ${name}`,
          gradient: GRADIENTS[idx % GRADIENTS.length],
          Icon: getDomainIcon(name),
        }
      })
  }, [published, courseCategories])

  const totalCourses = published.length

  return (
    <>
      <Helmet>
        <title>Programs | Amit Solution Hub</title>
        <meta
          name="description"
          content="Explore all learning domains and programs at Amit Solution Hub. Choose your skill track and start your journey today."
        />
      </Helmet>

      <div className="pt-24 lg:pt-28" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-indigo-500' : 'bg-blue-400'}`} />
          <div className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-purple-500' : 'bg-violet-400'}`} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest mb-6 ${isDark ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
            <GraduationCap size={14} />
            Learning Programs
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Learning Path
            </span>
          </h1>

          <p className={`text-lg max-w-2xl mx-auto mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Pick a domain that matches your goals. Each program offers structured courses, hands-on projects, and industry-recognized certificates.
          </p>

          <div className="inline-flex items-center gap-12">
            {[
              { value: totalCourses, label: 'Total Courses' },
              { value: domains.length, label: 'Domains' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-widest mt-1 text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domain Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        {loading && domains.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-60 animate-pulse rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`} />
            ))}
          </div>
        ) : domains.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-32 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <GraduationCap size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-semibold">No programs available yet</p>
            <p className="text-sm mt-2 opacity-70">Check back soon for exciting new learning programs!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => {
              const [gradClass, badgeBg, badgeText] = domain.gradient
              const DomainIcon = domain.Icon
              const preview = domain.courses.slice(0, 3)

              return (
                <Link
                  key={domain.name}
                  to={`/courses?domain=${encodeURIComponent(domain.name)}`}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isDark
                      ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:shadow-black/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-slate-200/80'
                  }`}
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${gradClass}`} />

                  <div className="flex flex-col gap-5 p-6 h-full">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradClass} shadow-lg`}>
                        <DomainIcon size={26} className="text-white" />
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : `${badgeBg} ${badgeText} border`}`}>
                        {domain.count} Course{domain.count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div>
                      <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {domain.name}
                      </h2>
                      <p className={`text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {domain.description}
                      </p>
                    </div>

                    {preview.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {preview.map(course => (
                          <span
                            key={course.id || course._id || course.title}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold max-w-[160px] truncate ${
                              isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {course.title}
                          </span>
                        ))}
                        {domain.count > 3 && (
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isDark ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                            +{domain.count - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`mt-auto flex items-center gap-2 text-sm font-black transition-all duration-300 group-hover:gap-3 ${isDark ? 'text-indigo-400' : 'text-blue-600'}`}>
                      Explore Courses
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className={`py-16 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Not sure where to start?
          </h2>
          <p className={`text-base mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Browse all courses or chat with our team to find the right program for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Browse All Courses
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/chat"
              className={`inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 ${
                isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              Chat with Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
