'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import SEO from '../components/SEO'

const EditingService = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  const capabilities = [
    { title: 'Cinematic Video Editing', description: 'Professional editing for YouTube, short films, and social media content.', icon: '🎬' },
    { title: 'Photo Retouching', description: 'Advanced color grading, background removal, and high-end skin retouching.', icon: '📸' },
    { title: 'Motion Graphics', description: 'Eye-catching animations and transitions to elevate your visual storytelling.', icon: '✨' },
    { title: 'Brand Identity', description: 'Graphic design services including logo design and social media banners.', icon: '🎨' },
  ]

  return (
    <>
      <SEO title="Video & Photo Editing | Ashnexa Systems" 
           description="Professional video editing, photo retouching, motion graphics, and brand identity design services." />
      
      <div className="pt-[140px] md:pt-[180px] pb-20 min-h-screen relative">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full mb-6 relative">
              <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.6)]"></span>
              <span className="text-rose-700 font-bold text-sm tracking-wide">Creative Studio</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Video & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">Photo Editing</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Transforming your raw footage and images into professional, high-impact content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {capabilities.map((c, i) => (
              <div key={i} className="group bg-white/40 backdrop-blur-2xl p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/60 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-to-br from-rose-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-pink-600 text-white flex items-center justify-center text-2xl rounded-2xl mb-6 shadow-md transform group-hover:scale-110 transition-all duration-300">
                    {c.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{c.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{c.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 text-center relative overflow-hidden shadow-xl border border-white/80">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Got a project in mind?</h2>
            <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Upload your footage or share your vision, and let our creative team work their magic.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Start Editing
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

export default EditingService
