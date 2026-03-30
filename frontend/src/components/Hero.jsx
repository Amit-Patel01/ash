import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import heroBg from '../assets/hero-bg.png'

const Hero = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 md:pt-36">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Tech Solutions"
          className="w-full h-full object-cover opacity-20 select-none pointer-events-none transition-opacity duration-1000"
        />
        {/* Mirror/Reflection Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/40 backdrop-blur-[1px]"></div>
      </div>


      {/* Content */}
      <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto py-12 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>



        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/50 px-5 py-2.5 rounded-full mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-blue-700 font-semibold text-sm group-hover:text-blue-800 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
            </svg>
            Welcome to AmitSolutionHub
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-display">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm">
            Build Your Digital
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-500">
            Future
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-10 leading-relaxed max-w-2xl mx-auto">
          <span className="font-semibold text-blue-600">Web Development</span> • <span className="font-semibold text-indigo-600">PC Repair</span> • <span className="font-semibold text-purple-600">Digital Solutions</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/services"
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg text-gray-700 bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Explore Services
            </span>
          </Link>
          <Link
            to="/contact"
            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% Satisfaction</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Expert Support</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Fast Delivery</span>
          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
