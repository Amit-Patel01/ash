import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

const statusConfig = {
  'To Do':       { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)', text: '#94a3b8', dot: '#64748b', label: 'To Do' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  text: '#fbbf24', dot: '#f59e0b', label: 'In Progress' },
  'In Review':   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa', dot: '#3b82f6', label: 'In Review' },
  'Done':        { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  text: '#34d399', dot: '#10b981', label: 'Done' },
  'todo':        { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)', text: '#94a3b8', dot: '#64748b', label: 'To Do' },
  'in-progress': { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  text: '#fbbf24', dot: '#f59e0b', label: 'In Progress' },
  'review':      { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa', dot: '#3b82f6', label: 'In Review' },
  'done':        { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  text: '#34d399', dot: '#10b981', label: 'Done' },
}

const priorityConfig = {
  high:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   text: '#f87171', label: 'High' },
  medium: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', text: '#fbbf24', label: 'Medium' },
  low:    { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', text: '#60a5fa', label: 'Low' },
}

const getStatus = (status) => statusConfig[status] || statusConfig['todo']
const getPriority = (priority) => priorityConfig[(priority || 'low').toLowerCase()] || priorityConfig.low

function TaskCard({ task, userDisplayName, onStatusChange, updating }) {
  const st = getStatus(task.status)
  const pr = getPriority(task.priority)
  const isUpdating = updating === task.id

  return (
    <div
      className="group relative rounded-2xl p-5 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      {/* Status indicator top bar */}
      <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full transition-all duration-300" style={{ background: st.dot, opacity: 0.6 }} />

      {/* Task title & project */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-white leading-snug group-hover:text-blue-300 transition-colors">{task.title}</h3>
          {task.project && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{task.project}</p>
          )}
        </div>

        {/* Priority badge */}
        <span
          className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
          style={{ background: pr.bg, border: `1px solid ${pr.border}`, color: pr.text }}
        >
          {pr.label}
        </span>
      </div>

      {/* Assigned to */}
      <p className="text-[11px] text-slate-600 mb-4 flex items-center gap-1.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        {userDisplayName?.split(' ')[0]}
      </p>

      {/* Bottom: status + actions */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
          style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
          {st.label}
        </span>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { status: 'in-progress', title: 'Mark In Progress', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', color: '#f59e0b' },
            { status: 'done', title: 'Mark Done', icon: 'M5 13l4 4L19 7', color: '#10b981' },
          ].map(btn => {
            const isActive = task.status === btn.status || (btn.status === 'done' && ['done', 'Done', 'completed'].includes(task.status))
            return (
              <button
                key={btn.status}
                onClick={() => onStatusChange(task.id, btn.status)}
                disabled={isUpdating}
                title={btn.title}
                className="h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: isActive ? btn.color + '25' : 'transparent',
                  color: isActive ? btn.color : '#475569',
                  border: isActive ? `1px solid ${btn.color}40` : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = btn.color; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#475569'; }}
              >
                {isUpdating ? (
                  <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={btn.icon} />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function EmployeeTasks() {
  const { userProfile } = useAuth()
  const { tasks, updateTask } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  const myTasks = useMemo(() => {
    if (!userProfile) return []
    const myName = (userProfile.displayName || '').toLowerCase()
    const myInitial = (userProfile.displayName?.charAt(0) || '').toUpperCase()
    const myEmail = (userProfile.email || '').toLowerCase()

    return tasks.filter(t => {
      const assignee = (t.assignee || '').toLowerCase()
      const isMine = assignee === myName ||
        assignee === myInitial.toLowerCase() ||
        assignee === myEmail ||
        (t.assignee && t.assignee.length === 1 && t.assignee.toUpperCase() === myInitial)

      const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.project && t.project.toLowerCase().includes(search.toLowerCase()))
      const matchesFilter = filter === 'all' || (filter === 'active' && t.status !== 'done' && t.status !== 'Done') || (filter === 'done' && (t.status === 'done' || t.status === 'Done'))

      return isMine && matchesSearch && matchesFilter
    })
  }, [tasks, userProfile, search, filter])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try { await updateTask(taskId, { status: newStatus }) }
    catch (err) { console.error('Task update error:', err) }
    finally { setUpdatingId(null) }
  }

  // Summary counts
  const totalTasks = myTasks.length
  const doneTasks = myTasks.filter(t => ['done', 'Done', 'completed'].includes(t.status)).length
  const activeTasks = totalTasks - doneTasks

  if (!userProfile) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mr-3" />
      <span className="text-slate-400">Loading tasks...</span>
    </div>
  )

  return (
    <div className="space-y-6 pb-20" style={{ animation: 'fadeInUp 0.45s ease forwards' }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Tasks</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage your workload and track progress</p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'Total', val: totalTasks, color: '#6366f1' },
            { label: 'Active', val: activeTasks, color: '#f59e0b' },
            { label: 'Done', val: doneTasks, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-2 flex items-center gap-2" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
              <span className="text-lg font-black" style={{ color: s.color }}>{s.val}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: s.color + 'aa' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl px-4 py-2.5 pr-10 text-[13px] text-white placeholder-slate-600 focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-2xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { val: 'all', label: 'All' },
            { val: 'active', label: 'Active' },
            { val: 'done', label: 'Completed' },
          ].map(f => (
            <button
              key={f.val}
              onClick={() => setFilter(f.val)}
              className="rounded-xl px-4 py-1.5 text-[12px] font-bold transition-all duration-200"
              style={filter === f.val ? {
                background: 'rgba(99,102,241,0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.3)',
              } : {
                color: '#64748b',
                border: '1px solid transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task grid */}
      {myTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              userDisplayName={userProfile.displayName}
              onStatusChange={handleStatusChange}
              updating={updatingId}
            />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-3xl py-20 px-6 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-slate-400 mb-1">
            {search || filter !== 'all' ? 'No tasks match your filter' : 'No tasks assigned yet'}
          </h3>
          <p className="text-[12px] text-slate-600 max-w-xs">
            {search || filter !== 'all' ? 'Try adjusting your search or filter settings.' : 'Your tasks will automatically appear here once assigned by an admin.'}
          </p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-4 text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
