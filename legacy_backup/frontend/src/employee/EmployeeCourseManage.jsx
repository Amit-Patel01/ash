import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { getEmployeeKeyList, getEmployeeMemberData, courseBelongsToEmployee } from './employeeUtils'
import { DOCUMENT_TYPES } from '../utils/certificateTemplate'
import { emailNotify } from '../utils/emailNotify'
import { formatEnrollmentDeadline, isEnrollmentClosed, normalizeEnrollmentDeadline } from '../utils/enrollmentDeadline'
import { getLearningTypeLabel, normalizeLearningType } from '../utils/learningType'
import { BookOpen, CircleDollarSign, FileText, Video, Users, MousePointerClick, Check, X, Star, Lightbulb } from 'lucide-react'
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
const COURSE_BLANK = {
  deliveryType: 'course',
  title: '',
  category: '',
  level: 'Beginner',
  description: '',
  thumbnail: '',
  enrollmentDeadline: '',
  availableSoon: false,
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
  weeklySchedule: '',
  meetingDateTime: '',
  meetingTimezone: DEFAULT_TIMEZONE,
  enrollmentDeadline: '',
}

const getPublicDetailsForm = (course = {}) => ({
  description: course.description || '',
  outcomes: Array.isArray(course.features) ? course.features.join('\n') : '',
  curriculum: Array.isArray(course.curriculum) ? course.curriculum.map(item => item?.title || item).join('\n') : '',
  projects: Array.isArray(course.projects) ? course.projects.join('\n') : '',
  prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites.join('\n') : '',
  faq: Array.isArray(course.faq) ? course.faq.map(item => `${item?.q || ''} | ${item?.a || ''}`).join('\n') : '',
  language: course.language || '',
  supportText: course.supportText || '',
  certificateIncluded: course.certificateIncluded === true,
})

