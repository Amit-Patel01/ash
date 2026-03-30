import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

const priorityColors = {
  High: 'bg-red-500/10 text-red-400',
  Medium: 'bg-amber-500/10 text-amber-400',
  Low: 'bg-blue-500/10 text-blue-400',
  high: 'bg-red-500/10 text-red-400',
  medium: 'bg-amber-500/10 text-amber-400',
  low: 'bg-blue-500/10 text-blue-400',
}

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

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'In Review',
  'done': 'Done'
}

export default function EmployeeDashboard() {
  const { userProfile } = useAuth()
  const { tasks, projects, updateTask } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [updatingId, setUpdatingId] = useState(null)

  // Filter tasks assigned to this employee
  const myTasks = useMemo(() => {
    if (!userProfile) return []
    const myInitial = userProfile.displayName?.charAt(0).toUpperCase()
    return tasks.filter(t => t.assignee === myInitial || t.assignee === userProfile.displayName)
  }, [tasks, userProfile])

  // Derive projects I'm working on based on tasks
  const myProjects = useMemo(() => {
    const projectNames = [...new Set(myTasks.map(t => t.project))]
    return projectNames.map(name => {
      const pTasks = myTasks.filter(t => t.project === name)
      const doneTasks = pTasks.filter(t => ['done', 'Done', 'completed'].includes(t.status)).length
      const progress = pTasks.length > 0 ? Math.round((doneTasks / pTasks.length) * 100) : 0
      
      const storeProj = projects.find(p => p.title === name)
      
      return {
        id: storeProj?.id || name,
        name: name,
        role: userProfile?.jobTitle || 'Contributor',
        progress: progress,
        status: storeProj?.status || 'Active',
        tasks: pTasks.length,
        completedTasks: doneTasks
      }
    })
  }, [myTasks, projects, userProfile])

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

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(t => ['done', 'Done', 'completed'].includes(t.status)).length
  const inProgressTasks = myTasks.filter(t => ['in-progress', 'In Progress'].includes(t.status)).length
  const pendingTasks = myTasks.filter(t => ['todo', 'To Do'].includes(t.status)).length

  if (!userProfile) return <div className="p-8 text-white">Loading profile...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, {userProfile.displayName}. Manage your assigned tasks below.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Tasks', value: totalTasks, icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08', color: 'from-blue-500 to-indigo-600' },
          { label: 'In Progress', value: inProgressTasks, icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182', color: 'from-amber-500 to-orange-600' },
          { label: 'Completed', value: completedTasks, icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-500 to-green-600' },
          { label: 'Active Projects', value: myProjects.length, icon: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z', color: 'from-purple-500 to-violet-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-inner`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-px">
        {['overview', 'tasks', 'projects'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === tab
                ? 'text-emerald-400 bg-emerald-500/10 border-b-2 border-emerald-400 shadow-[0_4px_12px_rgba(52,211,153,0.1)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-white mb-4">Urgent Tasks</h3>
            <div className="space-y-3">
              {myTasks.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No tasks assigned to you yet.</p>
              ) : (
                myTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all group">
                    <div className={`w-2 h-2 rounded-full ${['done', 'Done', 'completed'].includes(task.status) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ['in-progress', 'In Progress'].includes(task.status) ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-gray-400'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.project}</p>
                    </div>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      disabled={updatingId === task.id}
                      className={`px-2 py-1 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer transition-all ${updatingId === task.id ? 'opacity-50' : ''}`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-white mb-4">My Contributed Projects</h3>
            <div className="space-y-4">
              {myProjects.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No active projects found.</p>
              ) : (
                myProjects.map(project => (
                  <div key={project.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <span className="text-xs text-gray-400">{project.completedTasks}/{project.tasks} tasks</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{project.role}</p>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{project.progress}% track completion</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider">Task</th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider">Project</th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myTasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">No tasks assigned to you.</td>
                  </tr>
                ) : (
                  myTasks.map(task => (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{task.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">{task.project}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${priorityColors[task.priority] || 'bg-gray-500/10 text-gray-400'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={task.status} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          disabled={updatingId === task.id}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium transition-all bg-transparent border border-white/10 text-gray-300 focus:border-white/30 cursor-pointer ${updatingId === task.id ? 'opacity-50' : ''}`}
                        >
                          <option value="todo" className="bg-gray-900">To Do</option>
                          <option value="in-progress" className="bg-gray-900">In Progress</option>
                          <option value="review" className="bg-gray-900">In Review</option>
                          <option value="done" className="bg-gray-900">Done</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">{task.dueDate || task.deadline || 'N/A'}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {myProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 text-sm bg-gray-900/30 rounded-2xl border border-white/5">
              No active projects found.
            </div>
          ) : (
            myProjects.map(project => (
              <div key={project.id} className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">{project.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 capitalize border border-emerald-500/20">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{project.role}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Contribution</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                    <span>{project.completedTasks} of {project.tasks} tasks done</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
