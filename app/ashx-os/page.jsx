'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Code2,
  Palette,
  Server,
  Cpu,
  HardDrive,
  Monitor,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Sparkles,
  Download,
  Terminal,
  Layers,
  ArrowRight,
  Send,
  HelpCircle,
  ChevronDown,
  Globe,
  Radio
} from 'lucide-react'
import { useTheme } from '@/src/context/ThemeContext'

const Layout = dynamic(() => import('@/src/components/Layout'), { ssr: false })

export default function AshxOsPage() {
  const [email, setEmail] = useState('')
  const [systemType, setSystemType] = useState('Desktop')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
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
          systemType,
          source: 'landing_page'
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
    }
  }

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const faqs = [
    {
      q: 'What is ASHX OS?',
      a: 'ASHX OS is a state-of-the-art Linux-based desktop operating system developed by Amit Solution Hub. It is engineered specifically for gamers, programmers, creators, and cloud engineers with ultra-low latency and peak hardware acceleration.'
    },
    {
      q: 'When will ASHX OS be officially released?',
      a: 'The public Beta release is scheduled for the End of December 2026. Early access beta testers will receive invitation links to download ISO images before the official worldwide launch.'
    },
    {
      q: 'Will ASHX OS be free to download?',
      a: 'Yes, ASHX OS Community Edition will be 100% free and open-source with lifetime updates for developers and creators.'
    },
    {
      q: 'Can I dual-boot ASHX OS alongside Windows 11 / macOS?',
      a: 'Yes! The ASHX OS installer includes a seamless partition manager supporting dual-boot alongside Windows, macOS, or existing Linux distributions without data loss.'
    },
    {
      q: 'Will my Steam games and Windows software work?',
      a: 'Yes! ASHX OS comes pre-tuned with Proton-GE, DXVK, Wine-Staging, and Vulkan shaders to run modern AAA titles and Windows creative applications with near-native performance.'
    }
  ]

  const specs = [
    {
      component: 'Processor (CPU)',
      minimum: '64-bit Dual Core (2.0 GHz+)',
      recommended: 'Intel Core i5/i7/i9 (10th Gen+) or AMD Ryzen 5/7/9 (3000 Series+)'
    },
    {
      component: 'System Memory (RAM)',
      minimum: '4 GB DDR4',
      recommended: '16 GB - 32 GB High-Speed DDR4/DDR5'
    },
    {
      component: 'Graphics Card (GPU)',
      minimum: 'Vulkan 1.2 capable GPU (Intel HD / AMD / Nvidia)',
      recommended: 'Nvidia RTX 2060+ / AMD Radeon RX 6600+ / Intel Arc'
    },
    {
      component: 'Storage Space',
      minimum: '30 GB NVMe / SSD space',
      recommended: '100 GB+ High Speed PCIe Gen4 NVMe SSD'
    },
    {
      component: 'Display Support',
      minimum: '1080p 60Hz Resolution',
      recommended: '2K / 4K / Ultrawide with 144Hz - 360Hz HDR & FreeSync/G-Sync'
    }
  ]

  return (
    <Layout>
      <div className={`min-h-screen bg-transparent transition-colors duration-300 ${
        isDark ? 'text-slate-100' : 'text-slate-800'
      }`}>
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-32 pb-20 sm:pt-36 sm:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Top Announcement Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest mb-6 animate-pulse ${
              isDark 
                ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]' 
                : 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm'
            }`}>
              <Radio className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
              <span>THE NEXT GENERATION OF DESKTOP LINUX</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-mono uppercase">
              <span className={
                isDark 
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.5)]'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'
              }>
                ASHX OS
              </span>
            </h1>

            <p className={`mt-3 text-lg sm:text-2xl md:text-3xl font-extrabold uppercase tracking-widest ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Built to <span className="text-pink-500">Game</span> • <span className="text-indigo-600 dark:text-cyan-400">Code</span> • <span className="text-amber-500">Create</span> • <span className="text-teal-600 dark:text-teal-400">Deploy</span>
            </p>

            <p className={`mt-6 max-w-3xl mx-auto text-sm sm:text-lg leading-relaxed font-normal ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Engineered from the ground up for maximum speed, developer sovereignty, hardware acceleration, and cloud scalability. Say goodbye to OS bloatware.
            </p>

            {/* Live Launching Countdown */}
            <div className={`mt-10 inline-flex flex-col items-center gap-3 p-5 sm:px-8 sm:py-4 rounded-3xl backdrop-blur-xl border ${
              isDark 
                ? 'bg-slate-900/80 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]' 
                : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/50'
            }`}>
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-indigo-600'
              }`}>
                <Flame className="w-4 h-4 text-amber-500" />
                Official Launch Countdown: <span className={isDark ? 'text-white' : 'text-slate-900'}>End of December 2026</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className={`text-xl sm:text-2xl font-black ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{timeLeft.days}</span>
                  <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Days</span>
                </div>
                <span className={`font-bold text-lg ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>:</span>
                <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hours</span>
                </div>
                <span className={`font-bold text-lg ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>:</span>
                <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mins</span>
                </div>
                <span className={`font-bold text-lg ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>:</span>
                <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className={`text-xl sm:text-2xl font-black ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sec</span>
                </div>
              </div>
            </div>

            {/* Poster Highlight Display */}
            <div className="mt-14 max-w-2xl mx-auto">
              <div className={`relative rounded-3xl p-1.5 ${
                isDark 
                  ? 'bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_60px_rgba(6,182,212,0.35)]' 
                  : 'bg-gradient-to-b from-indigo-500 via-purple-500 to-blue-500 shadow-2xl shadow-indigo-500/20'
              }`}>
                <div className={`rounded-[22px] overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                  <img
                    src="/ashx-os-poster.jpg"
                    alt="ASHX OS Launch Poster Official"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= 4 CORE PILLARS SECTION ================= */}
        <section className="py-20 border-t border-slate-200/60 relative bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                Architectural Core
              </span>
              <h2 className={`text-3xl sm:text-5xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Four Pillars of Pure Power
              </h2>
              <p className={`mt-4 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                ASHX OS is not another re-skinned distribution. It is purpose-built with deep kernel tuning for the demanding workflows of tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Pillar 1: GAME */}
              <div className={`p-8 rounded-3xl border transition-all relative overflow-hidden group ${
                isDark 
                  ? 'bg-slate-950/80 border-pink-500/30 hover:border-pink-500/60 shadow-[0_0_30px_rgba(244,63,94,0.1)]' 
                  : 'bg-white/90 backdrop-blur-md border-pink-200/80 hover:border-pink-300 shadow-lg shadow-pink-500/5'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>GAME</h3>
                    <p className="text-xs text-pink-500 font-bold uppercase tracking-wider">Zero Latency Gaming Pipeline</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Pre-configured with Proton-GE, Wine-Staging, Vulkan asynchronous shader compilation, and low-latency audio pipewire. Achieve up to 15% higher 1% low FPS compared to standard desktop operating systems.
                </p>
                <div className="space-y-2.5">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>Auto GPU overclocking profiles with GameMode daemon</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>Native Anti-Cheat compatibility layer for top multiplayer games</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>Multi-monitor VRR (Variable Refresh Rate) & HDR10</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: CODE */}
              <div className={`p-8 rounded-3xl border transition-all relative overflow-hidden group ${
                isDark 
                  ? 'bg-slate-950/80 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                  : 'bg-white/90 backdrop-blur-md border-indigo-200/80 hover:border-indigo-300 shadow-lg shadow-indigo-500/5'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
                    <Code2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>CODE</h3>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>First-Class Developer Environment</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Skip hours of manual setup. ASHX OS ships with complete development toolchains for Rust, Python, Go, Node.js, C++, and Docker, paired with a GPU-accelerated lightning fast terminal.
                </p>
                <div className="space-y-2.5">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                    <span>Pre-configured Neovim, VSCode, and Git integration</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                    <span>Rootless Docker & Podman containers out of the box</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                    <span>Instant dev-container spinup and local LLM runtime</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: CREATE */}
              <div className={`p-8 rounded-3xl border transition-all relative overflow-hidden group ${
                isDark 
                  ? 'bg-slate-950/80 border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                  : 'bg-white/90 backdrop-blur-md border-amber-200/80 hover:border-amber-300 shadow-lg shadow-amber-500/5'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                    <Palette className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>CREATE</h3>
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Studio Video & 3D Suite</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Experience seamless GPU rendering without crashes. Optimized for DaVinci Resolve Studio, Blender, Krita, and OBS Studio with direct hardware encoding (NVENC / QuickSync / VA-API).
                </p>
                <div className="space-y-2.5">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Real-time 4K/8K timeline playback with zero frame drops</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Color-calibrated DCI-P3 & sRGB Wayland color management</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Professional audio jack & pipewire DAW support</span>
                  </div>
                </div>
              </div>

              {/* Pillar 4: DEPLOY */}
              <div className={`p-8 rounded-3xl border transition-all relative overflow-hidden group ${
                isDark 
                  ? 'bg-slate-950/80 border-teal-500/30 hover:border-teal-500/60 shadow-[0_0_30px_rgba(20,184,166,0.1)]' 
                  : 'bg-white/90 backdrop-blur-md border-teal-200/80 hover:border-teal-300 shadow-lg shadow-teal-500/5'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                    <Server className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>DEPLOY</h3>
                    <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">Cloud-Native & Edge Server</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Seamlessly transition from local development to production servers. Includes instant K3s Kubernetes clustering, Firecracker microVMs, and automated system rollback snapshots.
                </p>
                <div className="space-y-2.5">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span>Immutable root filesystem with Btrfs instant rollback</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span>Zero-trust cryptographic security & memory isolation</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span>Native cloud sync with AWS, GCP, Azure & Amit Solution Hub Cloud</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ================= SYSTEM REQUIREMENTS ================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              Compatibility
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System Specifications
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              ASHX OS is hyper-optimized to breathe new life into older hardware while harnessing the full horsepower of next-gen flagship rigs.
            </p>
          </div>

          <div className={`overflow-x-auto rounded-3xl border ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/90 shadow-md'
          } backdrop-blur-md`}>
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className={`uppercase text-[11px] font-black tracking-wider border-b ${
                isDark ? 'bg-slate-950/80 text-cyan-400 border-slate-800' : 'bg-slate-50/90 text-indigo-700 border-slate-200'
              }`}>
                <tr>
                  <th className="p-4 sm:p-5">Hardware Component</th>
                  <th className="p-4 sm:p-5">Minimum Requirements</th>
                  <th className="p-4 sm:p-5">Recommended Specs</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200/80 text-slate-600'}`}>
                {specs.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-white/5 transition-colors">
                    <td className={`p-4 sm:p-5 font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <Cpu className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                      {item.component}
                    </td>
                    <td className="p-4 sm:p-5">{item.minimum}</td>
                    <td className={`p-4 sm:p-5 font-semibold ${isDark ? 'text-cyan-300' : 'text-indigo-700'}`}>{item.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= VIP BETA REGISTRATION FORM ================= */}
        <section className="py-20 border-t border-slate-200/60 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${
              isDark ? 'bg-amber-500/10 border border-amber-400/40 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>LIMITED EARLY ACCESS WAITLIST</span>
            </div>

            <h2 className={`text-3xl sm:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Get Early ISO Download Access
            </h2>
            <p className={`mt-4 text-sm sm:text-base max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Join thousands of developers, gamers, and Linux enthusiasts. Receive private Beta release candidate links, direct community Discord invites, and installation guides.
            </p>

            <div className={`mt-8 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
              isDark ? 'bg-slate-900/80 border-cyan-500/30 shadow-2xl' : 'bg-white/90 border-slate-200 shadow-xl'
            }`}>
              {isSubscribed ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>You're on the VIP List!</h3>
                  <p className={`text-sm max-w-md ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Thank you! We have registered your email. You will receive an exclusive download link when the Beta drops in December 2026.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address (e.g. name@domain.com)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`flex-1 text-sm px-4 py-3 rounded-2xl outline-none border ${
                        isDark 
                          ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400' 
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                      }`}
                    />
                    <select
                      value={systemType}
                      onChange={(e) => setSystemType(e.target.value)}
                      className={`text-sm px-4 py-3 rounded-2xl outline-none border ${
                        isDark 
                          ? 'bg-slate-950 border-slate-700 text-white focus:border-cyan-400' 
                          : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                      }`}
                    >
                      <option value="Desktop">Gaming / Workstation PC</option>
                      <option value="Laptop">Developer Laptop</option>
                      <option value="Server">HomeLab / Cloud Server</option>
                      <option value="Handheld">Steam Deck / Handheld</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      isDark 
                        ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-cyan-500/30' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                    }`}
                  >
                    <span>Reserve My Early Access Seat</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No spam ever. 100% privacy guaranteed by Amit Solution Hub.
                  </p>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* ================= FAQ ACCORDION ================= */}
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="text-center mb-12">
            <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              Questions & Answers
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white/90 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-indigo-50/30 dark:hover:bg-white/5 transition-colors"
                >
                  <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className={`px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-4 ${
                    isDark ? 'border-slate-800/60 text-slate-300' : 'border-slate-100 text-slate-600'
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Return Button */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              <span>← Back to Amit Solution Hub Home</span>
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  )
}