const textLines = (value) => String(value || '').split('\n').map(item => item.trim()).filter(Boolean)


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
    teamMembers,
  } = useStore()
  const { currentUser, userProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )
  const displayName = userProfile?.displayName || currentUser?.displayName || memberData?.name || 'Employee'
  const employeeId = userProfile?.employeeId || currentUser?.employeeId || memberData?.employeeId || ''
  const employeeKeys = useMemo(
    () => getEmployeeKeyList(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )
  const myCourses = useMemo(
    () => courses.filter(course => courseBelongsToEmployee(course, employeeKeys)),
    [courses, employeeKeys]
  )
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('plans') // details | plans | materials | meeting | students
  const [publicDetailsForm, setPublicDetailsForm] = useState(getPublicDetailsForm())
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
  const [weeklySchedule, setWeeklySchedule] = useState('')
  const [editMeet, setEditMeet] = useState(false)
  const [editingPlanMeetingIdx, setEditingPlanMeetingIdx] = useState(null)
  const [planMeetingForm, setPlanMeetingForm] = useState({
    meetingLink: '',
    weeklySchedule: '',
    meetingDateTime: '',
    meetingTimezone: DEFAULT_TIMEZONE
  })
  const [certificateBusyId, setCertificateBusyId] = useState('')
  const planMeetingStats = useMemo(() => {
    const plans = Array.isArray(selectedCourse?.plans) ? selectedCourse.plans : []
    return {
      scheduled: plans.filter(plan => plan?.meetingStartsAt || plan?.weeklySchedule).length,
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
    setPublicDetailsForm(getPublicDetailsForm(course))
    setMeetingLink(course.meetingLink || '')
    setWeeklySchedule(course.weeklySchedule || '')
    setActiveTab('plans')
    setEditMeet(false)
    setEditingPlanMeetingIdx(null)
  }

  const savePublicDetails = async () => {
    if (!selectedCourse) return
    setSaving(true)
    try {
      const updates = {
        description: publicDetailsForm.description.trim(),
        features: textLines(publicDetailsForm.outcomes),
        curriculum: textLines(publicDetailsForm.curriculum).map(title => ({ title })),
        projects: textLines(publicDetailsForm.projects),
        prerequisites: textLines(publicDetailsForm.prerequisites),
        faq: textLines(publicDetailsForm.faq)
          .map(line => {
            const [question, ...answerParts] = line.split('|')
            const answer = answerParts.join('|').trim()
            return question?.trim() && answer ? { q: question.trim(), a: answer } : null
          })
          .filter(Boolean),
        language: publicDetailsForm.language.trim(),
        supportText: publicDetailsForm.supportText.trim(),
        certificateIncluded: publicDetailsForm.certificateIncluded,
      }
      await updateCourse(selectedCourse.id, updates)
      setSelectedCourse(current => ({ ...current, ...updates }))
    } finally {
      setSaving(false)
    }
  }


  const openCreateCourse = useCallback(() => {
    if (!canCreateCourses) return
    setCourseForm(COURSE_BLANK)
    setShowCourseModal(true)
  }, [canCreateCourses])

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
        enrollmentDeadline: normalizeEnrollmentDeadline(courseForm.enrollmentDeadline),
        availableSoon: courseForm.availableSoon === true,
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
  }, [canCreateCourses, searchParams, setSearchParams, openCreateCourse])

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
      weeklySchedule: plan.weeklySchedule || '',
      meetingDateTime: formatDateTimeInput(plan.meetingStartsAt),
      meetingTimezone: plan.meetingTimezone || DEFAULT_TIMEZONE,
      enrollmentDeadline: normalizeEnrollmentDeadline(plan.enrollmentDeadline),
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
      const normalizedWeeklySchedule = (planForm.weeklySchedule || '').trim()
      const normalizedMeetingStartsAt = planForm.meetingDateTime ? new Date(planForm.meetingDateTime).toISOString() : ''
      const normalizedMeetingTimezone = planForm.meetingTimezone || DEFAULT_TIMEZONE
      const meetingChanged =
        normalizeText(existingPlan?.meetingLink) !== normalizeText(normalizedMeetingLink) ||
        normalizeText(existingPlan?.weeklySchedule) !== normalizeText(normalizedWeeklySchedule) ||
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
        weeklySchedule: normalizedWeeklySchedule,
        meetingStartsAt: normalizedMeetingStartsAt,
        meetingTimezone: normalizedMeetingStartsAt ? normalizedMeetingTimezone : '',
        enrollmentDeadline: normalizeEnrollmentDeadline(planForm.enrollmentDeadline),
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
      await updateCourse(selectedCourse.id, { meetingLink, weeklySchedule })
      setSelectedCourse({ ...selectedCourse, meetingLink, weeklySchedule })
      setEditMeet(false)

      if (courseEnrollments.length > 0 && (meetingLink || weeklySchedule)) {
        await Promise.all(
          courseEnrollments.map(enr => 
            emailNotify('course_meeting_scheduled', {
              studentName: enr.userName || enr.userEmail,
              studentEmail: enr.userEmail,
              courseTitle: selectedCourse.title,
              planLabel: 'Course Live Session',
              weeklySchedule: weeklySchedule || 'Weekly Live Class',
              meetingLink: meetingLink || '',
              employeeName: userProfile?.displayName || currentUser?.displayName || selectedCourse.instructor || 'Lead Mentor',
              reason: 'schedule_updated'
            })
          )
        )
      }
    } finally { setSaving(false) }
  }

  const openPlanMeetingEditor = (plan, idx) => {
    setEditingPlanMeetingIdx(idx)
    setPlanMeetingForm({
      meetingLink: plan.meetingLink || '',
      weeklySchedule: plan.weeklySchedule || '',
      meetingDateTime: formatDateTimeInput(plan.meetingStartsAt),
      meetingTimezone: plan.meetingTimezone || DEFAULT_TIMEZONE
    })
  }

  const savePlanMeetingDirect = async (idx) => {
    setSaving(true)
    try {
      const plans = Array.isArray(selectedCourse.plans) ? [...selectedCourse.plans] : []
      const existing = plans[idx] || {}
      const normalizedStartsAt = planMeetingForm.meetingDateTime ? new Date(planMeetingForm.meetingDateTime).toISOString() : ''
      const updatedPlan = {
        ...existing,
        meetingLink: planMeetingForm.meetingLink.trim(),
        weeklySchedule: planMeetingForm.weeklySchedule.trim(),
        meetingStartsAt: normalizedStartsAt,
        meetingTimezone: normalizedStartsAt ? (planMeetingForm.meetingTimezone || DEFAULT_TIMEZONE) : '',
        meetingReminderSentAt: '',
        meetingLiveSentAt: ''
      }
      plans[idx] = updatedPlan
      await updateCourse(selectedCourse.id, { plans })
      setSelectedCourse({ ...selectedCourse, plans })
      setEditingPlanMeetingIdx(null)

      const recipients = courseEnrollments.filter(enr => 
        enr.userEmail && matchesPlanEnrollment(enr, updatedPlan, selectedCourse)
      )
      if (recipients.length > 0 && (updatedPlan.meetingLink || updatedPlan.weeklySchedule)) {
        await Promise.all(
          recipients.map(enr =>
            emailNotify('course_meeting_scheduled', {
              studentName: enr.userName || enr.userEmail,
              studentEmail: enr.userEmail,
              courseTitle: selectedCourse.title,
              planLabel: updatedPlan.label || 'Plan Access',
              weeklySchedule: updatedPlan.weeklySchedule || 'Weekly Live Session',
              meetingLink: updatedPlan.meetingLink || '',
              employeeName: userProfile?.displayName || currentUser?.displayName || selectedCourse.instructor || 'Lead Mentor',
              reason: 'schedule_updated'
            })
          )
        )
      }
    } catch (err) {
      alert(err?.message || 'Failed to save plan meeting details.')
    } finally {
      setSaving(false)
    }
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
    { id: 'details', label: 'Public details', title: 'Public Course Details', icon: BookOpen },
    { id: 'plans', label: 'Plans', title: 'Duration Plans & Pricing', icon: CircleDollarSign },
    { id: 'materials', label: 'Materials', title: 'Study Materials', icon: FileText },
    { id: 'meeting', label: 'Session Link', title: 'Meeting / Session Link', icon: Video },
    { id: 'students', label: 'Students', title: 'Enrolled Students', icon: Users },
  ]
  const emptyStateTitle = canCreateCourses ? 'Create your first course' : 'No courses assigned'
  const emptyStateBody = canCreateCourses
    ? 'Use Add Course to create a draft course. After that you can manage plans, materials, meeting links, and students here.'
    : 'Ask the admin to assign you as instructor for a course.'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            {canCreateCourses
              ? 'Create draft courses from your employee panel and manage delivery details from one place.'
              : 'Manage your assigned course plans, materials, meeting links, and student activity.'}
          </p>
        </div>
        {canCreateCourses && (
          <button
            onClick={openCreateCourse}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:shadow-lg"
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-900">{emptyStateTitle}</p>
              <p className="mt-2 text-xs text-slate-400">{emptyStateBody}</p>
            </div>
          ) : visibleCourses.map(course => {
            const cnt = enrollments.filter(e => e.status === 'active' && matchesCourseEnrollment(e, course)).length
            const planCount = (course.plans || []).length
            const enrollmentClosed = isEnrollmentClosed(course)
            const deadlineText = formatEnrollmentDeadline(course.enrollmentDeadline)
            return (
              <button key={course.id} onClick={() => openCourse(course)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCourse?.id === course.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{course.title}</h4>
                    <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{planCount} plans</span>
                      <span>·</span>
                      <span>{cnt} students</span>
                    </div>
                    {deadlineText && (
                      <p className={`mt-1 text-[10px] font-semibold ${enrollmentClosed ? 'text-rose-300' : 'text-amber-300'}`}>
                        {enrollmentClosed ? `Enrollment closed on ${deadlineText}` : `Enrollment closes on ${deadlineText}`}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3">
          {!selectedCourse ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center">
              <div className="flex justify-center mb-4 text-blue-400">
                {visibleCourses.length === 0 ? <BookOpen className="w-12 h-12" /> : <MousePointerClick className="w-12 h-12" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {visibleCourses.length === 0 ? emptyStateTitle : 'Select a course to manage'}
              </h3>
              <p className="text-slate-500 text-sm max-w-lg mx-auto">
                {visibleCourses.length === 0
                  ? emptyStateBody
                  : 'Choose a course from the left to update its plans, materials, meeting links, and enrolled students.'}
              </p>
              {canCreateCourses && visibleCourses.length === 0 && (
                <button
                  onClick={openCreateCourse}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-blue-700"
                >
                  Create Course
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white/60 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCourse.title}</h2>
                  <p className="text-sm text-slate-500">
                    {[selectedCourse.category, selectedCourse.level].filter(Boolean).join(' · ') || 'Course details'}
                  </p>
                  {selectedCourse.enrollmentDeadline && (
                    <p className={`mt-1 text-xs font-semibold ${isEnrollmentClosed(selectedCourse) ? 'text-rose-300' : 'text-amber-300'}`}>
                      {isEnrollmentClosed(selectedCourse)
                        ? `Enrollment closed on ${formatEnrollmentDeadline(selectedCourse.enrollmentDeadline)}`
                        : `Enrollment closes on ${formatEnrollmentDeadline(selectedCourse.enrollmentDeadline)}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-400">
                    {(selectedCourse.plans || []).length} plan{(selectedCourse.plans || []).length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-400">{courseEnrollments.length} enrolled</p>
                  <p className="text-[10px] text-slate-500 mt-1">{planMeetingStats.scheduled} scheduled · {planMeetingStats.linksReady} links ready</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto bg-white p-1 rounded-xl border border-slate-200">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`min-w-max flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === t.id ? 'bg-blue-600 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ─── PLANS TAB ─────────────────────────────────── */}
              {activeTab === 'details' && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/60 p-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Public course details</h3>
                    <p className="mt-1 text-xs text-slate-500">This content appears on the public course page. Add one item per line; FAQ format is Question | Answer.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Overview</label>
                    <textarea value={publicDetailsForm.description} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, description: event.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="Short course overview" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div><label className="text-xs font-bold text-slate-700">What students will learn</label><textarea value={publicDetailsForm.outcomes} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, outcomes: event.target.value })} rows={6} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="One outcome per line" /></div>
                    <div><label className="text-xs font-bold text-slate-700">Syllabus modules</label><textarea value={publicDetailsForm.curriculum} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, curriculum: event.target.value })} rows={6} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="One module per line" /></div>
                    <div><label className="text-xs font-bold text-slate-700">Projects / assignments</label><textarea value={publicDetailsForm.projects} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, projects: event.target.value })} rows={5} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="One project per line" /></div>
                    <div><label className="text-xs font-bold text-slate-700">Prerequisites</label><textarea value={publicDetailsForm.prerequisites} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, prerequisites: event.target.value })} rows={5} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="One prerequisite per line" /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div><label className="text-xs font-bold text-slate-700">Language</label><input value={publicDetailsForm.language} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, language: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="e.g. Hindi + English" /></div>
                    <div><label className="text-xs font-bold text-slate-700">Student support</label><input value={publicDetailsForm.supportText} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, supportText: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="e.g. Community and doubt support" /></div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={publicDetailsForm.certificateIncluded} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, certificateIncluded: event.target.checked })} className="h-4 w-4 accent-blue-600" /> Verifiable certificate included</label>
                  <div><label className="text-xs font-bold text-slate-700">FAQs</label><textarea value={publicDetailsForm.faq} onChange={event => setPublicDetailsForm({ ...publicDetailsForm, faq: event.target.value })} rows={5} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="Who can join? | Beginners can join this course." /></div>
                  <div className="flex justify-end"><button onClick={savePublicDetails} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Public Details'}</button></div>
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Duration Plans & Pricing</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Students see these plans on the course page</p>
                    </div>
                    <button onClick={openAddPlan}
                      className="px-3 py-1.5 bg-blue-600 text-slate-900 text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Plan
                    </button>
                  </div>

                  {!(selectedCourse.plans || []).length ? (
                    <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
                      <div className="flex justify-center mb-3">
                        <CircleDollarSign className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-slate-900 font-bold text-base mb-1">No Access Plans Added Yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">Create pricing tiers like Basic 1-Month, Standard 3-Months, or Premium Lifetime Access.</p>
                      <button onClick={openAddPlan} className="mt-5 px-5 py-2.5 bg-blue-600 text-white text-xs font-extrabold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                        + Add First Duration Plan
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {(selectedCourse.plans || []).map((plan, idx) => (
                        <div key={idx} className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-lg ${plan.highlighted ? 'border-amber-300 bg-amber-50/30 ring-2 ring-amber-500/20' : 'border-slate-200 bg-white'}`}>
                          {plan.highlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full flex items-center gap-1 shadow-md">
                              <Star className="w-3 h-3 fill-white text-white" /> Most Popular Tier
                            </div>
                          )}
                          
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-base">{plan.label}</h4>
                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                                  ⏱️ {plan.duration}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className={`text-xl font-black ${plan.highlighted ? 'text-amber-600' : 'text-blue-600'}`}>
                                  {plan.isFree || plan.price === 0 ? 'FREE' : `₹${Number(plan.price).toLocaleString('en-IN')}`}
                                </p>
                              </div>
                            </div>

                            {plan.enrollmentDeadline && (
                              <p className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 mb-3">
                                ⏳ Deadline: {formatEnrollmentDeadline(plan.enrollmentDeadline)}
                              </p>
                            )}

                            {plan.features?.length > 0 && (
                              <ul className="space-y-1.5 mb-4 border-t border-slate-100 pt-3">
                                {plan.features.slice(0, 4).map((f, fi) => (
                                  <li key={fi} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" /> <span className="truncate">{f}</span>
                                  </li>
                                ))}
                                {plan.features.length > 4 && <li className="text-[10px] font-bold text-slate-400 pl-5">+{plan.features.length - 4} more benefits</li>}
                              </ul>
                            )}

                            {/* Session Schedule Badge */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 mb-4 space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Session Status</p>
                              {plan.weeklySchedule ? (
                                <p className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                                  📅 {plan.weeklySchedule}
                                </p>
                              ) : plan.meetingStartsAt ? (
                                <p className="text-xs font-bold text-slate-800">{formatMeetingPreview(plan.meetingStartsAt, plan.meetingTimezone)}</p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No schedule set</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${plan.meetingLink ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                  {plan.meetingLink ? '✓ Meeting Link Set' : 'No Link Set'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Plan Actions */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 mt-auto">
                            <button onClick={() => movePlan(idx, -1)} disabled={idx === 0} title="Move Up" className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 text-xs font-bold">↑</button>
                            <button onClick={() => movePlan(idx, 1)} disabled={idx === (selectedCourse.plans || []).length - 1} title="Move Down" className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 text-xs font-bold">↓</button>
                            <button onClick={() => openEditPlan(plan, idx)} className="flex-1 py-2 px-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-black transition-colors">
                              Edit Plan
                            </button>
                            <button onClick={() => deletePlan(idx)} title="Delete Plan" className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* ─── MATERIALS TAB ──────────────────────────────── */}
              {activeTab === 'materials' && (
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Study Materials</h3>
                  <div className="flex gap-2 mb-4">
                    <input value={matForm.title} onChange={e => setMatForm({...matForm, title: e.target.value})} placeholder="Material title" className="flex-1 px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50" />
                    <input value={matForm.url} onChange={e => setMatForm({...matForm, url: e.target.value})} placeholder="URL / link" className="flex-1 px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50" />
                    <button onClick={addMaterial} disabled={saving || !matForm.title || !matForm.url} className="px-4 py-2.5 bg-purple-600 text-slate-900 text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 transition-all">Add</button>
                  </div>
                  {!(selectedCourse.materials || []).length ? (
                    <p className="text-sm text-slate-500 italic py-4">No materials added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(selectedCourse.materials || []).map((mat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <FileText className="w-6 h-6 text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{mat.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{mat.url}</p>
                          </div>
                          <button onClick={() => removeMaterial(i)} className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── MEETING LINK TAB ───────────────────────────── */}
              {activeTab === 'meeting' && (
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-6">
                  {/* Course Default Meeting & Weekly Schedule Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Default Meeting & Weekly Schedule</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Set a default live session link and weekly schedule for students.
                        </p>
                      </div>
                      <button 
                        onClick={() => setEditMeet(!editMeet)} 
                        className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all"
                      >
                        {editMeet ? 'Cancel' : 'Edit Meeting & Schedule'}
                      </button>
                    </div>

                    {editMeet ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Live Meeting URL</label>
                          <input 
                            value={meetingLink} 
                            onChange={e => setMeetingLink(e.target.value)} 
                            placeholder="https://meet.google.com/... or Zoom link"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500" 
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Weekly Live Schedule (Days & Time)</label>
                          <div className="flex gap-2 flex-wrap mb-2">
                            {[
                              'Sunday to Monday Live Session @ 7:00 PM',
                              'Every Sunday @ 10:00 AM',
                              'Every Monday @ 6:00 PM',
                              'Every Mon, Wed, Fri @ 7:00 PM',
                              'Every Tue & Thu @ 6:00 PM',
                              'Weekend Special (Sat & Sun @ 11:00 AM)',
                              'Daily Live Class (Mon to Sat @ 8:00 PM)'
                            ].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setWeeklySchedule(preset)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-semibold transition-all"
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>

                          <input 
                            value={weeklySchedule} 
                            onChange={e => setWeeklySchedule(e.target.value)} 
                            placeholder="e.g. Every Mon & Wed @ 7 PM"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500" 
                          />
                        </div>

                        <div className="flex justify-end">
                          <button 
                            onClick={saveMeeting} 
                            disabled={saving} 
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                          >
                            Save Meeting & Schedule
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {selectedCourse.meetingLink ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Meeting Link:</span>
                            <a href={selectedCourse.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold underline break-all">
                              {selectedCourse.meetingLink}
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No default meeting link set.</p>
                        )}

                        {selectedCourse.weeklySchedule ? (
                          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                            📅 Weekly Schedule: <span className="text-slate-800 font-semibold">{selectedCourse.weeklySchedule}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">No weekly schedule configured.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Plan-specific Live Meeting & Weekly Schedule List */}
                  {!!selectedCourse.plans?.length && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Per-Plan Meeting Links & Weekly Schedules</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedCourse.plans.map((plan, idx) => {
                          const isEditingThisPlan = editingPlanMeetingIdx === idx

                          return (
                            <div key={`${plan.id || plan.label || idx}-meeting`} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    Plan #{idx + 1}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900 mt-1">{plan.label}</h4>
                                </div>
                                <button
                                  onClick={() => {
                                    if (isEditingThisPlan) {
                                      setEditingPlanMeetingIdx(null)
                                    } else {
                                      openPlanMeetingEditor(plan, idx)
                                    }
                                  }}
                                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
                                >
                                  {isEditingThisPlan ? 'Cancel' : 'Edit Plan Link & Schedule'}
                                </button>
                              </div>

                              {isEditingThisPlan ? (
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Plan Meeting Link</label>
                                    <input 
                                      value={planMeetingForm.meetingLink}
                                      onChange={e => setPlanMeetingForm({ ...planMeetingForm, meetingLink: e.target.value })}
                                      placeholder="https://meet.google.com/... or Zoom link"
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Weekly Live Session Schedule</label>
                                    <div className="flex gap-2 flex-wrap mb-2">
                                      {[
                                        'Every Mon, Wed, Fri @ 7:00 PM',
                                        'Every Tue & Thu @ 6:00 PM',
                                        'Weekend Special (Sat & Sun @ 11:00 AM)',
                                        'Daily Live Class @ 8:00 PM'
                                      ].map(preset => (
                                        <button
                                          key={preset}
                                          type="button"
                                          onClick={() => setPlanMeetingForm({ ...planMeetingForm, weeklySchedule: preset })}
                                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-medium transition-all"
                                        >
                                          + {preset}
                                        </button>
                                      ))}
                                    </div>
                                    <input 
                                      value={planMeetingForm.weeklySchedule}
                                      onChange={e => setPlanMeetingForm({ ...planMeetingForm, weeklySchedule: e.target.value })}
                                      placeholder="e.g. Every Mon & Wed @ 7:00 PM"
                                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Specific Start Date/Time (Optional)</label>
                                      <input 
                                        type="datetime-local"
                                        value={planMeetingForm.meetingDateTime}
                                        onChange={e => setPlanMeetingForm({ ...planMeetingForm, meetingDateTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Timezone</label>
                                      <input 
                                        value={planMeetingForm.meetingTimezone}
                                        onChange={e => setPlanMeetingForm({ ...planMeetingForm, meetingTimezone: e.target.value })}
                                        placeholder="Asia/Kolkata"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      onClick={() => setEditingPlanMeetingIdx(null)}
                                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => savePlanMeetingDirect(idx)}
                                      disabled={saving}
                                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                                    >
                                      Save Plan Meeting & Schedule
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 text-xs">
                                  {plan.meetingLink ? (
                                    <p className="text-slate-600 flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">Meeting Link:</span>
                                      <a href={plan.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline truncate">
                                        {plan.meetingLink}
                                      </a>
                                    </p>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 bg-slate-100 text-slate-500">
                                      No plan link set
                                    </span>
                                  )}

                                  {plan.weeklySchedule && (
                                    <p className="font-bold text-emerald-600 flex items-center gap-1 mt-1">
                                      📅 Weekly Schedule: <span className="text-slate-800 font-medium">{plan.weeklySchedule}</span>
                                    </p>
                                  )}

                                  {plan.meetingStartsAt && (
                                    <p className="text-[11px] text-slate-500">
                                      🕒 Next Class: {formatMeetingPreview(plan.meetingStartsAt, plan.meetingTimezone)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* ─── STUDENTS TAB ───────────────────────────────── */}
              {activeTab === 'students' && (
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Enrolled Students ({courseEnrollments.length})</h3>
                  {courseEnrollments.length === 0 ? <p className="text-sm text-slate-500 italic py-4">No students enrolled yet</p> : (
                    <div className="space-y-2">
                      {courseEnrollments.map(enr => {
                        const documents = DOCUMENT_TYPES.map(type => ({
                          type: type.id,
                          meta: type,
                          record: getEnrollmentCertificate(enr, selectedCourse, type.id),
                        }))
                        return (
                        <div key={enr.id} className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 lg:flex-row lg:items-center">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold text-slate-900 flex-shrink-0">
                            {(enr.userName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{enr.userName || '—'}</p>
                            <p className="text-[10px] text-slate-400">{enr.userEmail} · {enr.planLabel || 'Standard'}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {documents.map(({ type, meta, record }) => (
                                <span key={type} className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${record ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                                  {record ? `${meta.shortLabel} Issued` : `${meta.shortLabel} Pending`}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-left lg:text-right flex-shrink-0">
                            <p className="text-xs font-bold text-blue-400">{Number(enr.amount) === 0 ? 'FREE' : `₹${Number(enr.amount).toLocaleString('en-IN')}`}</p>
                            {enr.userMobile && <p className="text-[10px] text-slate-400">{enr.userMobile}</p>}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowPlanModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl mb-10 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-blue-600" />
                  {editingPlanIdx !== null ? 'Edit Access Plan' : 'Add Duration Access Plan'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure duration, pricing, live session links, and student features</p>
              </div>
              <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Plan Name & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Plan Name *</label>
                  <div className="flex gap-1.5 flex-wrap mb-1.5">
                    {['Basic Access', 'Standard Plan', 'Pro Mentorship', 'Lifetime Access'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, label: preset })}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-[10px] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input 
                    value={planForm.label} 
                    onChange={e => setPlanForm({...planForm, label: e.target.value})} 
                    placeholder="e.g. Standard 3-Months" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Duration *</label>
                  <div className="flex gap-1.5 flex-wrap mb-1.5">
                    {['1 Month', '3 Months', '6 Months', 'Lifetime'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, duration: preset })}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-[10px] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input 
                    value={planForm.duration} 
                    onChange={e => setPlanForm({...planForm, duration: e.target.value})} 
                    placeholder="e.g. 3 Months Full Access" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              {/* Pricing & Free Plan Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <input 
                    type="number" 
                    value={planForm.price} 
                    onChange={e => setPlanForm({...planForm, price: e.target.value})} 
                    disabled={planForm.isFree} 
                    placeholder="4999" 
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-40" 
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-4">
                  <span className="text-xs font-extrabold text-slate-700">Free Course Access</span>
                  <button 
                    type="button" 
                    onClick={() => setPlanForm({...planForm, isFree: !planForm.isFree})}
                    className={`w-12 h-6 rounded-full relative transition-all ${planForm.isFree ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${planForm.isFree ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Highlight as Most Popular */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                <div>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Highlight as "Most Popular"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Shows a golden recommended tag on the course sales card</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPlanForm({...planForm, highlighted: !planForm.highlighted})}
                  className={`w-12 h-6 rounded-full relative transition-all ${planForm.highlighted ? 'bg-amber-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${planForm.highlighted ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Features (One per line + Quick Chips) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Included Features (One per line)</label>
                  <span className="text-[10px] text-slate-400">Click chips to quick add</span>
                </div>

                <div className="flex gap-1.5 flex-wrap mb-2">
                  {[
                    '30 Recorded Video Modules',
                    'Weekly Live Session & Doubt Clearing',
                    '1-on-1 Mentor Guidance',
                    'Verified Certificate on Completion',
                    'WhatsApp Premium Support Group'
                  ].map(featureText => (
                    <button
                      key={featureText}
                      type="button"
                      onClick={() => {
                        const current = planForm.features.trim()
                        if (current.includes(featureText)) return
                        setPlanForm({
                          ...planForm,
                          features: current ? `${current}\n${featureText}` : featureText
                        })
                      }}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold transition-colors"
                    >
                      + {featureText}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={planForm.features} 
                  onChange={e => setPlanForm({...planForm, features: e.target.value})} 
                  rows={4}
                  placeholder="30 Recorded Videos&#10;Weekly Live Sessions&#10;1-on-1 Doubt Clearing&#10;Certificate on Completion"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 resize-none font-mono" 
                />
              </div>

              {/* Live Session Link & Weekly Schedule Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Live Meeting & Weekly Schedule</h4>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Plan Live Meeting URL</label>
                  <input
                    value={planForm.meetingLink}
                    onChange={e => setPlanForm({ ...planForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/... or Zoom link"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Weekly Live Session Schedule</label>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {[
                      'Sunday to Monday Live Session @ 7:00 PM',
                      'Every Sunday @ 10:00 AM',
                      'Every Monday @ 6:00 PM',
                      'Every Mon, Wed, Fri @ 7:00 PM',
                      'Weekend Special (Sat & Sun @ 11:00 AM)'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, weeklySchedule: preset })}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-[10px] font-medium transition-all"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    value={planForm.weeklySchedule}
                    onChange={e => setPlanForm({ ...planForm, weeklySchedule: e.target.value })}
                    placeholder="e.g. Sunday to Monday Live Session @ 7:00 PM"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1.6fr,1fr] gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Single Session Start Date/Time</label>
                    <input
                      type="datetime-local"
                      value={planForm.meetingDateTime}
                      onChange={e => setPlanForm({ ...planForm, meetingDateTime: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Timezone</label>
                    <input
                      value={planForm.meetingTimezone}
                      onChange={e => setPlanForm({ ...planForm, meetingTimezone: e.target.value })}
                      placeholder="Asia/Kolkata"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Enrollment Deadline */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plan Enrollment Deadline</label>
                <input
                  type="date"
                  value={planForm.enrollmentDeadline}
                  onChange={e => setPlanForm({ ...planForm, enrollmentDeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Enrollment for this specific plan closes automatically after this date.</p>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowPlanModal(false)} 
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={savePlan} 
                disabled={saving || !planForm.label || !planForm.duration}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : editingPlanIdx !== null ? 'Update Access Plan' : 'Save Access Plan'}
              </button>
            </div>
          </div>
        </div>
      )}


      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCreateCourse} />
          <div className="relative mb-10 w-full max-w-2xl rounded-2xl border border-slate-300 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create New Course</h2>
                <p className="mt-1 text-xs text-slate-400">This course will be assigned to your employee account automatically.</p>
              </div>
              <button onClick={closeCreateCourse} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveCourseDraft} className="space-y-4 p-6">
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
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
                <div className="sm:col-span-2">
                  <label className="label">Enrollment Deadline</label>
                  <input
                    type="date"
                    value={courseForm.enrollmentDeadline}
                    onChange={event => setCourseForm({ ...courseForm, enrollmentDeadline: event.target.value })}
                    className="input"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Leave this empty if students should be able to enroll at any time.</p>
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
                <p className="mt-1 text-[11px] text-slate-400">Optional. This image can be used later on course cards and listing pages.</p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/[0.03] p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Available Soon</p>
                  <p className="mt-1 text-[11px] text-slate-400">Mark this as an upcoming program so admin can publish it with a public coming soon state.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCourseForm({ ...courseForm, availableSoon: !courseForm.availableSoon })}
                  className={`relative h-6 w-11 rounded-full transition-all ${courseForm.availableSoon ? 'bg-fuchsia-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${courseForm.availableSoon ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-slate-900">Assigned Instructor</p>
                <p className="mt-1 text-sm text-slate-500">{displayName}</p>
                <p className="mt-1 text-[11px] text-slate-400">Employee ID: {employeeId || 'Not set'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateCourse}
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseSaving || !courseForm.title.trim() || !courseForm.category}
                  className="flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:shadow-lg disabled:opacity-50"
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
