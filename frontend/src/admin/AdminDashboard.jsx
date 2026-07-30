import { useMemo, useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  BookOpen, 
  FolderOpen, 
  Users, 
  ArrowUpRight, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag,
  Filter,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { projects, orders, getTotalRevenue, courses, users, loading: storeLoading } = useStore()
  const { currentUser } = useAuth()

  // Real-time live clock state
  const [time, setTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  // Calculate 7-day revenue trend & growth dynamically
  const { sevenDaysData, growthPercentage, avgDailyRev, peakRev } = useMemo(() => {
    if (!orders || orders.length === 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      return {
        sevenDaysData: days.map(day => ({ day, amount: 0, heightPct: 8, formattedDate: '' })),
        growthPercentage: 0,
        avgDailyRev: 0,
        peakRev: 0
      }
    }

    const now = new Date()
    const current7Days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    let currentPeriodRev = 0
    let prevPeriodRev = 0

    // Build last 7 days buckets (index 6 is today)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dayLabel = dayNames[date.getDay()]
      const formattedDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      // Calculate revenue for this specific day
      const dayRev = orders
        .filter(o => {
          if (o.status !== 'completed' && o.status !== 'success') return false
          const oDate = new Date(o.createdAt || o.date)
          return oDate >= date && oDate < nextDate
        })
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

      currentPeriodRev += dayRev
      current7Days.push({ day: dayLabel, amount: dayRev, rawDate: date, formattedDate })
    }

    // Previous 7 days for growth comparison
    for (let i = 13; i >= 7; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const dayRev = orders
        .filter(o => {
          if (o.status !== 'completed' && o.status !== 'success') return false
          const oDate = new Date(o.createdAt || o.date)
          return oDate >= date && oDate < nextDate
        })
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

      prevPeriodRev += dayRev
    }

    const maxDayRev = Math.max(...current7Days.map(d => d.amount), 1)

    const formattedData = current7Days.map(item => ({
      ...item,
      heightPct: Math.max(Math.round((item.amount / maxDayRev) * 100), 14)
    }))

    let pctChange = 0
    if (prevPeriodRev === 0) {
      pctChange = currentPeriodRev > 0 ? 100 : 0
    } else {
      pctChange = Math.round(((currentPeriodRev - prevPeriodRev) / prevPeriodRev) * 100)
    }

    return {
      sevenDaysData: formattedData,
      growthPercentage: pctChange,
      avgDailyRev: Math.round(currentPeriodRev / 7),
      peakRev: maxDayRev
    }
  }, [orders])

  // Sort recent signups by date descending
  const recentSignups = useMemo(() => {
    if (!users || users.length === 0) return []
    return [...users]
      .filter(u => u.role === 'student' || u.role === 'customer' || !u.role)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [users])

  // Filtered Orders for Table View
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    let list = [...orders]
    if (selectedStatusFilter !== 'all') {
      list = list.filter(o => o.status === selectedStatusFilter)
    }
    return list.slice(0, 6)
  }, [orders, selectedStatusFilter])

  if (storeLoading) return null

  const totalRevenue = getTotalRevenue()
  const pendingCount  = orders.filter(o => o.status === 'pending').length
  const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'success').length
  const studentCount  = (users || []).filter(u => u.role === 'student' || u.role === 'customer' || !u.role).length

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtext: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage}% this week`,
      icon: DollarSign,
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/20',
      badgeColor: growthPercentage >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      link: '/admin/sales',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      subtext: `${completedCount} completed`,
      icon: ShoppingBag,
      iconBg: 'bg-blue-600 text-white shadow-blue-600/20',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      link: '/admin/sales',
    },
    {
      label: 'Pending Orders',
      value: pendingCount,
      subtext: pendingCount > 0 ? 'Action required' : 'All clear',
      icon: Clock,
      iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
      badgeColor: pendingCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200',
      link: '/admin/sales',
    },
    {
      label: 'Total Projects',
      value: projects.length,
      subtext: 'Source codes ready',
      icon: FolderOpen,
      iconBg: 'bg-indigo-600 text-white shadow-indigo-600/20',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      link: '/admin/projects',
    },
    {
      label: 'Active Courses',
      value: courses.length,
      subtext: 'Curriculum catalog',
      icon: BookOpen,
      iconBg: 'bg-violet-600 text-white shadow-violet-600/20',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      link: '/admin/courses',
    },
    {
      label: 'Total Students',
      value: studentCount,
      subtext: 'Registered users',
      icon: Users,
      iconBg: 'bg-rose-500 text-white shadow-rose-500/20',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      link: '/admin/students',
    },
  ]

  const statusConfig = {
    completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    success:   { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending:   { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    failed:    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    default:   { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  }

  const sc = (status) => statusConfig[status] || statusConfig.default

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const dateString = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6 min-h-screen pb-12 font-sans bg-slate-50/50 p-2 sm:p-4 lg:p-6 rounded-3xl animate-in fade-in duration-300">

      {/* ── Realtime Header Banner (Light/White Modern Design) ── */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        {/* Ambient Subtle Gradient Mesh Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 via-indigo-100/30 to-purple-100/20 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-emerald-100/30 via-teal-100/20 to-transparent rounded-full blur-2xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-800">REALTIME MONITOR</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-semibold">{dateString}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{currentUser?.displayName?.split(' ')[0] || 'Admin'}</span> 👋
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              Welcome back to your command center. Everything is running smoothly with real-time syncing enabled.
            </p>
          </div>

          {/* Right Header Live Widget */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Live Clock Card (Ultra-Modern White Theme) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-xs flex items-center gap-3">
              <div className="w-9.5 h-9.5 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Live Server Time</p>
                <p className="text-base font-mono font-black tracking-wider text-slate-900">{timeString}</p>
              </div>
            </div>

            {/* Refresh Action */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 font-bold text-xs flex items-center gap-2 outline-none cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 6 Modern White Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link
              key={i}
              to={stat.link}
              className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${stat.iconBg}`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stat.value}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${stat.badgeColor}`}>
                  {stat.subtext}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Revenue Analytics & Recent Signups (White Modern Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart (Clean White Card) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Analytics</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase">Live 7-Day</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Daily revenue breakdown from verified online orders</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Growth Rate</p>
                  <p className={`text-sm font-black ${growthPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {growthPercentage >= 0 ? `+${growthPercentage}%` : `${growthPercentage}%`}
                  </p>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Avg</p>
                  <p className="text-sm font-black text-slate-800">₹{avgDailyRev.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* 7-Day Bar Chart */}
            <div className="mt-8">
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6">
                {sevenDaysData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative" title={`${item.formattedDate}: ₹${item.amount.toLocaleString('en-IN')}`}>
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-xl shadow-lg whitespace-nowrap">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>

                    {/* Bar Container */}
                    <div className="w-full bg-slate-100 rounded-2xl h-36 relative overflow-hidden flex items-end p-1">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 group-hover:brightness-110 shadow-xs ${
                          item.amount === peakRev && peakRev > 0
                            ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500'
                            : 'bg-gradient-to-t from-blue-500 to-indigo-500'
                        }`}
                        style={{ height: `${item.heightPct}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.day}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{item.formattedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Chart Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              <span>Peak Day: <strong className="text-slate-800">₹{peakRev.toLocaleString('en-IN')}</strong></span>
            </div>
            <Link to="/admin/sales" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              View Detailed Sales Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Signups Feed (Clean White Feed Card) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Signups</h3>
              </div>
              <Link to="/admin/students" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                View All →
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">Latest students joined SolutionHub AI</p>

            <div className="space-y-3">
              {recentSignups.map((u, i) => (
                <div key={u.uid || u._id || i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 hover:border-slate-200 transition-all duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-black shadow-xs">
                        {(u.displayName || u.name || u.email || 'S').charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.displayName || u.name || u.email?.split('@')[0] || 'Student'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Active
                  </span>
                </div>
              ))}
              {recentSignups.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">No recent signups</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] font-medium text-slate-400">Total registered students: <strong className="text-slate-700">{studentCount}</strong></p>
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table (Modern White Theme) ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Real-time status of latest orders</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
            {['all', 'completed', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all outline-none cursor-pointer ${
                  selectedStatusFilter === st
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Order ID</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Project / Item</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order, i) => {
                const cfg = sc(order.status)
                return (
                  <tr key={order.id || i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/60">
                        #{order.id?.slice(-6).toUpperCase() || 'ORD'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {order.project_title || 'Project Package'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{order.customer_name || 'Customer'}</p>
                      <p className="text-xs text-slate-400">{order.customer_email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">₹{Number(order.amount || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {order.status || 'completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs text-slate-500 font-medium">{order.date || 'Today'}</p>
                    </td>
                  </tr>
                )
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-600">No orders found for this filter</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try selecting another status tab above</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Shortcut Navigation (Clean White Cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Manage Courses',   to: '/admin/courses',     gradient: 'from-violet-500 to-indigo-600', icon: BookOpen },
          { label: 'View Students',    to: '/admin/students',    gradient: 'from-rose-500 to-pink-600', icon: Users },
          { label: 'Source Codes',     to: '/admin/projects',    gradient: 'from-blue-500 to-cyan-600', icon: FolderOpen },
          { label: 'Sales Overview',   to: '/admin/sales',       gradient: 'from-emerald-500 to-teal-600', icon: TrendingUp },
        ].map(({ label, to, gradient, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
              <Icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{label}</p>
              <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">Open Page <ArrowRight className="w-3 h-3" /></p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
