import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import GlowBackground from './GlowBackground'
import LiveMeetingPopup from './LiveMeetingPopup'
import AnnouncementPopup from './AnnouncementPopup'

const Layout = () => {
  const location = useLocation()
  
  // Hide navbar/footer on specific pages
  const hideNavbar = ['/chat', '/signup', '/login'].some(path => location.pathname.startsWith(path))
  const hideFooter = ['/chat', '/signup', '/login', '/admin', '/employee'].some(path => location.pathname.startsWith(path))

  return (
    <div className="min-h-screen w-full flex flex-col relative text-slate-900">
      <GlowBackground />
      <LiveMeetingPopup />
      <AnnouncementPopup />
      
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