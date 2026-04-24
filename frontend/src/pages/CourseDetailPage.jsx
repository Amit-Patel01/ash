import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import CourseEnrollModal from '../components/CourseEnrollModal'
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

const fade = (v) => `transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

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
    case 'customer':
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

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { courses, courseCategories, users, teamMembers, isUserEnrolled, enrollments } = useStore()
  const { currentUser, isAdmin, isEmployee } = useAuth()

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
  const { instructor, publicProfileId } = useMemo(
    () => resolveInstructorProfile(course, users, teamMembers),
    [course, users, teamMembers]
  )

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
  const availableSoon = course.availableSoon === true
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
  const features = Array.isArray(course.features) ? course.features : []
  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : []
  const faq = Array.isArray(course.faq) ? course.faq : [
    { q: `Who is this ${learningType} designed for?`, a: `This ${learningType} is designed for ${course.level || 'all levels'} learners who want to excel in ${course.category || 'this field'}.` },
    { q: 'Do I need any prior experience?', a: course.level === 'Beginner' ? 'No prior experience required. We start from the basics.' : 'Some basic knowledge is recommended.' },
    { q: 'Are sessions recorded?', a: 'Yes, all live sessions are recorded and shared with enrolled students.' },
    { q: 'What is the refund policy?', a: 'We offer a 7-day money-back guarantee if you are not satisfied.' },
  ]

  const currentEmployeeIds = [currentUser?.uid, currentUser?.employeeId].filter(Boolean)
  const canManage = isAdmin || (isEmployee && assignedEmployeeIds.some(id => currentEmployeeIds.includes(id)))

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>{course.title} — Amit Solution Hub</title>
        <meta name="description" content={course.description} />
      </Helmet>

      {/* Admin/Employee tabs */}
      {canManage && (
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 pt-20">
          <div className="max-w-6xl mx-auto px-4 flex justify-center pb-3">
            <div className="inline-flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
              {[
                { id: 'overview', label: '📖 Overview' },
                { id: 'enrollments', label: '👥 Enrollments' },
                ...(isAdmin ? [{ id: 'settings', label: '⚙️ Settings' }] : []),
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeSection === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}>
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
                    {['Student','Email','Mobile','Plan','Amount','Status','Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrollments.filter(matchesCourseEnrollment).map(enr => (
                    <tr key={enr.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{enr.userName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{enr.userEmail}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{enr.userMobile || '—'}</td>
                      <td className="px-4 py-3 text-sm">{enr.planLabel || 'Standard'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">
                        {Number(enr.amount) === 0 ? 'FREE' : `₹${Number(enr.amount).toLocaleString('en-IN')}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${enr.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
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
          <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/30 pt-24 pb-16 px-4">
            {/* BG blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: catMeta?.color ? catMeta.color + '15' : '#3b82f615' }} />

            <div className={`relative z-10 max-w-5xl mx-auto text-center ${fade(heroVisible)}`}>
              {/* Category badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border bg-white shadow-sm"
                style={{ borderColor: catMeta?.color ? catMeta.color + '40' : '#3b82f640' }}>
                <span className="text-lg">{catMeta?.icon || '📚'}</span>
                <span className="text-sm font-bold" style={{ color: catMeta?.color || '#3b82f6' }}>
                  {course.category}
                </span>
                <span className="rounded-full bg-slate-950/5 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                  {itemLabel}
                </span>
                {course.badge && (
                  <>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider">{course.badge}</span>
                  </>
                )}
                {availableSoon && (
                  <>
                    <span className="text-slate-200">·</span>
                    <span className="rounded-full bg-fuchsia-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-700">
                      {availableSoonLabel}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 text-slate-900">
                {course.title.split(' ').map((word, i, arr) =>
                  i >= Math.floor(arr.length * 0.6)
                    ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> {word}</span>
                    : <span key={i}> {word}</span>
                )}
              </h1>

              {course.description && (
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">{course.description}</p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-slate-500">
                {course.level && <span className={`px-3 py-1 rounded-full font-bold text-xs ${LEVEL_COLORS[course.level] || 'bg-slate-100 text-slate-600'}`}>{course.level}</span>}
                {course.duration && <span>⏱ {course.duration}</span>}
                {enrolledCount > 0 && <span>👥 {enrolledCount} Enrolled</span>}
                {instructorName && <span>👨‍🏫 {instructorName}</span>}
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
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-300">
                    {primaryCtaLabel}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
                {features.length > 0 && (
                  <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                    View Curriculum
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

          {/* FEATURES */}
          {features.length > 0 && (
            <section id="features" ref={featRef} className="py-20 px-4 bg-slate-50/50">
              <div className={`max-w-6xl mx-auto ${fade(featVisible)}`}>
                <div className="text-center mb-14">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4">What You'll <span className="text-blue-600">Get</span></h2>
                  <p className="text-slate-500 max-w-xl mx-auto">Everything included in this {learningType}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-800 font-medium leading-snug pt-1">{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CURRICULUM */}
          {curriculum.length > 0 && (
            <section id="curriculum" className="py-20 px-4 bg-white">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{itemLabel} <span className="text-blue-600">Curriculum</span></h2>
                  <p className="text-slate-500 max-w-xl mx-auto">A comprehensive, structured learning path</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {curriculum.map((mod, i) => (
                    <div key={i} className="relative p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group overflow-hidden">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-bl-xl">MODULE {i + 1}</div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                        <span className="text-blue-600 font-black text-sm">#{(i + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{mod.title || mod}</h4>
                      {mod.description && <p className="text-sm text-slate-400">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* INSTRUCTOR */}
          {(instructor || course.instructor || course.assignedEmployeeName) && (
            <section className="py-20 px-4 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Meet Your <span className="text-blue-600">Instructor</span></h2>
                </div>
                <div className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl mx-auto">
                  <div className="w-48 h-48 rounded-3xl border-4 border-blue-100 overflow-hidden shadow-lg bg-slate-200 flex-shrink-0 flex items-center justify-center">
                    {instructorImage ? (
                      <img src={instructorImage} alt={instructorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-black text-white">
                        {instructorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {instructorName}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-3">
                      {instructorRole}
                    </p>
                    <p className={`${instructor?.bio ? 'text-slate-500' : 'text-slate-400 italic'} leading-relaxed mb-4`}>
                      {instructorBio}
                    </p>
                    {(instructor?.department || instructorLinks.length > 0 || publicProfileId) && (
                      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start mb-5">
                        {instructor?.department ? (
                          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                            {instructor.department}
                          </span>
                        ) : null}
                        {publicProfileId ? (
                          <Link
                            to={`/team/${publicProfileId}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                          >
                            View Profile
                          </Link>
                        ) : null}
                        {instructorLinks.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {[
                        { label: 'Experience', value: instructorExperience },
                        { label: 'Students', value: enrolledCount > 0 ? `${enrolledCount}+` : 'Growing' },
                        { label: 'Rating', value: '4.9/5' }
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                          <p className="text-2xl font-black text-blue-600">{stat.value}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PRICING / PLANS */}
          <section id="pricing" ref={planRef} className="py-20 px-4 bg-white">
            <div className={`max-w-6xl mx-auto ${fade(planVisible)}`}>
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                  Choose Your <span className="text-blue-600">Plan</span>
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
                      className={`relative rounded-3xl border-2 p-7 transition-all duration-300 hover:-translate-y-1 ${
                        plan.highlighted
                          ? 'border-blue-500 bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30 scale-105'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-xl'
                      }`}>
                      {plan.highlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black rounded-full shadow-lg uppercase tracking-wider">
                          ★ Most Popular
                        </div>
                      )}
                      <h3 className={`text-xl font-black mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.label}</h3>
                      <p className={`text-sm mb-2 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{plan.duration}</p>
                      {plan.enrollmentDeadline && (
                        <p className={`text-xs mb-3 ${plan.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>
                          Enrollment closes: {formatEnrollmentDeadline(plan.enrollmentDeadline)}
                        </p>
                      )}
                      <div className="mb-6">
                        {plan.price === 0 || plan.isFree ? (
                          <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : 'text-emerald-600'}`}>FREE</span>
                        ) : (
                          <>
                            <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                              ₹{Number(plan.price).toLocaleString('en-IN')}
                            </span>
                            <span className={`text-sm ml-1 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>/{plan.duration}</span>
                          </>
                        )}
                      </div>
                      {Array.isArray(plan.features) && plan.features.length > 0 && (
                        <ul className="space-y-3 mb-7">
                          {plan.features.map((f, fi) => (
                            <li key={fi} className="flex items-start gap-2 text-sm">
                              <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-blue-300' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={plan.highlighted ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
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
                        className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                          disablePlanAction
                            ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                            : plan.highlighted
                              ? 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 shadow-lg'
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-500/20'
                        }`}>
                        {planButtonLabel}
                      </button>
                    </div>
                  )})}
                </div>
              ) : (
                /* Single price / free */
                <div className="max-w-md mx-auto">
                  <div className="rounded-3xl border-2 border-blue-500 p-8 text-center bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30">
                    <h3 className="text-xl font-black mb-2">Full Access</h3>
                    {course.duration && <p className="text-blue-200 mb-5">{course.duration}</p>}
                    <div className="mb-6">
                      {course.isFree || course.price === 0 ? (
                        <span className="text-5xl font-black">FREE</span>
                      ) : (
                        <span className="text-5xl font-black">₹{Number(course.price || 0).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    {features.length > 0 && (
                      <ul className="space-y-2 mb-7 text-left">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-blue-100">
                            <svg className="w-4 h-4 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
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
                      className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg text-lg ${
                        enrollmentLocked || (enrollmentClosed && !enrolled)
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

          {/* FAQ */}
          <section className="py-20 px-4 bg-slate-50">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Frequently Asked <span className="text-blue-600">Questions</span></h2>
              </div>
              <div className="space-y-3">
                {faq.map((item, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left">
                      <span className="font-semibold text-slate-900 pr-4">{item.q}</span>
                      <svg className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 text-blue-600 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {openFaq === i && <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">{item.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="relative py-24 px-4 overflow-hidden" style={{ background: `linear-gradient(135deg, #1d4ed8, #4f46e5)` }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
                Ready to Build Your Next Skill?
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10">
                Join our growing community of learners and take the next step with a structured, mentor-led program.
              </p>
              {enrollmentLocked ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-3 rounded-full bg-white/70 px-10 py-5 text-xl font-bold text-fuchsia-700 shadow-2xl"
                >
                  {availableSoonLabel}
                </button>
              ) : enrollmentClosed && !enrolled ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-3 rounded-full bg-white/70 px-10 py-5 text-xl font-bold text-slate-500 shadow-2xl"
                >
                  {closedActionLabel}
                </button>
              ) : (
                <a href="#pricing"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-xl shadow-2xl bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 transition-all duration-300">
                  {learningType === 'webinar' ? 'Register Now' : 'Enroll Now'}
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              )}
            </div>
          </section>

          {/* WhatsApp float */}
          <a href={`https://wa.me/918799246225?text=Hello, I would like to learn more about this ${learningType}: ${encodeURIComponent(course.title)}`}
            target="_blank" rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform" style={{ background: '#25D366' }}>
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
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
