import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import GlowBackground from './GlowBackground'

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <GlowBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-x-hidden">
        <Navbar />

        <main className="flex-grow w-full">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default Layout