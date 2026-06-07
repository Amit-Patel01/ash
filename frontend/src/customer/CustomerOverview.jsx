import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

export default function CustomerOverview() {
  const { currentUser, userProfile } = useAuth()
  const { orders } = useStore()

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customer_email === currentUser?.email || o.customer_uid === currentUser?.uid)
  }, [orders, currentUser])

  const totalSpent = myOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length
  const completedOrders = myOrders.filter(o => o.status === 'completed').length
  const recentOrders = myOrders.slice(0, 5)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, <span className="text-blue-400 font-semibold">{userProfile?.displayName || currentUser?.displayName || 'Customer'}</span>. Here's your overview.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: myOrders.length, icon: '📦', color: 'from-blue-500 to-indigo-600' },
          { label: 'Completed', value: completedOrders, icon: '✅', color: 'from-emerald-500 to-green-600' },
          { label: 'Pending', value: pendingOrders, icon: '⏳', color: 'from-amber-500 to-orange-600' },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰', color: 'from-purple-500 to-violet-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:bg-gray-800/50 hover:border-white/10 transition-all duration-300 shadow-xl group">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 mb-4`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Orders */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Recent Orders
          </h3>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-500 font-medium">No orders yet</p>
              <Link to="/projects" className="text-blue-400 text-sm hover:text-blue-300 mt-2 inline-block">Browse projects</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate">{order.project_title || 'Project'}</p>
                    <p className="text-xs text-gray-500">{order.date || 'Recent'}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-emerald-400">₹{Number(order.amount || 0).toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{order.status || 'pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link to="/projects" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Browse Projects</p>
                <p className="text-xs text-gray-400">Explore available projects</p>
              </div>
            </Link>
            <Link to="/customer/support" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Contact Support</p>
                <p className="text-xs text-gray-400">Get help from our team</p>
              </div>
            </Link>
            <Link to="/customer/profile" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Update Profile</p>
                <p className="text-xs text-gray-400">Manage photo, phone and password</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
