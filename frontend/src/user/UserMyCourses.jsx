import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { getCertificateDocumentLabel } from '../utils/certificateHelpers'
import { getLearningTypeLabel } from '../utils/learningType'

export default function UserMyCourses() {
  const { getUserEnrollments, courses, certificates } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)
  const progressStorageKey = `solutionhub:lms-progress:${currentUser?.uid || 'guest'}`
  const [resourceProgress, setResourceProgress] = useState(() => {
    if (typeof window === 'undefined') return {}
    try {
      const savedProgress = JSON.parse(window.localStorage.getItem(progressStorageKey) || '{}')
      return savedProgress && typeof savedProgress === 'object' ? savedProgress : {}
    } catch {
      return {}
    }
  })

  const myEnrollments = currentUser ? getUserEnrollments(currentUser.uid) : []
  const myCertificates = currentUser
    ? certificates.filter(cert => {
        if (cert.status !== 'approved' && cert.status !== 'active') return false
        const uid = currentUser.uid
        const email = currentUser.email
        if (uid && cert.userId === uid) return true
        if (uid && cert.assignedEmployeeUid === uid) return true
        if (email && cert.assignedEmployeeEmail === email) return true
        return false
      })
    : []

  const normalize = (value) => String(value || '').trim().toLowerCase()
  const compact = (value) => normalize(value).replace(/[^a-z0-9]/g, '')
  const buildResourceId = (...parts) => parts.map(compact).filter(Boolean).join(':')

  const isResourceComplete = (resourceId) => Boolean(resourceProgress[resourceId])

  const getProgressPercent = (completed, total) => (
    total > 0 ? Math.round((completed / total) * 100) : 0
  )

  const saveResourceProgress = (nextProgress) => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(progressStorageKey, JSON.stringify(nextProgress))
    } catch {
      // Progress tracking is helpful, but the portal should keep working if storage is blocked.
    }
  }

  const toggleResourceProgress = (resourceId) => {
    setResourceProgress((currentProgress) => {
      const nextProgress = { ...currentProgress }

      if (nextProgress[resourceId]) {
        delete nextProgress[resourceId]
      } else {
        nextProgress[resourceId] = new Date().toISOString()
      }

      saveResourceProgress(nextProgress)
      return nextProgress
    })
  }

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

  const getCourseLearningData = (group) => {
    const course = group.course
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
    const sessionResources = planEntries
      .filter((entry) => entry.meetingDateTime || entry.hasMeetingLink)
      .map((entry, index) => ({
        id: buildResourceId(group.key, 'session', entry.enrollment.id || entry.resolvedPlanLabel || index),
        type: 'Live Session',
        title: entry.resolvedPlanLabel,
        subtitle: entry.meetingDateTime || 'Meeting time will be shared soon',
        url: entry.meetingLink,
        internal: false,
        actionLabel: entry.hasMeetingLink ? 'Join' : '',
      }))
    const materialResources = hasMaterials
      ? course.materials.map((material, index) => {
        const materialUrl = typeof material === 'string' ? material : material?.url || ''
        const materialTitle = typeof material === 'string'
          ? `Material ${index + 1}`
          : material?.title || material?.name || `Material ${index + 1}`

        return {
          id: buildResourceId(group.key, 'material', material?.id || materialTitle || materialUrl || index),
          type: 'Material',
          title: materialTitle,
          subtitle: materialUrl || 'Material link pending',
          url: materialUrl,
          internal: false,
          actionLabel: materialUrl ? 'Open' : '',
        }
      })
      : []
    const documentResources = allDocuments.map((document, index) => ({
      id: buildResourceId(group.key, 'document', document.id || document.certificate_id || index),
      type: 'Document',
      title: getCertificateDocumentLabel(document, document.templateSnapshot),
      subtitle: document.certificate_id
        ? `Plan: ${document.planLabel} • ID: ${document.certificate_id}`
        : `Plan: ${document.planLabel}`,
      url: document.certificate_id ? `/verify?id=${document.certificate_id}` : '',
      internal: true,
      actionLabel: document.certificate_id ? 'Verify' : '',
    }))
    const learningResources = [...sessionResources, ...materialResources, ...documentResources]
    const completedResources = learningResources.filter((resource) => isResourceComplete(resource.id)).length
    const progressPercent = getProgressPercent(completedResources, learningResources.length)
    const nextResource = learningResources.find((resource) => !isResourceComplete(resource.id)) || null
    const canExpand = learningResources.length > 0
    const groupResourcesReady = [
      planEntries.some((entry) => entry.hasMeetingLink),
      hasMaterials,
      allDocuments.length > 0,
    ].filter(Boolean).length

    return {
      group,
      course,
      hasMaterials,
      planEntries,
      nextSessionEntry,
      allDocuments,
      primaryDocument,
      sessionResources,
      materialResources,
      documentResources,
      learningResources,
      completedResources,
      progressPercent,
      nextResource,
      canExpand,
      groupResourcesReady,
    }
  }

  const courseLearningGroups = myCourseGroups.map(getCourseLearningData)
  const totalLearningResources = courseLearningGroups.reduce(
    (total, group) => total + group.learningResources.length,
    0
  )
  const completedLearningResources = courseLearningGroups.reduce(
    (total, group) => total + group.completedResources,
    0
  )
  const overallProgress = getProgressPercent(completedLearningResources, totalLearningResources)
  const readyLiveSessions = courseLearningGroups.reduce(
    (total, group) => total + group.sessionResources.filter((resource) => resource.url).length,
    0
  )
  const issuedDocuments = courseLearningGroups.reduce(
    (total, group) => total + group.documentResources.length,
    0
  )

  if (myEnrollments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-[0_10px_30px_rgba(148,163,184,0.25)]">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No programs yet</h3>
          <p className="text-slate-500 text-sm mb-6">Browse our courses and webinars to start learning</p>
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
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {myCourseGroups.length} program{myCourseGroups.length !== 1 ? 's' : ''} • {myEnrollments.length} active plan{myEnrollments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/user/certificates"
            className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-100 transition-all"
          >
            Documents
          </Link>
          <button onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
            Browse More
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">LMS Progress</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-3xl font-black text-slate-900">{overallProgress}%</p>
            <p className="text-xs font-semibold text-emerald-600">{completedLearningResources}/{totalLearningResources || 0} done</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600">Learning Items</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{totalLearningResources}</p>
          <p className="mt-1 text-xs font-semibold text-sky-600">Sessions, materials, and documents</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">Live Ready</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{readyLiveSessions}</p>
          <p className="mt-1 text-xs font-semibold text-blue-600">Joinable plan sessions</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Documents</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{issuedDocuments}</p>
          <p className="mt-1 text-xs font-semibold text-amber-600">Issued certificates and files</p>
        </div>
      </div>

      <div className="space-y-4">
        {courseLearningGroups.map((learningGroup) => {
          const {
            group,
            course,
            hasMaterials,
            planEntries,
            nextSessionEntry,
            allDocuments,
            primaryDocument,
            learningResources,
            completedResources,
            progressPercent,
            nextResource,
            canExpand,
            groupResourcesReady,
          } = learningGroup
          const isExpanded = expandedId === group.key

          return (
            <div key={group.key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-all shadow-[0_10px_30px_rgba(148,163,184,0.2)]">
              <div className="p-5 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                      📚
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{group.enrollments[0]?.category || course.category}</p>
                      <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-semibold text-sky-600">
                          {getLearningTypeLabel(course)}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {group.enrollments.length} active plan{group.enrollments.length !== 1 ? 's' : ''}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-600">
                          Latest enrollment: {formatDate(group.enrollments[0]?.enrolledAt || group.enrollments[0]?.createdAt)}
                        </span>
                      </div>
                      {course.instructor && (
                        <p className="text-xs text-slate-400">👨‍🏫 {course.instructor}</p>
                      )}
                      {nextSessionEntry?.meetingDateTime && (
                        <p className="text-xs text-blue-600 mt-1">
                          Next live session: {nextSessionEntry.resolvedPlanLabel} • {nextSessionEntry.meetingDateTime}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {allDocuments.length > 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          {allDocuments.length} Document{allDocuments.length !== 1 ? 's' : ''} Ready
                        </span>
                      )}
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">Learning Progress</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {completedResources}/{learningResources.length} items completed
                        </p>
                      </div>
                      {nextResource ? (
                        <button
                          type="button"
                          onClick={() => setExpandedId(group.key)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100"
                        >
                          Continue
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      ) : learningResources.length > 0 ? (
                        <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-400">
                          Pending content
                        </span>
                      )}
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500">
                      <span className="flex-shrink-0">{progressPercent}% complete</span>
                      <span className="min-w-0 truncate text-right">{nextResource ? `Next: ${nextResource.title}` : 'All caught up'}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {planEntries.map((entry) => (
                      <div
                        key={entry.enrollment.id}
                        className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-600">
                              Enrolled Plan
                            </p>
                            <p className="mt-1 text-base font-bold text-slate-900">{entry.resolvedPlanLabel}</p>
                            <p className="mt-1 text-[11px] text-blue-500">
                              Enrolled {formatDate(entry.enrollment.enrolledAt || entry.enrollment.createdAt)}
                            </p>
                          </div>
                          {entry.hasMeetingLink ? (
                            <a
                              href={entry.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              Join Plan Session
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-400">
                              Link pending
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {entry.enrolledPlan?.duration && (
                            <span className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[11px] font-medium text-slate-600">
                              Duration: {entry.enrolledPlan.duration}
                            </span>
                          )}
                          {(entry.enrolledPlan?.price !== undefined || entry.enrolledPlan?.isFree) && (
                            <span className="px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-600">
                              {formatPlanPrice(entry.enrolledPlan?.price, entry.enrolledPlan?.isFree)}
                            </span>
                          )}
                          {entry.meetingDateTime && (
                            <span className="px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-medium text-blue-600">
                              Session: {entry.meetingDateTime}
                            </span>
                          )}
                          {entry.courseDocuments.length > 0 && (
                            <span className="px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-[11px] font-medium text-amber-600">
                              {entry.courseDocuments.length} document{entry.courseDocuments.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {entry.planFeatures.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {entry.planFeatures.map((feature, index) => (
                              <span
                                key={`${entry.enrollment.id}-plan-feature-${index}`}
                                className="px-2.5 py-1 rounded-full border border-purple-200 bg-purple-50 text-[11px] font-medium text-purple-600"
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
                    <p className="text-[11px] text-slate-400">{groupResourcesReady} of 3 shared resources ready</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${planEntries.some((entry) => entry.hasMeetingLink) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        Live Session
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${hasMaterials ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        Materials
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${allDocuments.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        Documents
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {canExpand && (
                      <button onClick={() => setExpandedId(isExpanded ? null : group.key)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 transition-colors">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
                        </svg>
                        View Documents
                      </Link>
                    )}
                    {!hasMaterials && !planEntries.some((entry) => entry.hasMeetingLink) && allDocuments.length === 0 && (
                      <button
                        onClick={() => navigate('/user/support')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        Contact Support
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && canExpand && (
                <div className="px-5 pb-5 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Learning Path</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {completedResources}/{learningResources.length} completed
                      </p>
                    </div>
                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                      {progressPercent}% complete
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {learningResources.map((resource) => {
                      const resourceComplete = isResourceComplete(resource.id)
                      const typeClasses =
                        resource.type === 'Live Session'
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : resource.type === 'Material'
                            ? 'bg-purple-50 border-purple-200 text-purple-600'
                            : 'bg-amber-50 border-amber-200 text-amber-600'

                      return (
                        <div
                          key={resource.id}
                          className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 transition-colors sm:flex-row sm:items-center ${resourceComplete ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleResourceProgress(resource.id)}
                              aria-label={resourceComplete ? `Mark ${resource.title} incomplete` : `Mark ${resource.title} complete`}
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${resourceComplete ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-emerald-400 hover:text-emerald-500'}`}
                            >
                              {resourceComplete ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-current" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${typeClasses}`}>
                                  {resource.type}
                                </span>
                                {resourceComplete && (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                    Done
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{resource.title}</p>
                              <p className="mt-0.5 truncate text-[11px] text-slate-400">{resource.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">
                            {resource.url && resource.internal ? (
                              <Link
                                to={resource.url}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:flex-none"
                              >
                                {resource.actionLabel}
                              </Link>
                            ) : resource.url ? (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:flex-none"
                              >
                                {resource.actionLabel}
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => toggleResourceProgress(resource.id)}
                              className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-colors sm:flex-none ${resourceComplete ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                              {resourceComplete ? 'Undo' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}