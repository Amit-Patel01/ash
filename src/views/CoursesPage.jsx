'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  Clock3,
  Code2,
  GraduationCap,
  IndianRupee,
  MonitorPlay,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserRound,
  Video } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'
import { formatEnrollmentDeadline, isEnrollmentClosed } from '../utils/enrollmentDeadline'
import { getLearningTypeLabel } from '../utils/learningType'

const PageIcon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2 }) => {
  const icons = {
    book: BookOpen,
    certificate: BadgeCheck,
    clock: Clock3,
    code: Code2,
    currency: IndianRupee,
    mentor: UserRound,
    search: Search,
    settings: SlidersHorizontal,
    spark: Sparkles,
    trending: TrendingUp,
    video: Video }
  const Icon = icons[name] || GraduationCap
  return <Icon aria-hidden="true" size={size} color={color} strokeWidth={strokeWidth} />
}

const getCategoryIconKey = (value = '') => {
  const normalized = String(value).toLowerCase()
  if (normalized.includes('ai') || normalized.includes('data')) return 'spark'
  if (normalized.includes('web') || normalized.includes('develop') || normalized.includes('code')) return 'code'
  if (normalized.includes('trading') || normalized.includes('stock') || normalized.includes('market')) return 'trending'
  if (normalized.includes('webinar') || normalized.includes('live')) return 'video'
  return 'book'
}

const getInstructorDisplayName = (instructor, fallback = 'Mentor Support') => {
  if (!instructor) return fallback
  if (typeof instructor === 'string') return instructor.trim() || fallback
  if (typeof instructor === 'object') return instructor.name || instructor.displayName || instructor.title || fallback
  return String(instructor) || fallback
}

