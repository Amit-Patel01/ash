import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'
import {
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  getEmployeeKeyList,
  courseBelongsToEmployee,
  getEmployeeDisplayName,
} from './employeeUtils'

/* ── Utility ─────────────────────────────────────────────────────── */
const getInitials = (name = '') =>
  (name || 'S').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

const avatarGradients = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-purple-600',
]

const getGradient = (str = '') => avatarGradients[str.charCodeAt(0) % avatarGradients.length]

/* ── Sub-components ──────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[24px]"
        style={{ background: `${gradient}08` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>
        </div>
        <div className="w-11 h-11 flex items-center justify-center rounded-2xl text-white shadow-md flex-shrink-0"
          style={{ background: gradient }}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full"
        style={{ background: gradient }} />
    </div>
  )
}

function CourseProgressBar({ course, enrolled }) {
  const studentCount = enrolled.filter(e => e.courseId === course.id || e.courseTitle === course.title).length
  const gradient = getGradient(course.title || '')
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/8 bg-white/50 dark:bg-white/4 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group">
      {/* Color accent */}
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center shadow-md`}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title || 'Untitled Course'}
        </p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {studentCount} student{studentCount !== 1 ? 's' : ''} enrolled
          {course.price ? ` · ₹${Number(course.price).toLocaleString('en-IN')}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
          {studentCount} enrolled
        </span>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function MentorDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { courses, users, certificates } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState('overview')
  const [studentSearch, setStudentSearch] = useState('')

  const displayName = getEmployeeDisplayName(currentUser, userProfile)
  const firstName = displayName.split(' ')[0]

  /* ── Resolve which courses belong to this mentor ── */
  const memberData = useMemo(
    () => getEmployeeMemberData(users, currentUser, userProfile),
    [users, currentUser, userProfile]
  )
  const employeeKeys = useMemo(
    () => getEmployeeKeyList(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const myCourses = useMemo(
    () => courses.filter(c => courseBelongsToEmployee(c, employeeKeys)),
    [courses, employeeKeys]
  )

  /* ── All enrollments from users store ── */
  const allEnrollments = useMemo(() => {
    const result = []
    users.forEach(u => {
      if (u.role === 'student' || !u.role || u.role === 'user') {
        myCourses.forEach(course => {
          const isEnrolled = u.enrollments?.some?.(
            e => e.courseId === course.id || e.courseTitle === course.title
          )
          if (isEnrolled) {
            result.push({ ...u, enrolledCourse: course })
          }
        })
      }
    })
    return result
  }, [users, myCourses])

  /* ── Students list (deduplicated) ── */
  const myStudents = useMemo(() => {
    const seen = new Set()
    return allEnrollments.filter(e => {
      if (seen.has(e.uid || e.email)) return false
      seen.add(e.uid || e.email)
      return true
    })
  }, [allEnrollments])

  /* ── Certificates issued for mentor's courses ── */
  const myCerts = useMemo(
    () => certificates.filter(cert =>
      myCourses.some(c => c.title === cert.courseName || c.id === cert.courseId)
    ),
    [certificates, myCourses]
  )

  /* ── Filtered students ── */
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return myStudents
    const q = studentSearch.toLowerCase()
    return myStudents.filter(s =>
      (s.displayName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.enrolledCourse?.title || '').toLowerCase().includes(q)
    )
  }, [myStudents, studentSearch])

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'students', label: `Students (${myStudents.length})` },
    { key: 'courses', label: `Courses (${myCourses.length})` },
  ]

  /* ── Styles ── */
  const cardBase = `rounded-[24px] border ${isDark ? 'bg-slate-900 border-white/8' : 'bg-white border-slate-200/80'} shadow-sm`

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* ── Header ── */}
      <div className={`relative overflow-hidden rounded-[28px] p-7 sm:p-9 ${isDark ? 'bg-slate-900 border border-white/8' : 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-orange-100/60'} shadow-sm`}>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-orange-300/10 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Mentor Hub</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back, {firstName}! 🎓
            </h1>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your mentoring command center — students, courses, and progress at a glance.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              to="/employee/certificates"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              Issue Certificate
            </Link>
            <Link
              to="/employee/broadcast"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold hover:-translate-y-0.5 transition-all ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>
              Broadcast
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="My Students"
          value={myStudents.length}
          sub="Total enrolled"
          gradient="linear-gradient(135deg,#6366f1,#8b5cf6)"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
        />
        <StatCard
          label="My Courses"
          value={myCourses.length}
          sub="Assigned to you"
          gradient="linear-gradient(135deg,#f59e0b,#f97316)"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
        />
        <StatCard
          label="Certificates"
          value={myCerts.length}
          sub="Issued from your courses"
          gradient="linear-gradient(135deg,#10b981,#14b8a6)"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
        />
        <StatCard
          label="Enrollments"
          value={allEnrollments.length}
          sub="Across all your courses"
          gradient="linear-gradient(135deg,#ec4899,#f43f5e)"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>}
        />
      </div>

      {/* ── Tabs ── */}
      <div className={`${cardBase} overflow-hidden`}>
        {/* Tab bar */}
        <div className={`flex border-b ${isDark ? 'border-white/8' : 'border-slate-100'}`}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-sm font-bold transition-all relative ${
                activeTab === tab.key
                  ? isDark ? 'text-amber-400' : 'text-amber-600'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* My Courses quick view */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>My Assigned Courses</h3>
                  <button onClick={() => setActiveTab('courses')} className="text-xs font-bold text-indigo-500 hover:text-indigo-400">View All →</button>
                </div>
                {myCourses.length === 0 ? (
                  <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
                    <p className="text-sm text-slate-500 font-medium">No courses assigned yet. Contact admin to assign courses.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myCourses.slice(0, 4).map(course => (
                      <CourseProgressBar key={course.id} course={course} enrolled={allEnrollments} />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent students */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recent Students</h3>
                  <button onClick={() => setActiveTab('students')} className="text-xs font-bold text-indigo-500 hover:text-indigo-400">View All →</button>
                </div>
                {myStudents.length === 0 ? (
                  <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
                    <p className="text-sm text-slate-500 font-medium">No students enrolled in your courses yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {myStudents.slice(0, 4).map((student, idx) => (
                      <div key={student.uid || idx}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${isDark ? 'border-white/8 bg-white/4 hover:bg-white/8' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm'}`}>
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient(student.displayName || student.email || '')} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                          {student.photoURL
                            ? <img src={student.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover" />
                            : getInitials(student.displayName || student.email)
                          }
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {student.displayName || student.email?.split('@')[0] || 'Student'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{student.enrolledCourse?.title || 'Enrolled'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className={`text-sm font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Actions</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { to: '/employee/certificates', label: 'Issue Certificate', desc: 'Generate QR certs', gradient: 'from-emerald-500 to-teal-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg> },
                    { to: '/employee/broadcast', label: 'Send Broadcast', desc: 'Email all students', gradient: 'from-violet-500 to-purple-600', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" /></svg> },
                    { to: '/employee/course-manage', label: 'Manage Courses', desc: 'Edit your courses', gradient: 'from-amber-500 to-orange-500', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
                  ].map(action => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${isDark ? 'border-white/8 bg-white/4 hover:bg-white/8' : 'border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-600 transition-colors`}>{action.label}</p>
                        <p className="text-xs text-slate-500">{action.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search students by name, email, or course..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                />
              </div>

              {filteredStudents.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {studentSearch ? 'No students match your search.' : 'No students enrolled in your courses yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student, idx) => (
                    <div
                      key={student.uid || idx}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${isDark ? 'border-white/8 bg-white/4 hover:bg-white/8' : 'border-slate-100 bg-white hover:border-amber-100 hover:shadow-sm'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(student.displayName || '')} flex items-center justify-center text-white text-sm font-black flex-shrink-0 overflow-hidden`}>
                        {student.photoURL
                          ? <img src={student.photoURL} alt="" className="w-full h-full object-cover" />
                          : getInitials(student.displayName || student.email)
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {student.displayName || student.email?.split('@')[0] || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      </div>
                      {/* Course */}
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200/80'}`}>
                          {student.enrolledCourse?.title ? student.enrolledCourse.title.slice(0, 22) + (student.enrolledCourse.title.length > 22 ? '…' : '') : 'Course'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="space-y-3">
              {myCourses.length === 0 ? (
                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-white/4' : 'bg-slate-50'}`}>
                  <p className="text-sm text-slate-500 font-medium">No courses assigned yet. Contact admin to assign courses to your account.</p>
                  <Link to="/employee/course-manage" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all">
                    View Course Manager →
                  </Link>
                </div>
              ) : (
                myCourses.map(course => (
                  <CourseProgressBar key={course.id} course={course} enrolled={allEnrollments} />
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
