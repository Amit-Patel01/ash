import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/brand-logo.png'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollYRef = useRef(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  useEffect(() => {
    setIsOpen(false)
    setIsHidden(false)
    lastScrollYRef.current = window.scrollY
  }, [location])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollYRef.current
      const shouldHideNavbar = scrollingDown && currentScrollY > 120 && !isOpen
      setScrolled(currentScrollY > 20)
      setIsHidden(currentScrollY <= 20 ? false : shouldHideNavbar)
      lastScrollYRef.current = currentScrollY
    }
    lastScrollYRef.current = window.scrollY
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  const navLinks = [
    { name: 'Home',     path: '/' },
    { name: 'About',    path: '/about' },
    { name: 'Courses',  path: '/courses' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contact',  path: '/contact' },
  ]

  /* ── Theme Toggle Button ── */
  const ThemeToggle = ({ mobile = false }) => (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      className={`
        relative flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 outline-none
        ${mobile
          ? 'w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          : `w-10 h-10 border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white/90 border-slate-200 hover:bg-slate-50'} shadow-sm`
        }
      `}
    >
      {isDark ? (
        /* Sun icon */
        <svg className="w-4.5 h-4.5 text-amber-400" style={{width:18,height:18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        /* Moon icon */
        <svg className="w-4.5 h-4.5 text-slate-600" style={{width:18,height:18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )

  return (
    <nav className={`fixed left-0 right-0 z-[140] transform-gpu transition-all duration-500 ease-in-out top-0 ${isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} ${scrolled ? 'py-2 lg:py-3' : 'py-4 lg:py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Floating Glass Container ── */}
        <div className={`
          relative flex justify-between items-center px-4 md:px-8 lg:px-12 rounded-full
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isDark
            ? `border border-white/10 ${scrolled ? 'h-16 lg:h-20 bg-slate-900/80 backdrop-blur-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7)] scale-100 mt-2' : 'h-20 lg:h-24 bg-slate-900/60 backdrop-blur-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] scale-[1.01]'}`
            : `border border-white/20 ${scrolled ? 'h-16 lg:h-20 bg-white/10 backdrop-blur-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] scale-100 mt-2' : 'h-20 lg:h-24 bg-white/5 backdrop-blur-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] scale-[1.01]'}`
          }
        `}>
          {/* Animated Glow */}
          <div className={`absolute top-[2px] -inset-x-2 bottom-[-10px] rounded-full blur-3xl opacity-50 animate-[bluePulse_8s_infinite] pointer-events-none ${isDark ? 'bg-gradient-to-r from-indigo-500/15 via-blue-400/10 to-indigo-500/15' : 'bg-gradient-to-r from-blue-400/20 via-cyan-300/15 to-blue-500/20'}`} />

          {/* Glass Highlight */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-white/30 to-transparent skew-x-[45deg] -translate-y-full animate-[reflection_10s_infinite]" />
          </div>

          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-6 lg:gap-10 h-full">
            <Link to="/" className="relative z-10 flex items-center group flex-shrink-0 outline-none">
              <div className="relative transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1">
                <img
                  src={brandLogo}
                  alt="Brand Logo"
                  className="h-10 lg:h-12 w-auto object-contain filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.2)]"
                />
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 h-full py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-5 h-full flex items-center rounded-full text-sm lg:text-[15px] font-bold transition-all duration-300 group outline-none overflow-hidden ${
                      isActive
                        ? isDark ? 'text-indigo-300 bg-indigo-500/15 shadow-md' : 'text-blue-700 bg-white/90 shadow-md'
                        : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-white/20'
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] ${isDark ? 'bg-indigo-400' : 'bg-blue-600'}`} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right: Theme + Auth + Chat */}
          <div className="flex items-center gap-2 lg:gap-3 h-full">

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <ThemeToggle />

              {currentUser ? (
                <div className={`flex items-center gap-2 p-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'customer' ? '/customer' : '/employee'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-black hover:bg-slate-900'}`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all group active:scale-95 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                    title="Logout"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 lg:gap-3">
                  <Link
                    to="/login"
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-white/80'}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/join-us"
                    className="relative group overflow-hidden px-7 py-2.5 rounded-full text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Join Us
                  </Link>
                </div>
              )}

              {/* Chat Button */}
              <Link
                to="/chat"
                className={`hidden sm:flex relative items-center gap-2 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-sm lg:text-[15px] hover:-translate-y-0.5 transition-all duration-300 shadow-md border ${
                  isDark
                    ? 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700'
                    : 'bg-white/90 text-slate-900 border-slate-200 hover:bg-white'
                }`}
              >
                <svg className="w-5 h-5 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Chat
              </Link>
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle mobile />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg border transition-all duration-300 active:scale-95 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div className={`lg:hidden absolute top-full left-4 right-4 mt-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${isOpen ? 'opacity-100 scale-y-100 max-h-[800px]' : 'opacity-0 scale-y-95 max-h-0 pointer-events-none'}`}>
          <div className={`border shadow-2xl rounded-3xl p-4 flex flex-col gap-2 relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive
                      ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50 shadow-sm'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isActive && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />}
                    {link.name}
                  </span>
                </Link>
              )
            })}

            <div className={`h-px w-full my-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200/50'}`} />

            {/* Mobile Auth */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {currentUser ? (
                <>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'customer' ? '/customer' : '/employee'}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 transition-all duration-300 active:scale-95 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false) }}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-red-600 bg-red-50 border border-red-200/50 transition-all duration-300 active:scale-95 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold border transition-all duration-300 active:scale-95 ${isDark ? 'text-slate-300 bg-white/5 border-white/10' : 'text-slate-600 bg-white/80 border-white/60 shadow-sm'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Login
                  </Link>
                  <Link
                    to="/join-us"
                    onClick={() => setIsOpen(false)}
                    className="relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all duration-300 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    Join Us
                  </Link>
                </>
              )}
            </div>

            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className={`relative group w-full outline-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg ${isDark ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'}`}
            >
              Chat with Us
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
