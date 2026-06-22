import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { FolderOpen } from 'lucide-react'
import {
  EmployeeBadge,
  EmployeeEmptyState,
  EmployeePageHeader,
  EmployeeSurface,
} from './EmployeePanelUI'
import {
  formatTimeAgo,
  getEmployeeDisplayName,
  getEmployeeIdentitySet,
  getEmployeeMemberData,
  normalize,
  taskBelongsToEmployee,
} from './employeeUtils'

const getStatusKey = (status) => {
  const value = normalize(status)
  if (['done', 'completed', 'complete', 'closed'].includes(value)) return 'done'
  if (['in-progress', 'in progress', 'progress', 'working'].includes(value)) return 'in-progress'
  if (['review', 'in-review', 'in review'].includes(value)) return 'review'
  return 'todo'
}

const statusMeta = {
  todo: { label: 'To Do', tone: 'warning' },
  'in-progress': { label: 'In Progress', tone: 'info' },
  review: { label: 'In Review', tone: 'neutral' },
  done: { label: 'Done', tone: 'success' },
}

const priorityMeta = {
  high: { label: 'High', tone: 'danger' },
  medium: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'info' },
}

export default function EmployeeTasksRefined() {
  const { currentUser, userProfile } = useAuth()
  const { tasks, teamMembers, updateTask, addTask } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    priority: 'Medium',
    dueDate: '',
    assigneeRaw: '',
  })

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

  const isFounder = useMemo(() => {
    const name = normalize(userProfile?.displayName || currentUser?.displayName || memberData?.name || '')
    const role = normalize(userProfile?.role || memberData?.role || '')
    return name.includes('amit') || name.includes('naivedh') || role.includes('founder')
  }, [userProfile, currentUser, memberData])

  const assigneeOptions = useMemo(() => {
    const options = []
    teamMembers.forEach(m => {
      if (m.name || m.employeeId) {
        options.push({
          label: m.name ? `${m.name} (${m.employeeId || 'No ID'})` : m.employeeId,
          value: `eid:${m.employeeId}`,
          name: m.name,
          email: m.email,
          employeeId: m.employeeId
        })
      }
    })
    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [teamMembers])

  const identities = useMemo(
    () => getEmployeeIdentitySet(currentUser, userProfile, memberData),
    [currentUser, userProfile, memberData]
  )

  const displayName = getEmployeeDisplayName(currentUser, userProfile, memberData)

  const myTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!taskBelongsToEmployee(task, identities)) return false

      const searchValue = normalize(search)
      const matchesSearch =
        !searchValue ||
        normalize(task.title).includes(searchValue) ||
        normalize(task.project).includes(searchValue)

      const statusKey = getStatusKey(task.status)
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && statusKey !== 'done') ||
        (filter === 'done' && statusKey === 'done') ||
        (filter === 'review' && statusKey === 'review')

      return matchesSearch && matchesFilter
    })
  }, [tasks, identities, search, filter])

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(task => getStatusKey(task.status) === 'done').length
  const reviewTasks = myTasks.filter(task => getStatusKey(task.status) === 'review').length
  const activeTasks = myTasks.filter(task => getStatusKey(task.status) === 'in-progress').length

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Task update error:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    let assigneeName = ''
    let assigneeEmail = ''
    let assigneeEmployeeId = ''
    
    if (formData.assigneeRaw) {
      const selected = assigneeOptions.find(o => o.value === formData.assigneeRaw)
      if (selected) {
        assigneeName = selected.name || ''
        assigneeEmail = selected.email || ''
        assigneeEmployeeId = selected.employeeId || ''
      }
    }

    const payload = {
      title: formData.title,
      project: formData.project,
      assignee: assigneeName,
      assigneeUserId: '',
      assigneeEmail: assigneeEmail,
      assigneeEmployeeId: assigneeEmployeeId,
      priority: formData.priority,
      dueDate: formData.dueDate,
      status: 'todo',
    }
    
    try {
      await addTask(payload)
      setShowCreateModal(false)
      setFormData({ title: '', project: '', priority: 'Medium', dueDate: '', assigneeRaw: '' })
    } catch (err) {
      console.error('Failed to create task:', err)
      alert('Failed to create task.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <EmployeePageHeader
        eyebrow="Daily Flow"
        title="Task Workspace"
        description={`${displayName}'s assigned tasks are grouped on a clear board. Search, quick status updates, and review visibility are all managed here.`}
        stats={[
          { label: 'Visible tasks', value: totalTasks },
          { label: 'In progress', value: activeTasks },
          { label: 'In review', value: reviewTasks },
          { label: 'Completed', value: completedTasks },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {isFounder && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-cyan-300 shadow-lg shadow-cyan-400/20"
              >
                + Assign Task
              </button>
            )}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task or project"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none"
              />
              <svg className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 focus:border-cyan-400/30 focus:outline-none"
            >
              <option value="all" className="bg-slate-950">All Tasks</option>
              <option value="active" className="bg-slate-950">Active</option>
              <option value="review" className="bg-slate-950">In Review</option>
              <option value="done" className="bg-slate-950">Completed</option>
            </select>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Pending Queue', value: totalTasks - completedTasks, tone: 'warning', hint: 'Tasks needing active attention' },
          { label: 'Live Progress', value: activeTasks, tone: 'info', hint: 'Currently moving items' },
          { label: 'Review Ready', value: reviewTasks, tone: 'neutral', hint: 'Waiting for feedback or closure' },
        ].map(card => (
          <EmployeeSurface key={card.label} className="p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">{card.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-4xl font-black text-white">{card.value}</p>
              <EmployeeBadge tone={card.tone}>{card.label}</EmployeeBadge>
            </div>
            <p className="mt-3 text-sm text-slate-400">{card.hint}</p>
          </EmployeeSurface>
        ))}
      </section>

      <EmployeeSurface
        title="Task Queue"
        description="Update status with quick controls and track tasks with clear project context."
      >
        {myTasks.length === 0 ? (
          <EmployeeEmptyState
            icon={<FolderOpen className="w-12 h-12 text-slate-500" strokeWidth={1.5} />}
            title="No tasks matched this view"
            description="Try adjusting the search or filters. If the list is still empty, ask an administrator to confirm that tasks are assigned to your employee account."
          />
        ) : (
          <div className="space-y-4">
            {myTasks.map(task => {
              const statusKey = getStatusKey(task.status)
              const priorityKey = priorityMeta[normalize(task.priority)] ? normalize(task.priority) : 'low'
              const status = statusMeta[statusKey]
              const priority = priorityMeta[priorityKey]

              return (
                <div key={task.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.05]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <EmployeeBadge tone={status.tone}>{status.label}</EmployeeBadge>
                        <EmployeeBadge tone={priority.tone}>{priority.label} Priority</EmployeeBadge>
                        {task.project && <EmployeeBadge>{task.project}</EmployeeBadge>}
                      </div>
                      <h3 className="mt-4 text-lg font-black text-white">{task.title || 'Untitled Task'}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {task.description || 'No task description was provided. Use the status controls to move the workflow forward.'}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Assigned to {displayName}</span>
                        {task.updatedAt && <span>Updated {formatTimeAgo(task.updatedAt)}</span>}
                        {task.createdAt && <span>Created {formatTimeAgo(task.createdAt)}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end items-center">
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                        <button
                          onClick={() => handleStatusChange(task.id, 'todo')}
                          disabled={updatingId === task.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusKey === 'todo'
                              ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              : 'text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/5'
                          }`}
                        >
                          To Do
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'in-progress')}
                          disabled={updatingId === task.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusKey === 'in-progress'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'text-gray-500 hover:text-cyan-400 border border-transparent hover:bg-white/5'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'review')}
                          disabled={updatingId === task.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusKey === 'review'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'text-gray-500 hover:text-amber-400 border border-transparent hover:bg-white/5'
                          }`}
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'done')}
                          disabled={updatingId === task.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusKey === 'done'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-gray-500 hover:text-emerald-400 border border-transparent hover:bg-white/5'
                          }`}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </EmployeeSurface>

      {/* Founder Assign Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white">Assign New Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Task Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Enter task title" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Project *</label>
                  <input type="text" value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })} required placeholder="Project name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Assign To *</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.assigneeRaw}
                      onChange={(e) => setFormData({ ...formData, assigneeRaw: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none"
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select Employee</option>
                      {assigneeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Priority</label>
                  <div className="relative">
                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none">
                      {['Low', 'Medium', 'High'].map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Due Date</label>
                  <input type="text" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} placeholder="e.g. Tomorrow or Apr 15" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 px-4 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-900 rounded-2xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">Assign Task</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold text-slate-300 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
