import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import brandLogo from '../assets/brand logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/40 bg-white/70 backdrop-blur-2xl shadow-xl shadow-black/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img src={brandLogo} alt="Brand Logo" className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`text-gray-800 hover:text-blue-600 font-semibold text-base lg:text-lg transition-all duration-300 relative group py-2 ${location.pathname === link.path ? 'text-blue-600' : ''}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
              </Link>
            ))}
            <button className="ml-2 lg:ml-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-semibold text-base lg:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-1">
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100/60 active:bg-gray-200/60 transition-colors">
              {isOpen ? (
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/80 backdrop-blur-2xl mx-3 mb-3 rounded-2xl shadow-2xl border border-white/40">
          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`block px-4 py-3 text-gray-800 hover:text-blue-600 font-semibold text-base hover:bg-blue-50/80 rounded-lg transition-all duration-200 ${location.pathname === link.path ? 'text-blue-600 bg-blue-50' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
