import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../config/api'
import { useStore } from '../store/StoreContext'

const ProjectDetails = () => {
  const { slug } = useParams()
  const { projects } = useStore()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const found = projects.find(p => p.slug === slug && p.status === 'active')
    setProject(found || null)
    setLoading(false)
    setTimeout(() => setLoaded(true), 100)
  }, [slug, projects])

  if (loading) {
    return (
      <section className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 animate-pulse space-y-8">
          <div className="h-80 bg-slate-200/50 rounded-3xl"></div>
          <div className="h-10 bg-slate-200/50 rounded-xl w-2/3"></div>
          <div className="h-6 bg-slate-200/50 rounded-lg w-full"></div>
          <div className="h-6 bg-slate-200/50 rounded-lg w-5/6"></div>
        </div>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Project Not Found</h2>
          <p className="text-slate-600 mb-6">The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:from-blue-700 hover:to-indigo-700 transition-all">
            Browse Projects
          </Link>
        </div>
      </section>
    )
  }

  const features = project.features ? JSON.parse(project.features) : []
  const techStack = project.tech_stack ? JSON.parse(project.tech_stack) : []

  return (
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Background */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-20 -right-20 w-[30rem] h-[30rem] bg-blue-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 -left-20 w-[30rem] h-[30rem] bg-purple-500/15 rounded-full blur-[100px]"></div>
      </div>
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/projects" className="hover:text-blue-600 transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{project.title}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/60 shadow-xl mb-10">
          {/* Image */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
            {project.image_url ? (
              <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* Category & Featured badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                project.category_slug === 'basic' ? 'bg-green-500/20 text-green-700 border-green-300/50' :
                project.category_slug === 'medium' ? 'bg-amber-500/20 text-amber-700 border-amber-300/50' :
                'bg-purple-500/20 text-purple-700 border-purple-300/50'
              }`}>
                {project.category_name}
              </span>
              {project.is_featured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-8 md:p-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">{project.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {project.long_description || project.description}
            </p>

            {/* Tech Stack */}
            {techStack.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, idx) => (
                    <span key={idx} className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl border border-blue-100">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/60 rounded-xl border border-slate-100">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-700 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Project Only */}
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg group">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Project Only</div>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                  ₹{Number(project.price_project_only).toLocaleString('en-IN')}
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Complete project files
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Deployment guide
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    30-day support
                  </li>
                </ul>
                <Link
                  to={`/checkout/${project.slug}?type=project_only`}
                  className="block w-full text-center px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300 border border-slate-200"
                >
                  Buy Project Only
                </Link>
              </div>

              {/* Project + Source Code */}
              <div className="relative bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-300/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl group">
                <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                  Best Value
                </div>
                <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Project + Source Code</div>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                  ₹{Number(project.price_with_source).toLocaleString('en-IN')}
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Complete project files
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Full source code access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Deployment guide
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    60-day priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Customize & extend freely
                  </li>
                </ul>
                <Link
                  to={`/checkout/${project.slug}?type=project_with_source`}
                  className="block w-full text-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Buy with Source Code
                </Link>
              </div>
            </div>

            {/* Demo Preview */}
            {project.demo_url && (
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Live Demo Preview</h3>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
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
          <Link to="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
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
