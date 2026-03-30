import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

const statusConfig = {
  'To Do': { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  'In Progress': { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  'In Review': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  'Done': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'M9 12.75L11.25 15 15 9.75m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  'todo': { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  'in-progress': { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  'review': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  'done': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'M9 12.75L11.25 15 15 9.75m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
}

const priorityConfig = {
  'high': { color: 'text-red-500', icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z' },
  'medium': { color: 'text-amber-500', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  'low': { color: 'text-blue-500', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
}

export default function EmployeeTasks() {
  const { userProfile } = useAuth()
  const { tasks, updateTask } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  // Filter tasks assigned to this employee
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
      const matchesFilter = filter === 'all' || (filter === 'active' && t.status !== 'done') || (filter === 'done' && t.status === 'done')

      return isMine && matchesSearch && matchesFilter
    })
  }, [tasks, userProfile, search, filter])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      console.error("Task update error:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  if (!userProfile) return <div className="p-8 text-white">Loading tasks...</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">Efficiently manage your workload and track progress.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group/search">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all w-full md:w-64"
            />
            <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within/search:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="all" className="bg-gray-900">All Tasks</option>
            <option value="active" className="bg-gray-900">Active</option>
            <option value="done" className="bg-gray-900">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] w-1/3">Task Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Priority</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myTasks.length > 0 ? myTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{task.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{task.project}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span className="text-[10px] text-gray-500 font-medium">Assigned to {userProfile.displayName?.split(' ')[0]}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <svg className={`w-5 h-5 ${priorityConfig[task.priority?.toLowerCase()]?.color || 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={priorityConfig[task.priority?.toLowerCase()]?.icon || priorityConfig.low.icon} />
                      </svg>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${priorityConfig[task.priority?.toLowerCase()]?.color || 'text-blue-500'}`}>
                        {task.priority || 'low'}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm ${statusConfig[task.status]?.color || statusConfig.todo.color}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={statusConfig[task.status]?.icon || statusConfig.todo.icon} />
                        </svg>
                        {task.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                      {['in-progress', 'done'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(task.id, s)}
                          disabled={updatingId === task.id || task.status === s}
                          className={`p-2 rounded-xl transition-all ${
                            task.status === s 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'text-gray-500 hover:text-white hover:bg-white/10'
                          } disabled:opacity-50`}
                          title={`Mark as ${s}`}
                        >
                          {s === 'in-progress' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No tasks identified</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
