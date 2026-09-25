'use client'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import brandLogo from '../assets/brand-logo.png'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../store/StoreContext'

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
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false)
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false)

  // Pull course categories for Programs sub-menu
  const { courses, courseCategories } = useStore()
  const published = courses.filter(c => c.published !== false)
  const domainLinks = [...new Set(published.map(c => c.category).filter(Boolean))]
    .slice(0, 6) // max 6 domains in dropdown

  const isCompanyActive = location.pathname === '/about' || location.pathname === '/infrastructure' || location.pathname === '/contact'
  const isWhyUsActive = location.pathname.startsWith('/services') || location.hash === '#why-choose-us'
  const isProgramsActive = location.pathname.startsWith('/programs') || location.pathname.startsWith('/courses')

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
  ]

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } },
  }

  // Theme toggle component moved outside to prevent re-renders

  return (
    <nav className={`fixed left-0 right-0 top-0 z-[140] border-b transition-all duration-300 ${
      isDark
        ? `border-white/10 ${scrolled ? 'bg-slate-950/60 backdrop-blur-xl shadow-xl shadow-black/50' : 'bg-transparent backdrop-blur-md'}`
        : `border-slate-200/50 ${scrolled ? 'bg-white/30 backdrop-blur-xl shadow-md shadow-slate-900/5' : 'bg-transparent backdrop-blur-sm'}`
    }`}>
      {/* Animated Glow */}
      <div className={`absolute -inset-x-0 bottom-[-20px] h-20 blur-2xl opacity-25 pointer-events-none animate-pulse ${isDark ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/10' : 'bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/10'}`} style={{ animationDuration: '4s' }} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className={`
          relative flex min-w-0 justify-between items-center transition-all duration-300
          ${scrolled ? 'h-14 sm:h-16 lg:h-20' : 'h-16 sm:h-20 lg:h-24'}
        `}>

          {/* Left: Logo + Nav Links */}
          <div className="flex min-w-0 items-center gap-3 lg:gap-5 xl:gap-10 h-full">
            <Link to="/" className="relative z-10 flex min-w-0 items-center gap-2 sm:gap-3 group flex-shrink-0 outline-none">
              <div className="relative overflow-hidden rounded-xl px-1.5 sm:px-2 py-1 transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1">
                {/* Radial Glow on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none ${isDark ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/15'}`} />

                <img
                  src={brandLogo}
                  alt="Ashnexa Systems Logo"
                  className="relative z-10 h-7 sm:h-9 lg:h-10 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
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

              {/* Full Brand Name Text */}
              <div className="flex flex-col min-w-0">
                <span className={`text-sm sm:text-base lg:text-lg font-black tracking-tight leading-none whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Amit <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Solution Hub</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                  Tech & Learning
                </span>
              </div>
            </Link>

            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes logo-shine {
                0% { left: -150%; }
                25% { left: 150%; }
                100% { left: 150%; }
              }
              @keyframes navGradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .nav-active-pill {
                background-size: 200% 200%;
                animation: navGradientShift 3s ease infinite;
              }
            `}} />

            {/* Desktop Links */}
            <div className="hidden 2xl:flex items-center gap-1.5 py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 flex items-center rounded-xl text-sm xl:text-[15px] font-bold transition-all duration-300 group outline-none ${
                      isActive
                        ? isDark ? 'text-white nav-active-pill bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-md shadow-indigo-500/20' : 'text-white nav-active-pill bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-md shadow-blue-500/20'
                        : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                )
              })}

              {/* Projects Link */}
              <Link
                to="/projects"
                className={`relative px-4 py-2 flex items-center rounded-xl text-sm xl:text-[15px] font-bold transition-all duration-300 group outline-none ${
                  location.pathname === '/projects'
                    ? isDark ? 'text-white nav-active-pill bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-md shadow-indigo-500/20' : 'text-white nav-active-pill bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-md shadow-blue-500/20'
                    : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100/60'
                }`}
              >
                <span className="relative z-10">Project</span>
              </Link>

              {/* Programs Dropdown */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setProgramsDropdownOpen(true)}
                onMouseLeave={() => setProgramsDropdownOpen(false)}
              >
                <button
                  className={`relative px-4 py-2 flex items-center gap-1.5 rounded-xl text-sm xl:text-[15px] font-bold transition-all duration-300 outline-none ${
                    isProgramsActive
                      ? isDark ? 'text-white nav-active-pill bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-md shadow-indigo-500/20' : 'text-white nav-active-pill bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-md shadow-blue-500/20'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100/60'
                  }`}
                >
                  <span className="relative z-10">Programs</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${programsDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Programs Dropdown Panel */}
                <AnimatePresence>
                  {programsDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`absolute left-0 top-[100%] mt-1 w-64 rounded-2xl border shadow-2xl origin-top-left ${
                        isDark
                          ? 'bg-slate-950/95 border-white/10 text-slate-200 backdrop-blur-2xl'
                          : 'bg-white/95 border-slate-100 text-slate-800 backdrop-blur-2xl shadow-slate-300/40'
                      }`}
                    >
                      <div className="p-2">
                        {/* All Programs link */}
                        <Link
                          to="/programs"
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-black rounded-xl transition-all duration-200 ${
                            location.pathname === '/programs'
                              ? isDark ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/20 text-indigo-300' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                              : isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-50 hover:text-blue-600'
                          }`}
                        >
                          <span className="text-base">🎓</span>
                          All Programs
                        </Link>

                        {domainLinks.length > 0 && (
                          <>
                            <div className={`my-1.5 h-px mx-3 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                            <p className={`px-4 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Domains</p>
                            {domainLinks.map(domain => (
                              <Link
                                key={domain}
                                to={`/courses?domain=${encodeURIComponent(domain)}`}
                                className={`block px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 truncate ${
                                  location.search === `?domain=${encodeURIComponent(domain)}` && location.pathname === '/courses'
                                    ? isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-700'
                                    : isDark ? 'hover:bg-white/5 hover:text-white text-slate-400' : 'hover:bg-slate-50 hover:text-blue-600 text-slate-600'
                                }`}
                              >
                                {domain}
                              </Link>
                            ))}
                            <div className={`my-1.5 h-px mx-3 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                            <Link
                              to="/courses"
                              className={`block px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                isDark ? 'hover:bg-white/5 hover:text-white text-slate-400' : 'hover:bg-slate-50 hover:text-blue-600 text-slate-500'
                              }`}
                            >
                              View All Courses →
                            </Link>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Why Us Dropdown */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setWhyUsDropdownOpen(true)}
                onMouseLeave={() => setWhyUsDropdownOpen(false)}
              >
                <button
                  className={`relative px-4 py-2 flex items-center gap-1.5 rounded-xl text-sm xl:text-[15px] font-bold transition-all duration-300 outline-none ${
                    isWhyUsActive
                      ? isDark ? 'text-white nav-active-pill bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-md shadow-indigo-500/20' : 'text-white nav-active-pill bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-md shadow-blue-500/20'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100/60'
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
                </button>

                {/* Floating Dropdown Card */}
                <AnimatePresence>
                  {whyUsDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`absolute left-0 top-[100%] mt-1 w-52 rounded-2xl border shadow-2xl origin-top-left ${
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Company Dropdown */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setCompanyDropdownOpen(true)}
                onMouseLeave={() => setCompanyDropdownOpen(false)}
              >
                <button
                  className={`relative px-4 py-2 flex items-center gap-1.5 rounded-xl text-sm xl:text-[15px] font-bold transition-all duration-300 outline-none ${
                    isCompanyActive
                      ? isDark ? 'text-white nav-active-pill bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-md shadow-indigo-500/20' : 'text-white nav-active-pill bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 shadow-md shadow-blue-500/20'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100/60'
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
                </button>

                {/* Floating Dropdown Card */}
                <AnimatePresence>
                  {companyDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`absolute left-0 top-[100%] mt-1 w-52 rounded-2xl border shadow-2xl origin-top-left ${
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right: Theme + Auth + Chat */}
          <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 h-full">

            {/* Desktop */}
            <div className="hidden 2xl:flex items-center gap-1.5 xl:gap-2">
              {currentUser ? (
                <div className={`flex items-center gap-2 p-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                  <Link
                    to={getHomePathForRole(currentUser?.role)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:shadow-indigo-500/30"
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
                    className="relative group overflow-hidden px-3.5 lg:px-4 xl:px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
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
            <div className="2xl:hidden flex shrink-0 items-center gap-1.5 sm:gap-2">
              {currentUser && (
                <Link
                  to={getHomePathForRole(currentUser?.role)}
                  title="Dashboard"
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border overflow-hidden shadow-sm active:scale-95 transition-transform shrink-0 ${
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
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isOpen}
                className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 active:scale-95 outline-none ${
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
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.95, y: -10 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.95, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="2xl:hidden absolute top-full left-2 right-2 sm:left-4 sm:right-4 mt-2 max-h-[calc(100vh-4.5rem)] sm:max-h-[82vh] overflow-y-auto overscroll-contain origin-top custom-scrollbar z-50 rounded-3xl"
            >
              <div className={`border shadow-2xl rounded-3xl p-4 flex flex-col gap-2 relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

                {/* subtle color wash */}
                <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${isDark ? 'bg-indigo-600' : 'bg-blue-300'}`} />
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`relative block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
                        isActive
                          ? isDark ? 'text-white bg-gradient-to-r from-indigo-500/25 to-purple-500/20' : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm'
                          : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {isActive && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`} />}
                        {link.name}
                      </span>
                    </Link>
                  )
                })}

                {/* Mobile Programs Dropdown Accordion */}
                <div className="flex flex-col">
                  <button
                    onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
                    className={`flex items-center justify-between px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 outline-none ${
                      isProgramsActive
                        ? isDark ? 'text-indigo-400 bg-indigo-500/5' : 'text-blue-700 bg-blue-50/50'
                        : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {isProgramsActive && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />}
                      Programs
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${mobileProgramsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileProgramsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pl-4"
                      >
                        <Link
                          to="/programs"
                          onClick={() => setIsOpen(false)}
                          className={`block px-6 py-3 text-sm font-black rounded-xl transition-all duration-200 ${
                            location.pathname === '/programs'
                              ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
                          }`}
                        >
                          🎓 All Programs
                        </Link>
                        {domainLinks.map(domain => (
                          <Link
                            key={domain}
                            to={`/courses?domain=${encodeURIComponent(domain)}`}
                            onClick={() => setIsOpen(false)}
                            className={`block px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 mt-0.5 truncate ${
                              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
                            }`}
                          >
                            {domain}
                          </Link>
                        ))}
                        <Link
                          to="/courses"
                          onClick={() => setIsOpen(false)}
                          className={`block px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 mt-0.5 ${
                            isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-blue-600'
                          }`}
                        >
                          View All Courses →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Why Us Dropdown Accordion */}
                <div className="flex flex-col">
                  <button
                    onClick={() => setMobileWhyUsOpen(!mobileWhyUsOpen)}
                    className={`flex items-center justify-between px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 outline-none ${
                      isWhyUsActive
                        ? isDark ? 'text-indigo-400 bg-indigo-500/5' : 'text-blue-700 bg-blue-50/50'
                        : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
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

                  <AnimatePresence initial={false}>
                    {mobileWhyUsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pl-4"
                      >
                        <Link
                          to="/services"
                          onClick={() => setIsOpen(false)}
                          className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                            location.pathname === '/services'
                              ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
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
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
                          }`}
                        >
                          Custom Build
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Projects Link */}
                <Link
                  to="/projects"
                  onClick={() => setIsOpen(false)}
                  className={`relative block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
                    location.pathname === '/projects'
                      ? isDark ? 'text-white bg-gradient-to-r from-indigo-500/25 to-purple-500/20' : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm'
                      : isDark ? 'text-slate-300 hover:text-indigo-300 hover:bg-white/5' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {location.pathname === '/projects' && <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`} />}
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
                        : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
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

                  <AnimatePresence initial={false}>
                    {mobileCompanyOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pl-4"
                      >
                        <Link
                          to="/about"
                          onClick={() => setIsOpen(false)}
                          className={`block px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                            location.pathname === '/about'
                              ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-700 bg-blue-50'
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
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
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
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
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
                          }`}
                        >
                          Contact Us
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={`h-px w-full my-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200/50'}`} />

                {/* Mobile Auth */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {currentUser ? (
                    <>
                      <Link
                        to={getHomePathForRole(currentUser?.role)}
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
                        className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md transition-all duration-300 active:scale-95"
                      >
                        Join Us
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/chat"
                  onClick={() => setIsOpen(false)}
                  className="relative group w-full outline-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
                >
                  Chat with Us
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
