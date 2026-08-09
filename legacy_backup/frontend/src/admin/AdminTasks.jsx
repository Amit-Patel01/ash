import { useMemo, useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { normalize } from '../employee/employeeUtils'
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  LayoutGrid, 
  List, 
  Calendar, 
  UserCheck,
  Zap,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'

const emptyAssignee = { assignee: '', assigneeUserId: '', assigneeEmail: '', assigneeEmployeeId: '' }

function buildAssigneeRows(users, teamMembers) {
  const rows = []
  const seen = new Set()
  const push = (value, label, kind) => {
    if (!value || seen.has(value)) return
    seen.add(value)
    rows.push({ value, label, kind })
  }

  for (const u of (users || []).filter((x) => x.role !== 'admin')) {
    if (u?.uid) push(`uid:${u.uid}`, u.displayName || u.email || 'User', 'user')
  }
  for (const m of teamMembers || []) {
    if (m?.email) push(`email:${normalize(m.email)}`, m.name || m.email, 'member')
    else if (m?.employeeId) push(`eid:${normalize(m.employeeId)}`, m.name || m.employeeId, 'member')
    else if (m?.name) push(`name:${normalize(m.name)}`, m.name, 'member')
  }
  for (const letter of ['R', 'P', 'A', 'S', 'V', 'N']) {
    push(`legacy:${letter.toLowerCase()}`, letter, 'legacy')
  }
  rows.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  return rows
}

/** Map stored task assignee fields to canonical ids where possible (fixes legacy name-only assignees). */
function resolveAssigneeFromTask(task, users, teamMembers) {
  if (task.assigneeUserId) {
    return {
      assignee: task.assignee || '',
      assigneeUserId: task.assigneeUserId,
      assigneeEmail: task.assigneeEmail || '',
      assigneeEmployeeId: task.assigneeEmployeeId || '',
    }
  }
  if (task.assigneeEmail) {
    const em = normalize(task.assigneeEmail)
    const u = (users || []).find((x) => normalize(x.email) === em)
    const m = (teamMembers || []).find((x) => normalize(x.email) === em)
    return {
      assigneeUserId: u?.uid || '',
      assigneeEmail: task.assigneeEmail,
      assigneeEmployeeId: task.assigneeEmployeeId || m?.employeeId || '',
      assignee: task.assignee || m?.name || u?.displayName || '',
    }
  }
  if (task.assigneeEmployeeId) {
    const id = normalize(task.assigneeEmployeeId)
    const m = (teamMembers || []).find((x) => normalize(x.employeeId) === id)
    return {
      assigneeUserId: '',
      assigneeEmail: m?.email || task.assigneeEmail || '',
      assigneeEmployeeId: task.assigneeEmployeeId,
      assignee: task.assignee || m?.name || '',
    }
  }
  const n = normalize(task.assignee)
  if (!n) {
    return { assignee: '', assigneeUserId: '', assigneeEmail: '', assigneeEmployeeId: '' }
  }
  const u = (users || []).find((x) => normalize(x.displayName) === n)
  if (u?.uid) {
    return {
      assigneeUserId: u.uid,
      assigneeEmail: u.email || '',
      assigneeEmployeeId: '',
      assignee: u.displayName || task.assignee || '',
    }
  }
  const m = (teamMembers || []).find((x) => normalize(x.name) === n)
  if (m) {
    return {
      assigneeUserId: '',
      assigneeEmail: m.email || '',
      assigneeEmployeeId: m.employeeId || '',
      assignee: m.name || task.assignee || '',
    }
  }
  return {
    assignee: task.assignee || '',
    assigneeUserId: '',
    assigneeEmail: '',
    assigneeEmployeeId: '',
  }
}

const columns = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'review', label: 'In Review', color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

const priorityColors = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
}

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600'
]

function getAvatarInitials(value) {
  const raw = String(value || '').trim()
  if (!raw) return '?'
  if (raw.length <= 2 && !raw.includes(' ')) return raw.toUpperCase()
  const parts = raw.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((p) => p.charAt(0)).join('')
  return (initials || raw.charAt(0)).toUpperCase()
}

