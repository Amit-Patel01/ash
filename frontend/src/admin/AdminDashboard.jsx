import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Clock, DollarSign, BookOpen, FolderOpen } from 'lucide-react'

export default function AdminDashboard() {
  const { projects, orders, getTotalRevenue, courses, loading: storeLoading } = useStore()
  const { currentUser } = useAuth()

  if (storeLoading) return null

  const totalRevenue = getTotalRevenue()
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const completedCount = orders.filter(o => o.status === 'completed').length

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Orders', value: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10' },
    { label: 'Total Orders', value: orders.length, icon: TrendingUp, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-500/10' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10' },
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-500/10' },
  ]

  const recentOrders = orders.slice(0, 5)

  const statusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back, {currentUser?.displayName || 'Admin'}. Here&apos;s what&apos;s happening.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-2 tracking-tight truncate">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0 ml-3`}>
                <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/5">
          <h2 className="text-lg font-black text-white tracking-tight">Recent Orders</h2>
          <a href="/admin/sales" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Order</th>
                <th className="text-left px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Project</th>
                <th className="text-left px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Student</th>
                <th className="text-left px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</th>
                <th className="text-left px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="text-left px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((order, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 sm:px-8 py-4">
                    <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300 transition-colors">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 sm:px-8 py-4">
                    <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{order.project_title}</p>
                  </td>
                  <td className="px-6 sm:px-8 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-300">{order.customer_name}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-4">
                    <span className="text-sm font-black text-white">₹{Number(order.amount).toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 sm:px-8 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle(order.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-400' : order.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-gray-400'}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-4 whitespace-nowrap">
                    <p className="text-xs text-gray-500 font-medium">{order.date}</p>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500 font-bold text-sm">No orders found yet.</p>
                      <p className="text-gray-600 text-xs mt-1">Orders will appear here once students purchase.</p>
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
