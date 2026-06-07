import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/NotificationBell'

const navItems = [
  { path: '/employee', label: 'Dashboard', icon: 'dashboard', color: 'from-emerald-500 to-teal-500' },
  { path: '/employee/tasks', label: 'My Tasks', icon: 'task', color: 'from-sky-500 to-blue-600' },
  { path: '/employee/projects', label: 'Projects', icon: 'folder', color: 'from-violet-500 to-purple-600' },
  { path: '/employee/course-manage', label: 'Manage Courses', icon: 'book', color: 'from-amber-500 to-orange-500' },
  { path: '/employee/broadcast', label: 'Bulk Email', icon: 'speaker', color: 'from-rose-500 to-pink-600' },
  { path: '/employee/chat', label: 'Messages', icon: 'chat', color: 'from-cyan-500 to-sky-500' },
  { path: '/employee/sell-project', label: 'Sell Project', icon: 'tag', color: 'from-lime-500 to-green-600' },
  { path: '/employee/profile', label: 'Profile', icon: 'user', color: 'from-slate-400 to-slate-500' },
]

const iconMap = {
  book: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  dashboard: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  task: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  folder: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  chat: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  tag: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  user: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  speaker: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
    </svg>
  ),
}

const getFilteredNavItems = (userRole) => {
  const normalized = String(userRole || '').trim().toLowerCase()
  if (!normalized || normalized === 'admin') return navItems

  return navItems.filter((item) => {
    // Dashboard, My Tasks, and Profile are always allowed for all roles
    if (['/employee', '/employee/tasks', '/employee/profile'].includes(item.path)) {
      return true
    }

    if (item.path === '/employee/projects') {
      return [
        'hr & recruitment executive',
        'web development intern/executive',
        'project coordinator',
        'operations executive',
        'senior developer',
        'junior developer',
        'project manager',
        'frontend developer',
        'backend developer',
        'devops engineer',
        'lms coordinator',
        'placement & career support executive',
        'employee',
      ].includes(normalized)
    }

    if (item.path === '/employee/course-manage') {
      return [
        'lms coordinator',
        'training coordinator',
        'content writer',
        'web development intern/executive',
        'senior developer',
        'junior developer',
        'frontend developer',
        'backend developer',
        'developer',
      ].includes(normalized)
    }

    if (item.path === '/employee/broadcast') {
      return [
        'marketing executive',
        'hr & recruitment executive',
        'project manager',
        'operations executive',
      ].includes(normalized)
    }

    if (item.path === '/employee/chat') {
      return [
        'student support executive',
        'hr & recruitment executive',
        'web development intern/executive',
        'placement & career support executive',
        'business development executive (bde)',
        'marketing executive',
        'project coordinator',
        'operations executive',
        'support agent',
        'developer',
      ].includes(normalized)
    }

    if (item.path === '/employee/sell-project') {
      return [
        'business development executive (bde)',
        'sales executive',
      ].includes(normalized)
    }

    return true
  })
}

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useAuth()

  const isTeamMember = userProfile?.role === 'team' || userProfile?.role === 'Team Member'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const employeeName = userProfile?.displayName || currentUser?.displayName || 'Employee'
  const employeeEmail = currentUser?.email || 'employee@solutionhub.com'
  const employeeRole = userProfile?.jobTitle || userProfile?.role || 'employee'
  const employeeInitial = employeeName.charAt(0).toUpperCase()

  const filteredNavItems = useMemo(() => {
    return getFilteredNavItems(employeeRole)
  }, [employeeRole])

  // Enforce Role-Based Access Control (RBAC) path protection
  useEffect(() => {
    const isPathAllowed = filteredNavItems.some(item => 
      item.path === '/employee' 
        ? location.pathname === '/employee'
        : location.pathname.startsWith(item.path)
    )
    if (!isPathAllowed && location.pathname.startsWith('/employee')) {
      navigate('/employee', { replace: true })
    }
  }, [location.pathname, filteredNavItems, navigate])

  const currentNavItem = useMemo(() => {
    return filteredNavItems.find(item =>
      item.path === '/employee'
        ? location.pathname === '/employee'
        : location.pathname.startsWith(item.path)
    ) || filteredNavItems[0] || navItems[0]
  }, [location.pathname, filteredNavItems])

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0f1e 40%, #050a18 100%)' }}>
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 -right-48 h-[500px] w-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen">
        {/* ── SIDEBAR ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex transform flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarOpen ? 'w-72' : 'w-20'}`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(24px)' }}
        >
          {/* Brand */}
          <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 0 20px rgba(16,185,129,0.35)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-emerald-400">SolutionHub</p>
                  <h1 className="truncate text-[15px] font-black text-white leading-tight">
                    {isTeamMember ? 'Team Workspace' : 'Employee Portal'}
                  </h1>
                </div>
              )}
            </div>
          </div>

          {/* User card */}
          {sidebarOpen && (
            <div className="mx-3 mt-4 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  {employeeInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{employeeName}</p>
                  <p className="truncate text-[11px] text-slate-500">{employeeEmail}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {isTeamMember ? 'Team' : 'Employee'}
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  {employeeRole}
                </span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = item.path === '/employee'
                ? location.pathname === '/employee'
                : location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${sidebarOpen ? '' : 'justify-center'}`}
                  style={isActive ? {
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#fff',
                  } : {
                    border: '1px solid transparent',
                    color: 'rgba(148,163,184,0.8)',
                  }}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
                  )}

                  {/* Icon with gradient bg on active */}
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${isActive ? '' : 'group-hover:bg-white/5'}`}
                    style={isActive ? { background: `linear-gradient(135deg, ${item.color.replace('from-', '').replace(' to-', ', ')})`, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' } : {}}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>
                      {iconMap[item.icon]}
                    </span>
                  </span>

                  {sidebarOpen && <span className="truncate">{item.label}</span>}

                  {isActive && sidebarOpen && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.9)' }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleLogout}
              title="Logout"
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 transition-all duration-200 hover:text-white ${sidebarOpen ? '' : 'justify-center'}`}
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </span>
              {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
            </button>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3.5 top-20 hidden h-7 w-7 items-center justify-center rounded-full text-slate-300 transition-all duration-200 hover:text-white lg:flex"
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header
            className="sticky top-0 z-30 px-5 py-4 lg:px-8"
            style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile menu btn */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl p-2 text-slate-400 transition hover:text-white lg:hidden"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{currentNavItem.label}</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-400/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">SolutionHub</span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">Welcome back, {employeeName.split(' ')[0]}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Current page pill */}
                <div
                  className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                  <span className="text-[11px] font-bold text-slate-300">{currentNavItem.label}</span>
                </div>

                <NotificationBell />

                <Link
                  to="/"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-slate-400 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  <span className="hidden sm:inline">View Site</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto px-5 py-7 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
