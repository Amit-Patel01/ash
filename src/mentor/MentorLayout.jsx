'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  Megaphone,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  Bell,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../store/StoreContext'
import { getRoleDisplayLabel } from '../utils/roles'
import brandLogo from '../assets/brand-logo.png'

export default function MentorLayout({ children }) {
  const pathname = usePathname() || '/mentor'
  const router = useRouter()
  const { currentUser, userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const { courses, users } = useStore()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Redirect if not mentor/admin
  useEffect(() => {
    if (currentUser) {
      const role = String(currentUser.role || userProfile?.role || '').toLowerCase()
      if (role !== 'mentor' && role !== 'admin' && role !== 'superadmin') {
        router.replace('/user')
      }
    }
  }, [currentUser, userProfile, router])

  const navItems = [
    {
      name: 'Overview',
      path: '/mentor',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'My Courses & Batches',
      path: '/mentor/courses',
      icon: BookOpen,
      badge: null
    },
    {
      name: 'Assigned Students',
      path: '/mentor/students',
      icon: Users,
      badge: null
    },
    {
      name: 'Assignment Reviews',
      path: '/mentor/assignments',
      icon: FileText,
      badge: 'Review'
    },
    {
      name: 'Doubt Resolution',
      path: '/mentor/doubts',
      icon: MessageSquare,
      badge: 'Q&A'
    },
    {
      name: 'Batch Broadcast',
      path: '/mentor/broadcast',
      icon: Megaphone,
      badge: 'Live'
    },
    {
      name: 'Mentor Profile',
      path: '/mentor/profile',
      icon: User,
      badge: null
    }
  ]

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Mentor'
  const userEmail = currentUser?.email || ''
  const avatarUrl = userProfile?.photoURL || currentUser?.photoURL

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className={`hidden lg:flex flex-col w-72 border-r flex-shrink-0 sticky top-0 h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 group-hover:scale-105 transition-all">
              <img
                src={brandLogo?.src || brandLogo}
                alt="Amit Solution Hub Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-none text-slate-900 dark:text-white">
                Amit Solution Hub
              </div>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                <GraduationCap className="w-3 h-3" />
                <span>Mentor Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Mentor Mini Profile Banner */}
        <div className="p-4 mx-3 my-3 rounded-2xl border bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-indigo-950/30 dark:to-purple-950/20 border-indigo-200/60 dark:border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black truncate text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/mentor' && pathname.startsWith(item.path))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Sticky Header */}
        <header className={`h-16 border-b sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 backdrop-blur-xl transition-colors duration-300 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/80 shadow-xs'
        }`}>
          
          {/* Mobile hamburger & title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Amit Solution Hub</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Faculty & Mentorship Space</span>
            </div>
          </div>

          {/* Right quick actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span>View Main Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={toggleTheme}
              className={`lg:hidden p-2 rounded-xl border transition-colors ${
                isDark ? 'border-slate-800 text-amber-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/mentor/profile"
              className="flex items-center gap-2 p-1 rounded-full border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 transition-all"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>

        </header>

        {/* Mobile Slide-Over Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed top-0 bottom-0 left-0 w-80 z-50 p-6 flex flex-col justify-between border-r shadow-2xl lg:hidden ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <img src={brandLogo?.src || brandLogo} alt="Logo" className="h-8 w-auto" />
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">Amit Solution Hub</div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Mentor Portal</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="mt-6 space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.path
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-red-50 dark:bg-red-950/50 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  )
}