function TaskCard({ task, onDragStart, onDelete, onEdit, onStatusChange }) {
  const assigneeIndex = (task.assignee || 'A').charCodeAt(0) % avatarColors.length
  const assigneeInitials = getAvatarInitials(task.assignee)
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all duration-200 group flex flex-col justify-between space-y-3"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.Medium}`}>
            {task.priority} Priority
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Task">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors" title="Delete Task">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{task.title}</h4>
        <p className="text-xs font-semibold text-slate-400 mt-1">{task.project}</p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatarColors[assigneeIndex]} flex items-center justify-center text-[10px] font-black text-white shadow-xs shrink-0`}
            title={task.assignee || 'Unassigned'}
          >
            {assigneeInitials}
          </div>
          <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">{task.assignee || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Calendar className="w-3 h-3 text-slate-400" />
          {task.dueDate || 'No due'}
        </div>
      </div>
      
      {/* Quick status change buttons */}
      <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
        <div className="flex items-center gap-1">
          {[
            { id: 'todo', label: 'To Do', color: 'bg-slate-400' },
            { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
            { id: 'review', label: 'Review', color: 'bg-amber-500' },
            { id: 'done', label: 'Done', color: 'bg-emerald-500' },
          ].map(st => (
            <button
              key={st.id}
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, st.id); }}
              title={`Set status to ${st.label}`}
              className={`w-3.5 h-3.5 rounded-full transition-all flex items-center justify-center ${
                task.status === st.id ? `${st.color} ring-2 ring-offset-1 ring-slate-300 scale-110` : 'bg-slate-200 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminTasks() {
  const { tasks, addTask, updateTask, deleteTask, users, teamMembers } = useStore()
  const [view, setView] = useState('kanban')
  const [projectFilter, setProjectFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    priority: 'Medium',
    dueDate: '',
    status: 'todo',
    ...emptyAssignee,
  })

  // Realtime Clock State
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const assigneeRows = useMemo(() => buildAssigneeRows(users, teamMembers), [users, teamMembers])

  const assigneeSelectValue = useMemo(() => {
    if (formData.assigneeUserId) return `uid:${formData.assigneeUserId}`
    if (formData.assigneeEmail) return `email:${normalize(formData.assigneeEmail)}`
    if (formData.assigneeEmployeeId) return `eid:${normalize(formData.assigneeEmployeeId)}`
    const a = normalize(formData.assignee)
    if (!a) return ''
    if (assigneeRows.some((r) => r.value === `name:${a}`)) return `name:${a}`
    const legacy = assigneeRows.find((r) => r.kind === 'legacy' && normalize(r.label) === a)
    if (legacy) return legacy.value
    return ''
  }, [formData.assigneeUserId, formData.assigneeEmail, formData.assigneeEmployeeId, formData.assignee, assigneeRows])

  const applyAssigneeKey = (raw) => {
    if (!raw) return { ...emptyAssignee }
    if (raw.startsWith('uid:')) {
      const uid = raw.slice(4)
      const u = (users || []).find((x) => x.uid === uid)
      return {
        assigneeUserId: uid,
        assigneeEmail: u?.email || '',
        assigneeEmployeeId: '',
        assignee: u?.displayName || u?.email || '',
      }
    }
    if (raw.startsWith('email:')) {
      const key = raw.slice(6)
      const m = (teamMembers || []).find((x) => normalize(x.email) === key)
      const u = (users || []).find((x) => normalize(x.email) === key)
      return {
        assigneeUserId: u?.uid || '',
        assigneeEmail: m?.email || u?.email || '',
        assigneeEmployeeId: '',
        assignee: m?.name || u?.displayName || m?.email || u?.email || '',
      }
    }
    if (raw.startsWith('eid:')) {
      const key = raw.slice(4)
      const m = (teamMembers || []).find((x) => normalize(x.employeeId) === key)
      return {
        assigneeUserId: '',
        assigneeEmail: m?.email || '',
        assigneeEmployeeId: m?.employeeId || '',
        assignee: m?.name || m?.employeeId || '',
      }
    }
    if (raw.startsWith('name:')) {
      const row = assigneeRows.find((r) => r.value === raw)
      return {
        assigneeUserId: '',
        assigneeEmail: '',
        assigneeEmployeeId: '',
        assignee: row?.label || '',
      }
    }
    if (raw.startsWith('legacy:')) {
      const letter = raw.slice(7).toUpperCase()
      return {
        assigneeUserId: '',
        assigneeEmail: '',
        assigneeEmployeeId: '',
        assignee: letter,
      }
    }
    return { ...emptyAssignee }
  }
  
  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const projects = ['All', ...new Set(tasks.map(t => t.project).filter(Boolean))]

  const filteredTasks = useMemo(() => {
    let list = projectFilter === 'All' ? tasks : tasks.filter(t => t.project === projectFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t => t.title?.toLowerCase().includes(q) || t.project?.toLowerCase().includes(q) || t.assignee?.toLowerCase().includes(q))
    }
    return list
  }, [tasks, projectFilter, searchQuery])

  const handleDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId.toString()) }
  const handleDrop = async (e, columnId) => { 
    e.preventDefault(); 
    const taskId = e.dataTransfer.getData('taskId'); 
    try {
      await updateTask(taskId, { status: columnId })
    } catch (err) {
      console.error("Failed to update task status:", err)
    }
  }
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      console.error("Failed to update task status:", err)
    }
  }
  const handleDragOver = (e) => { e.preventDefault() }

  const openCreate = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      project: '',
      priority: 'Medium',
      dueDate: '',
      status: 'todo',
      ...emptyAssignee,
    })
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    const resolved = resolveAssigneeFromTask(task, users, teamMembers)
    setFormData({
      title: task.title,
      project: task.project,
      ...resolved,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: formData.title,
      project: formData.project,
      assignee: formData.assignee || '',
      assigneeUserId: formData.assigneeUserId || '',
      assigneeEmail: formData.assigneeEmail || '',
      assigneeEmployeeId: formData.assigneeEmployeeId || '',
      priority: formData.priority,
      dueDate: formData.dueDate,
      status: formData.status,
    }
    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload)
      } else {
        await addTask(payload)
      }
      setShowModal(false)
    } catch (err) {
      console.error('Failed to save task:', err)
      alert("Something went wrong while saving the task.")
    }
  }

  const handleDeleteClick = (task) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return
    setDeletingId(taskToDelete.id)
    try {
      await deleteTask(taskToDelete.id)
      setShowDeleteModal(false)
    } catch (err) {
      console.error('Failed to delete task:', err)
      alert("Failed to delete task.")
    } finally {
      setDeletingId(null)
      setTaskToDelete(null)
    }
  }

  const taskStats = {
    total: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'todo').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    review: filteredTasks.filter(t => t.status === 'review').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
  }

  const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 bg-slate-50/50 min-h-screen rounded-3xl font-sans text-slate-900 animate-in fade-in duration-300">
      
      {/* ── Realtime Task Banner (Light White Modern Header) ── */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 via-blue-100/30 to-purple-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-800">TASK MANAGER ENGINE</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-semibold">{timeString}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Task Management Board
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Track, assign, and organize team tasks in real-time across projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button 
              onClick={openCreate} 
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs tracking-wider uppercase shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Modern Stat Pills Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'To Do', count: taskStats.todo, color: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
          { label: 'In Progress', count: taskStats.inProgress, color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'In Review', count: taskStats.review, color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Done', count: taskStats.done, color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${item.color}`} />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{item.count}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.badge}`}>
              {Math.round((item.count / (taskStats.total || 1)) * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* ── Filter Controls & Search Bar ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks, assignees, or projects..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {projects.slice(0, 5).map(project => (
              <button 
                key={project} 
                onClick={() => setProjectFilter(project)} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  projectFilter === project 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {project}
              </button>
            ))}
          </div>

          {/* View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shrink-0">
            <button 
              onClick={() => setView('kanban')} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                view === 'kanban' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Board
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                view === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>
      </div>

      {/* ── View Render (Kanban Board vs List View) ── */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map(column => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id)
            return (
              <div 
                key={column.id} 
                onDrop={(e) => handleDrop(e, column.id)} 
                onDragOver={handleDragOver} 
                className="bg-slate-100/70 border border-slate-200/70 rounded-3xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${column.color}`} />
                      <h3 className="text-sm font-black text-slate-900">{column.label}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${column.badge}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {columnTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onDragStart={handleDragStart} 
                        onDelete={handleDeleteClick} 
                        onEdit={openEdit} 
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Task Title</th>
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Project</th>
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Assignee</th>
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const assigneeIndex = (task.assignee || 'A').charCodeAt(0) % avatarColors.length
                  const assigneeInitials = getAvatarInitials(task.assignee)
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">{task.project}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatarColors[assigneeIndex]} flex items-center justify-center text-[10px] font-black text-white shadow-xs shrink-0`}
                          >
                            {assigneeInitials}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{task.assignee || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{task.dueDate || 'No due'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(task)} className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(task)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create / Edit Task Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors font-bold text-lg">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Task Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  required 
                  placeholder="Enter task title..." 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Project Name *</label>
                  <input 
                    type="text" 
                    value={formData.project} 
                    onChange={e => setFormData({ ...formData, project: e.target.value })} 
                    required 
                    placeholder="e.g. Website Revamp" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Assignee</label>
                  <select
                    value={assigneeSelectValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ...applyAssigneeKey(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="" className="text-slate-400">Unassigned</option>
                    {assigneeRows.map((row) => (
                      <option key={row.value} value={row.value}>{row.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({ ...formData, priority: e.target.value })} 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })} 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    {[{ id: 'todo', label: 'To Do' }, { id: 'in-progress', label: 'In Progress' }, { id: 'review', label: 'In Review' }, { id: 'done', label: 'Done' }].map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="text" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })} 
                    placeholder="e.g. Aug 15" 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-xs font-black text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                >
                  {editingTask ? 'Update Task' : 'Save & Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-900 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Delete Task?</h3>
              <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">&quot;{taskToDelete?.title}&quot;</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={confirmDelete}
                disabled={deletingId}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                {deletingId ? 'Deleting Task...' : 'Yes, Delete Task'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingId}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
