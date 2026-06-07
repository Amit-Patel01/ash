import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import {
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  normalize,
  taskBelongsToEmployee,
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
const statDefinitions = [
  {
    key: 'tasks',
    label: 'Total Tasks',
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    glow: 'rgba(99,102,241,0.35)',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    key: 'projects',
    label: 'Projects',
    gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)',
    glow: 'rgba(168,85,247,0.35)',
    iconPath: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
  },
  {
    key: 'courses',
    label: 'Courses',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    glow: 'rgba(245,158,11,0.35)',
    iconPath: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    key: 'students',
    label: 'Students',
    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
    glow: 'rgba(16,185,129,0.35)',
    iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
]

function StatCard({ label, value, hint, gradient, glow, iconPath }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${glow}, 0 4px 24px rgba(0,0,0,0.3)`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: gradient.replace('135deg', '145deg').replace(')', ', transparent)'), opacity: 0.05 }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-black text-white tracking-tight">{value}</p>
          <p className="mt-1.5 text-[12px] font-medium text-slate-500">{hint}</p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: gradient, boxShadow: `0 4px 16px ${glow}` }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: gradient }} />
    </div>
  )
}

function ProgressBar({ progress, gradient = 'linear-gradient(90deg,#10b981,#06b6d4)' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
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
    () => [...new Set([currentUser?.uid, userProfile?.uid, employeeId].filter(Boolean))],
    [currentUser?.uid, userProfile?.uid, employeeId]
  )

  const courseCards = useMemo(() => courses
    .filter(course => employeeKeys.includes(course.assignedEmployeeId) || employeeKeys.includes(course.assignedEmployeeRef))
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

  const stats = [
    { key: 'tasks', value: totalTasks, hint: `${pendingTasks} pending` },
    { key: 'projects', value: myProjects.length, hint: `${inProgressTasks} in progress` },
    { key: 'courses', value: courseCards.length, hint: `${readyCourses} delivery ready` },
    { key: 'students', value: activeStudents, hint: `${recentActivity.length} recent activity` },
  ]

  const taskOverviewBars = [
    { label: 'Pending', count: pendingTasks, color: '#64748b', gradient: 'linear-gradient(90deg,#64748b,#94a3b8)' },
    { label: 'In Progress', count: inProgressTasks, color: '#f59e0b', gradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
    { label: 'Completed', count: completedTasks, color: '#10b981', gradient: 'linear-gradient(90deg,#10b981,#34d399)' },
  ]

  return (
    <div className="space-y-7" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 lg:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(2,6,23,0.95) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 0 60px rgba(16,185,129,0.08), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {/* Left: identity */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(6,182,212,0.4))', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400 mb-1">Employee Workspace</p>
                <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">{displayName}</h1>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-400 mb-4">
              Your central hub for tasks, courses, student activity and team communication — all in one focused workspace.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                {roleLabel}
              </span>
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                {departmentLabel}
              </span>
              {employeeId && (
                <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  ID {employeeId}
                </span>
              )}
            </div>
          </div>

          {/* Right: mini stat tiles */}
          <div className="grid grid-cols-2 gap-3 lg:min-w-[280px]">
            {[
              { label: 'Pending Tasks', value: pendingTasks, color: '#64748b' },
              { label: 'Ready Courses', value: readyCourses, color: '#10b981' },
              { label: 'Recent Activity', value: recentActivity.length, color: '#6366f1' },
              { label: 'Support Email', value: employeeEmail ? '✓ Active' : '—', color: '#06b6d4', small: true },
            ].map(tile => (
              <div key={tile.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">{tile.label}</p>
                <p className={`mt-2 font-black text-white ${tile.small ? 'text-sm mt-3' : 'text-2xl'}`}>{tile.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const def = statDefinitions.find(d => d.key === stat.key)
          return (
            <StatCard
              key={stat.key}
              label={def.label}
              value={stat.value}
              hint={stat.hint}
              gradient={def.gradient}
              glow={def.glow}
              iconPath={def.iconPath}
            />
          )
        })}
      </section>

      {/* ── Main Content Grid ─────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.1fr_0.85fr]">

        {/* Task Pipeline */}
        <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-black text-white">Task Pipeline</h2>
              <p className="mt-0.5 text-[12px] text-slate-500">Status breakdown of your workload</p>
            </div>
            <Link
              to="/employee/tasks"
              className="flex-shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-300 transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Open Board →
            </Link>
          </div>

          {/* Task bars */}
          <div className="space-y-4">
            {taskOverviewBars.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[12px] font-semibold text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-[12px] font-black text-white">{item.count}</span>
                </div>
                <ProgressBar progress={totalTasks ? Math.round((item.count / totalTasks) * 100) : 0} gradient={item.gradient} />
              </div>
            ))}
          </div>

          {/* Completion rate ring-like display */}
          {totalTasks > 0 && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-400">{Math.round((completedTasks / totalTasks) * 100)}%</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mt-0.5">Complete</p>
              </div>
              <div className="h-10 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <p className="text-[12px] text-slate-400 leading-5">{completedTasks} of {totalTasks} tasks completed across {myProjects.length} projects</p>
            </div>
          )}

          {/* Projects */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Projects</h3>
              <span className="text-[10px] text-slate-600">{myProjects.length} mapped</span>
            </div>
            {myProjects.length === 0 ? (
              <div className="rounded-2xl px-4 py-8 text-center text-[12px] text-slate-600" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                No project assignments yet
              </div>
            ) : myProjects.slice(0, 4).map(project => (
              <div key={project.id} className="rounded-2xl p-4 mb-2 transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[13px] font-semibold text-white truncate">{project.name}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black text-sky-300 flex-shrink-0"
                    style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
                  >
                    {project.progress}%
                  </span>
                </div>
                <ProgressBar progress={project.progress} gradient="linear-gradient(90deg,#38bdf8,#06b6d4)" />
                <p className="mt-1.5 text-[10px] text-slate-600">{project.completed}/{project.total} tasks done</p>
              </div>
            ))}
          </div>
        </div>

        {/* Course Delivery Board */}
        <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-black text-white">Course Delivery Board</h2>
              <p className="mt-0.5 text-[12px] text-slate-500">Meeting links, materials and student load</p>
            </div>
            <Link
              to="/employee/course-manage"
              className="flex-shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-300 transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Manage →
            </Link>
          </div>

          <div className="space-y-3">
            {courseCards.length === 0 ? (
              <div className="rounded-2xl px-4 py-10 text-center" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                <p className="text-[13px] font-semibold text-white mb-1">No courses assigned yet</p>
                <p className="text-[12px] text-slate-600">Ask admin to assign a course to manage it here.</p>
              </div>
            ) : courseCards.slice(0, 4).map(course => (
              <div
                key={course.id}
                className="rounded-2xl p-4 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{course.title}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-600">{course.category}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    {course.studentCount} students
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { val: course.plans, lbl: 'Plans' },
                    { val: course.materials, lbl: 'Materials' },
                    { val: course.meetingReady ? 'Ready' : 'Pending', lbl: 'Meeting', colored: true, ready: course.meetingReady },
                  ].map(item => (
                    <div key={item.lbl} className="rounded-xl py-2 text-center" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className={`text-[13px] font-black ${item.colored ? (item.ready ? 'text-emerald-400' : 'text-amber-400') : 'text-white'}`}>{item.val}</p>
                      <p className="mt-0.5 text-[9px] text-slate-600">{item.lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Latest Student Activity */}
          <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
            <h2 className="text-[13px] font-black text-white mb-0.5">Student Activity</h2>
            <p className="text-[11px] text-slate-500 mb-4">Recent enrollments on your courses</p>

            <div className="space-y-2.5">
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl px-4 py-8 text-center text-[12px] text-slate-600" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                  Activity will appear here automatically
                </div>
              ) : recentActivity.map(activity => (
                <div key={activity.id} className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white truncate">{activity.userName || activity.studentName || 'Student enrolled'}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{activity.courseTitle}</p>
                    </div>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{formatTimeAgo(activity.enrolledAt)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activity.planLabel && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-violet-300" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        {activity.planLabel}
                      </span>
                    )}
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {Number(activity.amount || 0) > 0 ? `₹${Number(activity.amount).toLocaleString('en-IN')}` : 'FREE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
            <h2 className="text-[13px] font-black text-white mb-0.5">Quick Actions</h2>
            <p className="text-[11px] text-slate-500 mb-4">Jump to pages you use most</p>

            <div className="space-y-2">
              {[
                { to: '/employee/tasks', label: 'Open Tasks', caption: 'Track pending and completed work', color: '#3b82f6' },
                { to: '/employee/course-manage', label: 'Manage Courses', caption: 'Update materials and meeting links', color: '#f59e0b' },
                { to: '/employee/broadcast', label: 'Send Broadcast', caption: 'Email enrolled students quickly', color: '#ec4899' },
                { to: '/employee/chat', label: 'Open Messages', caption: 'Respond to team communication', color: '#06b6d4' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${link.color}30`; e.currentTarget.style.background = `${link.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: link.color }} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white">{link.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{link.caption}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 ml-auto flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
