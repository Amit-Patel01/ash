import { useMemo, useRef, useState } from 'react'
import { Award, ExternalLink, FileImage, FileText, QrCode, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import CertificateDocument from '../components/certificates/CertificateDocument'
import { CERTIFICATE_EXPORT_WIDTH, downloadCertificatePdf, downloadCertificatePng } from '../utils/certificateExport'

const normalize = (value) => String(value || '').trim().toLowerCase()
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

const formatIssuedDate = (value) => {
  const time = getTimeValue(value)
  if (!time) return 'Pending'
  return new Date(time).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EmployeeHomeDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { tasks, projects, teamMembers, courses, enrollments, certificates, certificateTemplate } = useStore()
  const [certificateDownloading, setCertificateDownloading] = useState('')
  const certificateDownloadRef = useRef(null)

  const memberData = useMemo(() => {
    const currentEmail = normalize(currentUser?.email)
    const currentEmployeeId = normalize(userProfile?.employeeId || currentUser?.employeeId)
    return teamMembers.find(member =>
      normalize(member.email) === currentEmail ||
      (currentEmployeeId && normalize(member.employeeId) === currentEmployeeId)
    )
  }, [teamMembers, currentUser?.email, currentUser?.employeeId, userProfile?.employeeId])

  const displayName = userProfile?.displayName || currentUser?.displayName || memberData?.name || 'Employee'
  const roleLabel = userProfile?.jobTitle || memberData?.role || (userProfile?.role === 'mentor' ? 'Mentor' : 'Employee')
  const departmentLabel = userProfile?.department || memberData?.department || 'Operations'
  const employeeId = userProfile?.employeeId || currentUser?.employeeId || memberData?.employeeId || ''
  const canCreateCourses = Boolean(employeeId)
  const employeeEmail = currentUser?.email || userProfile?.email || memberData?.email || ''
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'EM'

  const identities = useMemo(() => {
    const values = [currentUser?.uid, userProfile?.uid, employeeId, employeeEmail, displayName, memberData?.name]
    return [...new Set(values.filter(Boolean).map(normalize))]
  }, [currentUser?.uid, userProfile?.uid, employeeId, employeeEmail, displayName, memberData?.name])

  const myTasks = useMemo(() => {
    const initial = displayName.charAt(0).toLowerCase()
    return tasks.filter(task => {
      const assignee = normalize(task.assignee)
      return identities.includes(assignee) || (assignee.length === 1 && assignee === initial)
    })
  }, [tasks, identities, displayName])

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
  const certificateIdentityKeys = useMemo(
    () => [...new Set([currentUser?.uid, userProfile?.uid, employeeId, employeeEmail].filter(Boolean).map(normalize))],
    [currentUser?.uid, userProfile?.uid, employeeEmail, employeeId]
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
  const assignedCertificates = useMemo(() => certificates
    .filter((certificate) => {
      if (certificate.source !== 'qr') return false

      const assignmentKeys = [
        certificate.assignedEmployeeUid,
        certificate.assignedEmployeeId,
        certificate.assignedEmployeeRef,
        certificate.assignedEmployeeEmail,
      ]
        .filter(Boolean)
        .map(normalize)

      return assignmentKeys.some((key) => certificateIdentityKeys.includes(key))
    })
    .sort((left, right) =>
      getTimeValue(right.updatedAt || right.createdAt || right.approval_date || right.rawDate || right.date) -
      getTimeValue(left.updatedAt || left.createdAt || left.approval_date || left.rawDate || left.date)
    ), [certificateIdentityKeys, certificates])
  const latestAssignedCertificate = assignedCertificates[0] || null

  const handleCertificateDownload = async (format) => {
    if (!certificateDownloadRef.current || !latestAssignedCertificate) return

    try {
      setCertificateDownloading(format)
      if (format === 'png') {
        await downloadCertificatePng(certificateDownloadRef.current, latestAssignedCertificate)
      } else {
        await downloadCertificatePdf(certificateDownloadRef.current, latestAssignedCertificate)
      }
    } catch (error) {
      console.error(`Employee certificate ${format} export failed:`, error)
      window.alert(`Unable to generate ${format.toUpperCase()} right now.`)
    } finally {
      setCertificateDownloading('')
    }
  }

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(task => isDone(task.status)).length
  const inProgressTasks = myTasks.filter(task => isProgress(task.status)).length
  const pendingTasks = totalTasks - completedTasks - inProgressTasks
  const readyCourses = courseCards.filter(course => course.meetingReady && course.materials > 0).length

  const stats = [
    { label: 'Tasks', value: totalTasks, hint: `${pendingTasks} pending` },
    { label: 'Projects', value: myProjects.length, hint: `${inProgressTasks} in progress` },
    { label: 'Courses', value: courseCards.length, hint: `${readyCourses} delivery ready` },
    { label: 'Certificates', value: assignedCertificates.length, hint: assignedCertificates.length ? 'assigned to you' : 'waiting for issue' },
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

      <section className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
              <Award size={14} />
              My Certificates
            </div>
            <h2 className="mt-4 text-2xl font-black text-white">Certificates assigned to your employee profile</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              When admin assigns a QR certificate to your account, it appears here automatically with preview and download options.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Assigned</p>
              <p className="mt-2 text-3xl font-black text-white">{assignedCertificates.length}</p>
              <p className="mt-1 text-sm text-slate-400">Certificates mapped to your ID or email</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Latest Status</p>
              <p className="mt-2 text-3xl font-black text-white">{latestAssignedCertificate?.status === 'revoked' ? 'Revoked' : latestAssignedCertificate ? 'Active' : 'None'}</p>
              <p className="mt-1 text-sm text-slate-400">Live from the QR certificate module</p>
            </div>
          </div>
        </div>

        {latestAssignedCertificate ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_320px]">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">Latest Assigned Certificate</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{latestAssignedCertificate.certificateTypeLabel || latestAssignedCertificate.certificateType || 'Certificate'}</h3>
                  <p className="mt-1 text-sm text-slate-400">Holder: {latestAssignedCertificate.userName || latestAssignedCertificate.name || displayName}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                  {latestAssignedCertificate.certificate_id}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="mx-auto w-full" style={{ maxWidth: 'min(100%, calc((100vh - 18rem) * 1.414))' }}>
                  <CertificateDocument certificate={latestAssignedCertificate} template={certificateTemplate} />
                </div>
              </div>

              <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
                <div ref={certificateDownloadRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px` }}>
                  <CertificateDocument certificate={latestAssignedCertificate} template={certificateTemplate} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">Quick Actions</p>
                <div className="mt-4 grid gap-3">
                  <Link
                    to={`/verify/${encodeURIComponent(latestAssignedCertificate.certificate_id)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
                  >
                    <ExternalLink size={16} />
                    Open Verify Page
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCertificateDownload('png')}
                    disabled={certificateDownloading === 'png'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileImage size={16} />
                    {certificateDownloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCertificateDownload('pdf')}
                    disabled={certificateDownloading === 'pdf'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText size={16} />
                    {certificateDownloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">Certificate Registry</p>
                <div className="mt-4 space-y-3">
                  {assignedCertificates.slice(0, 4).map((certificate) => (
                    <div key={certificate.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{certificate.certificateTypeLabel || certificate.certificateType || 'Certificate'}</p>
                          <p className="mt-1 break-all font-mono text-xs text-cyan-200">{certificate.certificate_id}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                          certificate.status === 'revoked'
                            ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
                            : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                        }`}>
                          {certificate.status === 'revoked' ? 'Revoked' : 'Active'}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                          <p className="font-black uppercase tracking-[0.16em] text-slate-500">Issued</p>
                          <p className="mt-1 text-sm font-semibold text-white">{formatIssuedDate(certificate.rawDate || certificate.date || certificate.approval_date || certificate.createdAt)}</p>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                          <p className="font-black uppercase tracking-[0.16em] text-slate-500">Source</p>
                          <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
                            <QrCode size={14} className="text-cyan-200" />
                            QR Module
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/verify/${encodeURIComponent(certificate.certificate_id)}`}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
                      >
                        <ShieldCheck size={15} />
                        View certificate
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <p className="text-lg font-semibold text-white">No certificates assigned yet.</p>
            <p className="mt-2 text-sm text-slate-400">As soon as admin issues a QR certificate to your employee profile, it will show up here with verify and download actions.</p>
          </div>
        )}
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
            {myProjects.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">No project assignments mapped to your tasks yet.</div> : myProjects.slice(0, 4).map(project => (
              <div key={project.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">{project.name}</p><p className="mt-1 text-xs text-slate-400">{project.completed}/{project.total} tasks completed</p></div><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-sky-300">{project.progress}%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400" style={{ width: `${project.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black text-white">Course Delivery Board</h2><p className="mt-1 text-sm text-slate-400">Create courses, then manage meeting links, materials, and student load.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              {canCreateCourses && (
                <Link to="/employee/course-manage?create=1" className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/20 hover:text-white">Add course</Link>
              )}
              <Link to="/employee/course-manage" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white">Manage now</Link>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {courseCards.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center"><p className="text-sm font-semibold text-white">{canCreateCourses ? 'No courses yet' : 'No courses assigned yet'}</p><p className="mt-2 text-sm text-slate-500">{canCreateCourses ? 'Use Add course to create your first draft course from this dashboard.' : 'Ask admin to assign a course so you can manage materials and meeting links.'}</p></div> : courseCards.slice(0, 4).map(course => (
              <div key={course.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.05]">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{course.title}</p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{course.category}</p></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{course.studentCount} students</span></div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className="font-black text-white">{course.plans}</p><p className="mt-1 text-slate-500">Plans</p></div>
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className="font-black text-white">{course.materials}</p><p className="mt-1 text-slate-500">Materials</p></div>
                  <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-center"><p className={`font-black ${course.meetingReady ? 'text-emerald-300' : 'text-amber-300'}`}>{course.meetingReady ? 'Ready' : 'Pending'}</p><p className="mt-1 text-slate-500">Meeting</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black text-white">Latest Student Activity</h2>
            <p className="mt-1 text-sm text-slate-400">Recent enrollments on your assigned courses.</p>
            <div className="mt-5 space-y-3">
              {recentActivity.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">New student activity will appear here automatically.</div> : recentActivity.map(activity => (
                <div key={activity.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">{activity.userName || activity.studentName || 'Student enrolled'}</p><p className="mt-1 text-xs text-slate-400">{activity.courseTitle}</p></div><span className="text-[11px] text-slate-500">{formatTimeAgo(activity.enrolledAt)}</span></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activity.planLabel && <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-300">{activity.planLabel}</span>}
                    {Number(activity.amount || 0) > 0 && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">₹{Number(activity.amount).toLocaleString('en-IN')}</span>}
                    {Number(activity.amount || 0) === 0 && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">FREE</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-400">Jump straight to the pages you use most.</p>
            <div className="mt-5 space-y-3">
              {[
                ...(canCreateCourses
                  ? [{ to: '/employee/course-manage?create=1', label: 'Add Course', caption: 'Create a new draft course from your employee panel' }]
                  : []),
                { to: '/employee/tasks', label: 'Open Tasks', caption: 'Track pending and completed work' },
                { to: '/employee/course-manage', label: 'Manage Courses', caption: 'Update your course details, materials, and meeting links' },
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
