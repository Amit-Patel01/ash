import React, { useState } from 'react';

export default function MaintenancePage({ message }) {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@amitsolutionhub.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between items-center overflow-hidden font-['Outfit',sans-serif] selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Animated Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Radial Glows */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[180px]" />
        
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }} 
        />

        {/* Floating Particles SVG Background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15%" cy="20%" r="2" fill="#818cf8" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="85%" cy="30%" r="2.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <circle cx="70%" cy="80%" r="1.8" fill="#c084fc" className="animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          <circle cx="25%" cy="75%" r="2.2" fill="#34d399" className="animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        </svg>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl px-6 py-6 flex items-center justify-center sm:justify-start">
        <div className="flex items-center gap-3">
          {/* Logo SVG Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Amit Solution Hub Technology Pvt Ltd
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl px-6 py-8 flex flex-col items-center text-center my-auto">
        
        {/* Status Badge with Live Pulse Dot */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md mb-8 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          System Maintenance & Infrastructure Upgrade
        </div>

        {/* HERO ANIMATED TECH SVG ILLUSTRATION */}
        <div className="relative w-full max-w-[540px] aspect-[4/3] my-2 flex items-center justify-center">
          
          {/* Main Vector SVG */}
          <svg 
            className="w-full h-full drop-shadow-[0_20px_50px_rgba(99,102,241,0.25)]" 
            viewBox="0 0 800 600" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="mainGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              <linearGradient id="laserBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="gearGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>

              <linearGradient id="gearGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>

              {/* Laser Scan Keyframe Filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Outer Orbital Tech Rings */}
            <g className="origin-center" style={{ transformOrigin: '400px 300px' }}>
              {/* Outer Dashed Ring (Rotating CW) */}
              <circle
                cx="400"
                cy="300"
                r="230"
                stroke="url(#mainGlow)"
                strokeWidth="1.5"
                strokeDasharray="12 16"
                strokeOpacity="0.4"
                className="animate-[spin_40s_linear_infinite]"
              />

              {/* Middle Orbital Ring (Rotating CCW) */}
              <circle
                cx="400"
                cy="300"
                r="190"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="6 20 40 20"
                strokeOpacity="0.5"
                className="animate-[spin_25s_linear_infinite_reverse]"
                style={{ transformOrigin: '400px 300px' }}
              />

              {/* Orbiting Satellite Node 1 */}
              <g className="animate-[spin_15s_linear_infinite]" style={{ transformOrigin: '400px 300px' }}>
                <circle cx="590" cy="300" r="6" fill="#38bdf8" filter="url(#neonGlow)" />
                <circle cx="590" cy="300" r="10" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
              </g>

              {/* Orbiting Satellite Node 2 */}
              <g className="animate-[spin_22s_linear_infinite_reverse]" style={{ transformOrigin: '400px 300px' }}>
                <circle cx="210" cy="300" r="5" fill="#a855f7" filter="url(#neonGlow)" />
              </g>
            </g>

            {/* Central Server Console / Matrix Frame */}
            <rect
              x="250"
              y="160"
              width="300"
              height="280"
              rx="20"
              fill="url(#cardGrad)"
              stroke="url(#mainGlow)"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <rect
              x="265"
              y="175"
              width="270"
              height="250"
              rx="14"
              fill="#030712"
              fillOpacity="0.7"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Server Rack Modules */}
            {/* Rack 1 */}
            <g>
              <rect x="285" y="195" width="230" height="42" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <circle cx="305" cy="216" r="4" fill="#34d399" className="animate-pulse" />
              <circle cx="320" cy="216" r="4" fill="#38bdf8" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
              <circle cx="335" cy="216" r="4" fill="#6366f1" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
              {/* Rack Lines */}
              <line x1="360" y1="211" x2="495" y2="211" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
              <line x1="360" y1="221" x2="460" y2="221" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
            </g>

            {/* Rack 2 */}
            <g>
              <rect x="285" y="247" width="230" height="42" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <circle cx="305" cy="268" r="4" fill="#38bdf8" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
              <circle cx="320" cy="268" r="4" fill="#a855f7" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <circle cx="335" cy="268" r="4" fill="#34d399" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
              <line x1="360" y1="263" x2="480" y2="263" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.9" />
              <line x1="360" y1="273" x2="440" y2="273" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Interactive Animated Gears Visual */}
            {/* Big Gear 1 (Clockwise) */}
            <g className="animate-[spin_12s_linear_infinite]" style={{ transformOrigin: '330px 345px' }}>
              <path
                d="M330 315 L334 322 L342 320 L343 328 L351 330 L348 338 L355 342 L349 348 L354 354 L347 357 L349 365 L341 365 L339 373 L331 370 L327 377 L321 371 L315 375 L312 367 L304 367 L305 359 L298 355 L302 348 L297 342 L304 338 L301 330 L309 328 L310 320 L318 322 Z"
                fill="url(#gearGradient1)"
                stroke="#a5b4fc"
                strokeWidth="1"
              />
              <circle cx="330" cy="345" r="12" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
            </g>

            {/* Small Gear 2 (Counter-Clockwise) */}
            <g className="animate-[spin_8s_linear_infinite_reverse]" style={{ transformOrigin: '388px 365px' }}>
              <path
                d="M388 345 L391 350 L397 349 L398 355 L404 356 L402 362 L407 365 L403 369 L407 374 L401 376 L402 382 L396 382 L395 388 L389 386 L386 391 L381 387 L377 390 L375 384 L369 384 L370 378 L364 375 L367 370 L363 365 L368 362 L366 356 L372 355 L373 349 L379 350 Z"
                fill="url(#gearGradient2)"
                stroke="#67e8f9"
                strokeWidth="1"
              />
              <circle cx="388" cy="365" r="9" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
            </g>

            {/* Vector Tool Icon Badge (Shield + Wrench) */}
            <g transform="translate(430, 315)">
              <rect x="0" y="0" width="75" height="75" rx="14" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
              {/* SVG Wrench & Hammer Icon */}
              <path
                d="M25 50 L40 35 M36 31 C33 28 33 23 36 20 C39 17 44 17 47 20 C48 21 49 23 49 25 L43 31 L50 38 L44 44 Z"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M48 24 L52 20"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* Laser Scanner Line (Scanning Up and Down) */}
            <g className="animate-[bounce_4s_ease-in-out_infinite]">
              <line x1="260" y1="210" x2="540" y2="210" stroke="url(#laserBeam)" strokeWidth="6" />
              <line x1="260" y1="210" x2="540" y2="210" stroke="#38bdf8" strokeWidth="1.5" filter="url(#neonGlow)" />
            </g>

            {/* Decorative Vector Terminal Floating Snippets */}
            <g transform="translate(150, 220)">
              <rect x="0" y="0" width="110" height="60" rx="10" fill="#0f172a" fillOpacity="0.85" stroke="#334155" strokeWidth="1" />
              <text x="14" y="24" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">STATUS: 200</text>
              <text x="14" y="42" fill="#34d399" fontSize="10" fontFamily="monospace">OPTIMIZING...</text>
            </g>

            <g transform="translate(540, 250)">
              <rect x="0" y="0" width="120" height="65" rx="10" fill="#0f172a" fillOpacity="0.85" stroke="#334155" strokeWidth="1" />
              <text x="14" y="24" fill="#c084fc" fontSize="11" fontFamily="monospace" fontWeight="bold">PATCH v2.4</text>
              <text x="14" y="44" fill="#94a3b8" fontSize="10" fontFamily="monospace">SYNCING DATA</text>
            </g>

            {/* Sparkle Vector Star */}
            <path
              d="M400 110 L404 122 L416 126 L404 130 L400 142 L396 130 L384 126 L396 122 Z"
              fill="#38bdf8"
              className="animate-pulse"
            />
            <path
              d="M230 440 L233 448 L241 451 L233 454 L230 462 L227 454 L219 451 L227 448 Z"
              fill="#818cf8"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>

        {/* Heading Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-6 mb-4">
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Under Maintenance
          </span>
        </h1>

        {/* Main Message */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal mb-8">
          {message || "We are currently performing scheduled infrastructure upgrades, database performance optimizations, and security enhancements to serve you better. Everything will be back online shortly!"}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          {/* Refresh Status Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer disabled:opacity-70"
          >
            <svg 
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Checking Status...' : 'Check Server Status'}</span>
          </button>

          {/* Copy Support Email */}
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-95 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 font-semibold">Email Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Support</span>
              </>
            )}
          </button>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Amit Solution Hub Technology Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Support: <strong className="text-slate-300 font-normal">support@amitsolutionhub.com</strong>
          </p>
        </div>
      </footer>

    </div>
  );
}
