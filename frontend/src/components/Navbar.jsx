import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/brand-logo.png'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

/* ── Theme Toggle Component ── */
const ThemeToggle = ({ mobile = false, isDark, toggleTheme }) => (
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false)
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false)
  const [whyUsDropdownOpen, setWhyUsDropdownOpen] = useState(false)
  const [mobileWhyUsOpen, setMobileWhyUsOpen] = useState(false)

  const isCompanyActive = location.pathname === '/about' || location.pathname === '/infrastructure' || location.pathname === '/contact'
  const isWhyUsActive = location.pathname.startsWith('/services') || location.hash === '#why-choose-us'

  const avatarUrl = userProfile?.avatar || userProfile?.photoURL || currentUser?.photoURL || currentUser?.avatar || ''
  const userDisplayName = userProfile?.displayName || currentUser?.displayName || 'User'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home',     path: '/' },
    { name: 'Courses',  path: '/courses' },
  ]

  // Theme toggle component moved outside to prevent re-renders

  return (
    <nav className={`fixed left-0 right-0 top-0 z-[140] border-b transition-all duration-300 ${
      isDark
        ? `border-white/10 ${scrolled ? 'bg-slate-900/80 backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]' : 'bg-slate-900/60 backdrop-blur-xl'}`
        : `border-slate-200/80 ${scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]' : 'bg-white/50 backdrop-blur-xl'}`
    }`}>
      {/* Animated Glow */}
      <div className={`absolute -inset-x-0 bottom-[-20px] h-20 blur-3xl opacity-35 pointer-events-none ${isDark ? 'bg-gradient-to-b from-indigo-500/10 to-transparent' : 'bg-gradient-to-b from-blue-400/10 to-transparent'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`
          relative flex justify-between items-center transition-all duration-300
          ${scrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-24'}
        `}>

          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-3 lg:gap-5 xl:gap-10 h-full">
            <Link to="/" className="relative z-10 flex items-center group flex-shrink-0 outline-none">
              <div className="relative overflow-hidden rounded-xl px-3 py-1.5 transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1">
                {/* Radial Glow on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none ${isDark ? 'bg-indigo-500/20' : 'bg-blue-500/15'}`} />

                <img
                  src={brandLogo}
                  alt="Brand Logo"
                  className="relative z-10 h-10 lg:h-12 w-auto object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
                />

                {/* Shine Sweep Beam */}
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div 
                    className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg]" 
                    style={{
                      animation: 'logo-shine 4s infinite ease-in-out',
                    }}
                  />
                </div>
              </div>
            </Link>

            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes logo-shine {
                0% { left: -150%; }
                25% { left: 150%; }
                100% { left: 150%; }
              }
            `}} />

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 h-full py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-2.5 lg:px-3 xl:px-5 h-full flex items-center rounded-full text-sm xl:text-[15px] font-bold transition-all duration-300 group outline-none overflow-hidden ${
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

              {/* Projects Link */}
              <Link
                to="/projects"
                className={`relative px-2.5 lg:px-3 xl:px-5 h-full flex items-center rounded-full text-sm xl:text-[15px] font-bold transition-all duration-300 group outline-none overflow-hidden ${
                  location.pathname === '/projects'
                    ? isDark ? 'text-indigo-300 bg-indigo-500/15 shadow-md' : 'text-blue-700 bg-white/90 shadow-md'
                    : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-white/20'
                }`}
              >
                <span className="relative z-10">Project Selling</span>
                {location.pathname === '/projects' && (
                  <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] ${isDark ? 'bg-indigo-400' : 'bg-blue-600'}`} />
                )}
              </Link>

              {/* Why Us Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setWhyUsDropdownOpen(true)}
                onMouseLeave={() => setWhyUsDropdownOpen(false)}
              >
                <button
                  className={`relative px-2.5 lg:px-3 xl:px-5 h-12 flex items-center gap-1.5 rounded-full text-sm xl:text-[15px] font-bold transition-all duration-300 outline-none ${
                    isWhyUsActive
                      ? isDark ? 'text-indigo-300 bg-indigo-500/15' : 'text-blue-700 bg-white/95 shadow-md'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-white/20'
                  }`}
                >
                  <span className="relative z-10">Why Us</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${whyUsDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {isWhyUsActive && (
                    <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] ${isDark ? 'bg-indigo-400' : 'bg-blue-600'}`} />
                  )}
                </button>

                {/* Floating Dropdown Card */}
                <div
                  className={`absolute left-0 top-[85%] mt-1 w-52 rounded-2xl border shadow-2xl transition-all duration-300 origin-top-left ${
                    whyUsDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible'
                      : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                  } ${
                    isDark
                      ? 'bg-slate-950/95 border-white/10 text-slate-200 backdrop-blur-2xl'
                      : 'bg-white/95 border-slate-100 text-slate-800 backdrop-blur-2xl shadow-slate-300/40'
                  }`}
                >
                  <div className="p-2 space-y-1">
                    <Link
                      to="/services"
                      className={`block px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        location.pathname === '/services'
                          ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      Our Services
                    </Link>
                    <Link
                      to="/custom-project"
                      className={`block px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        location.pathname === '/custom-project'
                          ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      Custom Build
                    </Link>
                  </div>
                </div>
              </div>

              {/* Company Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setCompanyDropdownOpen(true)}
                onMouseLeave={() => setCompanyDropdownOpen(false)}
              >
                <button
                  className={`relative px-2.5 lg:px-3 xl:px-5 h-12 flex items-center gap-1.5 rounded-full text-sm xl:text-[15px] font-bold transition-all duration-300 outline-none ${
                    isCompanyActive
                      ? isDark ? 'text-indigo-300 bg-indigo-500/15' : 'text-blue-700 bg-white/95 shadow-md'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-white/20'
                  }`}
                >
                  <span className="relative z-10">Company</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${companyDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {isCompanyActive && (
                    <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] ${isDark ? 'bg-indigo-400' : 'bg-blue-600'}`} />
                  )}
                </button>

                {/* Floating Dropdown Card */}
                <div
                  className={`absolute left-0 top-[85%] mt-1 w-52 rounded-2xl border shadow-2xl transition-all duration-300 origin-top-left ${
                    companyDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible'
                      : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                  } ${
                    isDark
                      ? 'bg-slate-950/95 border-white/10 text-slate-200 backdrop-blur-2xl'
                      : 'bg-white/95 border-slate-100 text-slate-800 backdrop-blur-2xl shadow-slate-300/40'
                  }`}
                >
                  <div className="p-2 space-y-1">
                    <Link
                      to="/about"
                      className={`block px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        location.pathname === '/about'
                          ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      About Us
                    </Link>
                    <Link
                      to="/infrastructure"
                      className={`block px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        location.pathname === '/infrastructure'
                          ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      Our Infrastructure
                    </Link>
                    <Link
                      to="/contact"
                      className={`block px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        location.pathname === '/contact'
                          ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Theme + Auth + Chat */}
          <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 h-full">

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              {currentUser ? (
                <div className={`flex items-center gap-2 p-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'student' ? '/user' : '/employee'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-black hover:bg-slate-900'}`}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={userDisplayName} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-slate-400 bg-slate-200 dark:bg-slate-800 dark:text-slate-500 p-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all group active:scale-95 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                    title="Logout"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className={`flex items-center p-1 rounded-full border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                  <Link
                    to="/login"
                    className={`px-3.5 lg:px-4 xl:px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/join-us"
                    className="relative group overflow-hidden px-3.5 lg:px-4 xl:px-5 py-2 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Join Us
                  </Link>
                </div>
              )}

              {/* Chat Button */}
              <Link
                to="/chat"
                className={`hidden xl:flex relative items-center gap-2 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-sm lg:text-[15px] hover:-translate-y-0.5 transition-all duration-300 shadow-md border ${
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
              {currentUser && (
                <Link
                  to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'student' ? '/user' : '/employee'}
                  title="Dashboard"
                  className={`w-10 h-10 flex items-center justify-center rounded-full border overflow-hidden shadow-sm active:scale-95 transition-transform shrink-0 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-slate-400 bg-slate-200 dark:bg-slate-800 dark:text-slate-500 p-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </Link>
              )}

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
                  onClick={() => setIsOpen(false)}
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

            {/* Mobile Why Us Dropdown Accordion */}
            <div className="flex flex-col">
              <button
                onClick={() => setMobileWhyUsOpen(!mobileWhyUsOpen)}
                className={`flex items-center justify-between px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 outline-none ${
                  isWhyUsActive
                    ? isDark ? 'text-indigo-400 bg-indigo-500/5' : 'text-blue-700 bg-blue-50/50'
                    : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  {isWhyUsActive && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />}
                  Why Us
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${mobileWhyUsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${mobileWhyUsOpen ? 'max-h-40 opacity-100 mt-1 pl-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <Link
                  to="/services"
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                    location.pathname === '/services'
                      ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-blue-600'
                  }`}
                >
                  Our Services
                </Link>
                <Link
                  to="/custom-project"
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 mt-1 ${
                    location.pathname === '/custom-project'
                      ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-blue-600'
                  }`}
                >
                  Custom Build
                </Link>
              </div>
            </div>

            {/* Mobile Projects Link */}
            <Link
              to="/projects"
              onClick={() => setIsOpen(false)}
              className={`relative block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
                location.pathname === '/projects'
                  ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50 shadow-sm'
                  : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-650 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <span className="relative z-10 flex items-center gap-3">
                {location.pathname === '/projects' && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />}
                Source Codes
              </span>
            </Link>

            {/* Mobile Company Dropdown */}
            <div className="flex flex-col">
              <button
                onClick={() => setMobileCompanyOpen(!mobileCompanyOpen)}
                className={`flex items-center justify-between px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 outline-none ${
                  isCompanyActive
                    ? isDark ? 'text-indigo-400 bg-indigo-500/5' : 'text-blue-700 bg-blue-50/50'
                    : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  {isCompanyActive && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />}
                  Company
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${mobileCompanyOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${mobileCompanyOpen ? 'max-h-60 opacity-100 mt-1 pl-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                    location.pathname === '/about'
                      ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-blue-600'
                  }`}
                >
                  About Us
                </Link>
                <Link
                  to="/infrastructure"
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 mt-1 ${
                    location.pathname === '/infrastructure'
                      ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-blue-600'
                  }`}
                >
                  Our Infrastructure
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 mt-1 ${
                    location.pathname === '/contact'
                      ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-blue-600'
                  }`}
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className={`h-px w-full my-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200/50'}`} />

            {/* Mobile Auth */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {currentUser ? (
                <>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'student' ? '/user' : '/employee'}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 transition-all duration-300 active:scale-95 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={userDisplayName} className="w-full h-full object-cover" />
                      ) : (
                        userDisplayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false) }}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-red-600 bg-red-50 border border-red-200/50 transition-all duration-300 active:scale-95 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <div className={`col-span-2 flex items-center p-1 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/join-us"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md transition-all duration-300 active:scale-95"
                  >
                    Join Us
                  </Link>
                </div>
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
