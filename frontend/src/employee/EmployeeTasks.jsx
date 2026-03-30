import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  'To Do': 'bg-gray-500/10 text-gray-400',
  'In Progress': 'bg-blue-500/10 text-blue-400',
  'In Review': 'bg-purple-500/10 text-purple-400',
  'Done': 'bg-emerald-500/10 text-emerald-400',
  'todo': 'bg-gray-500/10 text-gray-400',
  'in-progress': 'bg-blue-500/10 text-blue-400',
  'review': 'bg-purple-500/10 text-purple-400',
  'done': 'bg-emerald-500/10 text-emerald-400',
}

export default function EmployeeTasks() {
  const { userProfile } = useAuth()
  const { tasks, updateTask } = useStore()
  const [updatingId, setUpdatingId] = useState(null)

  // Filter tasks assigned to this employee
  const myTasks = useMemo(() => {
    if (!userProfile) return []
    const myName = (userProfile.displayName || '').toLowerCase()
    const myInitial = (userProfile.displayName?.charAt(0) || '').toUpperCase()
    const myEmail = (userProfile.email || '').toLowerCase()

    return tasks.filter(t => {
      const assignee = (t.assignee || '').toLowerCase()
      return assignee === myName || 
             assignee === myInitial.toLowerCase() || 
             assignee === myEmail ||
             (t.assignee && t.assignee.length === 1 && t.assignee.toUpperCase() === myInitial)
    })
  }, [tasks, userProfile])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      alert("Failed to update task status.")
    } finally {
      setUpdatingId(null)
    }
  }

  if (!userProfile) return <div className="p-8 text-white">Loading tasks...</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and update your assigned tasks.</p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Task Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myTasks.length > 0 ? myTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                      <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">{task.project}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-400' : 
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColors[task.status] || 'bg-gray-500/10 text-gray-400 border-white/10'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      disabled={updatingId === task.id}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium transition-all bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer ${updatingId === task.id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <option value="todo" className="bg-gray-900">To Do</option>
                      <option value="in-progress" className="bg-gray-900">In Progress</option>
                      <option value="review" className="bg-gray-900">In Review</option>
                      <option value="done" className="bg-gray-900">Done</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic text-sm">No tasks assigned to you.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
