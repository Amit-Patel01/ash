import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

export default function TeamMemberDashboard() {
  const { currentUser, userProfile } = useAuth()
  const { projects, orders } = useStore()
  const [tab, setTab] = useState('overview')

  const myProjects = projects.filter(p => p.createdBy === currentUser?.uid || p.team?.includes(userProfile?.avatar))
  const mySales = orders.filter(o => myProjects.some(p => p.id === o.project_id))
  const myRevenue = mySales.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount), 0)
  const completedSales = mySales.filter(o => o.status === 'completed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {userProfile?.displayName || 'Team Member'}</h1>
        <p className="text-sm text-gray-400 mt-1">Your personal dashboard</p>
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
          <div key={i} className="bg-gray-900/50 border border-white/5 rounded-xl p-5 hover:bg-gray-800/50 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
              {s.icon}
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-px">
        {['overview', 'projects', 'sales'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${tab === t ? 'text-emerald-400 bg-emerald-500/10 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">My Recent Sales</h3>
            {mySales.length === 0 ? (
              <p className="text-sm text-gray-500">No sales yet</p>
            ) : (
              <div className="space-y-3">
                {mySales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{sale.project_title}</p>
                      <p className="text-xs text-gray-500">{sale.customer_name} • {sale.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">₹{Number(sale.amount).toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{sale.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/employee/sell-project" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Sell a Project</p>
                  <p className="text-xs text-gray-400">Submit a project for listing</p>
                </div>
              </a>
              <a href="/employee/tasks" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">View Tasks</p>
                  <p className="text-xs text-gray-400">Check your assigned tasks</p>
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
