import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import GlowBackground from './GlowBackground'
import AnnouncementPopup from './AnnouncementPopup'
import DarkModeBackgroundFix from './DarkModeBackgroundFix'
import { useTheme } from '../context/ThemeContext'

const Layout = () => {
  const location = useLocation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const hideShellRoutes = ['/chat', '/signup', '/login', '/verify']
  
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
      
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
        {!hideNavbar && <Navbar />}

        <main className={`flex-grow w-full ${!hideNavbar ? 'pt-20 lg:pt-24' : ''} min-h-[calc(100vh-80px)]`}>
          <Outlet />
        </main>

        {!hideFooter && <Footer />}
      </div>

      {/* 2. WhatsApp Floating Button */}
      {!hideNavbar && (
        <a
          href="https://wa.me/917874248481"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.35)',
            zIndex: 9990,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            color: 'white',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(37, 211, 102, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 211, 102, 0.35)'
          }}
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{width: 32, height: 32}}>
            <path d="M17.472 14.382c-.022-.08-.124-.22-.326-.404-.226-.206-1.32-.652-1.524-.727-.204-.075-.353-.112-.5.113-.15.225-.578.728-.709.878-.13.15-.26.17-.463.07-.203-.1-.856-.315-1.63-.99-.6-.537-1.005-1.2-1.123-1.405-.118-.205-.012-.315.09-.415.09-.09.201-.235.3-.35.098-.115.13-.195.195-.325.065-.13.033-.245-.015-.35-.049-.1-.44-1.054-.6-1.442-.158-.387-.33-.335-.453-.335-.117-.003-.251-.003-.385-.003-.135 0-.353.05-.538.252-.186.202-.709.693-.709 1.69 0 1 .726 1.967.828 2.102.102.137 1.428 2.182 3.46 3.06.483.208.86.332 1.155.426.484.154.924.132 1.272.08.388-.058 1.125-.459 1.282-.9 0-.012.012-.022.012-.033.158-.44.158-.82.11-1.002zM12 .297c-6.63 0-12 5.373-12 12 0 2.112.55 4.18 1.59 6.002L0 24l5.89-1.543c1.764.962 3.75 1.47 5.782 1.47 6.63 0 12-5.374 12-12 0-6.627-5.372-12-12-12zm0 22.008c-1.896 0-3.756-.508-5.383-1.47l-.386-.23-3.486.913.93-3.39-.253-.402c-1.056-1.68-1.614-3.634-1.614-5.632 0-5.513 4.487-10 10-10s10 4.487 10 10-4.487 10-10 10z"/>
          </svg>
        </a>
      )}

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
