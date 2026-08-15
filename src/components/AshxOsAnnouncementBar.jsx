'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function AshxOsAnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('ashx_banner_dismissed')
    if (isDismissed) {
      setIsVisible(false)
    }

    const calculateTime = () => {
      const launchDate = new Date('December 31, 2026 23:59:59 GMT+0530').getTime()
      const now = new Date().getTime()
      const difference = launchDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('ashx_banner_dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className={`relative z-[150] w-full border-b transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-950/95 border-cyan-500/30 text-white shadow-[0_4px_25px_rgba(6,182,212,0.15)]' 
        : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-[0_2px_15px_rgba(0,0,0,0.06)]'
    } backdrop-blur-md overflow-hidden`}>
      {/* Background glow */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDark 
          ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.2),rgba(255,255,255,0))]' 
          : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))]'
      }`} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm relative z-10">
        
        {/* Left Badge + Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
            isDark 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
          } animate-pulse flex-shrink-0`}>
            <Sparkles className={`w-3 h-3 ${isDark ? 'text-cyan-300' : 'text-indigo-600'}`} />
            ASHX OS • Dec 2026
          </span>

          <p className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'} hidden md:inline`}>
            <span className={isDark ? 'text-cyan-400 font-bold' : 'text-indigo-600 font-bold'}>The Next-Gen Desktop Linux</span> is launching soon: Built to <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Game • Code • Create • Deploy</span>.
          </p>
          <p className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'} md:hidden`}>
            <span className={isDark ? 'text-cyan-400 font-bold' : 'text-indigo-600 font-bold'}>ASHX OS:</span> Launching Dec 2026!
          </p>
        </div>

        {/* Right: Countdown & CTA */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mini Countdown */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border font-mono text-xs ${
            isDark 
              ? 'bg-black/50 border-cyan-500/20 text-cyan-300' 
              : 'bg-slate-100/90 border-slate-200 text-slate-700'
          }`}>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-indigo-700'}`}>{timeLeft.days}</span>d
            <span>:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(timeLeft.hours).padStart(2, '0')}</span>h
            <span>:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(timeLeft.minutes).padStart(2, '0')}</span>m
            <span>:</span>
            <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{String(timeLeft.seconds).padStart(2, '0')}</span>s
          </div>

          {/* CTA Link */}
          <Link
            href="/ashx-os"
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
            }`}
          >
            <span>Explore OS</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </Link>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss Announcement"
            className={`p-1 rounded-md transition-colors ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-white/10' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  )
}

