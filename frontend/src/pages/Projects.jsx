import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import api from '../config/api'
import { useStore } from '../store/StoreContext'

const Projects = () => {
  const { projects: storeProjects, categories: storeCategories } = useStore()
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const activeProjects = storeProjects.filter(p => p.status === 'active')
    setProjects(activeProjects)
    
    // De-duplicate categories by slug to prevent UI duplication
    const uniqueCats = storeCategories.reduce((acc, current) => {
      const x = acc.find(item => item.slug === current.slug);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    
    setCategories(uniqueCats)
    setLoading(false)
    setTimeout(() => setLoaded(true), 100)
  }, [storeProjects, storeCategories])

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category_slug === activeCategory)

  return (
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Background Effects */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-10 -right-20 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-10 -left-20 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            <span className="text-blue-700 font-bold text-sm tracking-wide">Ready-to-Use Projects</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-800">
            Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Professionally built web projects ready for deployment. Choose your project and get started today.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/25'
                : 'bg-white/50 backdrop-blur-sm text-slate-600 border-white/60 hover:bg-white/70 hover:text-blue-600'
            }`}
          >
            All Projects
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat.slug
                  ? cat.slug === 'basic' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-lg shadow-green-500/25' :
                    cat.slug === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-500/25' :
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg shadow-purple-500/25'
                  : 'bg-white/50 backdrop-blur-sm text-slate-600 border-white/60 hover:bg-white/70 hover:text-blue-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/40 rounded-3xl overflow-hidden border border-white/60 animate-pulse">
                <div className="h-52 bg-slate-200/50"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200/50 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-slate-200/50 rounded-lg"></div>
                  <div className="h-4 bg-slate-200/50 rounded-lg w-5/6"></div>
                  <div className="h-10 bg-slate-200/50 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div key={project.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-[fadeInUp_0.6s_ease-out_forwards] opacity-0">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No projects found</h3>
            <p className="text-slate-500">Try selecting a different category</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-white/50 backdrop-blur-xl p-10 md:p-14 rounded-3xl border border-white/60 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">
                Need a Custom Project?
              </h2>
              <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
                Can't find what you're looking for? Let us build a custom solution tailored to your needs.
              </p>
              <Link
                to="/custom-project"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Contact Us
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Projects
