import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

export default function EmployeeOverview() {
  const { userProfile } = useAuth()
  const { tasks, projects } = useStore()

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

  const myProjects = useMemo(() => {
    const pNames = [...new Set(myTasks.map(t => t.project).filter(Boolean))]
    return pNames.map(name => {
      const pTasks = myTasks.filter(t => t.project === name)
      const doneTasks = pTasks.filter(t => ['done', 'Done', 'completed'].includes(t.status)).length
      const progress = pTasks.length > 0 ? Math.round((doneTasks / pTasks.length) * 100) : 0
      const storeProj = projects.find(p => p.title === name)
      
      return {
        id: storeProj?.id || name,
        name: name,
        progress: progress,
        totalTasks: pTasks.length,
        completedTasks: doneTasks
      }
    })
  }, [myTasks, projects])

  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(t => ['done', 'Done', 'completed'].includes(t.status)).length
  const inProgressTasks = myTasks.filter(t => ['in-progress', 'In Progress'].includes(t.status)).length

  if (!userProfile) return <div className="p-8 text-white">Loading stats...</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, <span className="text-blue-400 font-semibold">{userProfile.displayName}</span>. Here's what's happening today.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
          <span className="text-xs font-semibold text-gray-300">System Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Tasks', 
            value: totalTasks, 
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ), 
            color: 'from-blue-500 to-indigo-600' 
          },
          { 
            label: 'In Progress', 
            value: inProgressTasks, 
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ), 
            color: 'from-amber-500 to-orange-600' 
          },
          { 
            label: 'Completed', 
            value: completedTasks, 
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ), 
            color: 'from-emerald-500 to-green-600' 
          },
          { 
            label: 'Active Projects', 
            value: myProjects.length, 
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ), 
            color: 'from-purple-500 to-violet-600' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:bg-gray-800/50 hover:border-white/10 transition-all duration-300 shadow-xl group">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 mb-4`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Project Progress */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Project Progress
          </h3>
          <div className="space-y-6">
            {myProjects.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-500 font-medium">No active project assignments</p>
              </div>
            ) : (
              myProjects.slice(0, 3).map((project, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-gray-300">
                    <span>{project.name}</span>
                    <span className="text-blue-400">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>{project.completedTasks} / {project.totalTasks} Tasks</span>
                    <span>Target: Q{Math.floor(idx/2)+1} 2026</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Tasks
          </h3>
          <div className="space-y-4">
            {myTasks.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-500 font-medium">No recent tasks</p>
              </div>
            ) : (
              myTasks.slice(0, 4).map((task, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:-translate-x-1 transition-all group/task">
                  <div className={`w-2 h-10 rounded-full ${['done', 'Done', 'completed'].includes(task.status) ? 'bg-emerald-500' : task.status?.toLowerCase().includes('progress') ? 'bg-amber-500' : 'bg-blue-500'} shadow-[0_0_10px_currentColor]`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate group-hover/task:text-white transition-colors">{task.title}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{task.project}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${['done', 'Done', 'completed'].includes(task.status) ? 'bg-emerald-500/10 text-emerald-400' : task.status?.toLowerCase().includes('progress') ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
