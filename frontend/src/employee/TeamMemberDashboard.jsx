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

export default function TeamMemberDashboard() {
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

  const myCourses = useMemo(() => courses.filter(course =>
    employeeKeys.includes(course.assignedEmployeeId) ||
    employeeKeys.includes(course.assignedEmployeeRef)
  ), [courses, employeeKeys])

  const courseCards = useMemo(() => myCourses.map(course => {
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
  }).sort((a, b) => b.studentCount - a.studentCount), [myCourses, enrollments])

  const recentActivity = useMemo(() => courseCards
    .flatMap(course => course.students.map(item => ({
      ...item,
      courseTitle: item.courseTitle || course.title,
    })))
    .sort((a, b) => getTimeValue(b.enrolledAt) - getTimeValue(a.enrolledAt))
    .slice(0, 5), [courseCards])

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(task => isDone(task.status)).length
  const inProgressTasks = myTasks.filter(task => isProgress(task.status)).length
  const pendingTasks = totalTasks - completedTasks - inProgressTasks
  const readyCourses = courseCards.filter(course => course.meetingReady && course.materials > 0).length
  const activeStudents = courseCards.reduce((sum, course) => sum + course.studentCount, 0)

  const stats = [
    { label: 'Tasks', value: totalTasks, hint: `${pendingTasks} pending` },
    { label: 'Projects', value: myProjects.length, hint: `${inProgressTasks} in progress` },
    { label: 'Courses', value: myCourses.length, hint: `${readyCourses} delivery ready` },
    { label: 'Students', value: activeStudents, hint: `${recentActivity.length} recent activity` },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(3,7,18,0.96))] p-6 shadow-2xl shadow-black/20 lg:p-8">
        <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-white">{initials}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Employee Workspace</p>
                <h1 className="text-3xl font-black tracking-tight text-white lg:text-4xl">{displayName}</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              This dashboard organizes tasks, assigned courses, student activity, and quick actions so day-to-day work can be managed in one place.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">{roleLabel}</span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">{departmentLabel}</span>
              {employeeId && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200">ID {employeeId}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Pending</p><p className="mt-2 text-2xl font-black text-white">{pendingTasks}</p><p className="mt-1 text-xs text-slate-400">Tasks waiting</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ready Courses</p><p className="mt-2 text-2xl font-black text-white">{readyCourses}</p><p className="mt-1 text-xs text-slate-400">Meeting + materials set</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</p><p className="mt-2 text-2xl font-black text-white">{recentActivity.length}</p><p className="mt-1 text-xs text-slate-400">Latest enrollments</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Support</p><p className="mt-2 truncate text-sm font-semibold text-white">{employeeEmail || 'Employee account'}</p><p className="mt-1 text-xs text-slate-400">Live notifications enabled</p></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-gray-900/70 p-5 shadow-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-4xl font-black text-white">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-400">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black text-white">Task Pipeline</h2><p className="mt-1 text-sm text-slate-400">What needs attention right now.</p></div>
            <Link to="/employee/tasks" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white">Open board</Link>
          </div>
          <div className="mt-6 space-y-4">
            {[{ label: 'Pending', count: pendingTasks, tone: 'bg-sky-400' }, { label: 'In Progress', count: inProgressTasks, tone: 'bg-amber-400' }, { label: 'Completed', count: completedTasks, tone: 'bg-emerald-400' }].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-200">{item.label}</span><span className="text-slate-400">{item.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${item.tone}`} style={{ width: totalTasks ? `${Math.round((item.count / totalTasks) * 100)}%` : '0%' }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Projects</h3><span className="text-xs text-slate-500">{myProjects.length} mapped</span></div>
            {myProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">No project assignments mapped to your tasks yet.</div>
            ) : (
              myProjects.slice(0, 4).map(project => (
                <div key={project.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">{project.name}</p><p className="mt-1 text-xs text-slate-400">{project.completed}/{project.total} tasks completed</p></div><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-sky-300">{project.progress}%</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400" style={{ width: `${project.progress}%` }} /></div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black text-white">Course Delivery Board</h2><p className="mt-1 text-sm text-slate-400">Meeting links, materials and student load.</p></div>
            <Link to="/employee/course-manage" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white">Manage now</Link>
          </div>
          <div className="mt-6 space-y-3">
            {courseCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center"><p className="text-sm font-semibold text-white">No courses assigned yet</p><p className="mt-2 text-sm text-slate-500">Ask admin to assign a course so you can manage materials and meeting links.</p></div>
            ) : (
              courseCards.slice(0, 4).map(course => (
                <div key={course.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.05]">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{course.title}</p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{course.category}</p></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{course.studentCount} students</span></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className="font-black text-white">{course.plans}</p><p className="mt-1 text-slate-500">Plans</p></div>
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className="font-black text-white">{course.materials}</p><p className="mt-1 text-slate-500">Materials</p></div>
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className={`font-black ${course.meetingReady ? 'text-emerald-300' : 'text-amber-300'}`}>{course.meetingReady ? 'Ready' : 'Pending'}</p><p className="mt-1 text-slate-500">Meeting</p></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black text-white">Latest Student Activity</h2>
            <p className="mt-1 text-sm text-slate-400">Recent enrollments on your assigned courses.</p>
            <div className="mt-5 space-y-3">
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">New student activity will appear here automatically.</div>
              ) : (
                recentActivity.map(activity => (
                  <div key={activity.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{activity.userName || activity.studentName || 'Student enrolled'}</p><p className="mt-1 text-xs text-slate-400">{activity.courseTitle}</p></div><span className="text-[11px] text-slate-500">{formatTimeAgo(activity.enrolledAt)}</span></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activity.planLabel && <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-300">{activity.planLabel}</span>}
                      {Number(activity.amount || 0) > 0 && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">₹{Number(activity.amount).toLocaleString('en-IN')}</span>}
                      {Number(activity.amount || 0) === 0 && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">FREE</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-400">Jump straight to the pages you use most.</p>
            <div className="mt-5 space-y-3">
              {[
                { to: '/employee/tasks', label: 'Open Tasks', caption: 'Track pending and completed work' },
                { to: '/employee/course-manage', label: 'Manage Courses', caption: 'Update materials and meeting links' },
                { to: '/employee/broadcast', label: 'Send Broadcast', caption: 'Email enrolled students quickly' },
                { to: '/employee/chat', label: 'Open Messages', caption: 'Respond to team communication' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="block rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.06]">
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{link.caption}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/*
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

export default function TeamMemberDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { projects, orders, teamMembers } = useStore()
  const [tab, setTab] = useState('overview')

  // Find the employee data in our unified system
  const memberData = teamMembers.find(m => m.email?.toLowerCase() === currentUser?.email?.toLowerCase())
  const hasEmployeeId = userProfile?.employeeId || currentUser?.employeeId || memberData?.employeeId
  
  // Derived Data for the Logged-in Employee
  const userEmail = currentUser?.email?.toLowerCase()
  
  // Projects added by this employee
  const myProjects = projects.filter(p => (p.seller_email || '').toLowerCase() === userEmail)
  
  // Sales of projects added by this employee
  const mySales = orders.filter(o => {
    const project = projects.find(p => p.id === o.project_id)
    return (project?.seller_email || '').toLowerCase() === userEmail
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
  
  const completedSales = mySales.filter(s => s.status === 'completed').length
  const myRevenue = mySales.filter(s => s.status === 'completed').reduce((sum, s) => sum + Number(s.amount || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight italic">Team Console</h1>
            {hasEmployeeId && (
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">Verified Employee</span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Efficiently managing projects and performance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">Active Session</span>
        </div>
      </div>

      {/* Profile Summary Card (Unified Data) */}
      {(userProfile || memberData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl font-black text-blue-400 shadow-xl overflow-hidden">
             {(userProfile?.displayName || currentUser?.displayName || 'T').charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userProfile?.displayName || currentUser?.displayName}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  {userProfile?.jobTitle || memberData?.role || 'Team Member'}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  {userProfile?.department || memberData?.department || 'General'}
                </span>
              </div>
              {hasEmployeeId && (
                <p className="text-[11px] font-mono text-gray-500 mt-2 tracking-widest uppercase">Member ID: {userProfile?.employeeId || memberData?.employeeId}</p>
              )}
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-end">
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Performance Level</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-6 h-1 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'My Projects', 
            value: myProjects.length, 
            color: 'from-blue-500 to-indigo-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )
          },
          { 
            label: 'Total Sales', 
            value: mySales.length, 
            color: 'from-emerald-500 to-green-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )
          },
          { 
            label: 'Completed', 
            value: completedSales, 
            color: 'from-amber-500 to-orange-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          { 
            label: 'Revenue', 
            value: `₹${myRevenue.toLocaleString('en-IN')}`, 
            color: 'from-purple-500 to-violet-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-all duration-300 shadow-xl group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        {['overview', 'projects', 'sales'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-emerald-400 shadow-lg' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Performance</h3>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Live Updates</span>
            </div>
            {mySales.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-slate-400">
                No recent activity detected
              </div>
            ) : (
              <div className="space-y-4">
                {mySales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                        {sale.project_title?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sale.project_title}</p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-gray-500">{sale.customer_name} • {sale.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{Number(sale.amount).toLocaleString('en-IN')}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>{sale.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl h-fit">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Console</h3>
            <div className="space-y-4">
              <a href="/employee/sell-project" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Submit Project</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400">New marketplace listing</p>
                </div>
              </a>
              <a href="/employee/chat" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Messages</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400">Direct team communication</p>
                </div>
              </a>

              {/* Special Locked Features for those WITHOUT Employee ID */}
              {!hasEmployeeId && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/20 group animate-pulse">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Locked Features</p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">Please provide your **Employee ID** to Admin to unlock 24/7 internal analytics and private messaging.</p>
                </div>
              )}

              {/* Advanced Controls for Verified Employees */}
              {hasEmployeeId && (
                <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 group hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Revenue Analytics</p>
                    <span className="text-[10px] font-bold text-emerald-500">PRO</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Current Payout:</span>
                      <span className="text-white font-bold tracking-tight">₹{(myRevenue * 0.1).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myProjects.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-gray-900/30 rounded-2xl border border-white/5">
              <p className="text-gray-500 text-sm">No projects assigned to you yet</p>
            </div>
          )}
          {myProjects.map(project => (
            <div key={project.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">{project.title}</h3>
                <span className="text-xs text-emerald-400 font-medium">{project.sales || 0} sales</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{project.description}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">₹{Number(project.price_project_only).toLocaleString('en-IN')}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${project.category_slug === 'basic' ? 'bg-green-500/10 text-green-400' : project.category_slug === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>{project.category_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sales' && (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mySales.map(sale => (
                <tr key={sale.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white">{sale.project_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{sale.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-emerald-400 font-medium">₹{Number(sale.amount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{sale.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {mySales.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No sales yet</p>}
        </div>
      )}
    </div>
  )
}
*/
