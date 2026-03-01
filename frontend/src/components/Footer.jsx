import { Link } from 'react-router-dom'
import brandName from '../assets/brdname.png'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">
            {/* Column 1 */}
            <div>
              <img 
                src={brandName} 
                alt="BRD Name" 
                className="h-14 w-auto object-contain mb-4 hover:scale-110 transition"
              />
              <p className="text-gray-300 leading-relaxed text-sm max-w-sm">
                We build powerful web solutions, dashboards and smart systems for
                growing businesses.
              </p>
              <div className="flex gap-3 mt-6">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-500/50 transition border border-white/20">
                  𝕏
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-pink-500/50 transition border border-white/20">
                  📸
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-500/50 transition border border-white/20">
                  💼
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="md:text-center">
              <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Quick Links</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li>
                  <Link to="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="md:text-right">
              <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Get In Touch</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p className="hover:text-white transition">📧 amitpatel07029@gmail.com</p>
                <p className="hover:text-white transition">📱 +91 7874248481</p>
                <p className="hover:text-white transition">📍 Godhra, Gujarat, India</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            © 2026 AmitSolutionHub — Built with ❤️ by Amit Patel
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
