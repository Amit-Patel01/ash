import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import MobileRequiredPopup from '../components/MobileRequiredPopup'

const navItems = [
  { path: '/user', label: 'Dashboard', icon: 'dashboard' },
  { path: '/user/my-courses', label: 'My Courses', icon: 'book' },
  { path: '/user/certificates', label: 'Documents', icon: 'award' },
  { path: '/user/custom-project', label: 'Build Project', icon: 'build' },
  { path: '/user/orders', label: 'My Orders', icon: 'orders' },
  { path: '/user/support', label: 'Support Chat', icon: 'chat' },
  { path: '/user/profile', label: 'Profile', icon: 'user' },
]

const iconMap = {
  book: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>),
  dashboard: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>),
  orders: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>),
  chat: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>),
  user: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
  award: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0016.5 3h-9a2.25 2.25 0 00-2.25 2.25V16.5A2.25 2.25 0 007.5 18.75m9 0 1.154 1.154A1.125 1.125 0 0116.858 21H7.142a1.125 1.125 0 01-.796-1.92L7.5 18.75m4.5-10.5 1.068 2.165 2.39.347-1.729 1.685.408 2.381L12 13.762l-2.137 1.123.408-2.381-1.729-1.685 2.39-.347L12 8.25z" /></svg>),
  build: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.654-4.654m5.654-4.654l3.029-2.498a1.5 1.5 0 012.122 2.122l-2.498 3.029m-5.654 4.654l5.654-4.654" /></svg>),
}

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleWheel = (e) => {
    const target = e.target
    const scrollable = target.closest('.overflow-x-auto') || target.closest('.overflow-y-auto')
    if (scrollable) {
      const { scrollTop, scrollHeight, clientHeight } = scrollable
      const atTop = scrollTop === 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const userName = userProfile?.displayName || currentUser?.displayName || 'Student'
  const userEmail = currentUser?.email || 'student@solutionhub.com'
  const userAvatar = userProfile?.avatar || userProfile?.photoURL || currentUser?.avatar || currentUser?.photoURL || ''

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white dark' : 'bg-slate-50 text-slate-800'}`}>
      <MobileRequiredPopup />
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-305 ease-in-out ${sidebarOpen ? 'w-72' : 'w-20'} flex flex-col border-r ${
        isDark 
          ? 'bg-slate-900/35 backdrop-blur-xl border-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]' 
          : 'bg-white/45 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]'
      }`}>
        
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-200/50'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-450 to-violet-500 bg-clip-text text-transparent">SolutionHub</h1>
                <p className={`text-[10px] -mt-0.5 tracking-wider uppercase ${isDark ? 'text-gray-500' : 'text-slate-400 font-bold'}`}>User Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/user' ? location.pathname === '/user' : location.pathname.startsWith(item.path)
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setMobileMenuOpen(false)} 
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-600 dark:text-white shadow-lg shadow-blue-500/5' 
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className={`flex-shrink-0 transition-colors ${
                  isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : isDark 
                      ? 'text-gray-550 group-hover:text-gray-300' 
                      : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  {iconMap[item.icon]}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />}
              </Link>
            )
          })}
        </nav>

        {/* Profile / Logout Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200/50'}`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0 overflow-hidden text-sm font-bold border border-slate-350 dark:border-slate-800 text-white">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{userName}</p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-550' : 'text-slate-405'}`}>{userEmail}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} title="Logout" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-405 hover:text-red-550 hover:bg-red-500/5'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Collapse Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className={`hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full border transition-all ${
            isDark 
              ? 'bg-slate-900 border-white/10 text-gray-400 hover:text-white hover:bg-slate-800' 
              : 'bg-white border-slate-205 shadow-md text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-6 transition-all ${
          isDark 
            ? 'bg-slate-950/45 backdrop-blur-xl border-white/[0.05]' 
            : 'bg-white/40 backdrop-blur-xl border-white/50 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-lg ${isDark ? 'text-gray-450 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-400 font-medium'}`}>Welcome back,</p>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{userName}</p>
            </div>
          </div>
          
          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                isDark 
                  ? 'text-yellow-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-yellow-355' 
                  : 'text-amber-500 bg-slate-50 border-slate-250/80 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
              }`}
              title="Toggle theme mode"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.83A9.53 9.53 0 0112 21.75c-5.25 0-9.5-4.25-9.5-9.5A9.53 9.53 0 0112 2.25c.8 0 1.57.1 2.31.29a7.5 7.5 0 00-1.74 4.82c0 4.14 3.36 7.5 7.5 7.5.3 0 .59-.02.88-.06z" />
                </svg>
              )}
            </button>

            <Link to="/user/profile" className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-sm transition-all border ${
              isDark 
                ? 'text-gray-450 bg-white/5 border-white/5 hover:text-white hover:bg-white/10' 
                : 'text-slate-655 bg-slate-50 border-slate-250/80 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
            }`}>
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0)
                )}
              </div>
              <span className="hidden sm:inline font-medium">Profile</span>
            </Link>

            <Link to="/" className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-sm transition-all border ${
              isDark 
                ? 'text-gray-450 bg-white/5 border-white/5 hover:text-white hover:bg-white/10' 
                : 'text-slate-655 bg-slate-50 border-slate-250/80 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              <span className="hidden xs:inline font-medium">View Site</span>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto overscroll-contain" onWheel={handleWheel}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
