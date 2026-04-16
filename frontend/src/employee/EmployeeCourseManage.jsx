import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { DOCUMENT_TYPES } from '../utils/certificateTemplate'
import { emailNotify } from '../utils/emailNotify'
import { getLearningTypeLabel, normalizeLearningType } from '../utils/learningType'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
const COURSE_BLANK = {
  deliveryType: 'course',
  title: '',
  category: '',
  level: 'Beginner',
  description: '',
  thumbnail: '',
}
const FALLBACK_CATEGORIES = [
  'Trading',
  'Web Development',
  'Python',
  'Digital Marketing',
  'Graphic Design',
  'Excel / Data',
  'Other',
]
const PLAN_BLANK = {
  label: '',
  duration: '',
  price: '',
  isFree: false,
  highlighted: false,
  features: '',
  meetingLink: '',
  meetingDateTime: '',
  meetingTimezone: DEFAULT_TIMEZONE,
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()
const compactText = (value) => normalizeText(value).replace(/[^a-z0-9]/g, '')

const buildPlanId = (label) =>
  normalizeText(label)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `plan-${Date.now()}`

const formatDateTimeInput = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const timezoneOffset = parsed.getTimezoneOffset() * 60000
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

const formatMeetingPreview = (meetingStartsAt, meetingTimezone = DEFAULT_TIMEZONE) => {
  if (!meetingStartsAt) return 'No meeting time set'
  const parsed = new Date(meetingStartsAt)
  if (Number.isNaN(parsed.getTime())) return 'Invalid meeting time'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: meetingTimezone || DEFAULT_TIMEZONE,
    }).format(parsed)
  } catch {
    return parsed.toLocaleString('en-IN')
  }
}

const matchesPlanEnrollment = (enrollment, plan, course) => {
  const courseMatches =
    enrollment.courseId === course.id ||
    normalizeText(enrollment.courseTitle) === normalizeText(course.title) ||
    normalizeText(enrollment.courseName) === normalizeText(course.title)

  if (!courseMatches) return false

  const planKeys = [enrollment.planId, enrollment.planLabel, enrollment.planName]
    .map(normalizeText)
    .filter(Boolean)
  const compactPlanKeys = [enrollment.planId, enrollment.planLabel, enrollment.planName]
    .map(compactText)
    .filter(Boolean)
  const enrollmentAmount = Number(enrollment.amount)

  if (planKeys.length === 0) {
    if (!Number.isNaN(enrollmentAmount)) {
      const amountMatches = (course.plans || []).filter(item => {
        const planAmount = Number(item?.price || 0)
        const freePlan = item?.isFree || planAmount === 0
        return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount
      })
      if (amountMatches.length === 1) return amountMatches[0]?.id === plan?.id
    }
    return (course.plans || []).length <= 1
  }

  const directMatch = (
    planKeys.includes(normalizeText(plan?.id)) ||
    planKeys.includes(normalizeText(plan?.label)) ||
    planKeys.includes(String((course.plans || []).findIndex(item => item?.id === plan?.id))) ||
    compactPlanKeys.includes(compactText(plan?.id)) ||
    compactPlanKeys.includes(compactText(plan?.label))
  )

  if (directMatch) return true

  if (!Number.isNaN(enrollmentAmount)) {
    const amountMatches = (course.plans || []).filter(item => {
      const planAmount = Number(item?.price || 0)
      const freePlan = item?.isFree || planAmount === 0
      return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount
    })
    if (amountMatches.length === 1) return amountMatches[0]?.id === plan?.id
  }

  return false
}

const resolvePlanMeetingLink = (course, plan, fallbackLink = '') => {
  if (plan?.meetingLink) return plan.meetingLink
  const plans = Array.isArray(course?.plans) ? course.plans : []
  if (plans.length <= 1) return plan?.meetingLink || fallbackLink || course?.meetingLink || ''
  return ''
}

