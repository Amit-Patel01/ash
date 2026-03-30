import { useEffect, useState } from 'react'

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
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Video & <span className="text-rose-600">Photo Editing</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transforming your raw footage and images into professional, high-impact content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {capabilities.map((c, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h3>
              <p className="text-slate-600">{c.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-rose-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Got a project in mind?</h2>
          <p className="text-rose-100 text-lg mb-10 max-w-2xl mx-auto">
            Upload your footage and let us work our magic.
          </p>
          <a href="/contact" className="inline-block bg-white text-rose-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-rose-50 transition-colors shadow-lg">
            Start Editing
          </a>
        </div>
      </div>
    </div>
  )
}

export default EditingService
