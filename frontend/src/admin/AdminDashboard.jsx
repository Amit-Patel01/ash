import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, Clock, DollarSign, BookOpen, FolderOpen, Users, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { projects, orders, getTotalRevenue, courses, users, loading: storeLoading } = useStore()
  const { currentUser } = useAuth()

  if (storeLoading) return null

  const totalRevenue = getTotalRevenue()
  const pendingCount  = orders.filter(o => o.status === 'pending').length
  const completedCount = orders.filter(o => o.status === 'completed').length
  const studentCount  = (users || []).filter(u => u.role === 'student' || !u.role).length

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderOpen,
      gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1d4ed8',
      link: '/admin/projects',
    },
    {
      label: 'Pending Orders',
      value: pendingCount,
      icon: Clock,
      gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#b45309',
      link: '/admin/sales',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      bg: '#faf5ff',
      border: '#e9d5ff',
      text: '#6d28d9',
      link: '/admin/sales',
    },
    {
      label: 'Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      gradient: 'linear-gradient(135deg,#10b981,#14b8a6)',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#047857',
      link: '/admin/sales',
    },
    {
      label: 'Total Courses',
      value: courses.length,
      icon: BookOpen,
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      bg: '#eef2ff',
      border: '#c7d2fe',
      text: '#4338ca',
      link: '/admin/courses',
    },
    {
      label: 'Students',
      value: studentCount,
      icon: Users,
      gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)',
      bg: '#fff1f2',
      border: '#fecdd3',
      text: '#be123c',
      link: '/admin/students',
    },
  ]

  const recentOrders = orders.slice(0, 6)

  const statusConfig = {
    completed: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
    pending:   { bg: '#fffbeb', border: '#fde68a', text: '#92400e', dot: '#f59e0b' },
    default:   { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', dot: '#94a3b8' },
  }

  const sc = (status) => statusConfig[status] || statusConfig.default

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Page header ── */}
      <div
        className="relative rounded-3xl overflow-hidden p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg,#1e293b 0%,#1e3a5f 50%,#1e1b4b 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#3b82f6,transparent)' }} />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle,#8b5cf6,transparent)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-300 text-[11px] font-black uppercase tracking-[0.25em] mb-1">{greeting} 👋</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentUser?.displayName?.split(' ')[0] || 'Admin'} Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Here's what's happening in your workspace today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="group relative bg-white rounded-2xl p-4 border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            style={{ borderColor: stat.border }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
              style={{ background: stat.gradient }}
            >
              <stat.icon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: stat.text }}>{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: stat.text }} />
          </Link>
        ))}
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div
          className="flex items-center justify-between px-6 sm:px-8 py-5"
          style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', borderBottom: '1px solid #e2e8f0' }}
        >
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last {recentOrders.length} transactions</p>
          </div>
          <Link
            to="/admin/sales"
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderBottom: '1px solid #4f46e5' }}>
                {['Order', 'Project', 'Student', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 sm:px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/90">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order, i) => {
                const cfg = sc(order.status)
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 sm:px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400">#{order.id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{order.project_title}</p>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700">{order.customer_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{order.customer_email}</p>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span className="text-sm font-black text-slate-900">₹{Number(order.amount).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                      <p className="text-xs text-slate-400 font-medium">{order.date}</p>
                    </td>
                  </tr>
                )
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-bold text-sm">No orders yet</p>
                      <p className="text-slate-400 text-xs mt-1">Orders will appear once students purchase.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Manage Courses',   to: '/admin/courses',     gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: BookOpen },
          { label: 'View Students',    to: '/admin/students',    gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: Users },
          { label: 'Source Codes',     to: '/admin/projects',    gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)', icon: FolderOpen },
          { label: 'Sales Overview',   to: '/admin/sales',       gradient: 'linear-gradient(135deg,#10b981,#14b8a6)', icon: TrendingUp },
        ].map(({ label, to, gradient, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="relative group flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 overflow-hidden"
            style={{ background: gradient }}
          >
            <Icon className="w-6 h-6" strokeWidth={2} />
            <span className="text-[11px] font-black uppercase tracking-wider text-center">{label}</span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all rounded-2xl" />
          </Link>
        ))}
      </div>
    </div>
  )
}
