import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { getCertificateDocumentLabel } from '../utils/certificateHelpers'
import { getLearningTypeLabel } from '../utils/learningType'
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  FileText, 
  Award, 
  CheckCircle2, 
  Circle, 
  Video, 
  ExternalLink,
  User,
  Clock,
  Sparkles,
  ChevronRight,
  Folder
} from 'lucide-react'

export default function UserMyCourses() {
  const { getUserEnrollments, courses, certificates } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [activeCourseWorkspace, setActiveCourseWorkspace] = useState(null)

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
      // Keep working if localstorage blocked
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

  const formatPlanPrice = (price, isFree) => {
    if (isFree) return 'Free Plan'
    if (price === undefined || price === null || price === '') return 'Enrolled'
    const numericPrice = Number(price)
    if (Number.isNaN(numericPrice)) return String(price)
    return `₹${numericPrice.toLocaleString()}`
  }

  // Group enrollments by course
  const myCourseGroupsMap = myEnrollments.reduce((acc, enrollment) => {
    const matchedCourse = getMyCourse(enrollment)
    const course = matchedCourse || getCourseFallback(enrollment)
    const key = getCourseGroupKey(course, enrollment)

    if (!acc[key]) {
      acc[key] = {
        key,
        course,
        enrollments: []
      }
    }
    acc[key].enrollments.push(enrollment)
    return acc
  }, {})

  const myCourseGroups = Object.values(myCourseGroupsMap)

  // Build Learning Groups
  const courseLearningGroups = myCourseGroups.map((group) => {
    const course = group.course
    const planEntries = group.enrollments.map((enrollment) => {
      const planName = enrollment.selectedPlan || enrollment.planName || ''
      const matchedPlan = course.pricingPlans?.find((p) => p.name === planName)
      const resolvedPlanLabel = planName || matchedPlan?.name || 'Standard Access'
      const meetingLink = matchedPlan?.meetingLink || course.meetingLink || enrollment.meetingLink || ''
      const weeklySchedule = matchedPlan?.weeklySchedule || course.weeklySchedule || enrollment.weeklySchedule || ''
      const meetingDateTime = matchedPlan?.meetingDateTime || course.meetingDateTime || enrollment.meetingDateTime || ''
      const planFeatures = matchedPlan?.features || []

      const courseDocuments = myCertificates.filter((cert) => {
        const certCourseId = cert.courseId || cert.course_id
        const certCourseName = cert.courseName || cert.courseTitle || cert.course_name
        if (certCourseId && course.id && String(certCourseId) === String(course.id)) return true
        if (certCourseName && course.title && compact(certCourseName) === compact(course.title)) return true
        return false
      })

      return {
        enrollment,
        enrolledPlan: matchedPlan,
        resolvedPlanLabel,
        meetingLink,
        weeklySchedule,
        meetingDateTime,
        hasMeetingLink: Boolean(meetingLink),
        planFeatures,
        courseDocuments,
      }

    })

    const hasMaterials = (course.materials && course.materials.length > 0) || false
    const nextSessionEntry = planEntries.find((entry) => entry.meetingDateTime || entry.hasMeetingLink)
    const allDocuments = planEntries.flatMap((entry) => entry.courseDocuments)
    const primaryDocument = allDocuments[0]

    const learningResources = []

    planEntries.forEach((entry) => {
      if (entry.hasMeetingLink || entry.meetingDateTime) {
        learningResources.push({
          id: buildResourceId(group.key, 'live-session', entry.enrollment.id),
          type: 'Live Session',
          title: `Live Session • ${entry.resolvedPlanLabel}`,
          subtitle: entry.meetingDateTime ? `Scheduled: ${entry.meetingDateTime}` : 'Join room when live',
          url: entry.meetingLink || '',
          entry,
        })
      }
    })

    if (hasMaterials) {
      course.materials.forEach((mat, idx) => {
        learningResources.push({
          id: buildResourceId(group.key, 'material', mat.title || `item-${idx}`),
          type: 'Material',
          title: mat.title || `Resource Item ${idx + 1}`,
          subtitle: mat.description || 'Curriculum resource material',
          url: mat.fileUrl || mat.url || '',
          material: mat,
        })
      })
    }

    allDocuments.forEach((doc) => {
      learningResources.push({
        id: buildResourceId(group.key, 'document', doc.certificate_id || doc.id),
        type: 'Document',
        title: getCertificateDocumentLabel(doc),
        subtitle: `Issued #${doc.certificate_id || 'ID'}`,
        url: `/verify?id=${doc.certificate_id}`,
        doc,
      })
    })

    const completedResources = learningResources.filter((res) => isResourceComplete(res.id)).length
    const progressPercent = getProgressPercent(completedResources, learningResources.length)
    const nextResource = learningResources.find((res) => !isResourceComplete(res.id))
    const canExpand = learningResources.length > 0
    const groupResourcesReady = (hasMaterials ? 1 : 0) + (planEntries.some(e => e.hasMeetingLink) ? 1 : 0) + (allDocuments.length > 0 ? 1 : 0)

    return {
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
    }
  })

  const totalLearningResources = courseLearningGroups.reduce((total, group) => total + group.learningResources.length, 0)
  const completedLearningResources = courseLearningGroups.reduce((total, group) => total + group.completedResources, 0)
  const overallProgress = getProgressPercent(completedLearningResources, totalLearningResources)
  const readyLiveSessions = courseLearningGroups.reduce((total, group) => total + group.sessionResources?.filter((r) => r.url)?.length || 0, 0)
  const issuedDocuments = courseLearningGroups.reduce((total, group) => total + group.allDocuments.length, 0)

  const folderCategories = ['all', ...new Set(courseLearningGroups.map(g => g.group.enrollments[0]?.category || g.course.category || 'General'))]

  const displayLearningGroups = selectedFolder === 'all' 
    ? courseLearningGroups 
    : courseLearningGroups.filter(g => (g.group.enrollments[0]?.category || g.course.category || 'General') === selectedFolder)

  if (myEnrollments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Courses</h1>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No active program enrollments</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">Browse our industry-leading courses and webinars to start your technical learning journey.</p>
          <button onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/25 hover:scale-105 transition-all">
            Browse Courses <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── DEDICATED SEPARATE COURSE WORKSPACE VIEW ──────────────────────
  if (activeCourseWorkspace) {
    const { course, group, learningResources, completedResources, progressPercent, planEntries, allDocuments } = activeCourseWorkspace

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-16">
        {/* Workspace Top Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <button 
            onClick={() => setActiveCourseWorkspace(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" /> Back to My Courses
          </button>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[11px] font-black uppercase tracking-wider">
              {group.enrollments[0]?.category || course.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-black uppercase tracking-wider">
              Active Workspace
            </span>
          </div>
        </div>

        {/* Dedicated Course Header Banner */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 font-black border border-white/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">{course.category || 'Technology Program'}</p>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{course.title}</h1>
              </div>
            </div>

            {(() => {
              const assignedEmp = activeCourseWorkspace.group.enrollments.find(e => e.assignedEmployeeName)
              const mentorName = assignedEmp?.assignedEmployeeName || course.instructor || 'Lead Mentor'
              const mentorEmail = assignedEmp?.assignedEmployeeEmail || ''
              return (
                <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 font-bold text-white shadow-xs">
                    <User className="w-4 h-4 text-indigo-300" /> Assigned Lead Mentor: <span className="text-blue-300">{mentorName}</span>
                  </span>
                  {mentorEmail && (
                    <span className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      📧 {mentorEmail}
                    </span>
                  )}
                </div>
              )
            })()}


            {/* Overall Course Progress */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Curriculum Completion</p>
                <p className="text-2xl font-black text-white">{progressPercent}%</p>
              </div>
              <div className="sm:col-span-2">
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs font-medium text-slate-300 mt-1.5">{completedResources} of {learningResources.length} learning modules completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Dual Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Learning Curriculum Modules */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Program Curriculum & Lessons
              </h2>
              <span className="text-xs font-bold text-slate-500">{learningResources.length} items available</span>
            </div>

            <div className="space-y-3">
              {learningResources.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Curriculum content is being updated by your mentor.</p>
                </div>
              ) : (
                learningResources.map((res, index) => {
                  const resourceComplete = isResourceComplete(res.id)
                  return (
                    <div 
                      key={res.id} 
                      className={`p-5 rounded-3xl border transition-all ${
                        resourceComplete 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-500/30' 
                          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <button 
                            onClick={() => toggleResourceProgress(res.id)}
                            className="mt-0.5 text-emerald-600 hover:scale-110 transition-transform shrink-0"
                            title={resourceComplete ? "Mark incomplete" : "Mark completed"}
                          >
                            {resourceComplete ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100">
                                {res.type} #{index + 1}
                              </span>
                              {resourceComplete && (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                  COMPLETED
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{res.title}</h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{res.subtitle}</p>
                          </div>
                        </div>

                        {res.url && (
                          <a 
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-sm transition-all shrink-0"
                          >
                            Open <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Plans & Verified Documents */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Active Plans Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Enrolled Access Plans</h3>
              {planEntries.map((entry) => (
                <div key={entry.enrollment.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 space-y-2">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{entry.resolvedPlanLabel}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Enrolled: {formatDate(entry.enrollment.enrolledAt || entry.enrollment.createdAt)}</p>
                  {entry.hasMeetingLink && (
                    <div className="space-y-1 mt-2">
                      <a 
                        href={entry.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                      >
                        <Video className="w-4 h-4" /> Join Live Meeting Room
                      </a>
                      {entry.weeklySchedule && (
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-center pt-1">
                          📅 Weekly Schedule: {entry.weeklySchedule}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Issued Certificates Card */}
            {allDocuments.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Verified Certificates
                </h3>
                {allDocuments.map((doc) => (
                  <div key={doc.id || doc.certificate_id} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{getCertificateDocumentLabel(doc)}</p>
                      <p className="text-[10px] text-slate-500 font-medium">#{doc.certificate_id}</p>
                    </div>
                    <Link 
                      to={`/verify?id=${doc.certificate_id}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-black text-[11px] hover:bg-amber-700 transition-colors"
                    >
                      View Seal
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Support Desk Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-500/20 space-y-3">
              <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">Need Technical Assistance?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Contact your assigned lead mentor or submit a ticket to the SolutionHub support team.</p>
              <button 
                onClick={() => navigate('/user/support')}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                Contact Support Desk
              </button>
            </div>

          </div>

        </div>
      </div>
    )
  }

  // ── MAIN COURSE CARDS GRID DIRECTORY ──────────────────────────────
  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {myCourseGroups.length} active program{myCourseGroups.length !== 1 ? 's' : ''} • Click any course to open its dedicated workspace
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/user/certificates"
            className="px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-all"
          >
            Documents & Seals
          </Link>
          <button onClick={() => navigate('/courses')}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
            Browse More
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">LMS Progress</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{overallProgress}%</p>
            <p className="text-xs font-bold text-emerald-600">{completedLearningResources}/{totalLearningResources || 0} done</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">Learning Items</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{totalLearningResources}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Sessions & materials</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Live Ready</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{readyLiveSessions}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Joinable plan sessions</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">Documents</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{issuedDocuments}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Issued certificates</p>
        </div>
      </div>

      {/* 📁 Folder Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
        <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mr-2 shrink-0 flex items-center gap-1">
          <Folder className="w-4 h-4 text-blue-600" /> Folders:
        </span>
        {folderCategories.map(folder => {
          const count = folder === 'all' 
            ? courseLearningGroups.length 
            : courseLearningGroups.filter(g => (g.group.enrollments[0]?.category || g.course.category || 'General') === folder).length

          return (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border ${
                selectedFolder === folder
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${selectedFolder === folder ? 'text-white' : 'text-blue-500'}`} />
              <span>{folder === 'all' ? 'All Program Folders' : folder}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedFolder === folder ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {displayLearningGroups.map((learningGroup) => {
          const { group, course, learningResources, completedResources, progressPercent, planEntries } = learningGroup

          return (
            <div 
              key={group.key} 
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-blue-500/60 shadow-xs hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                
                {/* Left Thumbnail & Info */}
                <div className="flex items-start gap-5 min-w-0 flex-1">
                  <div 
                    onClick={() => setActiveCourseWorkspace(learningGroup)}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white overflow-hidden shrink-0 shadow-lg shadow-blue-500/20 cursor-pointer group-hover:scale-105 transition-transform"
                  >
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-white" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100">
                        {group.enrollments[0]?.category || course.category || 'Technology Track'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100">
                        Active Plan
                      </span>
                    </div>

                    {/* Course Title Click to Open Dedicated Workspace */}
                    <h3 
                      onClick={() => setActiveCourseWorkspace(learningGroup)}
                      className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer tracking-tight"
                    >
                      {course.title}
                    </h3>

                    {(() => {
                      const assignedEmp = group.enrollments.find(e => e.assignedEmployeeName)
                      const mentorName = assignedEmp?.assignedEmployeeName || course.instructor
                      return mentorName ? (
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pt-0.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" /> Assigned Lead Mentor: {mentorName}
                        </p>
                      ) : null
                    })()}


                    <p className="text-xs text-slate-400 font-medium pt-1">
                      {learningResources.length} curriculum items • Enrolled: {formatDate(group.enrollments[0]?.enrolledAt || group.enrollments[0]?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Right Progress & Open Dedicated Workspace CTA */}
                <div className="w-full sm:w-64 space-y-4 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                  <div>
                    <div className="flex items-center justify-between text-xs font-black mb-1.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Overall Progress</span>
                      <span className="text-emerald-600">{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{completedResources}/{learningResources.length} lessons finished</p>
                  </div>

                  <button 
                    onClick={() => setActiveCourseWorkspace(learningGroup)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Open Course Workspace <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}