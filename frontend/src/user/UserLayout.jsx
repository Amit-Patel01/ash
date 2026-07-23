import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../store/StoreContext'
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Wrench, 
  ShoppingBag, 
  Receipt, 
  MessageSquare, 
  User, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  Menu,
  CheckCheck,
  ChevronRight,
  Sparkles,
  Globe,
  ExternalLink
} from 'lucide-react'


const navItems = [
  { path: '/user', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/user/my-courses', label: 'My Courses', icon: BookOpen },
  { path: '/user/certificates', label: 'Documents', icon: Award },
  { path: '/user/custom-project', label: 'Build Project', icon: Wrench },
  { path: '/user/orders', label: 'My Orders', icon: ShoppingBag },
  { path: '/user/receipts', label: 'My Receipts', icon: Receipt },
  { path: '/user/support', label: 'Support Chat', icon: MessageSquare },
  { path: '/user/profile', label: 'Profile', icon: User },
]

export default function UserLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('solutionhub:read-notifications') || '[]')
    } catch {
      return []
    }
  })

  const notificationRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useAuth()
  const { getUserEnrollments, certificates, orders } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Fetch real enrollments, certificates & orders for this user
  const myEnrollments = useMemo(() => {
    return currentUser ? getUserEnrollments(currentUser.uid) : []
  }, [getUserEnrollments, currentUser])

  const myCertificates = useMemo(() => {
    if (!currentUser) return []
    return certificates.filter(cert => {
      if (cert.status !== 'approved' && cert.status !== 'active') return false
      const uid = currentUser.uid
      const email = currentUser.email
      return (uid && cert.userId === uid) || (uid && cert.assignedEmployeeUid === uid) || (email && cert.assignedEmployeeEmail === email)
    })
  }, [certificates, currentUser])

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customer_email === currentUser?.email || o.customer_uid === currentUser?.uid)
  }, [orders, currentUser])

  // Generate dynamic real notification items
  const realNotifications = useMemo(() => {
    const list = []

    // 1. Enrollment notifications
    myEnrollments.forEach(en => {
      list.push({
        id: `en-${en.id || en.courseId}`,
        title: 'Active Program Enrollment',
        desc: `You are enrolled in ${en.courseTitle || en.courseName || 'Technology Track'}.`,
        time: 'Active',
        link: '/user/my-courses',
        type: 'course'
      })
    })

    // 2. Certificate notifications
    myCertificates.forEach(cert => {
      list.push({
        id: `cert-${cert.id || cert.certificate_id}`,
        title: 'Verified Document Ready',
        desc: `Certificate #${cert.certificate_id || 'ID'} is verified and ready to download.`,
        time: 'Verified',
        link: '/user/certificates',
        type: 'certificate'
      })
    })

    // 3. Order notifications
    myOrders.forEach(ord => {
      list.push({
        id: `ord-${ord.id}`,
        title: `Order Status: ${ord.status?.toUpperCase() || 'COMPLETED'}`,
        desc: `Order for ${ord.project_title || 'Project'} (₹${ord.amount || 0}).`,
        time: ord.date || 'Recent',
        link: '/user/orders',
        type: 'order'
      })
    })

    // Fallback welcoming notifications if no data
    if (list.length === 0) {
      list.push(
        {
          id: 'welcome-1',
          title: 'Welcome to SolutionHub!',
          desc: 'Explore enrolled training tracks, verified offer letters, and custom project tools.',
          time: 'Just now',
          link: '/user/my-courses',
          type: 'info'
        },
        {
          id: 'welcome-2',
          title: 'Live Mentorship Desk',
          desc: 'Connect with technical instructors and submit queries in Support Chat.',
          time: '1h ago',
          link: '/user/support',
          type: 'info'
        },
        {
          id: 'welcome-3',
          title: 'Official Document Verification',
          desc: 'All issued certificates come with QR security seals.',
          time: '1d ago',
          link: '/user/certificates',
          type: 'info'
        }
      )
    }

    return list.map(n => ({
      ...n,
      read: readNotificationIds.includes(n.id)
    }))
  }, [myEnrollments, myCertificates, myOrders, readNotificationIds])

  const unreadCount = realNotifications.filter(n => !n.read).length

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    const allIds = realNotifications.map(n => n.id)
    setReadNotificationIds(allIds)
    try {
      localStorage.setItem('solutionhub:read-notifications', JSON.stringify(allIds))
    } catch (e) {
      console.error(e)
    }
  }

  const handleNotificationClick = (n) => {
    if (!n.read) {
      const updated = [...readNotificationIds, n.id]
      setReadNotificationIds(updated)
      try {
        localStorage.setItem('solutionhub:read-notifications', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
    }
    setShowNotifications(false)
    navigate(n.link)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const userName = userProfile?.displayName || currentUser?.displayName || 'Amit'
  const userEmail = currentUser?.email || 'student@solutionhub.com'
  const userAvatar = userProfile?.avatar || userProfile?.photoURL || currentUser?.avatar || currentUser?.photoURL || ''

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white dark' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* ── 1. Left Sidebar ────────────────────────────────────────── */}
      <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out w-72 h-screen flex flex-col justify-between border-r ${
        isDark 
          ? 'bg-slate-900 border-slate-800 shadow-2xl' 
          : 'bg-white border-slate-200/80 shadow-[0_0_30px_rgba(0,0,0,0.02)]'
      }`}>
        
        <div className="flex flex-col h-full justify-between p-5 overflow-y-auto">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 py-2 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 text-white">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                  <polyline points="7.5 19.79 7.5 14.6 3 12" />
                  <polyline points="21 12 16.5 14.6 16.5 19.79" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">SolutionHub</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 -mt-0.5">Student Portal</p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const IconComp = item.icon
                const isActive = item.path === '/user' ? location.pathname === '/user' : location.pathname.startsWith(item.path)
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-extrabold transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' 
                        : isDark 
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <IconComp className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-white' : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom Area: User Profile Card */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden text-sm font-black text-white shrink-0 border-2 border-white shadow-sm">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* ── 2. Right Main Layout ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 h-20 border-b flex items-center justify-between px-4 sm:px-8 transition-colors ${
          isDark 
            ? 'bg-slate-950/90 backdrop-blur-xl border-slate-800' 
            : 'bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-xs'
        }`}>
          {/* Header Left: Welcome */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="lg:hidden p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Welcome back,</p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {userName}
              </h2>
            </div>
          </div>

          {/* Header Center: Functional Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, documents..." 
              className="w-full pl-11 pr-12 py-2.5 bg-slate-100/70 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button 
                type="submit" 
                className="absolute right-2 px-2.5 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            )}
          </form>

          {/* Header Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Real Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-[9px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Live Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-extrabold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead} 
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Clear unread
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {realNotifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                          n.read 
                            ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100' 
                            : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-500/30 hover:bg-blue-100/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.desc}</p>
                        <div className="mt-2 flex items-center justify-end text-[10px] font-bold text-blue-600">
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <Link 
              to="/user/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0)
                )}
              </div>
              <span className="text-xs font-extrabold hidden sm:inline">Profile</span>
            </Link>

            {/* Settings Button */}
            <Link 
              to="/user/profile"
              className="p-2.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* View Site Button */}
            <Link 
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all shadow-xs"
              title="View Main Website"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black hidden md:inline">View Site</span>
            </Link>
          </div>

        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
