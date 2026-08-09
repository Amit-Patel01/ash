'use client'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import {
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  normalize,
  taskBelongsToEmployee,
  getEmployeeKeyList,
  courseBelongsToEmployee,
} from './employeeUtils'

const isDone = (status) => ['done', 'completed', 'complete', 'closed'].includes(normalize(status))
const isProgress = (status) => ['in-progress', 'in progress', 'progress', 'working'].includes(normalize(status))

const getTimeValue = (value) => {
  if (!value) return 0
  if (typeof value?.toMillis === 'function') return value.toMillis()
  const date = value?.toDate ? value.toDate() : new Date(value)
  const time = date.getTime()
  return Number.isFinite(time) ? time : 0
}

const formatTimeAgo = (value) => {
  const time = getTimeValue(value)
  if (!time) return 'just now'
  const diff = Math.floor((Date.now() - time) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(time).toLocaleDateString('en-IN')
}

/* ─── Stat card icon definitions ────────────────────────────────── */
function StatCard({ label, value, hint, gradient, glow, iconPath }) {
  return (
    <div
      className="group relative overflow-hidden rounded-[28px] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[28px]" style={{ background: gradient, opacity: 0.04 }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{value}</p>
          <p className="mt-1.5 text-xs font-medium text-slate-500">{hint}</p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-md shadow-blue-500/10" style={{ background: gradient }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: gradient }} />
    </div>
  )
}

function ProgressBar({ progress, gradient = 'linear-gradient(90deg,#2563eb,#4f46e5)' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out shadow-2xs"
        style={{ width: `${progress}%`, background: gradient }}
      />
    </div>
  )
}

export default function EmployeeHomeDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { tasks, projects, teamMembers, courses, enrollments } = useStore()

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

  const displayName = userProfile?.displayName || currentUser?.displayName || memberData?.name || 'Employee'
  const roleLabel = userProfile?.jobTitle || memberData?.role || (userProfile?.role === 'mentor' ? 'Mentor' : 'Employee')
  const departmentLabel = userProfile?.department || memberData?.department || 'Operations'
  const employeeId = userProfile?.employeeId || currentUser?.employeeId || memberData?.employeeId || ''
  const employeeEmail = currentUser?.email || userProfile?.email || memberData?.email || ''
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'EM'
  
  // Realtime fetched user avatar URL
  const userAvatar = userProfile?.avatar || userProfile?.photoURL || currentUser?.photoURL || memberData?.avatar || ''

  const identities = useMemo(
    () => getEmployeeIdentitySet(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const myTasks = useMemo(
    () => tasks.filter((task) => taskBelongsToEmployee(task, identities)),
    [tasks, identities]
  )

  const myProjects = useMemo(() => {
    const projectNames = [...new Set(myTasks.map(task => task.project).filter(Boolean))]
    return projectNames.map(name => {
      const projectTasks = myTasks.filter(task => task.project === name)
      const completed = projectTasks.filter(task => isDone(task.status)).length
      const linkedProject = projects.find(project => normalize(project.title) === normalize(name))
      return {
        id: linkedProject?.id || name,
        name,
        total: projectTasks.length,
        completed,
        progress: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
      }
    }).sort((a, b) => b.total - a.total)
  }, [myTasks, projects])

  const employeeKeys = useMemo(
    () => getEmployeeKeyList(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const courseCards = useMemo(() => courses
    .filter(course => courseBelongsToEmployee(course, employeeKeys))
    .map(course => {
      const students = enrollments.filter(enrollment =>
        enrollment.status === 'active' &&
        (enrollment.courseId === course.id || enrollment.courseTitle === course.title)
      )
      return {
        id: course.id,
        title: course.title,
        category: course.category || 'General',
        plans: Array.isArray(course.plans) ? course.plans.length : 0,
        materials: Array.isArray(course.materials) ? course.materials.length : 0,
        meetingReady: !!course.meetingLink,
        students,
        studentCount: students.length,
      }
    })
    .sort((a, b) => b.studentCount - a.studentCount), [courses, enrollments, employeeKeys])

  const recentActivity = useMemo(() => courseCards
    .flatMap(course => course.students.map(item => ({ ...item, courseTitle: item.courseTitle || course.title })))
    .sort((a, b) => getTimeValue(b.enrolledAt) - getTimeValue(a.enrolledAt))
    .slice(0, 5), [courseCards])

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(task => isDone(task.status)).length
  const inProgressTasks = myTasks.filter(task => isProgress(task.status)).length
  const pendingTasks = totalTasks - completedTasks - inProgressTasks
  const readyCourses = courseCards.filter(course => course.meetingReady && course.materials > 0).length
  const activeStudents = courseCards.reduce((sum, course) => sum + course.studentCount, 0)

  const taskOverviewBars = [
    { label: 'Pending Tasks', count: pendingTasks, color: '#64748b', gradient: 'linear-gradient(90deg,#64748b,#94a3b8)' },
    { label: 'In Progress', count: inProgressTasks, color: '#f59e0b', gradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
    { label: 'Completed', count: completedTasks, color: '#10b981', gradient: 'linear-gradient(90deg,#10b981,#34d399)' },
  ]

  const normalizedRoleKey = String(roleLabel || '').trim().toLowerCase()

  const welcomeMessage = useMemo(() => {
    switch (normalizedRoleKey) {
      case 'hr & recruitment executive':
        return 'Coordinate interviews, screen incoming candidates, and welcome new members to SolutionHub.'
      case 'student support executive':
        return 'Help students with their queries, resolve doubts, and keep their learning journey smooth.'
      case 'business development executive (bde)':
        return 'Drive partnerships, connect with colleges, generate leads, and grow SolutionHub.'
      case 'marketing executive':
        return 'Manage social media campaigns, create viral creatives, and expand SolutionHub\'s reach.'
      case 'content writer':
        return 'Draft engaging blogs, design course materials, and refine certificate descriptions.'
      case 'lms coordinator':
        return 'Keep the LMS portal updated, upload courses, and track student completion metrics.'
      case 'training coordinator':
        return 'Schedule trainer-student sessions, update meeting schedules, and collect session feedback.'
      case 'project coordinator':
        return 'Assign projects to interns, track weekly progress reports, and guide development.'
      case 'graphic designer':
        return 'Design premium posters, certificate templates, and stunning branding visuals.'
      case 'web development intern/executive':
        return 'Maintain website systems, deploy technical updates, and build new LMS features.'
      case 'operations executive':
        return 'Handle daily documentation, coordinate team task-boards, and ensure smooth operations.'
      case 'placement & career support executive':
        return 'Conduct resume reviews, guide student careers, and bring placement drives.'
      default:
        return 'Your central hub for tasks, courses, student activity, and team communication — all in one clean workspace.'
    }
  }, [normalizedRoleKey])

  const currentStats = useMemo(() => {
    return [
      { label: 'Total Tasks', value: totalTasks, hint: `${pendingTasks} pending`, gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)', glow: 'rgba(37,99,235,0.2)', icon: 'task' },
      { label: 'Projects Mapped', value: myProjects.length, hint: `${inProgressTasks} in progress`, gradient: 'linear-gradient(135deg,#7c3aed,#9333ea)', glow: 'rgba(124,58,237,0.2)', icon: 'folder' },
      { label: 'Assigned Courses', value: courseCards.length, hint: `${readyCourses} delivery ready`, gradient: 'linear-gradient(135deg,#d97706,#ea580c)', glow: 'rgba(217,119,6,0.2)', icon: 'book' },
      { label: 'Active Students', value: activeStudents, hint: `${recentActivity.length} recent activity`, gradient: 'linear-gradient(135deg,#059669,#0284c7)', glow: 'rgba(5,150,105,0.2)', icon: 'students' },
    ]
  }, [totalTasks, pendingTasks, myProjects.length, inProgressTasks, courseCards.length, readyCourses, activeStudents, recentActivity.length])

  const currentQuickActions = useMemo(() => {
    return [
      { to: '/employee/tasks', label: 'My Tasks Board', caption: 'Review and update active tasks', color: '#2563eb' },
      { to: '/employee/projects', label: 'Assigned Source Codes', caption: 'Track delivery progress & projects', color: '#7c3aed' },
      { to: '/employee/chat', label: 'Team & Student Messages', caption: 'Direct communication channels', color: '#0284c7' },
      { to: '/employee/broadcast', label: 'Bulk Email Broadcast', caption: 'Announce updates to students', color: '#db2777' },
    ]
  }, [])

  const statIcons = {
    task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
    book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    students: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-300 font-['Outfit',sans-serif]">

      {/* ── 1. Hero Banner (Profile Photo Fetched + Glassmorphic Workspace Image Overlay) ── */}
      <section
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/15"
      >
        {/* Ambient glowing circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-300/20 blur-2xl" />

        {/* Side Employee / Tech Workspace background image with frosted glass overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 lg:w-1/2 pointer-events-none overflow-hidden rounded-r-[32px] opacity-25">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Employee Workspace"
            className="h-full w-full object-cover mix-blend-overlay filter blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-600/40 to-blue-700 backdrop-blur-xs" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between z-10">
          {/* Left: identity with fetched Profile Photo */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div
                className="h-14 w-14 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-lg shrink-0 flex items-center justify-center text-xl font-black text-white"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-0.5">Employee Workspace</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{displayName}</h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-blue-100 font-medium mb-4">
              {welcomeMessage}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-2xs">
                {roleLabel}
              </span>
              <span className="rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-100 bg-white/15 backdrop-blur-md border border-white/20">
                {departmentLabel}
              </span>
              {employeeId && (
                <span className="rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white bg-white/20 backdrop-blur-md border border-white/30">
                  ID {employeeId}
                </span>
              )}
            </div>
          </div>

          {/* Right: Glassmorphic mini stats cards */}
          <div className="grid grid-cols-2 gap-3 lg:min-w-[280px]">
            {[
              { label: 'Total Tasks', value: totalTasks },
              { label: 'Pending Tasks', value: pendingTasks },
              { label: 'Mapped Projects', value: myProjects.length },
              { label: 'Profile Status', value: employeeEmail ? 'Active' : 'Offline', small: true }
            ].map(tile => (
              <div key={tile.label} className="rounded-2xl p-3.5 bg-white/20 backdrop-blur-lg border border-white/30 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-100">{tile.label}</p>
                <p className={`mt-1.5 font-extrabold text-white ${tile.small ? 'text-xs mt-2.5 text-emerald-200 font-bold' : 'text-2xl'}`}>{tile.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Stat Cards (White Theme Cards with White-Blue Accents) ── */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {currentStats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            gradient={stat.gradient}
            glow={stat.glow}
            iconPath={statIcons[stat.icon] || statIcons['task']}
          />
        ))}
      </section>

      {/* ── 3. Main Content Grid ── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">

        {/* Left Column: Workload & Task Overview */}
        <div className="space-y-6">
          <div className="rounded-[28px] p-6 bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Task & Delivery Pipeline</h2>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">Real-time status breakdown of assigned workload</p>
              </div>
              <Link
                to="/employee/tasks"
                className="flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
              >
                Open Board →
              </Link>
            </div>

            <div className="space-y-4">
              {taskOverviewBars.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">{item.count}</span>
                  </div>
                  <ProgressBar progress={totalTasks ? Math.round((item.count / totalTasks) * 100) : 0} gradient={item.gradient} />
                </div>
              ))}
            </div>

            {totalTasks > 0 && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl p-4 bg-emerald-50/70 border border-emerald-200/80">
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-700">{Math.round((completedTasks / totalTasks) * 100)}%</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mt-0.5">Complete</p>
                </div>
                <div className="h-9 w-px bg-emerald-200" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{completedTasks} of {totalTasks} tasks completed across {myProjects.length} projects</p>
              </div>
            )}
          </div>

          <div className="rounded-[28px] p-6 bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Assigned Project Workspaces</h3>
              <span className="text-xs font-bold text-slate-500">{myProjects.length} active</span>
            </div>
            {myProjects.length === 0 ? (
              <div className="rounded-2xl p-8 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-blue-200/80 bg-blue-50/30">
                No active project mapping yet. Tasks assigned to your profile will appear here automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {myProjects.slice(0, 3).map(project => (
                  <div key={project.id} className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-200 transition-all shadow-2xs">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{project.name}</p>
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200">
                        {project.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={project.progress} gradient="linear-gradient(90deg,#2563eb,#4f46e5)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions + Feed */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-[28px] p-6 bg-white border border-slate-200/90 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 tracking-tight mb-0.5">Quick Actions</h2>
            <p className="text-xs text-slate-500 font-medium mb-4">Direct paths allowed for your role</p>

            <div className="space-y-2.5">
              {currentQuickActions.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3 rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/70 hover:bg-blue-50/70 hover:border-blue-200 transition-all cursor-pointer"
                >
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: link.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{link.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{link.caption}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Student Activity Feed */}
          <div className="rounded-[28px] p-6 bg-white border border-slate-200/90 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 tracking-tight mb-0.5">Student Enrollment Feed</h2>
            <p className="text-xs text-slate-500 font-medium mb-4">Latest student entries across courses</p>

            <div className="space-y-2.5">
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl p-6 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-slate-200 bg-slate-50/50">
                  No recent student activity.
                </div>
              ) : recentActivity.map(activity => (
                <div key={activity.id} className="rounded-2xl p-3.5 bg-slate-50/70 border border-slate-200/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{activity.userName || activity.studentName || 'Student'}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{activity.courseTitle}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatTimeAgo(activity.enrolledAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  )
}
