'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
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
  Folder,
  MessageSquare,
  Send,
  Code,
  CornerDownRight,
  Plus
} from 'lucide-react'

const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

export default function UserMyCourses() {
  const { getUserEnrollments, courses, certificates } = useStore()
  const { currentUser } = useAuth()
    const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)
  const [expandedId, setExpandedId] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [activeCourseWorkspace, setActiveCourseWorkspace] = useState(null)
  const [workspaceTab, setWorkspaceTab] = useState('curriculum')

  // Real-time Assignment & Doubt states for Student
  const [studentAssignments, setStudentAssignments] = useState([])
  const [studentDoubts, setStudentDoubts] = useState([])
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [isPostingDoubt, setIsPostingDoubt] = useState(false)
  const [userActionMsg, setUserActionMsg] = useState('')

  // New Submission Form State
  const [projectForm, setProjectForm] = useState({
    assignmentTitle: '',
    repoUrl: '',
    liveUrl: '',
    studentNotes: ''
  })

  // New Doubt Form State
  const [doubtForm, setDoubtForm] = useState({
    question: '',
    codeSnippet: ''
  })

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
    thumbnail: '' })

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

  // Fetch live assignments & doubts for active course workspace
  const fetchStudentCourseData = async () => {
    if (!activeCourseWorkspace) return
    try {
      const [resA, resD] = await Promise.all([
        fetch('/api/mentor/assignments', { cache: 'no-store' }),
        fetch('/api/mentor/doubts', { cache: 'no-store' })
      ])
      if (resA.ok) {
        const dataA = await resA.json()
        if (dataA.success && Array.isArray(dataA.assignments)) {
          setStudentAssignments(dataA.assignments)
        }
      }
      if (resD.ok) {
        const dataD = await resD.json()
        if (dataD.success && Array.isArray(dataD.doubts)) {
          setStudentDoubts(dataD.doubts)
        }
      }
    } catch (err) {
      console.error('Error fetching student live data:', err)
    }
  }

  // Real-time live polling for student workspace (every 4s)
  useEffect(() => {
    if (activeCourseWorkspace) {
      fetchStudentCourseData()
      const interval = setInterval(fetchStudentCourseData, 4000)
      return () => clearInterval(interval)
    }
  }, [activeCourseWorkspace])

  // Student Submits Assignment to Mentor Live
  const handleStudentProjectSubmit = async (e, courseTitle) => {
    e.preventDefault()
    if (!projectForm.assignmentTitle.trim()) return

    setIsSubmittingTask(true)
    try {
      const studentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'
      const studentEmail = currentUser?.email || 'student@example.com'
      const res = await fetch('/api/mentor/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentEmail,
          courseTitle: courseTitle || 'Full-Stack Web Development',
          assignmentTitle: projectForm.assignmentTitle.trim(),
          repoUrl: projectForm.repoUrl.trim(),
          liveUrl: projectForm.liveUrl.trim(),
          studentNotes: projectForm.studentNotes.trim()
        })
      })

      if (res.ok) {
        setProjectForm({ assignmentTitle: '', repoUrl: '', liveUrl: '', studentNotes: '' })
        setUserActionMsg('Project submitted successfully! Your faculty mentor has received it in real time.')
        fetchStudentCourseData()
        setTimeout(() => setUserActionMsg(''), 5000)
      }
    } catch (err) {
      console.error('Submission failed:', err)
    } finally {
      setIsSubmittingTask(false)
    }
  }

  // Student Posts Doubt to Mentor Live
  const handleStudentDoubtSubmit = async (e, courseTitle) => {
    e.preventDefault()
    if (!doubtForm.question.trim()) return

    setIsPostingDoubt(true)
    try {
      const studentName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'
      const studentEmail = currentUser?.email || 'student@example.com'
      const res = await fetch('/api/mentor/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentEmail,
          courseTitle: courseTitle || 'Full-Stack Web Development',
          question: doubtForm.question.trim(),
          codeSnippet: doubtForm.codeSnippet.trim()
        })
      })

      if (res.ok) {
        setDoubtForm({ question: '', codeSnippet: '' })
        setUserActionMsg('Doubt posted! Your faculty mentor will reply in real time.')
        fetchStudentCourseData()
        setTimeout(() => setUserActionMsg(''), 5000)
      }
    } catch (err) {
      console.error('Failed to post doubt:', err)
    } finally {
      setIsPostingDoubt(false)
    }
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
        courseDocuments }

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
          entry })
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
          material: mat })
      })
    }

    allDocuments.forEach((doc) => {
      learningResources.push({
        id: buildResourceId(group.key, 'document', doc.certificate_id || doc.id),
        type: 'Document',
        title: getCertificateDocumentLabel(doc),
        subtitle: `Issued #${doc.certificate_id || 'ID'}`,
        url: `/verify?id=${doc.certificate_id}`,
        doc })
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
      groupResourcesReady }
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
          
          {/* Left Column: Interactive Workspace Tabs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Workspace Inner Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setWorkspaceTab('curriculum')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  workspaceTab === 'curriculum'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lessons & Curriculum</span>
              </button>
              <button
                onClick={() => setWorkspaceTab('assignments')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  workspaceTab === 'assignments'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Projects & Assignments</span>
              </button>
              <button
                onClick={() => setWorkspaceTab('doubts')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  workspaceTab === 'doubts'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Doubts & Mentor Q&A</span>
              </button>
            </div>

            {userActionMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>{userActionMsg}</span>
              </div>
            )}

            {/* TAB 1: CURRICULUM LESSONS */}
            {workspaceTab === 'curriculum' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Program Curriculum & Modules
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
            )}

            {/* TAB 2: LIVE ASSIGNMENT & PROJECT SUBMISSIONS */}
            {workspaceTab === 'assignments' && (
              <div className="space-y-6">
                
                {/* Submit New Project Form */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" /> Submit Project for Mentor Review
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Submit your source code repository or live link for feedback & grading.</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleStudentProjectSubmit(e, course.title)} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Project / Milestone Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Capstone Project: Full-Stack React & Node.js API"
                        value={projectForm.assignmentTitle}
                        onChange={(e) => setProjectForm({ ...projectForm, assignmentTitle: e.target.value })}
                        className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          GitHub Repository URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/your-username/repo-name"
                          value={projectForm.repoUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                          className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Live Deployment URL (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://your-project.vercel.app"
                          value={projectForm.liveUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                          className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Implementation Notes / Features Completed
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Briefly describe what you built, architecture choices, or instructions to run..."
                        value={projectForm.studentNotes}
                        onChange={(e) => setProjectForm({ ...projectForm, studentNotes: e.target.value })}
                        className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none resize-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingTask}
                        className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingTask ? 'Submitting...' : 'Submit to Mentor'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Submissions History */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Your Project Submissions & Feedback</h4>
                  {studentAssignments.filter(a => (a.studentEmail || '').toLowerCase() === (currentUser?.email || '').toLowerCase() || a.courseTitle === course.title).length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      No project submissions yet. Submit your project code above to get evaluated!
                    </div>
                  ) : (
                    studentAssignments.filter(a => (a.studentEmail || '').toLowerCase() === (currentUser?.email || '').toLowerCase() || a.courseTitle === course.title).map((sub) => (
                      <div
                        key={sub.id || sub._id}
                        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h5 className="text-sm font-black text-slate-900 dark:text-white">{sub.assignmentTitle}</h5>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            sub.status === 'graded'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : sub.status === 'revision_requested'
                                ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {sub.status === 'graded' ? `Score: ${sub.score}` : sub.status === 'revision_requested' ? 'Revision Needed' : 'Under Review'}
                          </span>
                        </div>

                        {sub.studentNotes && (
                          <p className="text-xs text-slate-500">"{sub.studentNotes}"</p>
                        )}

                        {sub.feedback && (
                          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800 text-xs">
                            <strong className="text-indigo-600 dark:text-indigo-400 font-bold block mb-0.5">Faculty Mentor Feedback:</strong>
                            <span className="text-slate-700 dark:text-slate-300">{sub.feedback}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold">
                          {sub.repoUrl && (
                            <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600">
                              <GithubIcon className="w-3.5 h-3.5" /> Source Code
                            </a>
                          )}
                          {sub.liveUrl && (
                            <a href={sub.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                              <ExternalLink className="w-3.5 h-3.5" /> Live Preview
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: LIVE DOUBTS & MENTOR Q&A */}
            {workspaceTab === 'doubts' && (
              <div className="space-y-6">
                
                {/* Ask Doubt Form */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" /> Ask a Question to Faculty Mentor
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Post technical questions or errors. Your mentor will reply directly.</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleStudentDoubtSubmit(e, course.title)} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Your Question / Doubt
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Explain the problem or error you are facing in detail..."
                        value={doubtForm.question}
                        onChange={(e) => setDoubtForm({ ...doubtForm, question: e.target.value })}
                        className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none resize-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Code Snippet / Error Logs (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Paste code or error stack trace here..."
                        value={doubtForm.codeSnippet}
                        onChange={(e) => setDoubtForm({ ...doubtForm, codeSnippet: e.target.value })}
                        className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-indigo-400 font-mono outline-none resize-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPostingDoubt}
                        className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isPostingDoubt ? 'Posting...' : 'Ask Faculty Mentor'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Doubts Thread Feed */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Discussion & Mentor Solutions</h4>
                  {studentDoubts.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      No questions asked yet. Ask a question above to start the discussion!
                    </div>
                  ) : (
                    studentDoubts.map((d) => (
                      <div
                        key={d.id || d._id}
                        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{d.studentName}</span>
                            <span className="text-[10px] text-slate-400">• {d.postedAt || 'Recently'}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            d.status === 'resolved'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {d.status === 'resolved' ? 'Answered' : 'Waiting for Mentor'}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.question}</p>

                        {d.codeSnippet && (
                          <div className="p-3 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                            <pre>{d.codeSnippet}</pre>
                          </div>
                        )}

                        {/* Replies */}
                        {Array.isArray(d.replies) && d.replies.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {d.replies.map((r, rIdx) => (
                              <div key={rIdx} className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 text-xs">
                                <div className="flex items-center gap-2 mb-1">
                                  <CornerDownRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                  <strong className="text-purple-700 dark:text-purple-300 font-bold">{r.author || 'Faculty Mentor'}</strong>
                                  <span className="text-[10px] text-slate-400">• {r.time || 'Recently'}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 pl-5">{r.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

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
                      href={`/verify?id=${doc.certificate_id}`}
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
            href="/user/certificates"
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