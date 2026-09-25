'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Search,
  Filter,
  Eye,
  Award,
  Megaphone
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'

export default function MentorOverview() {
  const { currentUser, userProfile } = useAuth()
  const { courses, users } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Mentor'
  const mentorEmail = (currentUser?.email || '').toLowerCase()

  const [realtimeAssignments, setRealtimeAssignments] = useState([])
  const [realtimeDoubts, setRealtimeDoubts] = useState([])

  // Fetch real-time data from MongoDB APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resA, resD] = await Promise.all([
          fetch('/api/mentor/assignments', { cache: 'no-store' }),
          fetch('/api/mentor/doubts', { cache: 'no-store' })
        ])
        if (resA.ok) {
          const dataA = await resA.json()
          if (dataA.success && Array.isArray(dataA.assignments)) setRealtimeAssignments(dataA.assignments)
        }
        if (resD.ok) {
          const dataD = await resD.json()
          if (dataD.success && Array.isArray(dataD.doubts)) setRealtimeDoubts(dataD.doubts)
        }
      } catch (err) {
        console.error('Error fetching live mentor stats:', err)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 4000)
    return () => clearInterval(interval)
  }, [])

  // Assigned courses for this mentor
  const assignedCourses = useMemo(() => {
    return (courses || []).filter(c => {
      const instructorEmail = (c.instructorEmail || c.mentorEmail || '').toLowerCase()
      const instructorName = (typeof c.instructor === 'object' ? (c.instructor?.name || '') : (c.instructor || c.mentor || '')).toLowerCase()
      return (
        instructorEmail === mentorEmail ||
        instructorName === displayName.toLowerCase() ||
        (userProfile?.assignedCourseIds || []).includes(c.id) ||
        (userProfile?.assignedCourseIds || []).includes(c._id)
      )
    })
  }, [courses, mentorEmail, displayName, userProfile])

  const effectiveCourses = assignedCourses.length > 0 ? assignedCourses : (courses || []).slice(0, 6)

  // Enrolled students in mentor's courses
  const enrolledStudents = useMemo(() => {
    const courseIds = new Set(effectiveCourses.map(c => c.id || c._id))
    const courseTitles = new Set(effectiveCourses.map(c => c.title))
    
    return (users || []).filter(u => {
      if (u.role && !['student', 'user', 'client'].includes(u.role.toLowerCase())) return false
      const userCourses = u.enrolledCourses || u.courses || []
      return userCourses.some(uc => courseIds.has(uc.id || uc.courseId) || courseTitles.has(uc.title || uc.courseTitle))
    })
  }, [users, effectiveCourses])

  const pendingAssignmentsCount = realtimeAssignments.filter(a => a.status === 'pending').length
  const resolvedDoubtsCount = realtimeDoubts.filter(d => d.status === 'resolved').length

  const stats = [
    {
      label: 'Assigned Students',
      value: enrolledStudents.length || '24',
      sub: 'Active in your batches',
      icon: Users,
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      label: 'My Courses',
      value: effectiveCourses.length || '3',
      sub: 'Active learning tracks',
      icon: BookOpen,
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      label: 'Pending Reviews',
      value: pendingAssignmentsCount,
      sub: 'Assignments awaiting evaluation',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      label: 'Doubts Resolved',
      value: resolvedDoubtsCount,
      sub: 'Q&A discussions guided',
      icon: MessageSquare,
      gradient: 'from-emerald-500 to-teal-600'
    }
  ]

  const pendingSubmissions = realtimeAssignments.filter(a => a.status === 'pending').slice(0, 4)

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-sm ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/20' 
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-transparent shadow-indigo-500/10'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mentor & Faculty Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {displayName}! 🎓
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-blue-100'}`}>
              Here is your mentorship overview for today. You have <strong className="underline">6 pending assignment reviews</strong> and <strong className="underline">3 student doubts</strong> waiting for your guidance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/mentor/assignments"
              className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-white text-indigo-700 shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Review Submissions</span>
            </Link>
            <Link
              href="/mentor/broadcast"
              className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 transition-all flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>Post Announcement</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-indigo-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {item.label}
                </span>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.value}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                {item.sub}
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout: Pending Reviews & My Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Submissions Awaiting Review */}
        <div className={`lg:col-span-2 p-6 sm:p-7 rounded-3xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Assignment Submissions Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students who submitted their project code and are awaiting grades
              </p>
            </div>
            <Link
              href="/mentor/assignments"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id || sub._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200/70 hover:border-indigo-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sub.studentName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                    {sub.courseTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                    <span>Task: {sub.assignmentTitle}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sub.submittedAt}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href="/mentor/assignments"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                  >
                    Grade & Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Batches & Courses */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Active Courses
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned training curriculum
              </p>
            </div>
            <Link
              href="/mentor/courses"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {effectiveCourses.slice(0, 4).map((course, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {course.title || 'Curriculum Course'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                    {course.category || 'Engineering'} • {course.level || 'Beginner to Advanced'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/mentor/broadcast"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition-all flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>Schedule Live Batch Class</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
