import { Link } from 'react-router-dom'

const ProjectCard = ({ project }) => {
  const features = project.features ? JSON.parse(project.features) : []
  const displayFeatures = features.slice(0, 3)

  return (
    <div className="group relative bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/60 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"></div>

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {(project.image_url || project.thumbnail) ? (
          <img
            src={project.image_url || project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
            project.category_slug === 'basic' ? 'bg-green-500/20 text-green-700 border-green-300/50' :
            project.category_slug === 'medium' ? 'bg-amber-500/20 text-amber-700 border-amber-300/50' :
            'bg-purple-500/20 text-purple-700 border-purple-300/50'
          }`}>
            {project.category_name}
          </span>
        </div>
        {/* Featured Badge */}
        {project.is_featured && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {displayFeatures.map((feature, idx) => (
            <span key={idx} className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100/80 rounded-lg">
              {feature}
            </span>
          ))}
          {features.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
              +{features.length - 3} more
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-5">
          <div>
            <span className="text-xs text-slate-500 block">Project Only</span>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              ₹{Number(project.price_project_only).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div>
            <span className="text-xs text-slate-500 block">+ Source Code</span>
            <span className="text-lg font-bold text-slate-500">
              ₹{Number(project.price_with_source).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to={`/projects/${project.slug}`}
            className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/50 transition-all duration-300 hover:shadow-md"
          >
            View Details
          </Link>
          <Link
            to={`/checkout/${project.slug}`}
            className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
