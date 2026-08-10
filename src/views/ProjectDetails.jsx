'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

import { parseList } from '../utils/parseList'

// Feature chip accents — cycled purely for visual rhythm, no logic impact
const FEATURE_COLORS = [
  { bg: '#EEF2FF', border: '#C7D2FE', icon: '#4F46E5' }, // indigo
  { bg: '#F0FDF4', border: '#BBF7D0', icon: '#16A34A' }, // green
  { bg: '#FFF1F2', border: '#FECDD3', icon: '#FB7185' }, // coral
  { bg: '#F0F9FF', border: '#BAE6FD', icon: '#0EA5E9' }, // sky
  { bg: '#FEFCE8', border: '#FDE68A', icon: '#CA8A04' }, // amber
  { bg: '#F5F3FF', border: '#DDD6FE', icon: '#7C3AED' }, // violet
]

const TECH_COLORS = ['#4F46E5', '#0EA5E9', '#FB7185', '#16A34A', '#CA8A04', '#7C3AED']

// Small set of code-glyph particles for the signature rising-blocks motif
const PARTICLES = [
  { glyph: '</>', left: '6%', size: 22, duration: 16, delay: 0, color: '#4F46E5' },
  { glyph: '{ }', left: '18%', size: 16, duration: 13, delay: 2, color: '#FB7185' },
  { glyph: '01', left: '30%', size: 14, duration: 19, delay: 4, color: '#0EA5E9' },
  { glyph: '</>', left: '46%', size: 18, duration: 15, delay: 1, color: '#7C3AED' },
  { glyph: '#', left: '60%', size: 20, duration: 17, delay: 6, color: '#16A34A' },
  { glyph: '{ }', left: '74%', size: 15, duration: 14, delay: 3, color: '#CA8A04' },
  { glyph: '</>', left: '86%', size: 20, duration: 18, delay: 5, color: '#4F46E5' },
  { glyph: '10', left: '94%', size: 13, duration: 12, delay: 7, color: '#FB7185' },
]