export default function CoursesPage() {
  const { courses, courseCategories, isUserEnrolled, loading } = useStore()
  const { currentUser } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const searchParams = useSearchParams()
  const [filterCat, setFilterCat] = useState(() => searchParams.get('domain') || 'All')
  const [search, setSearch] = useState('')

  // Sync filterCat when query param changes (e.g. clicking domain from Programs page)
  useEffect(() => {
    const domain = searchParams.get('domain')
    if (domain) setFilterCat(domain)
    else setFilterCat('All')
  }, [searchParams])

  const published = useMemo(() => courses.filter((course) => course.published !== false), [courses])

  const filtered = useMemo(() => {
    return published.filter((course) => {
      const query = search.trim().toLowerCase()
      const matchCategory = filterCat === 'All' || course.category === filterCat
      const matchQuery =
        !query ||
        String(course.title || '').toLowerCase().includes(query) ||
        String(course.description || '').toLowerCase().includes(query) ||
        String(course.category || '').toLowerCase().includes(query) ||
        getInstructorDisplayName(course.instructor, '').toLowerCase().includes(query)

      return matchCategory && matchQuery
    })
  }, [filterCat, published, search])

  const allCategories = useMemo(() => {
    const categoryNames = [...new Set(published.map((course) => course.category).filter(Boolean))]
    return ['All', ...categoryNames]
  }, [published])

  const categorySummaries = useMemo(() => {
    const counts = new Map()
    published.forEach((course) => {
      const category = course.category || 'General'
      counts.set(category, (counts.get(category) || 0) + 1)
    })
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 4)
  }, [published])

  const featuredCourse = useMemo(() => (
    published.find((course) => course.highlighted) || published[0] || null
  ), [published])

  const getCategoryMeta = (name) => {
    return courseCategories.find((category) => category.name === name)
  }

  const totalPlans = published.reduce((sum, course) => (
    sum + (Array.isArray(course.plans) && course.plans.length > 0 ? course.plans.length : 1)
  ), 0)

  const stats = [
    { value: published.length, label: 'Programs' },
    { value: Math.max(allCategories.length - 1, 0), label: 'Skill Tracks' },
    { value: totalPlans, label: 'Plans' },
  ]

  const levelStyles = {
    Beginner: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Intermediate: 'border-amber-200 bg-amber-50 text-amber-700',
    Advanced: 'border-rose-200 bg-rose-50 text-rose-700' }

  return (
    <>
            <div className="pt-8 lg:pt-12">

        <section id="course-catalogue" className="mx-auto w-full max-w-7xl space-y-7 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className={`rounded-[30px] border p-4 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-5 ${isDark ? 'border-white/5 bg-slate-900/60 shadow-slate-950/40' : 'border-white/85 bg-white/[0.92]'}`}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search aria-hidden="true" size={20} />
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by course, category, or instructor"
                  className={`h-14 w-full rounded-2xl border px-12 text-sm font-semibold outline-none transition-all placeholder:font-medium ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-sky-950/50' : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:ring-sky-100'}`}
                />
              </label>

              <div className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <SlidersHorizontal aria-hidden="true" size={16} />
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-black transition-all duration-300 ${
                      isActive
                        ? isDark
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-[0_12px_24px_rgba(99,102,241,0.3)]'
                          : 'border-slate-955 bg-slate-950 text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.9)]'
                        : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <PageIcon name={getCategoryIconKey(categoryMeta?.name || category)} size={14} />
                      {category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? 'bg-white/15 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {loading && published.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[430px] animate-pulse rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_58px_-42px_rgba(15,23,42,0.55)]">
                  <div className="h-48 rounded-t-[30px] bg-slate-100" />
                  <div className="space-y-4 p-5">
                    <div className="h-4 w-32 rounded-full bg-slate-100" />
                    <div className="h-7 w-4/5 rounded-full bg-slate-100" />
                    <div className="h-16 rounded-2xl bg-slate-100" />
                    <div className="h-12 rounded-2xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/[0.82] px-5 py-16 text-center shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <PageIcon name="search" size={28} />
              </div>
              <h3 className="mt-5 text-2xl font-black text-slate-950">No programs matched your search</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Clear filters to see the complete course catalogue.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setFilterCat('All')
                }}
                className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_18px_38px_-24px_rgba(15,23,42,0.85)]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course) => {
                const isEnrolled = currentUser ? isUserEnrolled(currentUser.uid, course.id) : false
                const isAvailableSoon = course.availableSoon === true || !course.plans || course.plans.length === 0
                const categoryMeta = getCategoryMeta(course.category)
                const planPrices = Array.isArray(course.plans) ? course.plans.map((plan) => Number(plan.price) || 0) : []
                const startingPrice = planPrices.length > 0 ? Math.min(...planPrices) : Number(course.price || 0)
                const isFree = course.isFree || startingPrice <= 0
                const enrollmentClosed = isEnrollmentClosed(course)
                const deadlineText = formatEnrollmentDeadline(course.enrollmentDeadline)
                const learningType = getLearningTypeLabel(course)
                const actionLabel = getLearningTypeLabel(course) === 'Webinar' ? 'Registration' : 'Enrollment'

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug || course.id}`}
                    className={`group flex h-full flex-col overflow-hidden rounded-[30px] border text-left shadow-[0_22px_60px_-42px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 ${isDark ? 'border-slate-800 bg-slate-900/60 shadow-slate-950/50 hover:border-indigo-500/40 hover:shadow-[0_28px_80px_-46px_rgba(99,102,241,0.25)]' : 'border-slate-200/80 bg-white hover:border-sky-200 hover:shadow-[0_28px_80px_-46px_rgba(37,99,235,0.5)]'}`}
                  >
                    <div className={`relative aspect-[16/10] overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: isDark ? `linear-gradient(135deg, ${categoryMeta?.color || '#0284c7'}22, #0f172a 48%, ${categoryMeta?.color || '#0f766e'}32)` : `linear-gradient(135deg, ${categoryMeta?.color || '#0284c7'}18, #f8fafc 48%, ${categoryMeta?.color || '#0f766e'}28)` }}
                      >
                        <PageIcon name={getCategoryIconKey(categoryMeta?.name || course.category)} size={44} color={categoryMeta?.color || '#0284c7'} />
                      </div>
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="relative z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.hidden = true
                          }}
                        />
                      ) : null}

                      <div className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />

                      <div className="absolute left-4 top-4 z-30 flex flex-wrap gap-2">
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
                        {!isEnrolled && !isAvailableSoon && !enrollmentClosed && deadlineText && deadlineText !== 'Open' && (
                          <span className="rounded-full bg-amber-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-950 flex items-center gap-1 shadow-md">
                            ⏳ Closes: {deadlineText}
                          </span>
                        )}
                      </div>

                      {Array.isArray(course.plans) && course.plans.length > 0 && (
                        <div className="absolute bottom-4 right-4 z-30 rounded-full border border-white/40 bg-slate-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                          {course.plans.length} plans
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${isDark ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-cyan-100 bg-cyan-50 text-cyan-700'}`}>
                          <PageIcon name={learningType === 'Webinar' ? 'video' : 'book'} size={13} />
                          {learningType}
                        </span>
                        <span className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                          <PageIcon name={getCategoryIconKey(categoryMeta?.name || course.category)} size={13} />
                          <span className="truncate">{course.category || 'General'}</span>
                        </span>
                        {course.level && (
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : levelStyles[course.level] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                            {course.level}
                          </span>
                        )}
                      </div>

                      <div className="mt-5">
                        <h3 className={`line-clamp-2 min-h-[3.25rem] text-xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-955'}`}>{course.title}</h3>
                        <p className={`mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{course.description}</p>
                        {isAvailableSoon ? (
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-400">
                            <CalendarClock aria-hidden="true" size={14} />
                            {learningTypeLabel(course)}
                          </p>
                        ) : deadlineText && (
                          <p className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold ${enrollmentClosed ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            <CalendarClock aria-hidden="true" size={14} />
                            {enrollmentClosed ? `${actionLabel} closed on ${deadlineText}` : `${actionLabel} closes on ${deadlineText}`}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                        <div className={`min-w-0 rounded-2xl border px-3 py-2.5 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                          <span className="inline-flex max-w-full items-center gap-1.5">
                            <PageIcon name="mentor" size={14} />
                            <span className="truncate">{getInstructorDisplayName(course.instructor)}</span>
                          </span>
                        </div>
                        <div className={`min-w-0 rounded-2xl border px-3 py-2.5 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                          <span className="inline-flex max-w-full items-center gap-1.5">
                            <PageIcon name="clock" size={14} />
                            <span className="truncate">{course.duration || 'Flexible Schedule'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                        {!isFree ? (
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                              {Array.isArray(course.plans) && course.plans.length > 0 ? 'Starting At' : 'Fee'}
                            </div>
                            <div className={`mt-1 flex items-center gap-1 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-955'}`}>
                              <IndianRupee aria-hidden="true" size={21} strokeWidth={3} />
                              {startingPrice.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black transition-all duration-300 ${
                          isEnrolled
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : enrollmentClosed
                              ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                              : isDark
                                ? 'bg-indigo-600 text-white shadow-[0_12px_24px_rgba(99,102,241,0.25)] hover:bg-indigo-500'
                                : 'bg-slate-950 text-white shadow-[0_16px_32px_-20px_rgba(15,23,42,0.88)]'
                        }`}>
                          {isEnrolled ? 'Continue' : enrollmentClosed ? `${actionLabel} Closed` : 'View Details'}
                          {!enrollmentClosed && <ArrowRight aria-hidden="true" size={16} />}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

          )}
        </section>
      </div>
    </>
  )
}

function learningTypeLabel(course) {
  const itemLabel = getLearningTypeLabel(course)
  return `${itemLabel} launching soon. Enrollment will open shortly.`
}
