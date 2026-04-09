import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import GlowBackground from './GlowBackground'
import AnnouncementPopup from './AnnouncementPopup'

const Layout = () => {
  const location = useLocation()
  const hideShellRoutes = ['/chat', '/signup', '/login', '/verify']
  
  // Hide navbar/footer on specific pages
  const hideNavbar = hideShellRoutes.some(path => location.pathname.startsWith(path))
  const hideFooter = [...hideShellRoutes, '/admin', '/employee'].some(path => location.pathname.startsWith(path))
  const hideAnnouncement = location.pathname.startsWith('/verify')
  const hideGlowBackground = location.pathname.startsWith('/verify')

  return (
    <div className="min-h-screen w-full flex flex-col relative text-slate-900">
      {!hideGlowBackground && <GlowBackground />}
      {!hideAnnouncement && <AnnouncementPopup />}
      
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
        {!hideNavbar && <Navbar />}

        <main className={`flex-grow w-full ${!hideNavbar ? 'pt-20 lg:pt-24' : ''} min-h-[calc(100vh-80px)]`}>
          <Outlet />
        </main>

        {!hideFooter && <Footer />}
      </div>
    </div>
  )
}

export default Layout
