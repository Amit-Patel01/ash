import { Link } from 'react-router-dom'
import brandName from '../assets/brdname.png'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden w-full">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 overflow-hidden">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
            
            {/* Column 1 - Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <img 
                  src={brandName} 
                  alt="BRD Name" 
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-gray-300 leading-relaxed text-sm max-w-full md:max-w-sm mx-auto md:mx-0 mb-6">
                We build powerful web solutions, dashboards and smart systems for growing businesses.
              </p>
              {/* Social Icons */}
              <div className="flex justify-center md:justify-start gap-3">
                <a 
                  href="https://x.com/AmitSolutionHub" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-500/50 transition-all duration-300 border border-white/20 hover:scale-110"
                  aria-label="X"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/amitsolutionhub" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500/50 transition-all duration-300 border border-white/20 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/amit-solution-hub" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-500/50 transition-all duration-300 border border-white/20 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
  href="https://github.com/Amit-Patel01" 
  target="_blank"
  rel="noopener noreferrer"
  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-800/70 transition-all duration-300 border border-white/20 hover:scale-110"
  aria-label="GitHub"
>
  <svg 
    className="w-5 h-5" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 .297a12 12 0 00-3.794 23.4c.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.107-.775.418-1.305.76-1.606-2.665-.303-5.467-1.332-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.526.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 016.003 0c2.293-1.552 3.3-1.23 3.3-1.23.654 1.65.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.371.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.003 12.003 0 0012 .297z"/>
  </svg>
</a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Quick Links
              </h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li>
                  <Link to="/" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Get In Touch */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Get In Touch
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <a href="mailto:contact@amitsolutionhub.com" className="flex items-center justify-center md:justify-end gap-3 hover:text-white transition hover:translate-x-[-5px]">
                  <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">📧</span>
                  contact@amitsolutionhub.com
                </a>
                <a href="tel:+917874248481" className="flex items-center justify-center md:justify-end gap-3 hover:text-white transition hover:translate-x-[-5px]">
                  <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">📱</span>
                  +91 7874248481
                </a>
                <p className="flex items-center justify-center md:justify-end gap-3">
                  <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">📍</span>
                  Godhra, Gujarat, India
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-8 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="text-gray-400 text-sm text-center md:text-left">
                © {currentYear} <span className="text-white font-semibold">AmitSolutionHub</span> — All rights reserved
              </div>
              
              {/* Made with love */}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>Built with</span>
                <span>by</span>
                <span className="text-white font-semibold">Amit Patel</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
