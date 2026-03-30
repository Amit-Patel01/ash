import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

export default function EmployeeProjects() {
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

  if (!userProfile) return <div className="p-8 text-white">Loading projects...</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-sm text-gray-400 mt-1">Status of projects you're contributing to.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProjects.length > 0 ? myProjects.map((proj) => (
          <div key={proj.id} className="group bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{proj.name}</h3>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{proj.completedTasks} / {proj.totalTasks} Tasks Completed</span>
              <span className="font-bold text-emerald-400">{proj.progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${proj.progress}%` }} />
            </div>
          </div>
        )) : (
          <div className="col-span-full bg-gray-900/50 backdrop-blur-sm border border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500">
            No projects found. Once tasks are assigned to you, projects will appear here.
          </div>
        )}
      </div>
    </div>
  )
}
