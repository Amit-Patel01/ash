'use client'
import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Code, Cpu, Cloud, Database, ShieldCheck,
  Check, CheckCircle2, Terminal, Layers, Sparkles,
  Server, MessageSquare, Headphones, Award, QrCode,
  GraduationCap, ArrowRight, Zap
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   SHARED ROBOT AVATAR SVG (Identical proportions, colors, face)
   Actions change: Arms, props, holograms, head accessories
   ───────────────────────────────────────────────────────────── */
export function RobotBaseGraphic({
  action = 'hero-coding',
  mousePos = { x: 0, y: 0 },
}) {
  const isCoding = action === 'hero-coding'
  const isArchitecture = action === 'projects-architecture'
  const isMentor = action === 'programs-mentor'
  const isCloud = action === 'services-cloud'
  const isShield = action === 'why-us-shield'
  const isScanner = action === 'certificate-scanner'
  const isSupport = action === 'contact-support'

  return (
    <svg
      viewBox="0 0 340 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-[0_15px_35px_rgba(79,70,229,0.18)]"
      style={{
        transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 10}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="bodyArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <linearGradient id="bodyJointGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        <linearGradient id="visorGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B0F19" />
          <stop offset="70%" stopColor="#030712" />
          <stop offset="100%" stopColor="#0B1329" />
        </linearGradient>

        <linearGradient id="ashCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        <linearGradient id="eyeGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        <linearGradient id="repulsorGlow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="softLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── 1. Anti-Gravity Repulsor / Hover Thruster Cone ── */}
      <g className="hover-thrust">
        <polygon points="148,310 192,310 212,365 128,365" fill="url(#repulsorGlow)" opacity="0.65" />
        <ellipse cx="170" cy="365" rx="42" ry="8" fill="#38BDF8" opacity="0.25" filter="url(#glowFilter)" />
      </g>

      {/* ── 2. Lower Pelvis & Anti-Gravity Base ── */}
      <g id="robot-pelvis">
        <path d="M142 278 Q170 290 198 278 L194 308 Q170 316 146 308 Z" fill="url(#bodyJointGrad)" stroke="#475569" strokeWidth="1.5" />
        {/* Thruster Ring */}
        <ellipse cx="170" cy="308" rx="22" ry="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" filter="url(#glowFilter)" />
      </g>

      {/* ── 3. Robot Torso / Chest Plate ── */}
      <g id="robot-torso">
        {/* Main Chest Armor Plate */}
        <path
          d="M130 178 C130 172 135 168 141 168 L199 168 C205 168 210 172 210 178 L206 265 C206 273 199 280 191 280 L149 280 C141 280 134 273 134 265 Z"
          fill="url(#bodyArmorGrad)"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Dark Carbon Neck Joint */}
        <path d="M152 148 L188 148 L184 168 L156 168 Z" fill="url(#bodyJointGrad)" stroke="#475569" strokeWidth="1" />

        {/* Chest Accent Grooves */}
        <path d="M142 195 L198 195" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M148 250 L192 250" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Glowing Ashnexa Core (Chest Reactor) */}
        <circle cx="170" cy="222" r="14" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
        <circle cx="170" cy="222" r="9" fill="url(#ashCoreGrad)" filter="url(#glowFilter)">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        {/* Core Inner Emblem "A" */}
        <path d="M166 226 L170 217 L174 226 M167 223 L173 223" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ── 4. Robot Head & Face (Visor, Eyes, Antenna) ── */}
      <g id="robot-head">
        {/* Head Shell */}
        <rect
          x="125"
          y="68"
          width="90"
          height="80"
          rx="32"
          fill="url(#bodyArmorGrad)"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Glossy Dark Visor */}
        <rect
          x="133"
          y="82"
          width="74"
          height="46"
          rx="18"
          fill="url(#visorGlassGrad)"
          stroke="#1E293B"
          strokeWidth="1.5"
        />

        {/* Visor Glare Reflection */}
        <path d="M142 86 C155 86 185 86 198 86 C194 92 188 95 180 95 L148 95 Z" fill="#FFFFFF" opacity="0.12" />

        {/* Glowing Digital Eye Optics (Twin Curved Friendly Eyes) */}
        <g id="robot-eyes">
          {/* Left Eye */}
          <ellipse cx="154" cy="105" rx="8" ry="7" fill="url(#eyeGlowGrad)" filter="url(#glowFilter)">
            <animate attributeName="ry" values="7;7;1;7;7" keyTimes="0;0.45;0.5;0.55;1" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="156" cy="103" r="2.2" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="186" cy="105" rx="8" ry="7" fill="url(#eyeGlowGrad)" filter="url(#glowFilter)">
            <animate attributeName="ry" values="7;7;1;7;7" keyTimes="0;0.45;0.5;0.55;1" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="188" cy="103" r="2.2" fill="#FFFFFF" />
        </g>

        {/* Side Ear Pods (Sensors) */}
        {/* Left Ear */}
        <rect x="117" y="93" width="9" height="24" rx="4.5" fill="url(#bodyJointGrad)" stroke="#475569" strokeWidth="1" />
        <circle cx="121.5" cy="105" r="2" fill="#38BDF8" filter="url(#glowFilter)" />
        {/* Right Ear */}
        <rect x="214" y="93" width="9" height="24" rx="4.5" fill="url(#bodyJointGrad)" stroke="#475569" strokeWidth="1" />
        <circle cx="218.5" cy="105" r="2" fill="#818CF8" filter="url(#glowFilter)" />

        {/* Top Antenna / Sensor Crown */}
        <rect x="168" y="48" width="4" height="20" rx="2" fill="url(#bodyJointGrad)" />
        <circle cx="170" cy="46" r="6" fill="url(#ashCoreGrad)" filter="url(#glowFilter)">
          <animate attributeName="r" values="5.5;6.5;5.5" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Headset Accessory for Support action */}
        {isSupport && (
          <g id="support-headset">
            {/* Headset Band across top of head */}
            <path d="M123 92 C123 60 217 60 217 92" stroke="#4F46E5" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#glowFilter)" />
            {/* Ear Cushion Left */}
            <rect x="114" y="88" width="8" height="26" rx="4" fill="#312E81" stroke="#6366F1" strokeWidth="1" />
            {/* Boom Microphone */}
            <path d="M120 108 Q126 130 148 132" stroke="#6366F1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="150" cy="132" r="3" fill="#38BDF8" filter="url(#glowFilter)" />
          </g>
        )}
      </g>

      {/* ── 5. Shoulders ── */}
      <circle cx="124" cy="184" r="12" fill="url(#bodyJointGrad)" stroke="#475569" strokeWidth="1.5" />
      <circle cx="216" cy="184" r="12" fill="url(#bodyJointGrad)" stroke="#475569" strokeWidth="1.5" />

      {/* ── 6. DYNAMIC ACTION-SPECIFIC ARMS & PROPS ── */}

      {/* ── ACTION A: HERO CODING ── */}
      {isCoding && (
        <g id="pose-coding">
          {/* Left Arm: Resting poised */}
          <path d="M120 188 Q96 220 102 250" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="102" cy="254" r="6" fill="url(#bodyJointGrad)" />

          {/* Right Arm: Extended towards laptop with coding beam */}
          <path d="M220 188 Q248 215 258 245" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="260" cy="248" r="6" fill="url(#bodyJointGrad)" />
          {/* Extended robotic fingers emitting code beam */}
          <path d="M260 248 L272 260" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <path d="M263 246 L278 255" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          {/* Glowing laser/spark at finger tip */}
          <circle cx="280" cy="256" r="4" fill="#38BDF8" filter="url(#softLaserGlow)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="0.8s" repeatCount="indefinite" />
          </circle>
          {/* Digital code stream beam from finger to screen */}
          <path d="M280 256 Q295 264 300 280" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8">
            <animate attributeName="strokeDashoffset" values="0;12" dur="0.6s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {/* ── ACTION B: PROJECTS ARCHITECTURE ── */}
      {isArchitecture && (
        <g id="pose-architecture">
          {/* Left Arm: Holding digital tablet/pad */}
          <path d="M120 188 Q90 220 106 244" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Right Arm: Pointing / interacting with 3D diagram */}
          <path d="M220 188 Q250 200 246 226" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="246" cy="228" r="5" fill="#38BDF8" filter="url(#glowFilter)" />
          {/* Holographic pointer ray */}
          <path d="M246 228 L270 200" stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 2" filter="url(#glowFilter)" />
        </g>
      )}

      {/* ── ACTION C: PROGRAMS MENTOR ── */}
      {isMentor && (
        <g id="pose-mentor">
          {/* Left Arm: Holding holographic curriculum ledger */}
          <path d="M120 188 Q88 220 102 248" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Right Arm: Gesturing forward teaching */}
          <path d="M220 188 Q250 210 244 235" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Stylus pointer */}
          <line x1="244" y1="235" x2="265" y2="215" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="266" cy="214" r="3.5" fill="#EC4899" filter="url(#glowFilter)" />
        </g>
      )}

      {/* ── ACTION D: SERVICES CLOUD OPS ── */}
      {isCloud && (
        <g id="pose-cloud">
          {/* Left Arm: Tuning server node */}
          <path d="M120 188 Q92 210 85 235" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="85" cy="236" r="4.5" fill="#38BDF8" filter="url(#glowFilter)" />
          {/* Right Arm: Managing cloud pipeline */}
          <path d="M220 188 Q248 210 255 235" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="255" cy="236" r="4.5" fill="#818CF8" filter="url(#glowFilter)" />
        </g>
      )}

      {/* ── ACTION E: WHY US DIGITAL SHIELD ── */}
      {isShield && (
        <g id="pose-shield">
          {/* Left Arm: Holding the glowing shield forward */}
          <path d="M120 188 Q90 200 80 230" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Right Arm: Poised at side supporting */}
          <path d="M220 188 Q240 220 232 250" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* ── ACTION F: CERTIFICATE SCANNER ── */}
      {isScanner && (
        <g id="pose-scanner">
          {/* Left Arm: Holding certificate document tray */}
          <path d="M120 188 Q90 225 106 255" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Right Arm: Holding optical laser scanner */}
          <path d="M220 188 Q250 205 238 238" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Futuristic Handheld Scanner Device */}
          <rect x="230" y="234" width="22" height="12" rx="4" fill="#0F172A" stroke="#818CF8" strokeWidth="1.5" />
          <circle cx="248" cy="240" r="2.5" fill="#10B981" filter="url(#glowFilter)" />
          {/* Projecting Emerald Laser Fan */}
          <polygon points="248,242 210,290 290,290" fill="url(#repulsorGlow)" opacity="0.35" />
          <line x1="205" y1="290" x2="295" y2="290" stroke="#10B981" strokeWidth="2.5" filter="url(#glowFilter)">
            <animate attributeName="y1" values="280;305;280" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y2" values="280;305;280" dur="2s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* ── ACTION G: CONTACT SUPPORT ── */}
      {isSupport && (
        <g id="pose-support">
          {/* Left Arm: Resting gently on support desk */}
          <path d="M120 188 Q90 215 95 248" stroke="url(#bodyArmorGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Right Arm: Finger touching headset receiver */}
          <path d="M220 188 Q242 165 224 112" stroke="url(#bodyArmorGrad)" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="224" cy="110" r="5" fill="#6366F1" filter="url(#glowFilter)" />
        </g>
      )}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN ROBOT COMPONENT WITH SCENARIOS / SURROUNDING ENVIRONMENT
   ───────────────────────────────────────────────────────────── */
