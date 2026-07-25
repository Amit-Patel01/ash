import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CourseEnrollModal from '../components/CourseEnrollModal'
import VerifiedCertificateSection from '../components/VerifiedCertificateSection'
import { CategoryIcon } from '../utils/CategoryIcon'
import { formatEnrollmentDeadline, isEnrollmentClosed, isPlanEnrollmentClosed } from '../utils/enrollmentDeadline'
import { getLearningTypeLabel, normalizeLearningType } from '../utils/learningType'

// Intersection observer hook
function useInView() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(e.target) } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const fade = () => 'transition-all duration-700 opacity-100 translate-y-0'

const parseList = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

const LEVEL_COLORS = { Beginner: 'bg-emerald-100 text-emerald-700', Intermediate: 'bg-amber-100 text-amber-700', Advanced: 'bg-red-100 text-red-700' }

const normalize = (value) => String(value || '').trim().toLowerCase()
const INSTRUCTOR_SYSTEM_ROLES = new Set(['admin', 'employee', 'mentor', 'instructor'])

const scoreInstructorMatch = (item, directCourseIdentities = [], fallbackCourseIdentities = []) => {
  if (!item) return -1

  const directItemIdentities = [item?.uid, item?.id, item?.employeeId, item?.email]
    .filter(Boolean)
    .map(normalize)
  const fallbackItemIdentities = [item?.displayName, item?.name]
    .filter(Boolean)
    .map(normalize)
  const normalizedRole = normalize(item?.role || item?.jobTitle)

  let score = 0

  if (directItemIdentities.some((identity) => directCourseIdentities.includes(identity))) score += 100
  if (fallbackItemIdentities.some((identity) => fallbackCourseIdentities.includes(identity))) score += 25
  if (INSTRUCTOR_SYSTEM_ROLES.has(normalizedRole)) score += 20
  if (item?.employeeId) score += 10
  if (item?.showOnTeam) score += 5

  return score
}

