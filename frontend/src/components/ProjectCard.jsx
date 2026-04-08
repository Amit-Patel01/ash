import { Link } from 'react-router-dom'

const ProjectCard = ({ project }) => {
  let features = []

  if (Array.isArray(project.features)) {
    features = project.features
  } else if (typeof project.features === 'string' && project.features.trim()) {
    try {
      features = JSON.parse(project.features)
    } catch {
      features = []
    }
  }

  const displayFeatures = features.slice(0, 3)

  return (
    <div className="group relative overflow-hidden rounded-[30px] border border-white/90 bg-white/88 backdrop-blur-xl shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-32px_rgba(37,99,235,0.32)]">
      {/* Glow effect */}
      <div className="pointer-events-none absolute -inset-2 bg-gradient-to-br from-sky-500/10 via-transparent to-indigo-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {(project.image_url || project.thumbnail) ? (
          <img
            src={project.image_url || project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/10 to-indigo-500/10">
            <svg className="h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-md ${
            project.category_slug === 'basic' ? 'border-green-300/60 bg-green-500/20 text-green-700' :
            project.category_slug === 'medium' ? 'border-amber-300/60 bg-amber-500/20 text-amber-700' :
            'border-purple-300/60 bg-purple-500/20 text-purple-700'
          }`}>
            {project.category_name}
          </span>
        </div>
        {/* Featured Badge */}
        {project.is_featured && (
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative space-y-5 p-6">
        <h3 className="text-xl font-black text-slate-800 transition-colors duration-300 group-hover:text-sky-700">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {project.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {displayFeatures.map((feature, idx) => (
            <span key={idx} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {feature}
            </span>
          ))}
          {features.length > 3 && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
              +{features.length - 3} more
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50 p-4">
          <div>
            <span className="block text-xs text-slate-500">Project Only</span>
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-2xl font-extrabold text-transparent">
              ₹{Number(project.price_project_only).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <span className="block text-xs text-slate-500">+ Source Code</span>
            <span className="text-lg font-bold text-slate-500">
              ₹{Number(project.price_with_source).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to={`/projects/${project.slug}`}
            className="block w-full rounded-[18px] bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_18px_38px_-18px_rgba(37,99,235,0.85)] transition-all duration-300 hover:-translate-y-0.5"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
