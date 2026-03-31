import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

export default function TeamMemberDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { projects, orders } = useStore()
  const [tab, setTab] = useState('overview')

  const myProjects = projects.filter(p => p.createdBy === currentUser?.uid || p.team?.includes(userProfile?.avatar) || p.assignedTo === currentUser?.uid)
  const mySales = orders.filter(o => myProjects.some(p => p.id === o.project_id))
  const myRevenue = mySales.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount), 0)
  const completedSales = mySales.filter(o => o.status === 'completed').length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight italic">Team Console</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Efficiently managing projects and performance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">Active Session</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'My Projects', 
            value: myProjects.length, 
            color: 'from-blue-500 to-indigo-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )
          },
          { 
            label: 'Total Sales', 
            value: mySales.length, 
            color: 'from-emerald-500 to-green-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )
          },
          { 
            label: 'Completed', 
            value: completedSales, 
            color: 'from-amber-500 to-orange-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          { 
            label: 'Revenue', 
            value: `₹${myRevenue.toLocaleString('en-IN')}`, 
            color: 'from-purple-500 to-violet-600',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-all duration-300 shadow-xl group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        {['overview', 'projects', 'sales'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-emerald-400 shadow-lg' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Performance</h3>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Live Updates</span>
            </div>
            {mySales.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-slate-400">
                No recent activity detected
              </div>
            ) : (
              <div className="space-y-4">
                {mySales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                        {sale.project_title?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sale.project_title}</p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-gray-500">{sale.customer_name} • {sale.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{Number(sale.amount).toLocaleString('en-IN')}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>{sale.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl h-fit">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Console</h3>
            <div className="space-y-4">
              <a href="/employee/sell-project" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Submit Project</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400">New marketplace listing</p>
                </div>
              </a>
              <a href="/employee/chat" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Messages</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400">Direct team communication</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myProjects.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-gray-900/30 rounded-2xl border border-white/5">
              <p className="text-gray-500 text-sm">No projects assigned to you yet</p>
            </div>
          )}
          {myProjects.map(project => (
            <div key={project.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">{project.title}</h3>
                <span className="text-xs text-emerald-400 font-medium">{project.sales || 0} sales</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{project.description}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">₹{Number(project.price_project_only).toLocaleString('en-IN')}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${project.category_slug === 'basic' ? 'bg-green-500/10 text-green-400' : project.category_slug === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>{project.category_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sales' && (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mySales.map(sale => (
                <tr key={sale.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white">{sale.project_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{sale.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-emerald-400 font-medium">₹{Number(sale.amount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{sale.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-400">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {mySales.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No sales yet</p>}
        </div>
      )}
    </div>
  )
}
