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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
      scrolled 
        ? 'py-2 md:py-3' 
        : 'py-4 md:py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating Glass Container */}
        <div className={`
          relative flex justify-between items-center px-6 md:px-8 rounded-full 
          transition-all duration-500 ease-out border shadow-2xl
          ${scrolled 
            ? 'h-16 md:h-20 bg-white/70 backdrop-blur-3xl border-white/50 shadow-blue-900/10 scale-100' 
            : 'h-20 md:h-24 bg-white/40 backdrop-blur-2xl border-white/40 shadow-blue-900/5 scale-[1.02]'
          }
        `}>
          
          {/* Subtle Glow Behind Navbar */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-full blur-xl pointer-events-none transition-opacity duration-500 opacity-50"></div>

          {/* Brand Logo */}
          <Link to="/" className="relative z-10 flex items-center group flex-shrink-0 outline-none">
            <div className="relative transform transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2">
              <img 
                src={brandLogo} 
                alt="Brand Logo" 
                className="h-10 md:h-12 w-auto object-contain filter drop-shadow-md" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 z-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`relative px-5 py-2.5 rounded-full text-sm lg:text-base font-bold transition-all duration-300 group outline-none overflow-hidden ${
                    isActive 
                      ? 'text-blue-700 shadow-inner bg-white/60' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white/40'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                  )}
                </Link>
              );
            })}
            
            {/* Help Button */}
            <button 
              onClick={() => window.location.href = 'https://chat.amitsolutionhub.com'}
              className="ml-2 lg:ml-4 relative group outline-none"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-2.5 rounded-full font-bold text-sm lg:text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg transform group-hover:-translate-y-0.5">
                <span className="group-hover:-rotate-12 transition-transform duration-300">👋</span>
                Help
              </div>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center z-10">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md shadow-sm border border-white/50 text-slate-700 hover:bg-white/80 hover:text-blue-600 active:scale-95 transition-all duration-300 outline-none"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className={`block w-6 h-0.5 bg-current rounded-full transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current rounded-full transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current rounded-full transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden absolute top-full left-4 right-4 mt-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${isOpen ? 'opacity-100 scale-y-100 max-h-[500px]' : 'opacity-0 scale-y-95 max-h-0 pointer-events-none'}`}>
          <div className="bg-white/70 backdrop-blur-3xl border border-white/50 shadow-2xl rounded-3xl p-4 flex flex-col gap-2 relative overflow-hidden">
            
            {/* Subtle glow in mobile menu */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full pointer-events-none"></div>

            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`relative block px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden group ${
                    isActive 
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
            
            <button 
              onClick={() => window.location.href = 'https://chat.amitsolutionhub.com'}
              className="relative group w-full outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl flex items-center justify-center gap-2">
                Get Help <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">🚀</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
