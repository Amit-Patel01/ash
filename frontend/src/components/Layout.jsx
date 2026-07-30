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

  // Hide WhatsApp & Back-to-top on dashboard routes
  const isPrivateRoute = ['/admin', '/employee', '/user'].some(p => location.pathname.startsWith(p))

  const [showBackToTop, setShowBackToTop] = useState(false)
  const [waHovered, setWaHovered] = useState(false)

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
    <div className="min-h-screen w-full flex flex-col relative text-slate-900 ash-canvas">
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


      {/* WhatsApp Floating Button */}
      {!isPrivateRoute && !hideNavbar && (
        <a
          href="https://wa.me/917874248481?text=Hi%2C%20I%20visited%20AmitSolutionHub%20and%20would%20like%20to%20know%20more!"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          onMouseEnter={() => setWaHovered(true)}
          onMouseLeave={() => setWaHovered(false)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #25d366, #128c7e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: waHovered
              ? '0 0 0 8px rgba(37,211,102,0.15), 0 12px 40px rgba(37,211,102,0.5)'
              : '0 0 0 0px rgba(37,211,102,0), 0 8px 24px rgba(37,211,102,0.4)',
            zIndex: 9995,
            transition: 'transform 0.3s ease, box-shadow 0.4s ease',
            transform: waHovered ? 'scale(1.12) translateY(-3px)' : 'scale(1)',
            textDecoration: 'none',
          }}
        >
          {/* Pulse ring */}
          <span style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            border: '2px solid rgba(37,211,102,0.5)',
            animation: 'waPulse 2.2s ease-out infinite',
            pointerEvents: 'none',
          }} />
          {/* WhatsApp SVG icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {/* Tooltip label */}
          <span style={{
            position: 'absolute',
            right: '68px',
            top: '50%',
            transform: waHovered ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(8px)',
            opacity: waHovered ? 1 : 0,
            pointerEvents: 'none',
            transition: 'all 0.25s ease',
            background: isDark ? '#1e293b' : 'white',
            color: isDark ? '#f1f5f9' : '#0f172a',
            fontSize: '12px',
            fontWeight: '700',
            padding: '6px 12px',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          }}>
            Chat with us
          </span>
        </a>
      )}

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes waPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Back To Top Button */}
      {!hideNavbar && showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: isPrivateRoute ? '24px' : '96px',
            right: '24px',
            width: '48px',
            height: '48px',
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Layout
