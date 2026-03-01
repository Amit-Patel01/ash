import { Link } from 'react-router-dom'
import launchVideo from '../assets/launchinsoon.mp4'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
      >
        <source src={launchVideo} type="video/mp4" />
      </video>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-12">
        {/* Badge */}
        <div className="inline-block bg-white border border-gray-200 px-6 py-2 rounded-full mb-6 animate-bounce shadow-md">
          <span className="text-blue-600 font-semibold text-sm">🚀 Welcome to AmitSolutionHub</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-lg">
          Build Your Digital Future
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-2xl mx-auto">
          Web Development • PC Repair • Digital Solutions
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/services"
            className="bg-white border border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg text-blue-600 hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Explore Services
          </Link>
          <Link
            to="/contact"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started →
          </Link>
        </div>

        {/* Stats */}
      
      </div>
    </section>
  )
}

export default Hero
