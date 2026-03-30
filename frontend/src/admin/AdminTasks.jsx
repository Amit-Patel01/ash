import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'

const columns = [
  { id: 'todo', label: 'To Do', color: 'gray' },
  { id: 'in-progress', label: 'In Progress', color: 'blue' },
  { id: 'review', label: 'In Review', color: 'amber' },
  { id: 'done', label: 'Done', color: 'emerald' },
]

const priorityColors = {
  High: 'bg-red-500/10 text-red-400 border-red-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const avatarColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500']

function TaskCard({ task, onDragStart, onDelete, onEdit }) {
  const assigneeIndex = (task.assignee || 'A').charCodeAt(0) % avatarColors.length
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-gray-900/80 border border-white/5 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-white/10 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${priorityColors[task.priority] || priorityColors.Medium}`}>{task.priority}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onEdit(task)} className="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
          </button>
          <button onClick={() => onDelete(task)} className="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </div>
      <h4 className="text-sm font-medium text-white mb-1">{task.title}</h4>
      <p className="text-xs text-gray-500 mb-3">{task.project}</p>
      <div className="flex items-center justify-between">
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatarColors[assigneeIndex]} flex items-center justify-center text-[9px] font-bold shadow-sm`}>{task.assignee}</div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          {task.dueDate}
        </div>
      </div>
    </div>
  )
}

export default function AdminTasks() {
  const { tasks, addTask, updateTask, deleteTask } = useStore()
  const [view, setView] = useState('kanban')
  const [projectFilter, setProjectFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({ title: '', project: '', assignee: 'R', priority: 'Medium', dueDate: '', status: 'todo' })
  
  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const projects = ['All', ...new Set(tasks.map(t => t.project))]

  const filteredTasks = projectFilter === 'All' ? tasks : tasks.filter(t => t.project === projectFilter)

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
  const handleDragOver = (e) => { e.preventDefault() }

  const openCreate = () => {
    setEditingTask(null)
    setFormData({ title: '', project: '', assignee: 'R', priority: 'Medium', dueDate: '', status: 'todo' })
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setFormData({ title: task.title, project: task.project, assignee: task.assignee, priority: task.priority, dueDate: task.dueDate, status: task.status })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData)
      } else {
        await addTask(formData)
      }
      setShowModal(false)
    } catch (err) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">{taskStats.total} tasks across {projects.length - 1} projects</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Task
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-sm text-gray-400">To Do: <span className="text-white font-medium">{taskStats.todo}</span></span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400" /><span className="text-sm text-gray-400">In Progress: <span className="text-white font-medium">{taskStats.inProgress}</span></span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-sm text-gray-400">In Review: <span className="text-white font-medium">{taskStats.review}</span></span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-sm text-gray-400">Done: <span className="text-white font-medium">{taskStats.done}</span></span></div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {projects.map(project => (
            <button key={project} onClick={() => setProjectFilter(project)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${projectFilter === project ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>{project}</button>
          ))}
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Board</button>
          <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>List</button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id)
            return (
              <div key={column.id} onDrop={(e) => handleDrop(e, column.id)} onDragOver={handleDragOver} className="bg-gray-900/30 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full bg-${column.color}-400`} />
                    <h3 className="text-sm font-semibold text-white">{column.label}</h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-md">{columnTasks.length}</span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map(task => (<TaskCard key={task.id} task={task} onDragStart={handleDragStart} onDelete={handleDeleteClick} onEdit={openEdit} />))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map(task => {
                const assigneeIndex = (task.assignee || 'A').charCodeAt(0) % avatarColors.length
                return (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4"><p className="text-sm font-medium text-white">{task.title}</p></td>
                    <td className="px-6 py-4 text-sm text-gray-400">{task.project}</td>
                    <td className="px-6 py-4"><div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColors[assigneeIndex]} flex items-center justify-center text-[10px] font-bold shadow-sm`}>{task.assignee}</div></td>
                    <td className="px-6 py-4"><span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${priorityColors[task.priority] || priorityColors.Medium}`}>{task.priority}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' : task.status === 'review' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : task.status === 'review' ? 'In Review' : 'To Do'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{task.dueDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(task)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg></button>
                        <button onClick={() => handleDeleteClick(task)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Task Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Enter task title" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Project *</label>
                  <input type="text" value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })} required placeholder="Project name" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Assignee</label>
                  <select value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                    {['R', 'P', 'A', 'S', 'V', 'N'].map(a => <option key={a} value={a} className="bg-gray-900">{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                    {['Low', 'Medium', 'High'].map(p => <option key={p} value={p} className="bg-gray-900">{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                    {[{ id: 'todo', label: 'To Do' }, { id: 'in-progress', label: 'In Progress' }, { id: 'review', label: 'In Review' }, { id: 'done', label: 'Done' }].map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Due Date</label>
                  <input type="text" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} placeholder="Apr 15" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">{editingTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !deletingId && setShowDeleteModal(false)} />
          <div className="relative bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-50"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">Delete Task?</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Are you sure you want to delete <span className="text-white font-medium">"{taskToDelete?.title}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-2">
                <button
                  onClick={confirmDelete}
                  disabled={deletingId}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {deletingId ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Deleting...</>
                  ) : 'Yes, Delete Task'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingId}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
