import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import GlowBackground from './GlowBackground'
import AnnouncementPopup from './AnnouncementPopup'
import DarkModeBackgroundFix from './DarkModeBackgroundFix'
import GuidanceModal from './GuidanceModal'
import { useTheme } from '../context/ThemeContext'

const Layout = () => {
  const location = useLocation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const hideShellRoutes = ['/chat', '/signup', '/login', '/verify', '/checkout']
  
  // Hide navbar/footer on specific pages
  const hideNavbar = hideShellRoutes.some(path => location.pathname.startsWith(path))
  const hideFooter = [...hideShellRoutes, '/admin', '/employee'].some(path => location.pathname.startsWith(path))
  const hideAnnouncement = location.pathname.startsWith('/verify')
  const hideGlowBackground = location.pathname.startsWith('/verify')

  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative text-slate-900">
      <DarkModeBackgroundFix />
      {!hideGlowBackground && <GlowBackground />}
      {!hideAnnouncement && <AnnouncementPopup />}
      {!hideNavbar && <GuidanceModal />}
      
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
        {!hideNavbar && <Navbar />}

        <main className={`flex-grow w-full ${!hideNavbar ? 'pt-20 lg:pt-24' : ''} min-h-[calc(100vh-80px)]`}>
          <Outlet />
        </main>

        {!hideFooter && <Footer />}
      </div>


      {/* 6. Back To Top Button */}
      {!hideNavbar && showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '172px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 9990,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            color: isDark ? '#fff' : '#4f46e5',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)'
          }}
          title="Back to Top"
          aria-label="Back to Top"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{width: 24, height: 24}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Layout
