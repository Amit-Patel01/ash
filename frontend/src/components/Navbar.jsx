import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import brandLogo from '../assets/brand logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

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
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
<nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
  scrolled 
    ? 'bg-white/60 backdrop-blur-3xl border-b border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.08)]' 
    : 'bg-white/40 backdrop-blur-xl border-b border-white/20'
}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center group flex-shrink-0">
            <div className="relative">
              <img 
                src={brandLogo} 
                alt="Brand Logo" 
                className="h-12 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`relative px-4 py-2 text-sm lg:text-base font-medium transition-all duration-300 group ${
                  location.pathname === link.path 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'w-full' 
                    : 'w-0 group-hover:w-full'
                }`}></span>
                {location.pathname === link.path && (
                  <span className="absolute inset-0 bg-blue-50/50 rounded-lg -z-10"></span>
                )}
              </Link>
            ))}
            <Link 
              to="/amitsolutionhub-support-chat.vercel.app/"
              className="ml-2 lg:ml-4 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-semibold text-sm lg:text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-0.5">
                Help
              </div>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 active:scale-95 transition-all duration-200 border border-gray-200/50"
            >
              {isOpen ? (
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mx-3 mb-3">
          <div className="glass-card rounded-2xl p-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`block px-5 py-3.5 text-base font-semibold rounded-xl transition-all duration-200 ${
                    location.pathname === link.path 
                      ? 'text-blue-600 bg-blue-50 shadow-inner' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2">
                <Link 
                  to="/contact"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-600/30"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
