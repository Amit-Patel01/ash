'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SEO from '../components/SEO'

const WebService = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const features = [
    { title: 'Full-Stack Applications', description: 'End-to-end web apps built using modern tech stacks like MERN & PostgreSQL.', icon: '⚡' },
    { title: 'Responsive Design', description: 'Pixel-perfect UI that works flawlessly on mobile, tablet, and desktop screens.', icon: '📱' },
    { title: 'SEO Optimized Code', description: 'Clean, semantic architecture to ensure your brand ranks high on search engines.', icon: '🔍' },
    { title: 'E-Commerce Solutions', description: 'Scalable digital stores with highly secure integrated payment gateways.', icon: '🛒' },
  ]

  return (
    <>
      <SEO title="Web Development Services | AmitSolutionHub" 
           description="Premium custom web development services and comprehensive Web Development Courses offered by AmitSolutionHub." />
      
      <div className="pt-[140px] md:pt-[180px] pb-20 min-h-screen relative">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.6)]"></span>
              <span className="text-blue-700 font-bold text-sm tracking-wide">Elite Digital Solutions</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Web Design & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Development</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From sophisticated landing pages to highly complex enterprise SaaS platforms, we architect digital experiences that scale.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {features.map((f, i) => (
              <div key={i} className="group bg-white/40 backdrop-blur-2xl p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/60 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl rounded-2xl mb-6 shadow-md transform group-hover:scale-110 transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{f.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Learn Web Development Banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl mb-12 border border-white/10 transform hover:scale-[1.01] transition-all duration-500">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full mb-4">
                  <span className="text-indigo-300 font-bold text-xs">🎓 AmitSolutionHub Academy</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Want to learn Web Development yourself?</h2>
                <p className="text-indigo-200 text-lg mb-0 leading-relaxed">
                  We don't just build websites; we teach you how to build them. Check out our comprehensive hands-on courses covering frontend, backend, and full-stack development from basic to advanced levels.
                </p>
              </div>
              <Link href="/courses" className="flex-shrink-0 group relative overflow-hidden bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center gap-3">
                <span className="relative z-10">Explore Courses</span>
                <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Need Custom Project Banner */}
          <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 text-center relative overflow-hidden shadow-xl border border-white/80">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Looking to hire us for a project?</h2>
            <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto font-medium">
              We provide dedicated engineering teams and freelancers to bring your vision to life. Let's discuss your requirements!
            </p>
            <Link href="/custom-project" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Start a Conversation
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default WebService
