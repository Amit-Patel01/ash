import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  BookOpen, 
  Award, 
  ShoppingBag, 
  ChevronRight, 
  Play, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Code2,
  FileText,
  ShieldCheck,
  MoreHorizontal,
  Compass
} from 'lucide-react'

export default function UserOverview() {
  const { currentUser, userProfile } = useAuth()
  const { orders, getUserEnrollments, courses, certificates } = useStore()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  // Load lesson progress count
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0)

  useEffect(() => {
    if (!currentUser?.uid) return
    try {
      const progressKey = `solutionhub:lms-progress:${currentUser.uid}`
      const savedProgress = JSON.parse(localStorage.getItem(progressKey) || '{}')
      if (savedProgress && typeof savedProgress === 'object') {
        setCompletedLessonsCount(Object.keys(savedProgress).length)
      }
    } catch (e) {
      console.error(e)
    }
  }, [currentUser])

  // Get student's enrollments & active courses
  const myEnrollments = useMemo(() => {
    return currentUser ? getUserEnrollments(currentUser.uid) : []
  }, [getUserEnrollments, currentUser])

  // Map enrollments to courses
  const myCourses = useMemo(() => {
    return myEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId || (enrollment.courseTitle && c.title === enrollment.courseTitle))
      return {
        enrollment,
        course: course || {
          title: enrollment.courseTitle || enrollment.courseName || 'Active Track',
          category: enrollment.category || 'Technology',
          deliveryType: enrollment.deliveryType || 'course',
          materials: []
        }
      }
    })
  }, [myEnrollments, courses])

  // Get student's certificates
  const myCertificatesCount = useMemo(() => {
    if (!currentUser) return 0
    return certificates.filter(cert => {
      if (cert.status !== 'approved' && cert.status !== 'active') return false
      const uid = currentUser.uid
      const email = currentUser.email
      if (uid && cert.userId === uid) return true
      if (uid && cert.assignedEmployeeUid === uid) return true
      if (email && cert.assignedEmployeeEmail === email) return true
      return false
    }).length
  }, [certificates, currentUser])

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customer_email === currentUser?.email || o.customer_uid === currentUser?.uid)
  }, [orders, currentUser])

  const userName = userProfile?.displayName || currentUser?.displayName || 'Amit'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* ── 1. Hero Banner (Lavendar / White Gradient Card) ─────────────── */}
      <div className="relative overflow-hidden rounded-[32px] border border-indigo-100/90 dark:border-slate-800 bg-gradient-to-r from-[#eef2ff] via-[#f5f3ff] to-[#faf5ff] dark:from-slate-900 dark:to-indigo-950/40 p-8 sm:p-12 shadow-sm">
        {/* Background decorative dots */}
        <div className="absolute top-4 right-1/3 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-xs uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SolutionHub Workspace
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">{userName}</span>
            </h1>

            {/* Paragraph */}
            <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              Manage your learning journey, access verified documentation, track live mentorship sessions, and request custom software build solutions.
            </p>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3.5 flex-wrap">
              <Link 
                to="/user/my-courses" 
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                Continue Learning <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/user/certificates" 
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-extrabold text-xs sm:text-sm border border-slate-200/90 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <Award className="w-4.5 h-4.5 text-blue-600" /> Documents & Seals
              </Link>
            </div>
          </div>

          {/* 3D Illustration Mockup Graphics */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              {/* Floating window mock */}
              <div className="w-64 h-44 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-slate-800 shadow-2xl p-4 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500 relative">
                {/* Header controls */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                {/* Mock content lines */}
                <div className="space-y-2 py-2">
                  <div className="h-3 w-3/4 bg-indigo-100 dark:bg-indigo-950/60 rounded-full" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                </div>
                {/* Graduation cap badge */}
                <div className="absolute -top-7 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white transform rotate-12">
                  <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 14.6l7.74-4.453a1 1 0 000-1.745L12 4 4.26 8.402a1 1 0 000 1.745zM4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
                  </svg>
                </div>
                {/* Floating Badge Left */}
                <div className="absolute -bottom-4 -left-6 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white" />
                  </div>
                </div>
                {/* Floating Badge Right */}
                <div className="absolute top-12 -right-10 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Quick Access Row ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Quick Access</h3>
          <Link to="/courses" className="text-xs font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Item 1: My Courses */}
          <Link 
            to="/user/my-courses" 
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">My Courses</p>
                <p className="text-xs text-slate-400 font-medium">Continue learning</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
          </Link>

          {/* Item 2: Documents */}
          <Link 
            to="/user/certificates" 
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-500/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">Documents</p>
                <p className="text-xs text-slate-400 font-medium">View & download</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-sky-600 transition-all" />
          </Link>

          {/* Item 3: Build Project */}
          <Link 
            to="/user/custom-project" 
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Build Project</p>
                <p className="text-xs text-slate-400 font-medium">Submit & track</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
          </Link>

          {/* Item 4: Support Chat */}
          <Link 
            to="/user/support" 
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-500/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">Support Chat</p>
                <p className="text-xs text-slate-400 font-medium">Get help instantly</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
          </Link>
        </div>
      </div>

      {/* ── 3. Stat Cards Row with Sparkline Waves ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'ACTIVE TRACKS', value: myCourses.length, icon: BookOpen, iconBg: 'bg-blue-600 text-white', badge: 'ENROLLED', badgeClass: 'bg-blue-50 text-blue-600 border-blue-100', stroke: '#2563eb' },
          { label: 'LESSONS COMPLETED', value: completedLessonsCount, icon: Play, iconBg: 'bg-purple-600 text-white', badge: 'LMS PROGRESS', badgeClass: 'bg-purple-50 text-purple-600 border-purple-100', stroke: '#9333ea' },
          { label: 'VERIFIED DOCUMENTS', value: myCertificatesCount, icon: ShieldCheck, iconBg: 'bg-emerald-600 text-white', badge: 'VERIFIED', badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100', stroke: '#10b981' },
          { label: 'ENROLLED ORDERS', value: myOrders.length, icon: ShoppingBag, iconBg: 'bg-rose-500 text-white', badge: 'TRANSACTIONS', badgeClass: 'bg-rose-50 text-rose-600 border-rose-100', stroke: '#f43f5e' },
        ].map((stat, i) => {
          const IconComp = stat.icon
          return (
            <div 
              key={i} 
              className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Header row inside card */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-md shrink-0`}>
                    <IconComp className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${stat.badgeClass}`}>
                      {stat.badge}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Number & label */}
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">{stat.label}</p>
              </div>

              {/* Sparkline wave SVG animation at bottom of card */}
              <div className="mt-6 -mx-6 -mb-6">
                <svg className="w-full h-12 overflow-visible" viewBox="0 0 200 40" fill="none">
                  <path 
                    d="M0 25 Q 35 10, 70 28 T 140 15 T 200 22 L 200 40 L 0 40 Z" 
                    fill={`${stat.stroke}10`} 
                  />
                  <path 
                    d="M0 25 Q 35 10, 70 28 T 140 15 T 200 22" 
                    stroke={stat.stroke} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    fill="none" 
                  />
                  {/* Wave node dots */}
                  <circle cx="70" cy="28" r="3" fill={stat.stroke} />
                  <circle cx="140" cy="15" r="3" fill={stat.stroke} />
                </svg>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}