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
          { label: 'My Projects', value: myProjects.length, color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Sales', value: mySales.length, color: 'from-emerald-500 to-green-600' },
          { label: 'Completed', value: completedSales, color: 'from-amber-500 to-orange-600' },
          { label: 'Revenue', value: `₹${myRevenue.toLocaleString('en-IN')}`, color: 'from-purple-500 to-violet-600' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900/50 border border-white/5 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" /></svg>
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
