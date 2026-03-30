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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Projects</h1>
          <p className="text-sm text-gray-400 mt-1">Direct oversight of your ongoing technical contributions.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
          <svg className="w-4 h-4 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{myProjects.length} Assigned</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProjects.length > 0 ? myProjects.map((proj, idx) => (
          <div key={proj.id} className="group relative bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-gray-800/50 hover:border-white/10 transition-all duration-500 shadow-2xl overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-xl text-[10px] font-black text-gray-500 border border-white/10 tracking-widest uppercase">
                  Project #{idx + 101}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-blue-400 transition-colors leading-tight">{proj.name}</h3>
              <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2">Enterprise-grade solution delivery for high-performance systems.</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Progress</span>
                    <span className="text-2xl font-black text-white">{proj.progress}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">Status</span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${proj.progress === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {proj.progress === 100 ? 'Completed' : 'Developing'}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    style={{ width: `${proj.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[8px] font-black text-gray-400">
                        TM
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">
                      +2
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{proj.completedTasks}/{proj.totalTasks} Done</span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 px-6 text-center bg-gray-900/40 rounded-3xl border-2 border-dashed border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Assignments</h3>
            <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium">As soon as the admin assigns you to a project task, it will appear here in your live stream.</p>
          </div>
        )}
      </div>
    </div>
  )
}
