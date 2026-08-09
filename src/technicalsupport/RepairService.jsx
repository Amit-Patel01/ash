'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SEO from '../components/SEO'

const RepairService = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const services = [
    { title: 'Hardware Repair', description: 'Screen replacement, keyboard fixing, battery upgrades, and internal cleaning.', icon: '🔧' },
    { title: 'Software Troubleshooting', description: 'OS installation, virus removal, driver updates, and performance tuning.', icon: '💻' },
    { title: 'Data Recovery', description: 'Safe extraction of lost data from damaged hard drives and SSDs.', icon: '💾' },
    { title: 'Upgrades & Optimization', description: 'RAM and SSD upgrades to make your old laptop run like new.', icon: '🚀' },
  ]

  return (
    <>
      <SEO title="PC & Laptop Repair | AmitSolutionHub" 
           description="Fast, reliable, and affordable computer repair and optimization services." />
      
      <div className="pt-[140px] md:pt-[180px] pb-20 min-h-screen relative">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full mb-6 relative">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.6)]"></span>
              <span className="text-indigo-700 font-bold text-sm tracking-wide">Expert Technical Service</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              PC & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Laptop Repair</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Fast, reliable, and affordable computer repair services by expert technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {services.map((s, i) => (
              <div key={i} className="group bg-white/40 backdrop-blur-2xl p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/60 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl rounded-2xl mb-6 shadow-md transform group-hover:scale-110 transition-all duration-300">
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{s.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 text-center relative overflow-hidden shadow-xl border border-white/80">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Device giving you trouble?</h2>
            <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Bring it to us or request a remote diagnostic session to get things running smoothly again.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-indigo-700 hover:to-violet-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Book a Repair
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}

export default RepairService
