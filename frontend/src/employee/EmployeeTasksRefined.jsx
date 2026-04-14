import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
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
  const { tasks, teamMembers, updateTask } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const memberData = useMemo(
    () => getEmployeeMemberData(teamMembers, currentUser, userProfile),
    [teamMembers, currentUser, userProfile]
  )

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
          <>
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
          </>
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
            icon="🗂"
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

                    <div className="flex flex-wrap gap-2 lg:max-w-[270px] lg:justify-end">
                      <button
                        onClick={() => handleStatusChange(task.id, 'todo')}
                        disabled={updatingId === task.id || statusKey === 'todo'}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Plan
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'in-progress')}
                        disabled={updatingId === task.id || statusKey === 'in-progress'}
                        className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'review')}
                        disabled={updatingId === task.id || statusKey === 'review'}
                        className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'done')}
                        disabled={updatingId === task.id || statusKey === 'done'}
                        className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === task.id ? 'Saving...' : 'Done'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </EmployeeSurface>
    </div>
  )
}
