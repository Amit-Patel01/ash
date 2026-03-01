import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
      
      <Navbar />

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <Footer />
      
    </div>
  )
}

export default Layout