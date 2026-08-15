'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Code2,
  Palette,
  Cpu,
  Terminal,
  Sparkles,
  Flame,
  CheckCircle2,
  ArrowRight,
  Send,
  Zap,
  Server,
  Layers,
  Monitor
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function AshxOsHeroSection() {
  const [activeTab, setActiveTab] = useState(0)
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const calculateTime = () => {
      const launchDate = new Date('December 31, 2026 23:59:59 GMT+0530').getTime()
      const now = new Date().getTime()
      const diff = launchDate - now
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }
    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/ashx-os/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          systemType: 'Desktop',
          source: 'homepage_section'
        })
      })
      const data = await res.json()
      if (data.success) {
        setIsSubscribed(true)
      }
    } catch (err) {
      console.error('Waitlist submit error:', err)
      setIsSubscribed(true)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setEmail(''), 3000)
    }
  }

  const pillars = [
    {
      id: 'game',
      title: 'GAME',
      icon: Gamepad2,
      tagline: 'Ultra High FPS & Zero Latency',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      glow: 'rgba(244,63,94,0.15)',
      badgeColor: 'text-pink-600 bg-pink-50 border-pink-200',
      features: [
        'Custom low-latency Linux kernel tailored for gaming',
        'Vulkan & Proton-GE layer pre-configured for AAA titles',
        'GameMode daemon with automatic GPU overclocking boost',
        'Direct pipewire ultra-low audio latency'
      ]
    },
    {
      id: 'code',
      title: 'CODE',
      icon: Code2,
      tagline: 'The Ultimate Developer Haven',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      glow: 'rgba(99,102,241,0.15)',
      badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      features: [
        'Out-of-the-box toolchains for Rust, Python, Go, Node & C++',
        'Integrated Zsh, Fish, Tmux & modern Alacritty GPU terminal',
        'Native Docker & Podman containers support',
        'Pre-configured modern Neovim & VSCode profiles'
      ]
    },
    {
      id: 'create',
      title: 'CREATE',
      icon: Palette,
      tagline: 'Pro Media & 4K Studio Suite',
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      glow: 'rgba(245,158,11,0.15)',
      badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
      features: [
        'Hardware accelerated NVENC & VAAPI video encoding',
        'Optimized for DaVinci Resolve, Blender & Krita',
        'Color-calibrated HDR display management (Wayland)',
        'Lossless OBS Studio streaming profiles'
      ]
    },
    {
      id: 'deploy',
      title: 'DEPLOY',
      icon: Server,
      tagline: 'Cloud-Native & Server Architecture',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      glow: 'rgba(20,184,166,0.15)',
      badgeColor: 'text-teal-600 bg-teal-50 border-teal-200',
      features: [
        'Instant single-node Kubernetes & K3s cluster spin-up',
        'MicroVM sandboxing with Firecracker compatibility',
        'Enterprise-grade cryptographic security & immutable root',
        'Edge AI model inference accelerator'
      ]
    }
  ]

  return (
    <section className={`relative w-full py-16 sm:py-24 transition-colors duration-300 ${isDark
        ? 'bg-slate-950 text-white border-y border-cyan-500/20'
        : 'bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60 text-slate-900 border-y border-slate-200/80'
      } overflow-hidden`}>

      {/* Background Ambient Glows */}
      <div className={`absolute inset-0 pointer-events-none ${isDark
          ? 'bg-[linear-gradient(to_right,#081b2f_1px,transparent_1px),linear-gradient(to_bottom,#081b2f_1px,transparent_1px)] opacity-30'
          : 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] opacity-50'
        } bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]`} />

      <div className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[130px] pointer-events-none ${isDark ? 'bg-cyan-600/15' : 'bg-indigo-400/10'
        }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Badges & Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-sm ${isDark
              ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-300'
              : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            }`}>
            <Sparkles className={`w-4 h-4 animate-pulse ${isDark ? 'text-cyan-300' : 'text-indigo-600'}`} />
            <span>OFFICIAL OS LAUNCH ANNOUNCEMENT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase font-mono">
            <span className={
              isDark
                ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'
            }>
              ASHX OS
            </span>
          </h2>

          <p className={`mt-2 text-base sm:text-xl font-extrabold tracking-widest uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
            Built to <span className="text-pink-500">Game</span> • <span className="text-indigo-600 dark:text-blue-400">Code</span> • <span className="text-amber-500">Create</span> • <span className="text-teal-600 dark:text-teal-400">Deploy</span>
          </p>

          <p className={`mt-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
            The next generation of Desktop Linux engineered by Amit Solution Hub. Unmatched gaming speed, out-of-the-box developer toolchains, and cloud-native stability.
          </p>

          {/* Launching Date & Live Countdown Pill */}
          <div className={`mt-8 inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-6 sm:py-3 rounded-2xl backdrop-blur-xl shadow-lg border ${isDark
              ? 'bg-slate-900/90 border-cyan-500/30'
              : 'bg-white/95 border-slate-200/90 shadow-slate-200/70'
            }`}>
            <div className="flex items-center gap-2 text-left">
              <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
              <div>
                <div className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Official Launch
                </div>
                <div className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  End of December 2026
                </div>
              </div>
            </div>

            <div className={`hidden sm:block h-8 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

            {/* Countdown timer */}
            <div className="flex items-center gap-2 font-mono">
              <div className={`flex flex-col items-center px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                <span className={`text-base sm:text-lg font-black ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{timeLeft.days}</span>
                <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Days</span>
              </div>
              <span className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
              <div className={`flex flex-col items-center px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                <span className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hours</span>
              </div>
              <span className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
              <div className={`flex flex-col items-center px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                <span className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mins</span>
              </div>
              <span className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
              <div className={`flex flex-col items-center px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                <span className={`text-base sm:text-lg font-black ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Poster Showcase (Left) + Interactive Pillars (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Poster Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className={`relative group w-full max-w-sm sm:max-w-md rounded-3xl p-1.5 transition-all duration-500 ${isDark
                ? 'bg-gradient-to-b from-cyan-500 via-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(6,182,212,0.25)]'
                : 'bg-gradient-to-b from-indigo-500 via-blue-500 to-purple-500 shadow-xl shadow-indigo-500/15'
              }`}>
              <div className={`relative rounded-[22px] overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <img
                  src="/ashx-os-poster.jpg"
                  alt="ASHX OS Launch Poster"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Floating pill over image */}
                <div className={`absolute bottom-4 inset-x-4 p-3 rounded-xl backdrop-blur-md border flex items-center justify-between ${isDark ? 'bg-slate-950/85 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-md'
                  }`}>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                      Version 1.0 Alpha
                    </span>
                    <span className="text-xs font-bold">Next-Gen Linux Kernel</span>
                  </div>
                  <Link
                    href="/ashx-os"
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${isDark ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Interactive Pillars & Waitlist Signup */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Tab selector */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/90 border-slate-200'
              }`}>
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon
                const isSelected = activeTab === idx
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${isSelected
                        ? `bg-gradient-to-r ${pillar.gradient} text-white shadow-md`
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{pillar.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Active Pillar Card */}
            <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${isDark
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white/95 border-slate-200/90 shadow-xl shadow-slate-200/50'
              }`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                      Core Pillar
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {pillars[activeTab].tagline}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${pillars[activeTab].gradient} text-white shadow-md`}>
                    {React.createElement(pillars[activeTab].icon, { className: 'w-6 h-6' })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  {pillars[activeTab].features.map((feature, i) => (
                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${isDark
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700'
                      }`}>
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                      <span className="text-xs sm:text-sm font-medium leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Waitlist Subscription Box */}
            <div className={`p-6 rounded-3xl border ${isDark
                ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-cyan-500/20'
                : 'bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/90 border-indigo-100 shadow-sm'
              }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Zap className="w-4 h-4 text-amber-500" />
                    Get Early Beta ISO Access
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Be the first to download ASHX OS when Beta releases in Dec 2026.
                  </p>
                </div>

                {isSubscribed ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    You're on the VIP Waitlist!
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none border w-full sm:w-60 ${isDark
                          ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                        }`}
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md whitespace-nowrap flex items-center gap-1.5 ${isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                        }`}
                    >
                      <span>Join</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Link to Full Landing Page */}
            <div className="flex items-center justify-between pt-2">
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                100% Open-Source & Enterprise Ready
              </div>
              <Link
                href="/ashx-os"
                className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors group ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-indigo-600 hover:text-indigo-700'
                  }`}
              >
                <span>Read Full Specifications & Architecture</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