const pickBestInstructorMatch = (items = [], directCourseIdentities = [], fallbackCourseIdentities = []) =>
  items
    .map((item, index) => ({
      item,
      index,
      score: scoreInstructorMatch(item, directCourseIdentities, fallbackCourseIdentities),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.item || null

const formatInstructorRole = (value, itemLabel) => {
  const rawValue = String(value || '').trim()
  if (!rawValue) return `${itemLabel} Instructor`

  switch (normalize(rawValue)) {
    case 'employee':
    case 'mentor':
    case 'instructor':
    case 'student':
      return `${itemLabel} Instructor`
    case 'admin':
      return 'Lead Instructor'
    default:
      return rawValue
  }
}

const getInstructorImage = (instructor) => {
  if (!instructor) return ''
  if (instructor.photoURL) return instructor.photoURL
  if (instructor.avatarUrl) return instructor.avatarUrl
  if (instructor.avatar) return instructor.avatar
  if (instructor.avatarSource === 'custom' && instructor.customImageUrl) return instructor.customImageUrl

  let githubValue = instructor.github
  if (githubValue) {
    if (githubValue.startsWith('http')) {
      if (!githubValue.endsWith('.png')) {
        githubValue = githubValue.replace(/\/$/, '')
        return `${githubValue}.png`
      }
      return githubValue
    }
    return `https://github.com/${githubValue}.png`
  }

  if (instructor.avatarSource === 'linkedin' && instructor.linkedin && !instructor.linkedin.includes('linkedin.com')) {
    return instructor.linkedin
  }

  return ''
}

const getInstructorLinks = (instructor) => {
  if (!instructor) return []

  const links = []

  if (instructor.github) {
    links.push({
      label: 'GitHub',
      href: instructor.github.startsWith('http') ? instructor.github : `https://github.com/${instructor.github}`,
    })
  }

  if (instructor.linkedin) {
    links.push({
      label: 'LinkedIn',
      href: instructor.linkedin.startsWith('http') ? instructor.linkedin : `https://linkedin.com/in/${instructor.linkedin}`,
    })
  }

  if (instructor.portfolio) {
    links.push({
      label: 'Portfolio',
      href: instructor.portfolio.startsWith('http') ? instructor.portfolio : `https://${instructor.portfolio}`,
    })
  }

  return links
}

const resolveInstructorProfile = (course, users = [], teamMembers = []) => {
  const directCourseIdentities = [course?.assignedEmployeeId, course?.assignedEmployeeRef]
    .filter(Boolean)
    .map(normalize)
  const fallbackCourseIdentities = [course?.assignedEmployeeName, course?.instructor]
    .filter(Boolean)
    .map(normalize)
  const courseIdentities = [...directCourseIdentities, ...fallbackCourseIdentities]

  if (courseIdentities.length === 0) {
    return { instructor: null, publicProfileId: '' }
  }

  const userMatch = pickBestInstructorMatch(users, directCourseIdentities, fallbackCourseIdentities)
  const teamMatch = pickBestInstructorMatch(teamMembers, directCourseIdentities, fallbackCourseIdentities)

  if (!userMatch && !teamMatch) {
    return { instructor: null, publicProfileId: '' }
  }

  const primaryMatch = pickBestInstructorMatch(
    [teamMatch, userMatch].filter(Boolean),
    directCourseIdentities,
    fallbackCourseIdentities
  )
  const secondaryMatch = primaryMatch === userMatch ? teamMatch : userMatch
  const resolvedJobTitle =
    primaryMatch?.jobTitle ||
    secondaryMatch?.jobTitle ||
    primaryMatch?.role ||
    secondaryMatch?.role ||
    ''

  const instructor = {
    ...secondaryMatch,
    ...primaryMatch,
    displayName:
      primaryMatch?.displayName ||
      secondaryMatch?.displayName ||
      primaryMatch?.name ||
      secondaryMatch?.name ||
      course?.assignedEmployeeName ||
      course?.instructor ||
      'Instructor',
    name:
      primaryMatch?.name ||
      secondaryMatch?.name ||
      primaryMatch?.displayName ||
      secondaryMatch?.displayName ||
      course?.assignedEmployeeName ||
      course?.instructor ||
      'Instructor',
    email: primaryMatch?.email || secondaryMatch?.email || '',
    employeeId: primaryMatch?.employeeId || secondaryMatch?.employeeId || '',
    uid: primaryMatch?.uid || secondaryMatch?.uid || '',
    department: primaryMatch?.department || secondaryMatch?.department || '',
    jobTitle: resolvedJobTitle,
    role: resolvedJobTitle,
    bio: primaryMatch?.bio || secondaryMatch?.bio || '',
    experience: primaryMatch?.experience || secondaryMatch?.experience || '',
    github: primaryMatch?.github || secondaryMatch?.github || '',
    linkedin: primaryMatch?.linkedin || secondaryMatch?.linkedin || '',
    portfolio: primaryMatch?.portfolio || secondaryMatch?.portfolio || '',
    avatar: primaryMatch?.avatar || secondaryMatch?.avatar || '',
    photoURL: primaryMatch?.photoURL || secondaryMatch?.photoURL || '',
    avatarUrl: primaryMatch?.avatarUrl || secondaryMatch?.avatarUrl || '',
    avatarSource: primaryMatch?.avatarSource || secondaryMatch?.avatarSource || '',
    customImageUrl: primaryMatch?.customImageUrl || secondaryMatch?.customImageUrl || '',
  }

  const publicProfileId = encodeURIComponent(
    instructor.uid ||
    instructor.employeeId ||
    teamMatch?.id ||
    instructor.email ||
    instructor.displayName ||
    'team-member'
  )

  return { instructor, publicProfileId }
}

/* ── Shared, purely presentational className helpers (no behavior) ── */
const sectionHeading = (isDark) => `text-3xl md:text-5xl font-extrabold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`
const gradientText = 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-400 dark:to-blue-400'
const checkIcon = (cls) => (
  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { courses, courseCategories, users, teamMembers, isUserEnrolled, enrollments } = useStore()
  const { currentUser, isAdmin, isEmployee } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')

  const [heroRef, heroVisible] = useInView()
  const [featRef, featVisible] = useInView()
  const [planRef, planVisible] = useInView()

  // Find course by slug or id
  const course = courses.find(c => c.slug === slug || c.id === slug)

  useEffect(() => {
    if (courses.length > 0 && !course) navigate('/courses', { replace: true })
  }, [courses, course, navigate])

  const catMeta = courseCategories.find(c => c.name === course?.category)
  const learningType = normalizeLearningType(course)
  const itemLabel = getLearningTypeLabel(course)
  const assignedEmployeeIds = [course?.assignedEmployeeId, course?.assignedEmployeeRef].filter(Boolean)
  const { instructor, publicProfileId } = resolveInstructorProfile(course, users, teamMembers)

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading course...</p>
        </div>
      </div>
    )
  }
  const instructorImage = getInstructorImage(instructor)
  const instructorLinks = getInstructorLinks(instructor)
  const instructorName =
    instructor?.displayName ||
    instructor?.name ||
    course.assignedEmployeeName ||
    course.instructor ||
    `${itemLabel} Instructor`
  const instructorRole = formatInstructorRole(instructor?.jobTitle || instructor?.role, itemLabel)
  const instructorBio = instructor?.bio || 'Expert instructor with proven industry experience.'
  const instructorExperience = instructor?.experience || '5+ Years'
  const matchesCourseEnrollment = (enrollment) =>
    enrollment.courseId === course.id ||
    (enrollment.courseTitle && enrollment.courseTitle === course.title)
  const enrolled = currentUser ? isUserEnrolled(currentUser.uid, course.id) : false
  const enrolledCount = enrollments.filter(e => e.status === 'active' && matchesCourseEnrollment(e)).length
  const availableSoon = course.availableSoon === true || !course.plans || course.plans.length === 0
  const enrollmentClosed = isEnrollmentClosed(course)
  const enrollmentDeadlineText = formatEnrollmentDeadline(course.enrollmentDeadline)
  const actionLabel = learningType === 'webinar' ? 'Registration' : 'Enrollment'
  const closedActionLabel = `${actionLabel} Closed`
  const availableSoonLabel = 'Available Soon'
  const enrollmentLocked = availableSoon && !enrolled
  const primaryCtaLabel = enrolled
    ? `Already Registered - View ${itemLabel}`
    : enrollmentLocked
      ? availableSoonLabel
      : course.isFree
        ? (learningType === 'webinar' ? 'Register for Free' : 'Enroll for Free')
        : (learningType === 'webinar' ? 'Register Now' : 'Enroll Now')
  const deadlineSummary = availableSoon
    ? `${itemLabel} will be available soon.`
    : enrollmentDeadlineText
      ? (enrollmentClosed ? `${actionLabel} closed on ${enrollmentDeadlineText}` : `${actionLabel} closes on ${enrollmentDeadlineText}`)
      : ''

  const plans = Array.isArray(course.plans) && course.plans.length > 0 ? course.plans : null
  const parsedFeatures = parseList(course.features)
  const features = parsedFeatures.length > 0 ? parsedFeatures : [
    'Live Interactive Classes & Recorded Sessions',
    'Hands-on Practical Projects & Assignments',
    'Mentor Guidance & Doubts Support',
    'Certificate of Completion',
    'Lifetime Access to Learning Resources',
    'Career & Resume Guidance'
  ]
  const curriculum = parseList(course.curriculum)
  const projects = parseList(course.projects)
  const prerequisites = parseList(course.prerequisites)
  const relatedCourses = courses
    .filter(item => String(item.id) !== String(course.id) && item.published !== false && (
      !course.category || String(item.category || '').toLowerCase() === String(course.category || '').toLowerCase()
    ))
  const faq = Array.isArray(course.faq) ? course.faq : [
    { q: `Who is this ${learningType} designed for?`, a: `This ${learningType} is designed for ${course.level || 'all levels'} learners who want to excel in ${course.category || 'this field'}.` },
    { q: 'Do I need any prior experience?', a: course.level === 'Beginner' ? 'No prior experience required. We start from the basics.' : 'Some basic knowledge is recommended.' },
    { q: 'Are sessions recorded?', a: 'Yes, all live sessions are recorded and shared with enrolled students.' },
    { q: 'What is the refund policy?', a: 'We offer a 7-day money-back guarantee if you are not satisfied.' },
  ]

  const currentEmployeeIds = [currentUser?.uid, currentUser?.employeeId].filter(Boolean)
  const canManage = isAdmin || (isEmployee && assignedEmployeeIds.some(id => currentEmployeeIds.includes(id)))

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Helmet>
        <title>{course.title} — Amit Solution Hub</title>
        <meta name="description" content={course.description} />
      </Helmet>

      {/* Admin/Employee tabs */}
      {canManage && (
        <div className={`sticky top-0 z-40 backdrop-blur-md border-b pt-20 ${isDark ? 'bg-slate-950/90 border-slate-900' : 'bg-white/90 border-slate-100'}`}>
          <div className="max-w-6xl mx-auto px-4 flex justify-center pb-3">
            <div className={`inline-flex items-center gap-1 p-1.5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100/60 border-slate-200/70'}`}>
              {[
                { id: 'overview', label: '📖 Overview' },
                { id: 'enrollments', label: '👥 Enrollments' },
                ...(isAdmin ? [{ id: 'settings', label: '⚙️ Settings' }] : []),
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeSection === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enrollments tab (admin/employee) */}
      {activeSection === 'enrollments' && canManage && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold mb-6">Enrolled Students — {course.title}</h2>
          {enrollments.filter(matchesCourseEnrollment).length === 0 ? (
            <div className="text-center py-16 text-slate-400">No students enrolled yet.</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Student', 'Email', 'Mobile', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrollments.filter(matchesCourseEnrollment).map(enr => (
                    <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{enr.userName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{enr.userEmail}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{enr.userMobile || '—'}</td>
                      <td className="px-4 py-3 text-sm">{enr.planLabel || 'Standard'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">
                        {Number(enr.amount) === 0 ? 'FREE' : `₹${Number(enr.amount).toLocaleString('en-IN')}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${enr.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {enr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {enr.enrolledAt?.toDate ? enr.enrolledAt.toDate().toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Main overview */}
      {activeSection === 'overview' && (
        <>
          {/* HERO */}
          <section ref={heroRef} className={`relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24 pb-16 px-4 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/30'}`}>
            {/* BG blobs */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${isDark ? 'bg-blue-900/10' : 'bg-blue-100/30'}`} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: catMeta?.color ? catMeta.color + (isDark ? '08' : '15') : (isDark ? '#3b82f608' : '#3b82f615') }} />

            <div className={`relative z-10 max-w-5xl mx-auto text-center ${fade(heroVisible)}`}>
              {/* Category badge */}
              <div className={`inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border shadow-sm ${isDark ? 'bg-slate-900 border-white/5 shadow-slate-950/20' : 'bg-white border-slate-100'}`}
                style={{ borderColor: catMeta?.color ? catMeta.color + '40' : '#3b82f640' }}>
                <CategoryIcon icon={catMeta?.icon || 'Laptop'} className="w-4 h-4 shrink-0" style={{ color: catMeta?.color || '#3b82f6' }} />
                <span className="text-sm font-bold" style={{ color: catMeta?.color || '#3b82f6' }}>
                  {course.category}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-950/5 text-slate-600'}`}>
                  {itemLabel}
                </span>
                {course.badge && (
                  <>
                    <span className="text-slate-200 dark:text-slate-700">·</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{course.badge}</span>
                  </>
                )}
                {availableSoon && (
                  <>
                    <span className="text-slate-200 dark:text-slate-700">·</span>
                    <span className="rounded-full bg-fuchsia-100 dark:bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-700 dark:text-fuchsia-400">
                      {availableSoonLabel}
                    </span>
                  </>
                )}
              </div>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {course.title.split(' ').map((word, i, arr) =>
                  i >= Math.floor(arr.length * 0.6)
                    ? <span key={i} className={gradientText}> {word}</span>
                    : <span key={i}> {word}</span>
                )}
              </h1>

              {course.description && (
                <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.description}</p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm text-slate-500">
                {course.level && <span className={`px-3 py-1 rounded-full font-bold text-xs ${LEVEL_COLORS[course.level] || 'bg-slate-100 text-slate-600'}`}>{course.level}</span>}
                {course.duration && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </span>
                )}
                {enrolledCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    {enrolledCount} Enrolled
                  </span>
                )}
                {instructorName && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-5.25 6.557c0 1.035.84 1.875 1.875 1.875h6.75a1.875 1.875 0 001.875-1.875m-10.5 0H3.375" />
                    </svg>
                    {instructorName}
                  </span>
                )}
                {deadlineSummary && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${availableSoon ? 'bg-fuchsia-100 text-fuchsia-700' : enrollmentClosed ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {deadlineSummary}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {enrollmentLocked ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-full bg-fuchsia-100 px-8 py-4 text-lg font-bold text-fuchsia-700 shadow-sm"
                  >
                    {availableSoonLabel}
                  </button>
                ) : enrollmentClosed && !enrolled ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-8 py-4 text-lg font-bold text-slate-500 shadow-sm"
                  >
                    {closedActionLabel}
                  </button>
                ) : (
                  <a href="#pricing"
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30 hover:scale-105 transition-all duration-300">
                    {primaryCtaLabel}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
                {features.length > 0 && (
                  <a href="#features" className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg border-2 transition-all ${isDark ? 'border-slate-800 text-slate-200 hover:bg-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    What You'll Get
                  </a>
                )}
              </div>

              {enrollmentLocked && (
                <div className="mx-auto mt-5 max-w-2xl rounded-3xl border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-sm font-medium text-fuchsia-800">
                  This program is publicly visible as an upcoming launch. Enrollment is not open yet.
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500">
                {[
                  deadlineSummary || (enrolledCount > 0 ? `${enrolledCount}+ Students Enrolled` : 'Open for New Learners'),
                  course.duration ? `${course.duration} Program` : 'Flexible Duration',
                  'Expert-Led Training',
                  '7-Day Refund Policy'
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. CHOOSE YOUR PLAN (PRICING) */}
          <section id="pricing" ref={planRef} className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            <div className={`max-w-6xl mx-auto ${fade(planVisible)}`}>
              <div className="text-center mb-14">
                <h2 className={sectionHeading(isDark)}>
                  Choose Your <span className={gradientText}>Plan</span>
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                  {enrollmentClosed && !enrolled
                    ? `${actionLabel} has closed for this ${learningType}. You can still review the full program details below.`
                    : plans
                      ? `Select the plan that best fits your goals and schedule for this ${learningType}.`
                      : learningType === 'webinar'
                        ? 'Register now to reserve your webinar access.'
                        : 'Enroll now to get full access to the complete course content.'}
                </p>
                {deadlineSummary && (
                  <p className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold ${enrollmentClosed ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {deadlineSummary}
                  </p>
                )}
              </div>

              {plans ? (
                /* Multiple Plans */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {plans.map((plan, i) => {
                    const planAlreadyEnrolled = currentUser && isUserEnrolled(currentUser.uid, course.id, {
                      planId: plan.id || i,
                      planLabel: plan.label,
                      planName: plan.label,
                      amount: Number(plan.price || 0),
                      isFree: plan.isFree || plan.price === 0,
                    })
                    const planClosed = isPlanEnrollmentClosed(plan, course)
                    const disablePlanAction = (availableSoon && !planAlreadyEnrolled) || (planClosed && !planAlreadyEnrolled)
                    const planButtonLabel = planAlreadyEnrolled
                      ? 'Registered'
                      : availableSoon
                        ? availableSoonLabel
                        : disablePlanAction
                          ? closedActionLabel
                          : plan.isFree || plan.price === 0
                            ? (learningType === 'webinar' ? 'Register Free' : 'Enroll Free')
                            : (learningType === 'webinar' ? 'Reserve Your Spot' : 'Get Started')

                    return (
                      <div key={plan.id || i}
                        className={`relative rounded-3xl border-2 p-7 transition-all duration-300 hover:-translate-y-1 ${plan.highlighted
                            ? 'border-blue-500 bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30 scale-105'
                            : isDark
                              ? 'border-slate-800 bg-slate-900/60 hover:border-indigo-500/30 hover:shadow-xl'
                              : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-xl'
                          }`}>
                        {plan.highlighted && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black rounded-full shadow-lg shadow-amber-500/30 uppercase tracking-wider">
                            ★ Most Popular
                          </div>
                        )}
                        <h3 className={`text-xl font-black mb-1 ${plan.highlighted ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>{plan.label}</h3>
                        <p className={`text-sm mb-2 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{plan.duration}</p>
                        {plan.enrollmentDeadline && (
                          <p className={`text-xs mb-3 ${plan.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>
                            Enrollment closes: {formatEnrollmentDeadline(plan.enrollmentDeadline)}
                          </p>
                        )}
                        {!(plan.price === 0 || plan.isFree) && (
                          <div className="mb-6">
                            <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                              ₹{Number(plan.price).toLocaleString('en-IN')}
                            </span>
                            <span className={`text-sm ml-1 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>/{plan.duration}</span>
                          </div>
                        )}
                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                          <ul className="space-y-3 mb-7">
                            {plan.features.map((f, fi) => (
                              <li key={fi} className="flex items-start gap-2 text-sm">
                                {checkIcon(`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-blue-300' : 'text-blue-500'}`)}
                                <span className={plan.highlighted ? 'text-blue-100' : isDark ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                          type="button"
                          disabled={disablePlanAction}
                          onClick={() => {
                            if (disablePlanAction) return
                            setSelectedPlan({ ...course, ...plan, courseId: course.id, courseTitle: course.title, planLabel: plan.label, planId: plan.id || i, assignedEmployeeId: course.assignedEmployeeId || '' })
                          }}
                          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${disablePlanAction
                              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                              : plan.highlighted
                                ? 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 shadow-lg'
                                : isDark
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-md shadow-indigo-500/20'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-500/20'
                            }`}>
                          {planButtonLabel}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Single price / free */
                <div className="max-w-md mx-auto">
                  <div className="rounded-3xl border-2 border-blue-500 p-8 text-center bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30">
                    <h3 className="text-xl font-black mb-2">Full Access</h3>
                    {course.duration && <p className="text-blue-200 mb-5">{course.duration}</p>}
                    {!(course.isFree || !course.price || Number(course.price) === 0) && (
                      <div className="mb-6">
                        <span className="text-5xl font-black">₹{Number(course.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {features.length > 0 && (
                      <ul className="space-y-2 mb-7 text-left">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-blue-100">
                            {checkIcon('w-4 h-4 text-blue-300 flex-shrink-0')}
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      disabled={enrollmentLocked || (enrollmentClosed && !enrolled)}
                      onClick={() => {
                        if (enrollmentLocked || (enrollmentClosed && !enrolled)) return
                        setSelectedPlan(course)
                      }}
                      className={`w-full py-4 font-bold rounded-2xl transition-all duration-300 shadow-lg text-lg ${enrollmentLocked || (enrollmentClosed && !enrolled)
                          ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                          : 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105'
                        }`}>
                      {enrolled ? 'Already Registered' : availableSoon ? availableSoonLabel : enrollmentClosed ? closedActionLabel : course.isFree || course.price === 0 ? (learningType === 'webinar' ? 'Register for Free' : 'Enroll for Free') : (learningType === 'webinar' ? 'Register Now' : 'Enroll Now')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. WHAT YOU'LL GET (FEATURES) */}
          {features.length > 0 && (
            <section id="features" ref={featRef} className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
              <div className={`max-w-6xl mx-auto ${fade(featVisible)}`}>
                <div className="text-center mb-14">
                  <h2 className={sectionHeading(isDark)}>What You'll <span className={gradientText}>Get</span></h2>
                  <p className="text-slate-500 max-w-xl mx-auto">Everything included in this {learningType}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {features.map((feat, i) => (
                    <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 group ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/20' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? 'bg-indigo-950/40 group-hover:bg-indigo-900/40' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                        {checkIcon('w-5 h-5 text-blue-600 dark:text-indigo-400')}
                      </div>
                      <p className={`font-medium leading-snug pt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4. CURRICULUM */}
          {curriculum.length > 0 && (
            <section id="curriculum" className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                  <h2 className={sectionHeading(isDark)}>{itemLabel} <span className={gradientText}>Curriculum</span></h2>
                  <p className="text-slate-500 max-w-xl mx-auto">A comprehensive, structured learning path</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {curriculum.map((mod, i) => (
                    <div key={i} className={`relative p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden ${isDark ? 'border-slate-800/80 bg-slate-900/40 hover:border-indigo-500/30' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl ${isDark ? 'bg-slate-800 text-indigo-300' : 'bg-blue-50 text-blue-600'}`}>Module {i + 1}</div>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors ${isDark ? 'bg-slate-800/60 group-hover:bg-indigo-950/60' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                        <span className="text-blue-600 dark:text-indigo-400 font-black text-sm">#{(i + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <h4 className={`font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{mod.title || mod}</h4>
                      {mod.description && <p className="text-sm text-slate-400 leading-relaxed">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 5. PROGRAM HIGHLIGHTS */}
          {(projects.length > 0 || prerequisites.length > 0 || course.certificateIncluded || course.language || course.supportText) && (
            <section className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                  <h2 className={sectionHeading(isDark)}>Program <span className={gradientText}>Highlights</span></h2>
                  <p className="text-slate-500 max-w-xl mx-auto">Key takeaways, prerequisites, and program details</p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {projects.length > 0 && (
                    <div className={`rounded-3xl border p-7 shadow-sm transition-all ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDark ? 'bg-indigo-950/60 text-indigo-400' : 'bg-blue-50 text-blue-600'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Projects & Assignments</h3>
                      </div>
                      <ul className="space-y-3">
                        {projects.map((project, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                            {checkIcon('mt-0.5 h-4 w-4 shrink-0 text-blue-500')}
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {prerequisites.length > 0 && (
                    <div className={`rounded-3xl border p-7 shadow-sm transition-all ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Before You Begin</h3>
                      </div>
                      <ul className="space-y-3">
                        {prerequisites.map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                            {checkIcon('mt-0.5 h-4 w-4 shrink-0 text-blue-500')}
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(course.certificateIncluded || course.language || course.supportText) && (
                    <div className={`rounded-3xl border p-7 shadow-sm md:col-span-2 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                        {course.certificateIncluded && (
                          <div className="pt-4 sm:pt-0 sm:px-4 first:px-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Certificate</p>
                            <p className="font-semibold text-slate-900 dark:text-white">Verifiable certificate included</p>
                          </div>
                        )}
                        {course.language && (
                          <div className="pt-4 sm:pt-0 sm:px-4 first:px-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Language</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{course.language}</p>
                          </div>
                        )}
                        {course.supportText && (
                          <div className="pt-4 sm:pt-0 sm:px-4 first:px-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Support</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{course.supportText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 5.5 VERIFIED CERTIFICATE SECTION */}
          <VerifiedCertificateSection courseTitle={course.title || "Full Stack Web Development"} isDark={isDark} />

          {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) */}
          <section className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <h2 className={sectionHeading(isDark)}>Frequently Asked <span className={gradientText}>Questions</span></h2>
              </div>
              <div className="space-y-3">
                {faq.map((item, i) => (
                  <div key={i} className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left outline-none">
                      <span className={`font-semibold pr-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.q}</span>
                      <svg className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 text-blue-600 dark:text-indigo-400 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {openFaq === i && <div className={`px-5 pb-5 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. RELATED COURSES */}
          {relatedCourses.length > 0 && (
            <section className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
              <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center"><h2 className={sectionHeading(isDark)}>More in <span className={gradientText}>{course.category}</span></h2></div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {relatedCourses.map(item => (
                    <Link key={item.id} to={`/courses/${item.slug || item.id}`} className={`rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
                      <p className="text-xs font-bold text-blue-600 dark:text-indigo-400">{item.level || 'All levels'}</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description || 'Explore this structured learning path.'}</p>
                      <span className="mt-4 inline-block text-sm font-bold text-blue-600 dark:text-indigo-400">View details →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}


        </>
      )}

      {/* Enrollment Modal */}
      {selectedPlan && (
        <CourseEnrollModal
          course={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => setSelectedPlan(null)}
        />
      )}
    </div>
  )
}