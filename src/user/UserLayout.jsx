'use client'
'use client'
import Link from 'next/link'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  Globe,
  ChevronDown,
  X
} from 'lucide-react'
import FormerStaffModal from '../components/FormerStaffModal'

const groupedUserNav = [
  {
    label: 'Learning & Docs',
    items: [
      { path: '/user/my-courses', label: 'My Courses', icon: BookOpen },
      { path: '/user/certificates', label: 'Documents & Certs', icon: Award },
    ]
  },
  {
    label: 'Projects & Orders',
    items: [
      { path: '/user/custom-project', label: 'Build Custom Project', icon: Wrench },
      { path: '/user/orders', label: 'My Orders', icon: ShoppingBag },
      { path: '/user/receipts', label: 'My Receipts', icon: Receipt },
    ]
  },
  {
    label: 'Support & Profile',
    items: [
      { path: '/user/support', label: 'Support Chat', icon: MessageSquare },
      { path: '/user/profile', label: 'Profile Settings', icon: User },
    ]
  }
]

export default function UserLayout({ children }) {
  const [openGroup, setOpenGroup] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ashnexa:read-notifications') || '[]')
    } catch {
      return []
    }
  })


  const navRef = useRef(null)
  const notificationRef = useRef(null)
  const pathname = usePathname() || ''; const location = { pathname }
    const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)
  const { currentUser, userProfile, logout } = useAuth()
  const { getUserEnrollments, certificates, orders } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [showFormerStaffPopup, setShowFormerStaffPopup] = useState(false)

  const isFormerStaff = Boolean(
    userProfile?.status === 'terminated' ||
    userProfile?.isTerminated ||
    userProfile?.previousRole ||
    currentUser?.status === 'terminated' ||
    currentUser?.isTerminated ||
    currentUser?.previousRole
  )

  useEffect(() => {
    if (isFormerStaff) {
      setShowFormerStaffPopup(true)
    }
  }, [isFormerStaff])

  // Close dropdowns on outside click or route change
  useEffect(() => {
    setOpenGroup(null)
    setShowNotifications(false)
    setShowProfileMenu(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenGroup(null)
        setShowProfileMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Real notifications
  const realNotifications = useMemo(() => {
    const list = []
    myEnrollments.forEach(en => {
      list.push({
        id: `en-${en.id || en.courseId}`,
        title: 'Active Program Enrollment',
        desc: `You are enrolled in ${en.courseTitle || en.courseName || 'Technology Track'}.`,
        time: 'Active',
        link: '/user/my-courses'
      })
    })

    myCertificates.forEach(cert => {
      list.push({
        id: `cert-${cert.id || cert.certificate_id}`,
        title: 'Verified Document Ready',
        desc: `Certificate #${cert.certificate_id || 'ID'} is verified and ready to download.`,
        time: 'Verified',
        link: '/user/certificates'
      })
    })

    myOrders.forEach(ord => {
      list.push({
        id: `ord-${ord.id}`,
        title: `Order Status: ${ord.status?.toUpperCase() || 'COMPLETED'}`,
        desc: `Order for ${ord.project_title || 'Project'} (₹${ord.amount || 0}).`,
        time: ord.date || 'Recent',
        link: '/user/orders'
      })
    })

    if (list.length === 0) {
      list.push(
        {
          id: 'welcome-1',
          title: 'Welcome to Ashnexa Systems!',
          desc: 'Explore enrolled training tracks, verified offer letters, and custom project tools.',
          time: 'Just now',
          link: '/user/my-courses'
        },
        {
          id: 'welcome-2',
          title: 'Live Mentorship Desk',
          desc: 'Connect with technical instructors and submit queries in Support Chat.',
          time: '1h ago',
          link: '/user/support'
        }
      )
    }

    return list.map(n => ({
      ...n,
      read: readNotificationIds.includes(n.id)
    }))
  }, [myEnrollments, myCertificates, myOrders, readNotificationIds])

  const unreadCount = useMemo(() => {
    return realNotifications.filter(n => !n.read).length
  }, [realNotifications])

  const markAllAsRead = () => {
    const allIds = realNotifications.map(n => n.id)
    setReadNotificationIds(allIds)
    localStorage.setItem('ashnexa:read-notifications', JSON.stringify(allIds))
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      const nextRead = [...readNotificationIds, notification.id]
      setReadNotificationIds(nextRead)
      localStorage.setItem('ashnexa:read-notifications', JSON.stringify(nextRead))
    }
    setShowNotifications(false)
    if (notification.link) navigate(notification.link)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.toLowerCase()
    if (q.includes('course') || q.includes('learn')) navigate('/user/my-courses')
    else if (q.includes('cert') || q.includes('doc')) navigate('/user/certificates')
    else if (q.includes('project') || q.includes('build')) navigate('/user/custom-project')
    else if (q.includes('order')) navigate('/user/orders')
    else if (q.includes('receipt')) navigate('/user/receipts')
    else if (q.includes('support') || q.includes('chat')) navigate('/user/support')
    else navigate('/user/profile')
    setSearchQuery('')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const userName = userProfile?.displayName || currentUser?.displayName || 'Amit'
  const userEmail = currentUser?.email || 'student@Ashnexa Systems.com'
  const userAvatar = userProfile?.avatar || userProfile?.photoURL || currentUser?.avatar || currentUser?.photoURL || ''

  return (
    <div className={`min-h-screen flex flex-col font-['Outfit',sans-serif] transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white dark' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* ── TOP HORIZONTAL NAVIGATION BAR ── */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-xs'
      }`} ref={navRef}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Logo & Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/user" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <img src="/brand-logo.png" alt="Ashnexa Systems Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                    Ashnexa Systems
                  </h1>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Student Portal</span>
                </div>
              </Link>
            </div>

            {/* Middle: Dashboard Link & Grouped Dropdowns */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/user"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/user'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Dashboard
              </Link>

              {groupedUserNav.map((group) => {
                const isOpen = openGroup === group.label
                const isGroupActive = group.items.some(item => location.pathname.startsWith(item.path))

                return (
                  <div key={group.label} className="relative">
                    <button
                      onClick={() => setOpenGroup(isOpen ? null : group.label)}
                      onMouseEnter={() => setOpenGroup(group.label)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isGroupActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{group.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                    </button>

                    {/* Floating Dropdown Panel */}
                    {isOpen && (
                      <div
                        onMouseLeave={() => setOpenGroup(null)}
                        className={`absolute left-0 mt-1 w-56 border rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
                        </div>
                        <div className="space-y-0.5 px-1.5">
                          {group.items.map((item) => {
                            const IconComp = item.icon
                            const isItemActive = location.pathname.startsWith(item.path)

                            return (
                              <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setOpenGroup(null)}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                  isItemActive
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                                }`}
                              >
                                <IconComp className={`w-4 h-4 ${isItemActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Right: Search, Notifications & Profile */}
            <div className="flex items-center gap-3">
              
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search portal..."
                  className={`w-40 lg:w-52 pl-8 pr-3 py-1.5 border rounded-xl text-xs font-medium focus:outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                  }`}
                />
              </form>

              {/* View Site Link */}
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>View Site</span>
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {realNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            n.read 
                              ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800' 
                              : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-500/30'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[9px] font-normal text-slate-400">{n.time}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                    {userAvatar ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" /> : userName.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-52 border rounded-2xl shadow-xl z-50 py-2 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <Link href="/user/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className={`lg:hidden fixed inset-0 z-50 flex flex-col animate-in fade-in duration-200 ${
          isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
        }`}>
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <img src="/brand-logo.png" alt="Ashnexa Systems Logo" className="w-8 h-8 object-contain shrink-0" />
              <span className="font-bold text-sm">Student Navigation</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-600 dark:text-slate-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Link
              href="/user"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </Link>

            {groupedUserNav.map((group) => (
              <div key={group.label} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const IconComp = item.icon
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"
                      >
                        <IconComp className="w-4 h-4 text-blue-600" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN DASHBOARD CONTENT (FULL WIDTH) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 overflow-y-auto">
        {children}
      </main>

      {/* Former Staff Reinstatement Full Screen Popup Modal */}
      <FormerStaffModal
        isOpen={showFormerStaffPopup}
        onClose={() => setShowFormerStaffPopup(false)}
      />

    </div>
  )
}