export default function EmployeeCourseManage() {
  const {
    courses,
    addCourse,
    updateCourse,
    enrollments,
    certificates,
    issueCertificate,
    revokeCertificate,
    courseCategories,
  } = useStore()
  const { currentUser, userProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Employee'
  const employeeId = userProfile?.employeeId || currentUser?.employeeId || ''
  const employeeKeys = useMemo(
    () => [...new Set([currentUser?.uid, userProfile?.uid, employeeId].filter(Boolean))],
    [currentUser?.uid, userProfile?.uid, employeeId]
  )
  const myCourses = useMemo(() => courses.filter(course =>
    employeeKeys.includes(course.assignedEmployeeId) ||
    employeeKeys.includes(course.assignedEmployeeRef)
  ), [courses, employeeKeys])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('plans') // plans | materials | meeting | students
  const [courseForm, setCourseForm] = useState(COURSE_BLANK)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [courseSaving, setCourseSaving] = useState(false)
  const canCreateCourses = Boolean(employeeId)
  const availableCategories = useMemo(() => {
    const fromStore = courseCategories.map(category => category?.name).filter(Boolean)
    return fromStore.length > 0 ? fromStore : FALLBACK_CATEGORIES
  }, [courseCategories])
  const visibleCourses = useMemo(() => {
    if (!selectedCourse?.id) return myCourses
    const alreadyListed = myCourses.some(course => course.id === selectedCourse.id)
    return alreadyListed ? myCourses : [selectedCourse, ...myCourses]
  }, [myCourses, selectedCourse])

  // ─── Plan states ───────────────────────────────────
  const [planForm, setPlanForm] = useState(PLAN_BLANK)
  const [editingPlanIdx, setEditingPlanIdx] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)

  // ─── Material states ────────────────────────────────
  const [matForm, setMatForm] = useState({ title: '', url: '' })

  // ─── Meeting link states ────────────────────────────
  const [meetingLink, setMeetingLink] = useState('')
  const [editMeet, setEditMeet] = useState(false)
  const [certificateBusyId, setCertificateBusyId] = useState('')
  const planMeetingStats = useMemo(() => {
    const plans = Array.isArray(selectedCourse?.plans) ? selectedCourse.plans : []
    return {
      scheduled: plans.filter(plan => plan?.meetingStartsAt).length,
      linksReady: plans.filter(plan => plan?.meetingLink).length,
    }
  }, [selectedCourse])
  const matchesCourseEnrollment = (enrollment, course) =>
    enrollment.courseId === course.id ||
    (enrollment.courseTitle && enrollment.courseTitle === course.title)

  const getEnrollmentCertificate = (enrollment, course, documentType = 'certificate') =>
    certificates.find(cert =>
      cert.status === 'approved' &&
      (cert.documentType || 'certificate') === documentType &&
      cert.userId === enrollment.userId &&
      (
        cert.enrollmentId === enrollment.id ||
        cert.courseId === course.id ||
        cert.courseName === course.title
      )
    ) || null

  const openCourse = (course) => {
    setSelectedCourse(course)
    setMeetingLink(course.meetingLink || '')
    setActiveTab('plans')
    setEditMeet(false)
  }

  const openCreateCourse = () => {
    if (!canCreateCourses) return
    setCourseForm(COURSE_BLANK)
    setShowCourseModal(true)
  }

  const closeCreateCourse = () => {
    setShowCourseModal(false)
    setCourseForm(COURSE_BLANK)
  }

  const saveCourseDraft = async (event) => {
    event?.preventDefault()
    if (!canCreateCourses || !courseForm.title.trim() || !courseForm.category) return
    setCourseSaving(true)
    try {
      const primaryEmployeeKey = currentUser?.uid || userProfile?.uid || employeeId
      const secondaryEmployeeKey = employeeId || userProfile?.uid || currentUser?.uid || ''
      const createdCourse = await addCourse({
        deliveryType: normalizeLearningType(courseForm),
        title: courseForm.title.trim(),
        category: courseForm.category,
        level: courseForm.level || 'Beginner',
        description: courseForm.description.trim(),
        thumbnail: courseForm.thumbnail.trim(),
        assignedEmployeeId: primaryEmployeeKey,
        assignedEmployeeRef: secondaryEmployeeKey,
        assignedEmployeeName: displayName,
        instructor: displayName,
        published: false,
        plans: [],
        materials: [],
        meetingLink: '',
      })
      openCourse(createdCourse)
      closeCreateCourse()
    } catch (error) {
      alert(error?.message || 'Failed to create course')
    } finally {
      setCourseSaving(false)
    }
  }

  useEffect(() => {
    if (!canCreateCourses || searchParams.get('create') !== '1') return
    openCreateCourse()
    const next = new URLSearchParams(searchParams)
    next.delete('create')
    setSearchParams(next, { replace: true })
  }, [canCreateCourses, searchParams, setSearchParams])

  // ─── Plans CRUD ─────────────────────────────────────
  const openAddPlan = () => {
    setPlanForm(PLAN_BLANK)
    setEditingPlanIdx(null)
    setShowPlanModal(true)
  }
  const openEditPlan = (plan, idx) => {
    setPlanForm({
      label: plan.label || '',
      duration: plan.duration || '',
      price: plan.price || '',
      isFree: plan.isFree || plan.price === 0 || false,
      highlighted: plan.highlighted || false,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      meetingLink: plan.meetingLink || '',
      meetingDateTime: formatDateTimeInput(plan.meetingStartsAt),
      meetingTimezone: plan.meetingTimezone || DEFAULT_TIMEZONE,
    })
    setEditingPlanIdx(idx)
    setShowPlanModal(true)
  }

  const savePlan = async () => {
    if (!planForm.label.trim() || !planForm.duration.trim()) return
    setSaving(true)
    try {
      const plans = Array.isArray(selectedCourse.plans) ? [...selectedCourse.plans] : []
      const existingPlan = editingPlanIdx !== null ? plans[editingPlanIdx] : null
      const normalizedMeetingLink = planForm.meetingLink.trim()
      const normalizedMeetingStartsAt = planForm.meetingDateTime ? new Date(planForm.meetingDateTime).toISOString() : ''
      const normalizedMeetingTimezone = planForm.meetingTimezone || DEFAULT_TIMEZONE
      const meetingChanged =
        normalizeText(existingPlan?.meetingLink) !== normalizeText(normalizedMeetingLink) ||
        (existingPlan?.meetingStartsAt || '') !== normalizedMeetingStartsAt ||
        (existingPlan?.meetingTimezone || DEFAULT_TIMEZONE) !== normalizedMeetingTimezone
      const planData = {
        ...(existingPlan || {}),
        id: existingPlan?.id || buildPlanId(planForm.label),
        label: planForm.label.trim(),
        duration: planForm.duration.trim(),
        price: planForm.isFree ? 0 : Number(planForm.price) || 0,
        isFree: planForm.isFree,
        highlighted: planForm.highlighted,
        features: planForm.features.split('\n').map(s => s.trim()).filter(Boolean),
        meetingLink: normalizedMeetingLink,
        meetingStartsAt: normalizedMeetingStartsAt,
        meetingTimezone: normalizedMeetingStartsAt ? normalizedMeetingTimezone : '',
      }
      if (meetingChanged) {
        planData.meetingReminderSentAt = ''
        planData.meetingLiveSentAt = ''
      }
      if (editingPlanIdx !== null) {
        plans[editingPlanIdx] = planData
      } else {
        plans.push(planData)
      }
      await updateCourse(selectedCourse.id, { plans })

      if (meetingChanged && normalizedMeetingStartsAt) {
        const recipients = courseEnrollments.filter(enrollment =>
          enrollment.userEmail &&
          matchesPlanEnrollment(enrollment, planData, selectedCourse)
        )

        await Promise.all(
          recipients.map(enrollment =>
            emailNotify('course_meeting_scheduled', {
              studentName: enrollment.userName || enrollment.userEmail,
              studentEmail: enrollment.userEmail,
              courseTitle: selectedCourse.title,
              planLabel: planData.label || enrollment.planLabel || enrollment.planName || '',
              meetingTime: formatMeetingPreview(normalizedMeetingStartsAt, normalizedMeetingTimezone),
              meetingLink: resolvePlanMeetingLink(selectedCourse, planData, normalizedMeetingLink),
              employeeName:
                userProfile?.displayName ||
                currentUser?.displayName ||
                selectedCourse.instructor ||
                'Instructor',
              reason: 'schedule_updated',
            })
          )
        )
      }

      setSelectedCourse({ ...selectedCourse, plans })
      setShowPlanModal(false)
    } finally {
      setSaving(false)
    }
  }

  const deletePlan = async (idx) => {
    if (!window.confirm('Delete this plan?')) return
    const plans = (selectedCourse.plans || []).filter((_, i) => i !== idx)
    await updateCourse(selectedCourse.id, { plans })
    setSelectedCourse({ ...selectedCourse, plans })
  }

  const movePlan = async (idx, dir) => {
    const plans = [...(selectedCourse.plans || [])]
    const to = idx + dir
    if (to < 0 || to >= plans.length) return
    ;[plans[idx], plans[to]] = [plans[to], plans[idx]]
    await updateCourse(selectedCourse.id, { plans })
    setSelectedCourse({ ...selectedCourse, plans })
  }

  // ─── Materials CRUD ──────────────────────────────────
  const addMaterial = async () => {
    if (!matForm.title.trim() || !matForm.url.trim()) return
    setSaving(true)
    try {
      const mats = [...(selectedCourse.materials || []), { title: matForm.title.trim(), url: matForm.url.trim() }]
      await updateCourse(selectedCourse.id, { materials: mats })
      setSelectedCourse({ ...selectedCourse, materials: mats })
      setMatForm({ title: '', url: '' })
    } finally { setSaving(false) }
  }
  const removeMaterial = async (idx) => {
    const mats = (selectedCourse.materials || []).filter((_, i) => i !== idx)
    await updateCourse(selectedCourse.id, { materials: mats })
    setSelectedCourse({ ...selectedCourse, materials: mats })
  }

  // ─── Meeting link ────────────────────────────────────
  const saveMeeting = async () => {
    setSaving(true)
    try {
      await updateCourse(selectedCourse.id, { meetingLink })
      setSelectedCourse({ ...selectedCourse, meetingLink })
      setEditMeet(false)
    } finally { setSaving(false) }
  }

  const courseEnrollments = selectedCourse
    ? enrollments.filter(e => e.status === 'active' && matchesCourseEnrollment(e, selectedCourse))
    : []

  const handleIssueCertificate = async (enrollment, documentType = 'certificate') => {
    if (!selectedCourse) return
    setCertificateBusyId(`${enrollment.id}:${documentType}`)
    try {
      await issueCertificate(
        {
          ...enrollment,
          courseId: selectedCourse.id,
          courseName: selectedCourse.title,
          courseTitle: selectedCourse.title,
        },
        {
          issuedByUid: currentUser?.uid,
          issuedByName: userProfile?.displayName || currentUser?.displayName || 'Employee',
          issuedByRole: userProfile?.role || 'employee',
          documentType,
          internshipRole: selectedCourse.title,
          internshipDuration: enrollment.planLabel || enrollment.planName || '',
        }
      )
    } finally {
      setCertificateBusyId('')
    }
  }

  const handleRevokeCertificate = async (certificateId, enrollmentId, documentType = 'certificate') => {
    if (!window.confirm('Revoke this certificate?')) return
    setCertificateBusyId(`${enrollmentId}:${documentType}`)
    try {
      await revokeCertificate(certificateId)
    } finally {
      setCertificateBusyId('')
    }
  }

  const TABS = [
    { id: 'plans', label: '💰 Plans', title: 'Duration Plans & Pricing' },
    { id: 'materials', label: '📄 Materials', title: 'Study Materials' },
    { id: 'meeting', label: '📹 Session Link', title: 'Meeting / Session Link' },
    { id: 'students', label: '👥 Students', title: 'Enrolled Students' },
  ]
  const emptyStateTitle = canCreateCourses ? 'Create your first course' : 'No courses assigned'
  const emptyStateBody = canCreateCourses
    ? 'Use Add Course to create a draft course. After that you can manage plans, materials, meeting links, and students here.'
    : 'Ask the admin to assign you as instructor for a course.'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="mt-1 text-sm text-gray-400">
            {canCreateCourses
              ? 'Create draft courses from your employee panel and manage delivery details from one place.'
              : 'Manage your assigned course plans, materials, meeting links, and student activity.'}
          </p>
        </div>
        {canCreateCourses && (
          <button
            onClick={openCreateCourse}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Course
          </button>
        )}
      </div>

      {canCreateCourses && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>New courses created from this panel are saved as drafts first. Add plans, materials, and meeting links here after creating the course.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course list */}
        <div className="lg:col-span-1 space-y-2">
          {visibleCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-gray-900/40 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-white">{emptyStateTitle}</p>
              <p className="mt-2 text-xs text-gray-500">{emptyStateBody}</p>
            </div>
          ) : visibleCourses.map(course => {
            const cnt = enrollments.filter(e => e.status === 'active' && matchesCourseEnrollment(e, course)).length
            const planCount = (course.plans || []).length
            return (
              <button key={course.id} onClick={() => openCourse(course)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCourse?.id === course.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-gray-900/50 hover:border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center text-lg flex-shrink-0">
                    📚
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{course.title}</h4>
                    <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                      <span>{planCount} plans</span>
                      <span>·</span>
                      <span>{cnt} students</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3">
          {!selectedCourse ? (
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
              <div className="text-5xl mb-4">{visibleCourses.length === 0 ? '📚' : '👈'}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {visibleCourses.length === 0 ? emptyStateTitle : 'Select a course to manage'}
              </h3>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">
                {visibleCourses.length === 0
                  ? emptyStateBody
                  : 'Choose a course from the left to update its plans, materials, meeting links, and enrolled students.'}
              </p>
              {canCreateCourses && visibleCourses.length === 0 && (
                <button
                  onClick={openCreateCourse}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
                >
                  Create Course
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedCourse.title}</h2>
                  <p className="text-sm text-gray-400">
                    {[selectedCourse.category, selectedCourse.level].filter(Boolean).join(' · ') || 'Course details'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-400">
                    {(selectedCourse.plans || []).length} plan{(selectedCourse.plans || []).length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500">{courseEnrollments.length} enrolled</p>
                  <p className="text-[10px] text-gray-600 mt-1">{planMeetingStats.scheduled} scheduled · {planMeetingStats.linksReady} links ready</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-white/5">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ─── PLANS TAB ─────────────────────────────────── */}
              {activeTab === 'plans' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Duration Plans & Pricing</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Students see these plans on the course page</p>
                    </div>
                    <button onClick={openAddPlan}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Plan
                    </button>
                  </div>

                  {!(selectedCourse.plans || []).length ? (
                    <div className="py-10 text-center">
                      <p className="text-3xl mb-2">💰</p>
                      <p className="text-gray-500 text-sm mb-1">No plans added yet</p>
                      <p className="text-xs text-gray-600">Add plans like Basic 1-Month, Standard 3-Months, Premium 6-Months</p>
                      <button onClick={openAddPlan} className="mt-4 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-600/30 transition-all">
                        Add First Plan
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(selectedCourse.plans || []).map((plan, idx) => (
                        <div key={idx} className={`relative rounded-2xl border p-5 ${plan.highlighted ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/5 bg-white/[0.02]'}`}>
                          {plan.highlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                              ★ Most Popular
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-white">{plan.label}</h4>
                              <p className="text-xs text-gray-500">{plan.duration}</p>
                            </div>
                            <p className={`text-lg font-black ${plan.highlighted ? 'text-blue-400' : 'text-white'}`}>
                              {plan.isFree || plan.price === 0 ? 'FREE' : `₹${Number(plan.price).toLocaleString('en-IN')}`}
                            </p>
                          </div>
                          {plan.features?.length > 0 && (
                            <ul className="space-y-1 mb-3">
                              {plan.features.slice(0, 3).map((f, fi) => (
                                <li key={fi} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <span className="text-emerald-400">✓</span> {f}
                                </li>
                              ))}
                              {plan.features.length > 3 && <li className="text-[10px] text-gray-600">+{plan.features.length - 3} more</li>}
                            </ul>
                          )}
                          <div className="rounded-xl border border-white/5 bg-black/20 p-3 mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">Plan Meeting</p>
                            <p className="text-[11px] text-white">{formatMeetingPreview(plan.meetingStartsAt, plan.meetingTimezone)}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${plan.meetingLink ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                {plan.meetingLink ? 'Join link ready' : 'Join link pending'}
                              </span>
                              {plan.meetingReminderSentAt && (
                                <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-300">
                                  Reminder sent
                                </span>
                              )}
                              {plan.meetingLiveSentAt && (
                                <span className="px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-[10px] font-semibold text-rose-300">
                                  Live mail sent
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 mt-auto">
                            <button onClick={() => movePlan(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/10 disabled:opacity-30 text-xs">↑</button>
                            <button onClick={() => movePlan(idx, 1)} disabled={idx === (selectedCourse.plans || []).length - 1} className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/10 disabled:opacity-30 text-xs">↓</button>
                            <button onClick={() => openEditPlan(plan, idx)} className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors">Edit</button>
                            <button onClick={() => deletePlan(idx)} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── MATERIALS TAB ──────────────────────────────── */}
              {activeTab === 'materials' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Study Materials</h3>
                  <div className="flex gap-2 mb-4">
                    <input value={matForm.title} onChange={e => setMatForm({...matForm, title: e.target.value})} placeholder="Material title" className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                    <input value={matForm.url} onChange={e => setMatForm({...matForm, url: e.target.value})} placeholder="URL / link" className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                    <button onClick={addMaterial} disabled={saving || !matForm.title || !matForm.url} className="px-4 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 transition-all">Add</button>
                  </div>
                  {!(selectedCourse.materials || []).length ? (
                    <p className="text-sm text-gray-600 italic py-4">No materials added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(selectedCourse.materials || []).map((mat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                          <span className="text-xl">📄</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{mat.title}</p>
                            <p className="text-[10px] text-gray-500 truncate">{mat.url}</p>
                          </div>
                          <button onClick={() => removeMaterial(i)} className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── MEETING LINK TAB ───────────────────────────── */}
              {activeTab === 'meeting' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Default Meeting / Live Session Link</h3>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {(selectedCourse.plans || []).length > 1
                          ? 'For multi-plan courses, students only see the meeting link for the plan they enrolled in. This default link is an optional fallback.'
                          : 'For single-plan courses, this link may be shown directly to students.'}
                      </p>
                    </div>
                    <button onClick={() => setEditMeet(!editMeet)} className="text-xs font-bold text-blue-400 hover:text-blue-300">{editMeet ? 'Cancel' : 'Edit'}</button>
                  </div>
                  {editMeet ? (
                    <div className="flex gap-2">
                      <input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/... or Zoom link"
                        className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                      <button onClick={saveMeeting} disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">Save</button>
                    </div>
                  ) : selectedCourse.meetingLink ? (
                    <a href={selectedCourse.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 underline break-all">{selectedCourse.meetingLink}</a>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No meeting link set. Click Edit to add.</p>
                  )}
                  {!!selectedCourse.plans?.length && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCourse.plans.map((plan, idx) => (
                        <div key={`${plan.id || plan.label || idx}-meeting`} className="rounded-xl border border-white/5 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{plan.label}</p>
                              <p className="text-[11px] text-gray-500">{formatMeetingPreview(plan.meetingStartsAt, plan.meetingTimezone)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${plan.meetingLink ? 'border-blue-500/20 bg-blue-500/10 text-blue-300' : 'border-white/10 bg-white/5 text-gray-500'}`}>
                              {plan.meetingLink ? 'Plan link ready' : 'No plan link set'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── STUDENTS TAB ───────────────────────────────── */}
              {activeTab === 'students' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Enrolled Students ({courseEnrollments.length})</h3>
                  {courseEnrollments.length === 0 ? <p className="text-sm text-gray-600 italic py-4">No students enrolled yet</p> : (
                    <div className="space-y-2">
                      {courseEnrollments.map(enr => {
                        const documents = DOCUMENT_TYPES.map(type => ({
                          type: type.id,
                          meta: type,
                          record: getEnrollmentCertificate(enr, selectedCourse, type.id),
                        }))
                        return (
                        <div key={enr.id} className="flex flex-col gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 lg:flex-row lg:items-center">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {(enr.userName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{enr.userName || '—'}</p>
                            <p className="text-[10px] text-gray-500">{enr.userEmail} · {enr.planLabel || 'Standard'}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {documents.map(({ type, meta, record }) => (
                                <span key={type} className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${record ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                  {record ? `${meta.shortLabel} Issued` : `${meta.shortLabel} Pending`}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-left lg:text-right flex-shrink-0">
                            <p className="text-xs font-bold text-blue-400">{Number(enr.amount) === 0 ? 'FREE' : `₹${Number(enr.amount).toLocaleString('en-IN')}`}</p>
                            {enr.userMobile && <p className="text-[10px] text-gray-500">{enr.userMobile}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            {documents.map(({ type, meta, record }) => {
                              const busy = certificateBusyId === `${enr.id}:${type}`
                              const buttonLabel = record ? `Revoke ${meta.shortLabel}` : `Issue ${meta.shortLabel}`
                              return record ? (
                                <button
                                  key={type}
                                  onClick={() => handleRevokeCertificate(record.id, enr.id, type)}
                                  disabled={busy}
                                  className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-all"
                                  title={record.certificate_id || meta.label}
                                >
                                  {busy ? 'Updating...' : buttonLabel}
                                </button>
                              ) : (
                                <button
                                  key={type}
                                  onClick={() => handleIssueCertificate(enr, type)}
                                  disabled={busy}
                                  className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 transition-all"
                                >
                                  {busy ? 'Issuing...' : buttonLabel}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── PLAN MODAL ──────────────────────────────────────── */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPlanModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl mb-10">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingPlanIdx !== null ? 'Edit Plan' : 'Add Duration Plan'}</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="label">Plan Name *</label>
                <input value={planForm.label} onChange={e => setPlanForm({...planForm, label: e.target.value})} placeholder="e.g. Basic / Standard / Premium" className="input" />
              </div>
              {/* Duration */}
              <div>
                <label className="label">Duration *</label>
                <input value={planForm.duration} onChange={e => setPlanForm({...planForm, duration: e.target.value})} placeholder="e.g. 1 Month / 3 Months / 6 Months" className="input" />
              </div>
              {/* Price */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="label">Price (₹)</label>
                  <input type="number" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} disabled={planForm.isFree} placeholder="4999" className="input disabled:opacity-40" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <button type="button" onClick={() => setPlanForm({...planForm, isFree: !planForm.isFree})}
                    className={`w-10 h-5 rounded-full relative transition-all ${planForm.isFree ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${planForm.isFree ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-400">Free</span>
                </div>
              </div>
              {/* Features */}
              <div>
                <label className="label">Features (one per line)</label>
                <textarea value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} rows={5}
                  placeholder="30 Recorded Videos&#10;Weekly Live Sessions&#10;1-on-1 Doubt Clearing&#10;Certificate on Completion&#10;WhatsApp Support Group"
                  className="input resize-none font-mono text-xs" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Plan Meeting Link</label>
                  <input
                    value={planForm.meetingLink}
                    onChange={e => setPlanForm({ ...planForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/... or Zoom link"
                    className="input"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Students on this plan will join this link directly from their customer panel.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1.6fr,1fr] gap-3">
                  <div>
                    <label className="label">Meeting Start Time</label>
                    <input
                      type="datetime-local"
                      value={planForm.meetingDateTime}
                      onChange={e => setPlanForm({ ...planForm, meetingDateTime: e.target.value })}
                      className="input"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Reminder mail goes 60 minutes before, and another mail goes when the meeting starts.</p>
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <input
                      value={planForm.meetingTimezone}
                      onChange={e => setPlanForm({ ...planForm, meetingTimezone: e.target.value })}
                      placeholder="Asia/Kolkata"
                      className="input"
                    />
                  </div>
                </div>
              </div>
              {/* Highlighted */}
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Mark as "Most Popular"</p>
                  <p className="text-[10px] text-gray-500">Shows a highlighted badge on this plan</p>
                </div>
                <button type="button" onClick={() => setPlanForm({...planForm, highlighted: !planForm.highlighted})}
                  className={`w-11 h-6 rounded-full relative transition-all ${planForm.highlighted ? 'bg-amber-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${planForm.highlighted ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={savePlan} disabled={saving || !planForm.label || !planForm.duration}
                  className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editingPlanIdx !== null ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCreateCourse} />
          <div className="relative mb-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/5 bg-gray-900 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Course</h2>
                <p className="mt-1 text-xs text-gray-500">This course will be assigned to your employee account automatically.</p>
              </div>
              <button onClick={closeCreateCourse} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">✕</button>
            </div>
            <form onSubmit={saveCourseDraft} className="space-y-4 p-6">
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                <span className="text-base leading-none">💡</span>
                <span>Start with the basic course details here. After saving, use this same page to add plans, materials, and live session links.</span>
              </div>

              <div>
                <label className="label">{getLearningTypeLabel(courseForm)} Title *</label>
                <input
                  value={courseForm.title}
                  onChange={event => setCourseForm({ ...courseForm, title: event.target.value })}
                  required
                  placeholder="e.g. Full Stack Web Development"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={courseForm.deliveryType}
                    onChange={event => setCourseForm({ ...courseForm, deliveryType: event.target.value })}
                    className="input"
                  >
                    <option value="course">Course</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select
                    value={courseForm.category}
                    onChange={event => setCourseForm({ ...courseForm, category: event.target.value })}
                    required
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={event => setCourseForm({ ...courseForm, level: event.target.value })}
                    className="input"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Short Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={event => setCourseForm({ ...courseForm, description: event.target.value })}
                  rows={3}
                  placeholder="Brief course description for students..."
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="label">Course Image URL</label>
                <input
                  value={courseForm.thumbnail}
                  onChange={event => setCourseForm({ ...courseForm, thumbnail: event.target.value })}
                  placeholder="https://example.com/course-image.jpg"
                  className="input"
                />
                <p className="mt-1 text-[11px] text-gray-500">Optional. This image can be used later on course cards and listing pages.</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">Assigned Instructor</p>
                <p className="mt-1 text-sm text-gray-400">{displayName}</p>
                <p className="mt-1 text-[11px] text-gray-500">Employee ID: {employeeId || 'Not set'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateCourse}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-gray-400 transition-all hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseSaving || !courseForm.title.trim() || !courseForm.category}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {courseSaving ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 600; color: #9ca3af; margin-bottom: 6px; }
        .input { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 0.875rem; color: white; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: rgba(59,130,246,0.5); }
        .input option { background: #111827; color: white; }
      `}</style>
    </div>
  )
}
