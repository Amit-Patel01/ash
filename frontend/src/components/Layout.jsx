import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import GlowBackground from './GlowBackground'

const Layout = () => {
  const location = useLocation()
  
  // Hide footer on specific pages like Chat or Admin/Employee panels
  const hideFooter = ['/chat', '/admin', '/employee'].some(path => location.pathname.startsWith(path))

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <GlowBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
        <Navbar />

        <main className="flex-grow w-full pt-20 lg:pt-24 min-h-[calc(100vh-80px)]">
          <Outlet />
        </main>

        {!hideFooter && <Footer />}
      </div>
    </div>
  )
}

export default Layout