export default function AshnexaRobot({
  action = 'hero-coding',
  className = '',
  badgeTitle = '',
  badgeSubtitle = '',
}) {
  const containerRef = useRef(null)
  const isHero = action === 'hero-coding'
  const inView = useInView(containerRef, { once: false, margin: '120px 0px' })
  const shouldAnimate = isHero || inView

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full select-none ${className}`}
      style={{ perspective: '1200px' }}
    >
      <style>{`
        @keyframes robotHover {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatSubtle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.05); }
        }
        @keyframes scanSweep {
          0%, 100% { top: 10%; opacity: 0.2; }
          50% { top: 85%; opacity: 0.9; }
        }
        .robot-hover-anim {
          animation: robotHover 6s ease-in-out infinite;
          animation-play-state: ${shouldAnimate ? 'running' : 'paused'};
        }
        .float-badge {
          animation: floatSubtle 5s ease-in-out infinite;
          animation-play-state: ${shouldAnimate ? 'running' : 'paused'};
        }
        .glow-pulse {
          animation: pulseGlow 4s ease-in-out infinite;
          animation-play-state: ${shouldAnimate ? 'running' : 'paused'};
        }
        @media (prefers-reduced-motion: reduce) {
          .robot-hover-anim, .float-badge, .glow-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Soft Ambient Purple / Blue Glow behind Robot ── */}
      <div className="glow-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-sky-400/20 blur-3xl pointer-events-none" />

      {/* ── RENDER SPECIFIC SECTION ACTION PROPS ── */}

      {/* ──────── 1. HERO CODING ROBOT + LAPTOP ──────── */}
      {action === 'hero-coding' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Laptop beside Robot */}
            <div className="absolute -bottom-4 -right-4 sm:-right-8 w-56 sm:w-64 bg-slate-950 rounded-2xl p-2 border border-slate-700 shadow-2xl shadow-indigo-950/40 transform rotate-[-6deg]">
              {/* Laptop screen */}
              <div className="rounded-xl bg-[#090D16] p-2.5 font-mono text-[10px] text-slate-300 border border-slate-800 space-y-1 overflow-hidden">
                <div className="flex items-center gap-1 mb-1 pb-1 border-b border-slate-800 text-[9px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-red-400/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-1 text-slate-400 font-sans font-bold">Ashnexa.tsx</span>
                </div>
                <p><span className="text-indigo-400 font-semibold">const</span> app = <span className="text-sky-300">createSystem</span>()</p>
                <p className="text-slate-500">// Deploying cloud nodes...</p>
                <p className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span>✓ 100% Operational</span>
                  <span className="w-1.5 h-3 bg-indigo-400 animate-pulse" />
                </p>
              </div>
              {/* Laptop base */}
              <div className="h-2 w-full bg-slate-800 rounded-b-lg mt-1" />
            </div>

            {/* Floating Tech Badges */}
            <div className="float-badge absolute -top-3 -left-2 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-100 dark:border-indigo-900/70 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Engine</span>
            </div>
            <div className="float-badge absolute top-12 -right-3 sm:-right-6 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-100 dark:border-sky-900/70 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2" style={{ animationDelay: '1.2s' }}>
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              <span>Cloud & DevOps</span>
            </div>
            <div className="float-badge absolute top-36 -left-4 z-20 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ animationDelay: '2s' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>System Verified ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────── 2. PROJECTS: 3D ARCHITECTURE ANALYZER ──────── */}
      {action === 'projects-architecture' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Floating 3D Architecture Diagram */}
            <div className="absolute top-10 -right-2 sm:-right-6 z-20 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-100 dark:border-indigo-900/70 shadow-xl space-y-2 w-48 text-[10px]">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="flex items-center gap-1 text-indigo-600"><Layers className="w-3 h-3" /> Architecture</span>
                <span className="text-[9px] text-emerald-600 font-mono">LIVE</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 flex items-center justify-between font-mono">
                  <span>API Gateway</span>
                  <span className="text-emerald-500 font-bold">200 OK</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 flex items-center justify-between font-mono">
                  <span>Microservices</span>
                  <span className="text-sky-500 font-bold">4 Nodes</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 flex items-center justify-between font-mono">
                  <span>PostgreSQL DB</span>
                  <span className="text-purple-500 font-bold">Synced</span>
                </div>
              </div>
            </div>

            {/* Floating Code badge */}
            <div className="float-badge absolute bottom-6 -left-3 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 shadow-lg text-xs font-bold text-slate-700 flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full-Stack Graph</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────── 3. PROGRAMS: MENTOR ROBOT + HOLOGRAM ──────── */}
      {action === 'programs-mentor' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Projected Holographic Student Figure & Module */}
            <div className="absolute top-8 -right-2 sm:-right-8 z-20 p-3.5 rounded-2xl bg-gradient-to-br from-white/95 via-indigo-50/90 to-purple-50/95 dark:from-slate-900/95 dark:to-indigo-950/90 backdrop-blur-md border border-indigo-200 dark:border-indigo-800/80 shadow-2xl w-52 space-y-2.5">
              {/* Hologram Header */}
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">AI Mentor Session</p>
                    <p className="text-[9px] text-indigo-600 font-semibold">1-on-1 Guidance</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                  HOLOGRAM
                </span>
              </div>

              {/* Student Hologram Wireframe Avatar */}
              <div className="p-2 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400/30 to-indigo-600/30 border border-indigo-300 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
                <div className="text-[10px] space-y-0.5 flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Active Learner</p>
                  <p className="text-emerald-600 text-[9px] font-semibold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Reviewing Architecture
                  </p>
                </div>
              </div>

              {/* Milestone Progress */}
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-[9px]">
                  <span>Curriculum Progress</span>
                  <span className="text-indigo-600 font-mono">92%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 w-[92%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating Learning Badges */}
            <div className="float-badge absolute bottom-4 -left-3 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Verified Certificate</span>
            </div>
            <div className="float-badge absolute -top-2 -left-2 z-20 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center gap-1" style={{ animationDelay: '1.5s' }}>
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Interactive Labs</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────── 4. SERVICES: CLOUD SERVERS & DEVOPS ──────── */}
      {action === 'services-cloud' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Holographic Cloud Server Console with Data Streams */}
            <div className="absolute top-10 -right-3 sm:-right-8 z-20 p-3.5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-2xl w-52 space-y-2 text-[10px] font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-sans font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Server className="w-3.5 h-3.5" /> Cloud Cluster
                </span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
              <div className="space-y-1.5 text-[9px]">
                <div className="flex justify-between text-slate-400">
                  <span>Containers:</span>
                  <span className="text-emerald-400 font-bold">16 Kubernetes Pods</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>API Response:</span>
                  <span className="text-sky-300 font-bold">14ms latency</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>DevOps CI/CD:</span>
                  <span className="text-indigo-400 font-bold">Auto-Deploy ✓</span>
                </div>
              </div>

              {/* Data stream line visual */}
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 animate-pulse w-full" />
              </div>
            </div>

            {/* Floating Server & DevOps Badges */}
            <div className="float-badge absolute bottom-4 -left-3 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-100 shadow-md text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              <span>AWS & Hybrid Cloud</span>
            </div>
            <div className="float-badge absolute -top-2 -left-2 z-20 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold flex items-center gap-1" style={{ animationDelay: '1s' }}>
              <Zap className="w-3 h-3 text-sky-600" />
              <span>99.99% Uptime</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────── 5. WHY US: GLOWING DIGITAL SHIELD ──────── */}
      {action === 'why-us-shield' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Large Glowing Digital Shield in front */}
            <div className="absolute bottom-6 -left-3 sm:-left-6 z-20 p-4 rounded-3xl bg-gradient-to-b from-white/95 via-indigo-50/90 to-white/95 dark:from-slate-900/95 dark:to-slate-950/95 backdrop-blur-xl border border-indigo-200 dark:border-indigo-800/80 shadow-2xl shadow-indigo-500/25 w-52 text-center space-y-2.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">Security & Reliability</p>
                <p className="text-[10px] text-slate-500 font-semibold">Verified Enterprise Standard</p>
              </div>
              <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Production Ready
              </div>
            </div>

            {/* Right Badge */}
            <div className="float-badge absolute top-16 -right-2 sm:-right-4 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Zero Downtime</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────── 6. CERTIFICATE: FUTURISTIC SCANNER ──────── */}
      {action === 'certificate-scanner' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Futuristic Scanned Certificate Pill Card */}
            <div className="absolute bottom-2 -left-2 sm:-left-6 z-20 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-emerald-200 dark:border-emerald-800/70 shadow-xl w-52 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" /> ID Verification
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  SCANNER ACTIVE
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-600">ASH-2026-8942</span>
                <span className="text-emerald-600 font-bold">Valid ✓</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Instant Online Confirmation</span>
              </div>
            </div>

            {/* Top Right Verified Floating Badge */}
            <div className="float-badge absolute top-10 -right-2 sm:-right-4 z-20 px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Verified ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────── 7. CONTACT / SUPPORT: HEADSET & CHAT BUBBLES ──────── */}
      {action === 'contact-support' && (
        <div className="robot-hover-anim relative flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto">
            <RobotBaseGraphic action={action} mousePos={mousePos} />

            {/* Futuristic Support Desk Surface underneath */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-64 h-3 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent rounded-full opacity-80" />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60 filter blur-xs" />

            {/* Floating Speech / Chat Bubble 1 */}
            <div className="float-badge absolute top-2 -right-3 sm:-right-6 z-20 p-2.5 px-3.5 rounded-2xl rounded-bl-sm bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 text-xs font-bold max-w-[190px]">
              How can we assist your tech journey today? 💬
            </div>

            {/* Floating Speech / Chat Bubble 2 at Support Desk */}
            <div className="float-badge absolute bottom-6 -left-3 sm:-left-6 z-20 p-2.5 px-3 rounded-2xl rounded-br-sm bg-white/95 dark:bg-slate-900/95 border border-slate-200 shadow-xl text-xs font-semibold text-slate-800 flex items-center gap-2" style={{ animationDelay: '1.5s' }}>
              <Headphones className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold">24/7 Support Desk</p>
                <p className="text-[9px] text-slate-400 font-medium">Response &lt; 15 mins</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
