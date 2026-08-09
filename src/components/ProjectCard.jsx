import Link from 'next/link'

const ProjectCard = ({ project }) => {
  let features = []
  if (Array.isArray(project.features)) {
    features = project.features
  } else if (typeof project.features === 'string' && project.features.trim()) {
    try { features = JSON.parse(project.features) } catch { features = [] }
  }
  const displayFeatures = features.slice(0, 3)

  const categoryColors = {
    basic:    { badge: 'border-emerald-300/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', label: '🟢' },
    medium:   { badge: 'border-amber-300/60 bg-amber-500/15 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', label: '🟡' },
    advanced: { badge: 'border-violet-300/60 bg-violet-500/15 text-violet-700 dark:text-violet-300', dot: 'bg-violet-500', label: '🟣' } }
  const colors = categoryColors[project.category_slug] || {
    badge: 'border-blue-300/60 bg-blue-500/15 text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    label: '🔵' }

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-transparent backdrop-blur-xl shadow-[0_16px_50px_-24px_rgba(15,23,42,0.35)] transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_28px_60px_-20px_rgba(99,102,241,0.3)] dark:border-white/8 dark:bg-slate-900/75 dark:shadow-[0_16px_50px_-24px_rgba(0,0,0,0.6)] dark:hover:shadow-[0_28px_60px_-20px_rgba(99,102,241,0.2)]">
      {/* Gradient glow on hover */}
      <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {(project.image_url || project.thumbnail) ? (
          <img
            src={project.image_url || project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
            <svg className="h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold backdrop-blur-md ${colors.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {project.category_name}
          </span>
        </div>

        {/* Featured Badge */}
        {project.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative space-y-4 p-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight">
            {project.title}
          </h3>
          <p className="line-clamp-2 mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {project.description}
          </p>
        </div>

        {/* Feature Tags */}
        {displayFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayFeatures.map((feature, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-white/8 dark:bg-white/4 dark:text-slate-400">
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                +{features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100/80 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-4 dark:border-white/8 dark:from-white/4 dark:to-indigo-500/5">
          <div className="flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Project Only</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-black text-transparent">
              ₹{Number(project.price_project_only).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200/80 dark:bg-white/10" />
          <div className="flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">+ Source Code</span>
            <span className="text-xl font-black text-slate-500 dark:text-slate-400">
              ₹{Number(project.price_with_source).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/projects/${project.slug}`}
          className="group/btn relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.6)]"
        >
          {/* Shimmer */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-full transition-transform duration-600" />
          <span className="relative flex items-center justify-center gap-2">
            View Details
            <svg className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}

export default ProjectCard
