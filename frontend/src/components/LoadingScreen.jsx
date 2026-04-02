import React from 'react'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a192f] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo Animation */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
            <svg className="w-12 h-12 text-white animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">
            Amit Solution<span className="text-blue-500">Hub</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Preparing Workspace</p>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-1/3 animate-[loading-bar_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
