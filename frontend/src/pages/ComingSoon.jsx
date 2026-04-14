import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ComingSoon = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <div className={`relative z-10 w-full max-w-2xl px-6 text-center transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {/* Animated Icon Container */}
        <div className="mb-12 inline-block">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-ping"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-500 border border-white/20">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
          Programs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Are Live</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-lg mx-auto">
          Our latest programs are now active. Explore the available courses and internships to get started today.
        </p>

        {/* Info Box */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12 flex items-center gap-4 text-left max-w-md mx-auto hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">
            Web Development, AI, Data Science, UI/UX, and Cyber Security programs are available now.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/courses"
            className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-50 shadow-xl transition-all active:scale-95"
          >
            Explore Courses
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>

        {/* Footer Text */}
        <p className="mt-16 text-slate-500 text-sm font-medium tracking-widest uppercase">
          Amit Solution Hub &bull; Programs Open Now
        </p>
      </div>
    </section>
  )
}

export default ComingSoon
