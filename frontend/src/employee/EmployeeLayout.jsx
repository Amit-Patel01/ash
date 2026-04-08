import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/NotificationBell'

const navItems = [
  { path: '/employee', label: 'Dashboard', icon: 'dashboard' },
  { path: '/employee/tasks', label: 'My Tasks', icon: 'task' },
  { path: '/employee/projects', label: 'Projects', icon: 'folder' },
  { path: '/employee/course-manage', label: 'Manage Courses', icon: 'book' },
  { path: '/employee/broadcast', label: 'Bulk Email / Broadcast', icon: 'speaker' },
  { path: '/employee/chat', label: 'Messages', icon: 'chat' },
  { path: '/employee/sell-project', label: 'Sell Project', icon: 'tag' },
  { path: '/employee/profile', label: 'Profile', icon: 'user' },
]

const iconMap = {
  book: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>),
  dashboard: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>),
  task: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>),
  folder: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>),
  chat: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>),
  tag: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>),
  trending: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>),
  user: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
  speaker: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" /></svg>),
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
  const currentNavItem = useMemo(() => {
    return navItems.find(item =>
      item.path === '/employee'
        ? location.pathname === '/employee'
        : location.pathname.startsWith(item.path)
    ) || navItems[0]
  }, [location.pathname])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.65),_rgba(2,6,23,0.92))]" />
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      <div className="relative flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-50 flex transform flex-col border-r border-white/10 bg-slate-950/90 backdrop-blur-2xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarOpen ? 'w-72' : 'w-24'}`}>
          <div className="border-b border-white/8 px-4 py-5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-300">SolutionHub</p>
                  <h1 className="truncate text-lg font-black text-white">{isTeamMember ? 'Team Workspace' : 'Employee Workspace'}</h1>
                </div>
              )}
            </div>
          </div>
          {sidebarOpen && (
            <div className="mx-4 mt-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white">
                  {employeeInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{employeeName}</p>
                  <p className="truncate text-[11px] text-slate-400">{employeeEmail}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  {isTeamMember ? 'Team' : 'Employee'}
                </span>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                  {employeeRole}
                </span>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {navItems.map((item) => {
              const isActive = item.path === '/employee' ? location.pathname === '/employee' : location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white shadow-lg shadow-emerald-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-emerald-300' : 'text-slate-500 group-hover:text-slate-300'}`}>{iconMap[item.icon]}</span>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {isActive && sidebarOpen && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-300 shadow-lg shadow-emerald-400/40" />}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/8 p-4">
            <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
              <button
                onClick={handleLogout}
                title="Logout"
                className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-400/10 hover:text-white ${sidebarOpen ? 'w-full justify-between' : 'justify-center px-0'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/15 text-rose-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                  </span>
                  {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
                </div>
              </button>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:flex">
            <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/70 px-4 py-4 backdrop-blur-2xl lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                </button>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">{currentNavItem.label}</p>
                  <h2 className="mt-1 text-2xl font-black text-white">{employeeName}</h2>
                  <p className="mt-1 text-sm text-slate-400">Focused workspace for tasks, students, communication and delivery.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <span className="font-black text-white">{currentNavItem.label}</span>
                  <span className="ml-2 text-slate-500">Active page</span>
                </div>
                <NotificationBell />
                <Link to="/" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  <span>View Site</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
