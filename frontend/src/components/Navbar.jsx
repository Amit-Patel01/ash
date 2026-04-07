import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/brand-logo.png'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

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
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contact', path: '/contact' },
  ]


  const isTradingPage = location.pathname === '/services/trading-mentorship'

  return (
    <nav className={`fixed left-0 right-0 z-[140] transition-all duration-500 ease-in-out ${isTradingPage ? 'top-9' : 'top-0'
      } ${scrolled
        ? 'py-2 lg:py-3'
        : 'py-4 lg:py-6'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Floating Glass Container with Blue Glow Animation */}
        <div className={`
          relative flex justify-between items-center px-4 md:px-8 lg:px-12 rounded-full 
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border border-white/20
          ${scrolled
            ? 'h-16 lg:h-20 bg-white/10 backdrop-blur-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] scale-100 mt-2'
            : 'h-20 lg:h-24 bg-white/5 backdrop-blur-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] scale-[1.01]'
          }
        `}>
          {/* Animated Light Blue Glow Background - Brought down slightly */}
          <div className="absolute top-[2px] -inset-x-2 bottom-[-10px] bg-gradient-to-r from-blue-400/20 via-cyan-300/15 to-blue-500/20 rounded-full blur-3xl opacity-50 animate-[bluePulse_8s_infinite] pointer-events-none"></div>


          {/* Glass Reflection Highlight */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-white/30 to-transparent skew-x-[45deg] -translate-y-full animate-[reflection_10s_infinite]"></div>
          </div>

          {/* Brand Logo & Alignment Container */}
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

            {/* Desktop Links - Perfectly Aligned */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 h-full py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-5 h-full flex items-center rounded-full text-sm lg:text-[15px] font-bold transition-all duration-300 group outline-none overflow-hidden ${isActive
                      ? 'text-blue-700 bg-white/90 shadow-md'
                      : 'text-slate-800 hover:text-blue-600'
                      }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 h-full">

            {/* Desktop Login / Dashboard - Hidden on Mobile */}
            <div className="hidden lg:flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-black/5 p-1 rounded-full border border-black/5">
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'customer' ? '/customer' : '/employee'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-black hover:bg-slate-900 shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-red-600 hover:bg-red-50 transition-all group active:scale-95"
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
                    to="/employee-login"
                    className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-800 hover:text-blue-600 hover:bg-white/80 transition-all duration-300"
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

              {/* Help Button - Modern Style */}
              <Link
                to="/chat"
                className="hidden sm:flex relative items-center gap-2 bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 px-6 py-2.5 rounded-full font-bold text-sm lg:text-[15px] hover:bg-white transition-all duration-300 shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Chat
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-lg border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all duration-300 active:scale-95 outline-none"
              >
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                  <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : ''}`}></span>
                  <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={`lg:hidden absolute top-full left-4 right-4 mt-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${isOpen ? 'opacity-100 scale-y-100 max-h-[800px]' : 'opacity-0 scale-y-95 max-h-0 pointer-events-none'}`}>
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-4 flex flex-col gap-2 relative overflow-hidden">


            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden group ${isActive
                    ? 'text-blue-700 bg-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isActive && <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                    {link.name}
                  </span>
                </Link>
              );
            })}

            <div className="h-px w-full bg-slate-200/50 my-2"></div>

            {/* Mobile Auth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {currentUser ? (
                <>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'customer' ? '/customer' : '/employee'}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 transition-all duration-300 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" />
                    </svg>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false) }}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-red-600 bg-red-50 border border-red-200/50 transition-all duration-300 active:scale-95"
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
                    to="/employee-login"
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-slate-600 bg-white/80 border border-white/60 shadow-sm transition-all duration-300 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Login
                  </Link>
                  <Link
                    to="/join-us"
                    onClick={() => setIsOpen(false)}
                    className="relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-900/10 transition-all duration-300 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-10 transition-opacity"></div>
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
              className="relative group w-full outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl flex items-center justify-center gap-2">
                Chat with Us
                <svg className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
