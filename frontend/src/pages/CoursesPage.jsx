import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'
import { formatEnrollmentDeadline, isEnrollmentClosed } from '../utils/enrollmentDeadline'
import { getLearningTypeLabel } from '../utils/learningType'

const PageIcon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  switch (name) {
    case 'book':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14H7.5A2.5 2.5 0 0 0 5 20V6.5Z" /><path d="M9 8h6M9 11h6" /></svg>
    case 'chat':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M20 14a3 3 0 0 1-3 3H9l-5 4V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7Z" /></svg>
    case 'search':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
    case 'mentor':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M4.5 18a4.5 4.5 0 0 1 9 0" /><path d="M16.5 7.5h4M18.5 5.5v4" /></svg>
    case 'clock':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
    default:
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="5" width="15" height="14" rx="2.2" /><path d="M8 9h8M8 12h8M8 15h5" /></svg>
  }
}

const getCategoryIconKey = (value = '') => {
  const normalized = String(value).toLowerCase()
  if (normalized.includes('ai')) return 'search'
  if (normalized.includes('web') || normalized.includes('develop')) return 'book'
  if (normalized.includes('trading') || normalized.includes('stock')) return 'search'
  return 'book'
}

export default function CoursesPage() {
  const { courses, courseCategories, isUserEnrolled } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [filterCat, setFilterCat] = useState('All')
  const [search, setSearch] = useState('')

  const published = useMemo(() => courses.filter((course) => course.published !== false), [courses])

  const filtered = useMemo(() => {
    return published.filter((course) => {
      const query = search.trim().toLowerCase()
      const matchCategory = filterCat === 'All' || course.category === filterCat
      const matchQuery =
        !query ||
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)

      return matchCategory && matchQuery
    })
  }, [filterCat, published, search])

  const allCategories = useMemo(() => {
    const categoryNames = [...new Set(published.map((course) => course.category).filter(Boolean))]
    return ['All', ...categoryNames]
  }, [published])

  const getCategoryMeta = (name) => {
    return courseCategories.find((category) => category.name === name)
  }

  const stats = [
    { value: `${published.length}+`, label: 'Published Programs' },
    { value: `${Math.max(allCategories.length - 1, 1)}`, label: 'Skill Tracks' },
    { value: '100%', label: 'Mobile Friendly Access' },
  ]

  const levelStyles = {
    Beginner: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Intermediate: 'border-amber-200 bg-amber-50 text-amber-700',
    Advanced: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return (
    <>
      <Helmet>
        <title>Courses | Amit Solution Hub</title>
        <meta
          name="description"
          content="Browse Amit Solution Hub courses and webinars with industry-focused learning paths, mentor support, and verifiable outcomes."
        />
      </Helmet>

      <PublicPageShell
        badge="Industry-Ready Learning"
        title={
          <>
            Choose a learning path that builds
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> real skills </span>
            for real careers
          </>
        }
        description="Browse structured courses and webinars with mentor support, clear outcomes, and a polished mobile-friendly experience from discovery to enrollment."
        actions={[
          { label: 'Browse Programs', to: '/courses#course-catalogue', icon: <PageIcon name="book" size={16} /> },
          { label: 'Contact for Guidance', to: '/contact', variant: 'secondary', icon: <PageIcon name="chat" size={16} /> },
        ]}
        pills={[
          'Mentor-guided roadmap',
          'Verifiable certificate flow',
          'Meeting link and material support',
          'Structured outcomes for internships',
        ]}
        stats={stats}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Why this helps</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Course details that feel clearer and more trustworthy</h3>
            </div>

            <div className="grid gap-3">
              {[
                { title: 'Transparent Structure', desc: 'Category, mentor, duration, pricing, and enrollment status remain easy to scan on every screen size.' },
                { title: 'Credible Presentation', desc: 'Clean cards, focused copy, and consistent spacing give the catalogue a more professional feel.' },
                { title: 'Student Clarity', desc: 'Learners can quickly understand what is included before they commit to a program.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.55)]">
                  <div className="text-sm font-bold text-slate-900">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Presentation Note</div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                We do not guarantee AICTE approval status; this layout is designed to present training details clearly, credibly, and in a way that is easier to verify.
              </p>
            </div>
          </div>
        }
      >
        <PublicSection id="course-catalogue" className="space-y-8">
          <PublicGlassCard className="space-y-6 p-5 sm:p-7">
            <PublicSectionHeading
              badge="Search and Filter"
              title="Find the right program faster"
              description="Use a simple search and category filter to shortlist the best course or webinar without losing context on mobile."
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, description, category, or instructor"
                  className="w-full rounded-[24px] border border-slate-200 bg-white px-12 py-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {allCategories.map((category) => {
                const isActive = filterCat === category
                const categoryMeta = getCategoryMeta(category)
                const count =
                  category === 'All'
                    ? published.length
                    : published.filter((course) => course.category === category).length

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilterCat(category)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'border-transparent bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.8)]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <PageIcon name={getCategoryIconKey(categoryMeta?.name || category)} size={14} />
                      {category}
                    </span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </PublicGlassCard>

          {filtered.length === 0 ? (
            <PublicGlassCard className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <PageIcon name="search" size={28} />
              </div>
              <h3 className="mt-5 text-2xl font-black text-slate-900">No programs matched your search</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Clear the current search or choose another category to view more options.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setFilterCat('All')
                }}
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.85)]"
              >
                Clear Filters
              </button>
            </PublicGlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course) => {
                const isEnrolled = currentUser ? isUserEnrolled(currentUser.uid, course.id) : false
                const isAvailableSoon = course.availableSoon === true
                const categoryMeta = getCategoryMeta(course.category)
                const planPrices = Array.isArray(course.plans) ? course.plans.map((plan) => Number(plan.price) || 0) : []
                const startingPrice = planPrices.length > 0 ? Math.min(...planPrices) : Number(course.price || 0)
                const enrollmentClosed = isEnrollmentClosed(course)
                const deadlineText = formatEnrollmentDeadline(course.enrollmentDeadline)
                const actionLabel = getLearningTypeLabel(course) === 'Webinar' ? 'Registration' : 'Enrollment'

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => navigate(`/courses/${course.slug || course.id}`)}
                    className="group overflow-hidden rounded-[30px] border border-white/90 bg-white/88 text-left shadow-[0_22px_60px_-34px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-100 hover:shadow-[0_28px_70px_-34px_rgba(37,99,235,0.32)]"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-5xl"
                          style={{ background: `linear-gradient(135deg, ${categoryMeta?.color || '#0284c7'}20, ${categoryMeta?.color || '#6366f1'}40)` }}
                        >
                          <PageIcon name={getCategoryIconKey(categoryMeta?.name || course.category)} size={44} color={categoryMeta?.color || '#0284c7'} />
                        </div>
                      )}

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {course.badge && (
                          <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                            {course.badge}
                          </span>
                        )}
                        {course.highlighted && (
                          <span className="rounded-full bg-amber-400/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
                            Featured
                          </span>
                        )}
                        {isEnrolled && (
                          <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                            Enrolled
                          </span>
                        )}
                        {!isEnrolled && isAvailableSoon && (
                          <span className="rounded-full bg-fuchsia-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                            Available Soon
                          </span>
                        )}
                        {!isEnrolled && !isAvailableSoon && enrollmentClosed && (
                          <span className="rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                            {actionLabel} Closed
                          </span>
                        )}
                      </div>

                      {Array.isArray(course.plans) && course.plans.length > 0 && (
                        <div className="absolute bottom-4 right-4 rounded-full border border-white/40 bg-slate-950/65 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                          {course.plans.length} plans
                        </div>
                      )}
                    </div>

                    <div className="space-y-5 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          {getLearningTypeLabel(course)}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                          <span className="inline-flex items-center gap-1.5">
                            <PageIcon name={getCategoryIconKey(categoryMeta?.name || course.category)} size={14} />
                            {course.category || 'General'}
                          </span>
                        </span>
                        {course.level && (
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${levelStyles[course.level] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                            {course.level}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-black leading-tight text-slate-900">{course.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>
                        {isAvailableSoon ? (
                          <p className="mt-3 text-xs font-semibold text-fuchsia-700">
                            {learningTypeLabel(course)}
                          </p>
                        ) : deadlineText && (
                          <p className={`mt-3 text-xs font-semibold ${enrollmentClosed ? 'text-rose-600' : 'text-amber-700'}`}>
                            {enrollmentClosed ? `${actionLabel} closed on ${deadlineText}` : `${actionLabel} closes on ${deadlineText}`}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="inline-flex items-center gap-1.5">
                            <PageIcon name="mentor" size={14} />
                            {course.instructor || 'Mentor Support'}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="inline-flex items-center gap-1.5">
                            <PageIcon name="clock" size={14} />
                            {course.duration || 'Flexible Schedule'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {Array.isArray(course.plans) && course.plans.length > 0 ? 'Starting At' : 'Fee'}
                          </div>
                          <div className="mt-1 text-2xl font-black text-slate-900">
                            {course.isFree ? 'FREE' : `₹${startingPrice.toLocaleString('en-IN')}`}
                          </div>
                        </div>

                        <div className={`inline-flex rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                          isEnrolled
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : enrollmentClosed
                              ? 'border border-rose-200 bg-rose-50 text-rose-700'
                              : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.85)]'
                        }`}>
                          {isEnrolled ? 'Continue' : enrollmentClosed ? `${actionLabel} Closed` : 'View Details'}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </PublicSection>
      </PublicPageShell>
    </>
  )
}

function learningTypeLabel(course) {
  const itemLabel = getLearningTypeLabel(course)
  return `${itemLabel} launching soon. Enrollment will open shortly.`
}