const ProjectDetails = () => {
  const { slug } = useParams()
  const { projects } = useStore()
  const { currentUser } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const found = projects.find(p => (p.slug === slug || String(p.id) === String(slug)) && p.status === 'active')
    setProject(found || null)
    setLoading(false)
    setTimeout(() => setLoaded(true), 100)
  }, [slug, projects])

  const BackgroundStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&display=swap');

      .pd-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }

      .pd-canvas {
        background:
          radial-gradient(60rem 40rem at 12% -10%, #E0E7FF 0%, transparent 60%),
          radial-gradient(50rem 35rem at 110% 10%, #DBEAFE 0%, transparent 55%),
          radial-gradient(40rem 30rem at 50% 120%, #FCE7F3 0%, transparent 55%),
          #FAFAFF;
        background-size: 140% 140%, 140% 140%, 140% 140%, auto;
        animation: pdMesh 22s ease-in-out infinite;
      }
      @keyframes pdMesh {
        0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
        50% { background-position: 8% 6%, 92% 8%, 46% 92%, 0 0; }
      }

      .pd-particle {
        position: absolute;
        bottom: -10%;
        font-family: 'Space Grotesk', monospace;
        font-weight: 700;
        opacity: 0;
        animation-name: pdRise;
        animation-timing-function: ease-in;
        animation-iteration-count: infinite;
        user-select: none;
      }
      @keyframes pdRise {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        8% { opacity: 0.18; }
        85% { opacity: 0.14; }
        100% { transform: translateY(-115vh) rotate(12deg); opacity: 0; }
      }

      .pd-underline {
        position: relative;
        display: inline-block;
      }
      .pd-underline::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: -4px;
        height: 6px;
        border-radius: 4px;
        background: linear-gradient(90deg, #A3E635, #4F46E5 60%, #FB7185);
        background-size: 200% 100%;
        animation: pdSlide 5s linear infinite;
      }
      @keyframes pdSlide {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 0%; }
      }

      .pd-cta {
        position: relative;
        overflow: hidden;
      }
      .pd-cta::before {
        content: '';
        position: absolute;
        top: 0; left: -60%;
        width: 40%; height: 100%;
        background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
        transform: skewX(-20deg);
        transition: left 0.6s ease;
      }
      .pd-cta:hover::before { left: 130%; }

      @media (prefers-reduced-motion: reduce) {
        .pd-canvas, .pd-particle, .pd-underline::after { animation: none !important; }
      }
    `}</style>
  )

  if (loading) {
    return (
      <section className="pd-canvas min-h-screen pt-10 lg:pt-14 pb-20 text-slate-900">
        <BackgroundStyles />
        <div className="max-w-5xl mx-auto px-4 animate-pulse space-y-8">
          <div className="h-80 rounded-3xl bg-indigo-100/60"></div>
          <div className="h-10 rounded-xl w-2/3 bg-indigo-100/60"></div>
          <div className="h-6 rounded-lg w-full bg-indigo-100/60"></div>
          <div className="h-6 rounded-lg w-5/6 bg-indigo-100/60"></div>
        </div>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="pd-canvas min-h-screen pt-10 lg:pt-14 pb-20 flex items-center justify-center text-slate-900">
        <BackgroundStyles />
        <div className="text-center px-4 relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="pd-display text-3xl font-extrabold mb-3 text-slate-800">Project Not Found</h2>
          <p className="mb-6 text-slate-600">The project you're looking for doesn't exist.</p>
          <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-bold hover:shadow-xl hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Browse Projects
          </Link>
        </div>
      </section>
    )
  }

  const features = parseList(project.features)
  const techStack = parseList(project.tech_stack)

  return (
    <section className="pd-canvas relative min-h-screen pt-10 lg:pt-14 pb-20 overflow-hidden text-slate-900">
      <BackgroundStyles />

      {/* Signature motif: rising code-block particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="pd-particle"
            style={{
              left: p.left,
              fontSize: p.size,
              color: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s` }}
          >
            {p.glyph}
          </span>
        ))}
      </div>

      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/projects" className="hover:text-indigo-600 transition-colors font-medium">Projects</Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">{project.title}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white shadow-2xl shadow-indigo-500/10 mb-10">
          {/* Image */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-indigo-100 via-sky-100 to-violet-100 overflow-hidden">
            {(project.image_url || project.thumbnail) ? (
              <img src={project.image_url || project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/15 via-sky-500/15 to-violet-500/15">
                <svg className="w-24 h-24 text-indigo-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* Category & Featured badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-sm text-white ${project.category_slug === 'basic' ? 'bg-emerald-500/90 border-emerald-300' :
                  project.category_slug === 'medium' ? 'bg-amber-500/90 border-amber-300' :
                    'bg-violet-500/90 border-violet-300'
                }`}>
                {project.category_name || project.category_slug || 'Source Code'}
              </span>
              {project.is_featured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg">
                  ★ Featured
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-8 md:p-10">
            <h1 className="pd-display text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">{project.title}</h1>
            <p className="text-lg leading-relaxed mb-8 text-slate-600 whitespace-pre-line">
              {project.long_description || project.description}
            </p>

            {/* 2. Choose Options & Pricing (Position #2) */}
            <div className="mb-10">
              <h3 className="pd-display pd-underline text-xs font-bold uppercase tracking-wider text-indigo-600 mb-5">
                Choose Options &amp; Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Only */}
                <div className="relative bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Project Only</div>
                  <div className="pd-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 mb-4">
                    ₹{Number(project.price_project_only || 0).toLocaleString('en-IN')}
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Complete project files
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Deployment guide
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      30-day support
                    </li>
                  </ul>
                  <Link
                    href={currentUser ? `/checkout/${project.slug}?type=project_only` : `/login?redirect=/checkout/${project.slug}?type=project_only`}
                    className="pd-cta block w-full text-center px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                  >
                    {currentUser ? 'Buy Project Only' : 'Login to Buy'}
                  </Link>
                </div>

                {/* Project + Source Code */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-2xl p-6 border border-violet-300/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-xl shadow-violet-500/25 group">
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-lime-400 to-emerald-500 text-emerald-950 text-xs font-extrabold rounded-full shadow-lg">
                    Best Value
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-100 mb-2">Project + Source Code</div>
                  <div className="pd-display text-4xl font-extrabold text-white mb-4">
                    ₹{Number(project.price_with_source || project.price_project_only || 0).toLocaleString('en-IN')}
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-violet-50">
                      <svg className="w-4 h-4 text-lime-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Complete project files
                    </li>
                    <li className="flex items-center gap-2 text-sm text-violet-50">
                      <svg className="w-4 h-4 text-lime-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Full source code access
                    </li>
                    <li className="flex items-center gap-2 text-sm text-violet-50">
                      <svg className="w-4 h-4 text-lime-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Deployment guide
                    </li>
                    <li className="flex items-center gap-2 text-sm text-violet-50">
                      <svg className="w-4 h-4 text-lime-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      60-day priority support
                    </li>
                    <li className="flex items-center gap-2 text-sm text-violet-50">
                      <svg className="w-4 h-4 text-lime-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Customize & extend freely
                    </li>
                  </ul>
                  <Link
                    href={currentUser ? `/checkout/${project.slug}?type=project_with_source` : `/login?redirect=/checkout/${project.slug}?type=project_with_source`}
                    className="pd-cta block w-full text-center px-6 py-3 rounded-xl font-bold text-sm text-violet-700 bg-white hover:bg-violet-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {currentUser ? 'Buy with Source Code' : 'Login to Buy'}
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Features */}
            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="pd-display pd-underline text-xs font-bold uppercase tracking-wider text-indigo-600 mb-5">
                  What You'll Get
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, idx) => {
                    const c = FEATURE_COLORS[idx % FEATURE_COLORS.length]
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                      >
                        <svg className="w-5 h-5 flex-shrink-0" style={{ color: c.icon }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-sm text-slate-700">{feature}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. Tech Stack */}
            {techStack.length > 0 && (
              <div className="mb-8">
                <h3 className="pd-display pd-underline text-xs font-bold uppercase tracking-wider text-indigo-600 mb-5">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 text-xs font-bold rounded-xl text-white shadow-sm hover:shadow-md transition-shadow"
                      style={{ backgroundColor: TECH_COLORS[idx % TECH_COLORS.length] }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Preview */}
            {project.demo_url && (
              <div className="rounded-2xl p-6 border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
                <h3 className="pd-display text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                  Live Demo Preview
                </h3>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-cta inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-indigo-500/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Live Demo
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Back to Projects */}
        <div className="text-center">
          <Link href="/projects" className="inline-flex items-center gap-2 font-medium transition-colors text-slate-600 hover:text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Projects
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProjectDetails