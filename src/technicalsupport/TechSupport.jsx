'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SEO from '../components/SEO'

const TechSupport = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const supportTypes = [
    { title: '24/7 Priority Support', description: 'Round-the-clock assistance for critical technical emergencies.', icon: '🕒' },
    { title: 'Remote Consultation', description: 'Expert guidance on software selection, system architecture, and security.', icon: '🛡️' },
    { title: 'Network Setup', description: 'Assistance with office or home network configuration and security.', icon: '🌐' },
    { title: 'Custom Tech Guidance', description: 'Personalized training sessions on how to master your tools and workflow.', icon: '💡' },
  ]

  return (
    <>
      <SEO title="Technical Support | Ashnexa Systems" 
           description="24/7 technical support, remote consultation, and network setup services." />
      
      <div className="pt-[140px] md:pt-[180px] pb-20 min-h-screen relative">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full mb-6 relative">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span>
              <span className="text-amber-700 font-bold text-sm tracking-wide">IT Solutions & Consulting</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Support</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Your partner in solving technical challenges and navigating the digital world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {supportTypes.map((s, i) => (
              <div key={i} className="group bg-white/40 backdrop-blur-2xl p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/60 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-400 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl rounded-2xl mb-6 shadow-md transform group-hover:scale-110 transition-all duration-300">
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{s.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 text-center relative overflow-hidden shadow-xl border border-white/80">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Need expert advice?</h2>
            <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Skip the frustration and talk to a professional today. Request emergency support or book an upcoming consultation.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Get Support Now
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

export default TechSupport
