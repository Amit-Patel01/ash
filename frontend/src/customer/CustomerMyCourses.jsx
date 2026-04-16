import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { getCertificateDocumentLabel } from '../utils/certificateHelpers'
import { getLearningTypeLabel } from '../utils/learningType'

export default function CustomerMyCourses() {
  const { getUserEnrollments, courses, certificates } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)

  const myEnrollments = currentUser ? getUserEnrollments(currentUser.uid) : []
  const myCertificates = currentUser
    ? certificates.filter(cert => cert.userId === currentUser.uid && cert.status === 'approved')
    : []

  const normalize = (value) => String(value || '').trim().toLowerCase()
  const compact = (value) => normalize(value).replace(/[^a-z0-9]/g, '')

  const formatDate = (value) => {
    if (!value) return 'Recently enrolled'
    if (typeof value?.toDate === 'function') return value.toDate().toLocaleDateString()

    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? 'Recently enrolled' : parsed.toLocaleDateString()
  }

  const getMyCourse = (enrollment) =>
    courses.find(c =>
      c.id === enrollment.courseId ||
      (enrollment.courseTitle && c.title === enrollment.courseTitle)
    )

  const getCourseFallback = (enrollment) => ({
    id: enrollment.courseId || enrollment.id,
    title: enrollment.courseTitle || enrollment.courseName || enrollment.courseId || 'Course',
    category: enrollment.category || 'Course',
    deliveryType: enrollment.deliveryType || 'course',
    instructor: enrollment.instructor || '',
    materials: [],
    meetingLink: '',
    thumbnail: '',
  })

  const getCourseGroupKey = (course, enrollment) =>
    course?.id ||
    enrollment.courseId ||
    compact(enrollment.courseTitle || enrollment.courseName || enrollment.id)

  const getCourseDocuments = (enrollment, course) => {
    const courseNames = [
      course?.title,
      enrollment.courseTitle,
      enrollment.courseName,
    ]
      .map(normalize)
      .filter(Boolean)

    return myCertificates.filter(cert =>
      cert.enrollmentId === enrollment.id ||
      cert.courseId === course?.id ||
      courseNames.includes(normalize(cert.courseName))
    )
  }

  const getEnrollmentPlan = (course, enrollment) => {
    const plans = Array.isArray(course?.plans) ? course.plans : []
    const planKeys = [enrollment.planId, enrollment.planLabel, enrollment.planName]
      .map(normalize)
      .filter(Boolean)
    const compactPlanKeys = [enrollment.planId, enrollment.planLabel, enrollment.planName]
      .map(compact)
      .filter(Boolean)

    if (planKeys.length === 0) return plans.length === 1 ? plans[0] : null

    const directMatch = plans.find((plan, index) => {
      const normalizedId = normalize(plan.id)
      const normalizedLabel = normalize(plan.label)
      const compactId = compact(plan.id)
      const compactLabel = compact(plan.label)
      const indexKey = String(index)

      return (
        planKeys.includes(normalizedId) ||
        planKeys.includes(normalizedLabel) ||
        planKeys.includes(indexKey) ||
        compactPlanKeys.includes(compactId) ||
        compactPlanKeys.includes(compactLabel)
      )
    })

    if (directMatch) return directMatch

    const enrollmentAmount = Number(enrollment.amount)
    if (!Number.isNaN(enrollmentAmount)) {
      const amountMatches = plans.filter(plan => {
        const planAmount = Number(plan?.price || 0)
        const freePlan = plan?.isFree || planAmount === 0
        return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount
      })
      if (amountMatches.length === 1) return amountMatches[0]
    }

    return plans.length === 1 ? plans[0] : null
  }

  const resolveMeetingLink = (course, plan) => {
    if (plan?.meetingLink) return plan.meetingLink
    const plans = Array.isArray(course?.plans) ? course.plans : []
    return plans.length <= 1 ? (course?.meetingLink || '') : ''
  }

  const formatMeetingDateTime = (meetingStartsAt, meetingTimezone) => {
    if (!meetingStartsAt) return ''
    const parsed = new Date(meetingStartsAt)
    if (Number.isNaN(parsed.getTime())) return ''

    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: meetingTimezone || undefined,
      }).format(parsed)
    } catch {
      return parsed.toLocaleString('en-IN')
    }
  }

  const formatPlanPrice = (value, isFree = false) => {
    if (isFree) return 'Free access'
    const amount = Number(value || 0)
    return amount > 0 ? `Rs ${amount.toLocaleString('en-IN')}` : 'Free access'
  }

  const myCourseGroups = Object.values(
    myEnrollments.reduce((acc, enrollment) => {
      const course = getMyCourse(enrollment) || getCourseFallback(enrollment)
      const courseKey = getCourseGroupKey(course, enrollment)

      if (!acc[courseKey]) {
        acc[courseKey] = {
          key: courseKey,
          course,
          enrollments: [],
        }
      }

      acc[courseKey].enrollments.push(enrollment)
      return acc
    }, {})
  )

  if (myEnrollments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">No programs yet</h3>
          <p className="text-gray-400 text-sm mb-6">Browse our courses and webinars to start learning</p>
          <button onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            Browse Courses
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-sm text-gray-400 mt-1">
            {myCourseGroups.length} program{myCourseGroups.length !== 1 ? 's' : ''} • {myEnrollments.length} active plan{myEnrollments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/customer/certificates"
            className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm font-medium text-amber-300 hover:bg-amber-500/15 transition-all"
          >
            Documents
          </Link>
          <button onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-all">
            Browse More
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {myCourseGroups.map(group => {
          const course = group.course
          const isExpanded = expandedId === group.key
          const hasMaterials = Array.isArray(course.materials) && course.materials.length > 0
          const planEntries = group.enrollments.map((enrollment) => {
            const enrolledPlan = getEnrollmentPlan(course, enrollment)
            const meetingLink = resolveMeetingLink(course, enrolledPlan)
            const meetingDateTime = formatMeetingDateTime(enrolledPlan?.meetingStartsAt, enrolledPlan?.meetingTimezone)
            const resolvedPlanLabel = enrolledPlan?.label || enrollment.planLabel || enrollment.planName || 'Standard Access'
            const planFeatures = Array.isArray(enrolledPlan?.features)
              ? enrolledPlan.features.filter(Boolean).slice(0, 4)
              : []
            const courseDocuments = getCourseDocuments(enrollment, course)

            return {
              enrollment,
              enrolledPlan,
              meetingLink,
              meetingDateTime,
              resolvedPlanLabel,
              planFeatures,
              courseDocuments,
              hasMeetingLink: Boolean(meetingLink),
              resourcesReady: [Boolean(meetingLink), hasMaterials, courseDocuments.length > 0].filter(Boolean).length,
            }
          })

          const nextSessionEntry = planEntries.find((entry) => entry.meetingDateTime) || null
          const allDocumentsMap = {}
          planEntries.forEach((entry) => {
            entry.courseDocuments.forEach((document) => {
              const documentKey = document.id || document.certificate_id
              if (!documentKey || allDocumentsMap[documentKey]) return
              allDocumentsMap[documentKey] = {
                ...document,
                planLabel: entry.resolvedPlanLabel,
              }
            })
          })
          const allDocuments = Object.values(allDocumentsMap)
          const primaryDocument = allDocuments[0] || null
          const canExpand =
            hasMaterials ||
            allDocuments.length > 0 ||
            planEntries.some((entry) => entry.meetingDateTime || entry.hasMeetingLink)
          const groupResourcesReady = [
            planEntries.some((entry) => entry.hasMeetingLink),
            hasMaterials,
            allDocuments.length > 0,
          ].filter(Boolean).length

          return (
            <div key={group.key} className="bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              <div className="p-5 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center text-2xl">
                      📚
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{group.enrollments[0]?.category || course.category}</p>
                      <h3 className="font-bold text-white mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-semibold text-sky-300">
                          {getLearningTypeLabel(course)}
                        </span>
                        <p className="text-[11px] text-gray-500">
                          {group.enrollments.length} active plan{group.enrollments.length !== 1 ? 's' : ''}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-300">
                          Latest enrollment: {formatDate(group.enrollments[0]?.enrolledAt || group.enrollments[0]?.createdAt)}
                        </span>
                      </div>
                      {course.instructor && (
                        <p className="text-xs text-gray-500">👨‍🏫 {course.instructor}</p>
                      )}
                      {nextSessionEntry?.meetingDateTime && (
                        <p className="text-xs text-blue-300 mt-1">
                          Next live session: {nextSessionEntry.resolvedPlanLabel} • {nextSessionEntry.meetingDateTime}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {allDocuments.length > 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                          {allDocuments.length} Document{allDocuments.length !== 1 ? 's' : ''} Ready
                        </span>
                      )}
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {planEntries.map((entry) => (
                      <div
                        key={entry.enrollment.id}
                        className="rounded-2xl border border-blue-500/15 bg-gradient-to-r from-blue-500/10 via-slate-900/70 to-purple-500/10 p-4"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-300/80">
                              Enrolled Plan
                            </p>
                            <p className="mt-1 text-base font-bold text-white">{entry.resolvedPlanLabel}</p>
                            <p className="mt-1 text-[11px] text-blue-100/70">
                              Enrolled {formatDate(entry.enrollment.enrolledAt || entry.enrollment.createdAt)}
                            </p>
                          </div>
                          {entry.hasMeetingLink ? (
                            <a
                              href={entry.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-400 transition-colors"
                            >
                              Join Plan Session
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-400">
                              Link pending
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {entry.enrolledPlan?.duration && (
                            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium text-gray-200">
                              Duration: {entry.enrolledPlan.duration}
                            </span>
                          )}
                          {(entry.enrolledPlan?.price !== undefined || entry.enrolledPlan?.isFree) && (
                            <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-medium text-emerald-300">
                              {formatPlanPrice(entry.enrolledPlan?.price, entry.enrolledPlan?.isFree)}
                            </span>
                          )}
                          {entry.meetingDateTime && (
                            <span className="px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-[11px] font-medium text-blue-200">
                              Session: {entry.meetingDateTime}
                            </span>
                          )}
                          {entry.courseDocuments.length > 0 && (
                            <span className="px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[11px] font-medium text-amber-300">
                              {entry.courseDocuments.length} document{entry.courseDocuments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {entry.planFeatures.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {entry.planFeatures.map((feature, index) => (
                              <span
                                key={`${entry.enrollment.id}-plan-feature-${index}`}
                                className="px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-[11px] font-medium text-purple-200"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[11px] text-gray-500">{groupResourcesReady} of 3 shared resources ready</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${planEntries.some((entry) => entry.hasMeetingLink) ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        Live Session
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${hasMaterials ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        Materials
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${allDocuments.length > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        Documents
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {canExpand && (
                      <button onClick={() => setExpandedId(isExpanded ? null : group.key)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/20 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        {isExpanded ? 'Hide Details' : 'Open Details'}
                        <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    )}
                    {primaryDocument && (
                      <Link
                        to={`/verify?id=${primaryDocument.certificate_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
                        </svg>
                        View Documents
                      </Link>
                    )}
                    {!hasMaterials && !planEntries.some((entry) => entry.hasMeetingLink) && allDocuments.length === 0 && (
                      <button
                        onClick={() => navigate('/customer/support')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Contact Support
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && canExpand && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                  {planEntries.some((entry) => entry.meetingDateTime || entry.hasMeetingLink) && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Plan Sessions</p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {planEntries
                          .filter((entry) => entry.meetingDateTime || entry.hasMeetingLink)
                          .map((entry) => (
                            <div key={`${entry.enrollment.id}-session`} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Plan Session</p>
                                  <p className="text-sm font-semibold text-white">{entry.resolvedPlanLabel}</p>
                                  <p className="text-[11px] text-blue-100/80">
                                    {entry.meetingDateTime || 'Meeting time will be shared soon'}
                                  </p>
                                </div>
                                {entry.hasMeetingLink ? (
                                  <a
                                    href={entry.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-400 transition-colors"
                                  >
                                    Join Meeting
                                  </a>
                                ) : (
                                  <span className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-[11px] font-semibold text-gray-400">
                                    Link pending
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {hasMaterials && (
                    <>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Study Materials</p>
                      <div className="space-y-2">
                        {course.materials.map((mat, i) => (
                          <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{mat.title}</p>
                              <p className="text-[10px] text-gray-500 truncate">{mat.url}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                  {allDocuments.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Issued Documents</p>
                      <div className="space-y-2">
                        {allDocuments.map(document => (
                          <div key={document.id} className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-amber-500/10 bg-black/10 px-3 py-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{getCertificateDocumentLabel(document, document.templateSnapshot)}</p>
                              <p className="text-[11px] text-amber-200/80">Plan: {document.planLabel} • ID: {document.certificate_id}</p>
                            </div>
                            <Link
                              to={`/verify?id=${document.certificate_id}`}
                              className="px-3 py-2 rounded-xl bg-amber-500 text-gray-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                            >
                              Verify
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
