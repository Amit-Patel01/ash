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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, {userProfile.displayName}. Here's your summary.</p>
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
    </div>
  )
}
