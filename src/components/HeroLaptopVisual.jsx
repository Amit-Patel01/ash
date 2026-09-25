'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Code, Cpu, Cloud, Database, ShieldCheck,
  Check, Terminal, Layers, Sparkles
} from 'lucide-react'

export default function HeroLaptopVisual() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState('pipeline.ts')

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none py-6 px-2 sm:px-4"
      style={{ perspective: '1400px' }}
    >
      <style>{`
        @keyframes laptopFloat {
          0%, 100% {
            transform: translateY(0px) rotateX(10deg) rotateY(-8deg) rotateZ(1deg);
          }
          50% {
            transform: translateY(-12px) rotateX(8deg) rotateY(-5deg) rotateZ(0deg);
          }
        }

        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(-1.5deg); }
        }
        @keyframes floatSlow3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes cursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @keyframes codeShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .laptop-chassis {
          animation: laptopFloat 6.5s ease-in-out infinite;
          transform-style: preserve-3d;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .cursor-blink {
          animation: cursorBlink 1s infinite;
        }

        .float-node-1 { animation: floatSlow1 5s ease-in-out infinite; }
        .float-node-2 { animation: floatSlow2 6s ease-in-out infinite 0.8s; }
        .float-node-3 { animation: floatSlow1 5.5s ease-in-out infinite 1.5s; }
        .float-node-4 { animation: floatSlow2 6.5s ease-in-out infinite 2s; }
        .float-node-5 { animation: floatSlow3 5s ease-in-out infinite 2.5s; }

        @media (prefers-reduced-motion: reduce) {
          .laptop-chassis, .float-node-1, .float-node-2, .float-node-3, .float-node-4, .float-node-5 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ── Soft Ambient Purple / Blue Glow behind laptop ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[320px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/18 to-sky-400/18 blur-3xl pointer-events-none" />

      {/* ── Floating Tech Badges (5 Domains) ── */}

      {/* 1. AI Engine (Top Right) */}
      <div className="float-node-1 absolute -top-1 sm:top-1 right-2 sm:right-6 z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/60 shadow-lg shadow-indigo-500/10 text-slate-800 dark:text-slate-200">
          <div className="w-6 h-6 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-none">
            <span className="text-[11px] font-bold block">AI Engine</span>
            <span className="text-[9px] font-medium text-purple-500">LLM & ML Systems</span>
          </div>
        </div>
      </div>

      {/* 2. Cloud Architecture (Top Left) */}
      <div className="float-node-2 absolute top-4 sm:top-6 -left-2 sm:left-2 z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100 dark:border-sky-900/60 shadow-lg shadow-sky-500/10 text-slate-800 dark:text-slate-200">
          <div className="w-6 h-6 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600">
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-none">
            <span className="text-[11px] font-bold block">Cloud & DevOps</span>
            <span className="text-[9px] font-medium text-sky-500">Auto-Scaling</span>
          </div>
        </div>
      </div>

      {/* 3. Zero-Trust Security (Bottom Left) */}
      <div className="float-node-3 absolute -bottom-3 sm:bottom-2 -left-1 sm:left-4 z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-emerald-100 dark:border-emerald-900/60 shadow-lg shadow-emerald-500/10 text-slate-800 dark:text-slate-200">
          <div className="w-6 h-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-none">
            <span className="text-[11px] font-bold block">Cyber Security</span>
            <span className="text-[9px] font-medium text-emerald-600">Zero-Trust Guard</span>
          </div>
        </div>
      </div>

      {/* 4. Distributed Database (Bottom Right) */}
      <div className="float-node-4 absolute -bottom-4 sm:bottom-3 right-0 sm:right-6 z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/60 shadow-lg shadow-indigo-500/10 text-slate-800 dark:text-slate-200">
          <div className="w-6 h-6 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div className="text-left leading-none">
            <span className="text-[11px] font-bold block">Data Storage</span>
            <span className="text-[9px] font-medium text-indigo-600">Distributed NoSQL</span>
          </div>
        </div>
      </div>

      {/* ── Small Animated "System Verified ✓" Pill ── */}
      <div className="float-node-5 absolute top-20 sm:top-24 -right-1 sm:right-1 z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider">System Verified ✓</span>
        </div>
      </div>

      {/* ── Main 3D Laptop Device Chassis ── */}
      <div
        className="laptop-chassis relative mx-auto w-[92%] sm:w-[460px] lg:w-[480px]"
        style={{
          transform: `translateY(${mousePos.y * -14}px) rotateX(${10 - mousePos.y * 14}deg) rotateY(${-8 + mousePos.x * 16}deg) rotateZ(1deg)`,
        }}
      >

        {/* ── LAPTOP SCREEN / LID ── */}
        <div className="relative rounded-[22px] p-2.5 sm:p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl shadow-slate-950/40">
          
          {/* Top Notch / Camera Bezel */}
          <div className="flex items-center justify-center pb-1">
            <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-sky-400 opacity-60" />
            </div>
          </div>

          {/* Screen Display Area: Realistic Software Development Code Editor */}
          <div className="relative rounded-xl bg-[#0B0F19] text-slate-200 overflow-hidden border border-slate-800/90 shadow-inner font-mono text-[11px] leading-relaxed">

            {/* Window Titlebar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800/80 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 border border-slate-800 font-sans text-[10.5px] font-semibold">
                  <span className="text-sky-400 font-mono font-bold">&lt;/&gt;</span>
                  <span>AshnexaApp.tsx</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-500 font-sans text-[10.5px]">
                  <span>server.ts</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Live Deploy</span>
              </div>
            </div>

            {/* Code Body Area */}
            <div className="p-3 sm:p-4 bg-[#090D16] space-y-1 overflow-hidden relative min-h-[170px] sm:min-h-[190px]">
              
              {/* Subtle Shimmer Light Sweep across screen */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  animation: 'codeShimmer 8s linear infinite'
                }}
              />

              {/* Code Line 1 */}
              <div className="flex items-start gap-3">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">1</span>
                <p className="text-slate-400">
                  <span className="text-indigo-400 font-semibold">import</span> {'{'} <span className="text-sky-300">createEngine</span>, <span className="text-sky-300">verifySystem</span> {'}'} <span className="text-indigo-400 font-semibold">from</span> <span className="text-amber-300">'@ashnexa/core'</span>
                </p>
              </div>

              {/* Code Line 2 */}
              <div className="flex items-start gap-3">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">2</span>
                <p className="text-slate-500 italic">// Production Enterprise Cloud Architecture</p>
              </div>

              {/* Code Line 3 */}
              <div className="flex items-start gap-3">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">3</span>
                <p>
                  <span className="text-indigo-400 font-semibold">export async function</span> <span className="text-blue-400 font-bold">deployInfrastructure</span>() {'{'}
                </p>
              </div>

              {/* Code Line 4 */}
              <div className="flex items-start gap-3 pl-4">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">4</span>
                <p>
                  <span className="text-purple-400">const</span> <span className="text-slate-200">platform</span> = <span className="text-indigo-400">await</span> <span className="text-blue-400">createEngine</span>({'{'}
                </p>
              </div>

              {/* Code Line 5 */}
              <div className="flex items-start gap-3 pl-8">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">5</span>
                <p>
                  <span className="text-sky-300">security</span>: <span className="text-amber-300">'Zero-Trust-TLS'</span>,
                </p>
              </div>

              {/* Code Line 6 */}
              <div className="flex items-start gap-3 pl-8">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">6</span>
                <p>
                  <span className="text-sky-300">credentials</span>: <span className="text-amber-300">'Verified-QR'</span>,
                </p>
              </div>

              {/* Code Line 7 */}
              <div className="flex items-start gap-3 pl-8">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">7</span>
                <p className="flex items-center">
                  <span className="text-sky-300">status</span>: <span className="text-emerald-400 font-semibold">'100% Operational'</span>
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-1.5 cursor-blink" />
                </p>
              </div>

              {/* Code Line 8 */}
              <div className="flex items-start gap-3 pl-4">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">8</span>
                <p>{'})'}</p>
              </div>

              {/* Code Line 9 */}
              <div className="flex items-start gap-3">
                <span className="text-slate-600 select-none text-[10px] w-4 text-right">9</span>
                <p>{'}'}</p>
              </div>

            </div>

            {/* Editor Bottom Status Strip */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#050811] border-t border-slate-800/80 text-[9.5px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">ASHNEXA-IDE</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-2.5 h-2.5" /> Ready
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>TypeScript</span>
                <span>UTF-8</span>
                <span>Port: 3000</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── LAPTOP LOWER DECK & HINGE ── */}
        <div className="relative -mt-0.5 mx-auto w-full">
          {/* Hinge */}
          <div className="w-28 h-2.5 mx-auto bg-gradient-to-b from-slate-900 to-slate-800 rounded-b-md shadow-md border-x border-b border-slate-700/60" />
          
          {/* Base Chassis Deck */}
          <div className="relative -mt-1 h-3.5 sm:h-4 w-full rounded-b-2xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-t border-slate-600/80 border-b border-slate-950 shadow-xl shadow-slate-950/60 flex items-center justify-center">
            {/* Front Lip Opening Notch */}
            <div className="w-14 h-1 rounded-full bg-slate-950/80 border-t border-slate-700/60" />
          </div>
        </div>

        {/* ── Perspective Drop Floor Shadow ── */}
        <div className="w-[85%] h-5 mx-auto rounded-full bg-indigo-950/20 blur-xl -mt-1" />

      </div>

    </div>
  )
}
