import { useMemo } from 'react'
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
    () => getEmployeeKeyList(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const myCourses = useMemo(() => courses.filter(course =>
    courseBelongsToEmployee(course, employeeKeys)
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
      <section className="relative overflow-hidden rounded-[28px] border border-slate-300 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(3,7,18,0.96))] p-6 shadow-2xl shadow-black/20 lg:p-8">
        <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 text-lg font-black text-slate-900">{initials}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Employee Workspace</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">{displayName}</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              This dashboard organizes tasks, assigned courses, student activity, and quick actions so day-to-day work can be managed in one place.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">{roleLabel}</span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">{departmentLabel}</span>
              {employeeId && <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200">ID {employeeId}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
            <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Pending</p><p className="mt-2 text-2xl font-black text-slate-900">{pendingTasks}</p><p className="mt-1 text-xs text-slate-400">Tasks waiting</p></div>
            <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ready Courses</p><p className="mt-2 text-2xl font-black text-slate-900">{readyCourses}</p><p className="mt-1 text-xs text-slate-400">Meeting + materials set</p></div>
            <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</p><p className="mt-2 text-2xl font-black text-slate-900">{recentActivity.length}</p><p className="mt-1 text-xs text-slate-400">Latest enrollments</p></div>
            <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Support</p><p className="mt-2 truncate text-sm font-semibold text-slate-900">{employeeEmail || 'Employee account'}</p><p className="mt-1 text-xs text-slate-400">Live notifications enabled</p></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-3xl border border-slate-300 bg-white/70 p-5 shadow-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-4xl font-black text-slate-900">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-400">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-300 bg-white/70 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black text-slate-900">Task Pipeline</h2><p className="mt-1 text-sm text-slate-400">What needs attention right now.</p></div>
            <Link to="/employee/tasks" className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-200 hover:text-slate-900">Open board</Link>
          </div>
          <div className="mt-6 space-y-4">
            {[{ label: 'Pending', count: pendingTasks, tone: 'bg-sky-400' }, { label: 'In Progress', count: inProgressTasks, tone: 'bg-amber-400' }, { label: 'Completed', count: completedTasks, tone: 'bg-emerald-400' }].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-200">{item.label}</span><span className="text-slate-400">{item.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.tone}`} style={{ width: totalTasks ? `${Math.round((item.count / totalTasks) * 100)}%` : '0%' }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Projects</h3><span className="text-xs text-slate-500">{myProjects.length} mapped</span></div>
            {myProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">No project assignments mapped to your tasks yet.</div>
            ) : (
              myProjects.slice(0, 4).map(project => (
                <div key={project.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{project.name}</p><p className="mt-1 text-xs text-slate-400">{project.completed}/{project.total} tasks completed</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-sky-300">{project.progress}%</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400" style={{ width: `${project.progress}%` }} /></div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-300 bg-white/70 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black text-slate-900">Course Delivery Board</h2><p className="mt-1 text-sm text-slate-400">Meeting links, materials and student load.</p></div>
            <Link to="/employee/course-manage" className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-200 hover:text-slate-900">Manage now</Link>
          </div>
          <div className="mt-6 space-y-3">
            {courseCards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/[0.03] px-4 py-10 text-center"><p className="text-sm font-semibold text-slate-900">No courses assigned yet</p><p className="mt-2 text-sm text-slate-500">Ask admin to assign a course so you can manage materials and meeting links.</p></div>
            ) : (
              courseCards.slice(0, 4).map(course => (
                <div key={course.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.05]">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{course.title}</p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{course.category}</p></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{course.studentCount} students</span></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className="font-black text-slate-900">{course.plans}</p><p className="mt-1 text-slate-500">Plans</p></div>
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className="font-black text-slate-900">{course.materials}</p><p className="mt-1 text-slate-500">Materials</p></div>
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className={`font-black ${course.meetingReady ? 'text-emerald-300' : 'text-amber-300'}`}>{course.meetingReady ? 'Ready' : 'Pending'}</p><p className="mt-1 text-slate-500">Meeting</p></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-300 bg-white/70 p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black text-slate-900">Latest Student Activity</h2>
            <p className="mt-1 text-sm text-slate-400">Recent enrollments on your assigned courses.</p>
            <div className="mt-5 space-y-3">
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">New student activity will appear here automatically.</div>
              ) : (
                recentActivity.map(activity => (
                  <div key={activity.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{activity.userName || activity.studentName || 'Student enrolled'}</p><p className="mt-1 text-xs text-slate-400">{activity.courseTitle}</p></div><span className="text-[11px] text-slate-500">{formatTimeAgo(activity.enrolledAt)}</span></div>
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

          <div className="rounded-[28px] border border-slate-300 bg-white/70 p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-400">Jump straight to the pages you use most.</p>
            <div className="mt-5 space-y-3">
              {[
                { to: '/employee/tasks', label: 'Open Tasks', caption: 'Track pending and completed work' },
                { to: '/employee/course-manage', label: 'Manage Courses', caption: 'Update materials and meeting links' },
                { to: '/employee/broadcast', label: 'Send Broadcast', caption: 'Email enrolled students quickly' },
                { to: '/employee/chat', label: 'Open Messages', caption: 'Respond to team communication' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="block rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.06]">
                  <p className="text-sm font-semibold text-slate-900">{link.label}</p>
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
