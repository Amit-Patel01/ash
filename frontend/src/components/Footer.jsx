import { Link } from 'react-router-dom'
import brandName from '../assets/brdname.png'
import msmeLogo from '../assets/msme.png'
import msmeQR from '../assets/msme-qr.png'

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

      <div className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 overflow-hidden">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-10">
            
            {/* Column 1 - Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <img 
                  src={brandName} 
                  alt="BRD Name" 
                  className="h-10 md:h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-gray-400 leading-relaxed text-sm max-w-full md:max-w-sm mx-auto md:mx-0 mb-6 font-medium">
                We build powerful web solutions, dashboards and smart systems for growing businesses.
              </p>
              
              {/* MSME Verification Box */}
              <div className="flex flex-col items-center md:items-start mb-8 w-full group">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl inline-flex items-center gap-4 shadow-xl hover:bg-white/10 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl p-1.5 border border-white/10 shadow-inner overflow-hidden">
                    <img src={msmeLogo} alt="MSME" className="w-full h-full object-contain brightness-110" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-extrabold mb-0.5">MSME Registered</div>
                    <div className="text-xs font-black text-white tracking-widest flex items-center gap-1.5">
                      UDYAM-GJ-17-0037282
                      <div className="relative group/qr">
                        <svg className="w-3.5 h-3.5 text-blue-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {/* QR Code Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 p-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/qr:opacity-100 group-hover/qr:visible transition-all scale-90 group-hover/qr:scale-100 z-50">
                          <img src={msmeQR} alt="MSME QR" className="w-full h-full rounded-lg bg-white p-1" />
                          <p className="text-[8px] text-center mt-1.5 text-gray-400 font-bold tracking-tighter">Scan to Verify</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center md:justify-start gap-3">
                {[
                  { name: 'X', href: 'https://x.com/AmitSolutionHub', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { name: 'Instagram', href: 'https://www.instagram.com/amitsolutionhub', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/amit-solution-hub', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                  { name: 'GitHub', href: 'https://github.com/Amit-Patel01', icon: 'M12 .297a12 12 0 00-3.794 23.4c.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.606-2.665-.303-5.467-1.332-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.526.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 016.003 0c2.293-1.552 3.3-1.23 3.3-1.23.654 1.65.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.371.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.003 12.003 0 0012 .297z' },
                ].map((social) => (
                  <a 
                    key={social.name}
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-500/10 transition-all duration-300 border border-white/10 hover:border-blue-500/30 hover:scale-110 shadow-lg"
                    aria-label={social.name}
                  >
                    <svg className="w-4.5 h-4.5 text-gray-400 hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2 - Navigation */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-black mb-6 text-white uppercase tracking-[0.25em] opacity-60">
                Navigation
              </h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-blue-500/70 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-blue-500/70 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-blue-500/70 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-blue-500/70 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-blue-500/70 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-blue-500/70 group-hover:text-blue-400 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-black mb-6 text-white uppercase tracking-[0.25em] opacity-60">
                Legal
              </h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li>
                  <Link to="/privacy-policy" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-slate-500 group-hover:text-blue-300 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-slate-500 group-hover:text-blue-300 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-slate-500 group-hover:text-blue-300 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/grievance" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-flex items-center gap-2.5 group">
                    <span className="inline-flex items-center justify-center text-slate-500 group-hover:text-blue-300 transition-colors">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.2" />
                      </svg>
                    </span>
                    Grievance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Contact */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-black mb-6 text-white uppercase tracking-[0.25em] opacity-60">
                Contact
              </h3>
              <div className="space-y-5 text-gray-400 text-sm">
                <a href="mailto:support@amitsolutionhub.com" className="flex items-center justify-center md:justify-start gap-4 group hover:text-white transition-all">
                  <span className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all border border-white/5 group-hover:border-blue-500/20 shadow-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4 8 8 6 8-6" />
                    </svg>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform font-medium">support@amitsolutionhub.com</span>
                </a>
                <a href="tel:+917874248481" className="flex items-center justify-center md:justify-start gap-4 group hover:text-white transition-all">
                  <span className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all border border-white/5 group-hover:border-blue-500/20 shadow-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                      <rect x="7.5" y="3.5" width="9" height="17" rx="2.2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17.5h2" />
                    </svg>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform font-medium">+91 7874248481</span>
                </a>
                <div className="flex items-center justify-center md:justify-start gap-4 group">
                  <span className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <span className="font-medium">Godhra, Gujarat, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 pt-10 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {/* Copyright */}
              <div className="text-gray-500 text-xs text-center md:text-left font-medium tracking-wide">
                © {currentYear} <span className="text-gray-200 font-black">AMITSOLUTIONHUB</span> — All rights reserved
              </div>
              
              {/* Made with love */}
              <div className="flex items-center gap-3 text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                <span>Created by</span>
                <span className="text-white bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">Amit Patel</span>
                <span className="text-red-500 animate-pulse">❤</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer
