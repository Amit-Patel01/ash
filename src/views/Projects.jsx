'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'

const categoryColors = {
  basic:    { active: 'from-emerald-500 to-green-600 shadow-[0_12px_28px_-10px_rgba(22,163,74,0.5)]',    inactive: 'border-emerald-200/80  text-emerald-700  hover:bg-emerald-50  dark:border-emerald-500/20 dark:text-emerald-400  dark:hover:bg-emerald-500/10' },
  medium:   { active: 'from-amber-500 to-orange-500 shadow-[0_12px_28px_-10px_rgba(245,158,11,0.5)]',     inactive: 'border-amber-200/80   text-amber-700    hover:bg-amber-50    dark:border-amber-500/20  dark:text-amber-400    dark:hover:bg-amber-500/10'  },
  advanced: { active: 'from-violet-600 to-fuchsia-600 shadow-[0_12px_28px_-10px_rgba(139,92,246,0.5)]',   inactive: 'border-violet-200/80  text-violet-700   hover:bg-violet-50   dark:border-violet-500/20 dark:text-violet-400   dark:hover:bg-violet-500/10' },
  default:  { active: 'from-blue-600 to-indigo-600 shadow-[0_12px_28px_-10px_rgba(99,102,241,0.5)]',      inactive: 'border-slate-200/80   text-slate-600    hover:bg-slate-50    dark:border-white/10      dark:text-slate-400    dark:hover:bg-white/5'        } }

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
]

const Projects = () => {
  const { projects: storeProjects, categories: storeCategories } = useStore()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [maxPrice, setMaxPrice] = useState(10000)

  const activeProjects = useMemo(() =>
    storeProjects.filter((p) => p.status === 'active'),
    [storeProjects]
  )

  const maxAvailablePrice = useMemo(() => {
    const prices = activeProjects.map(p => Number(p.price_project_only) || 0)
    return prices.length ? Math.max(...prices, 500) : 10000
  }, [activeProjects])

  const uniqueCategories = useMemo(() =>
    storeCategories.reduce((acc, cur) =>
      acc.find((c) => c.slug === cur.slug) ? acc : [...acc, cur],
      []
    ),
    [storeCategories]
  )

  const filteredProjects = useMemo(() => {
    let result = activeCategory === 'all'
      ? activeProjects
      : activeProjects.filter((p) => p.category_slug === activeCategory)

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category_name || '').toLowerCase().includes(q)
      )
    }

    // Price filter
    result = result.filter(p => (Number(p.price_project_only) || 0) <= maxPrice)

    // Sort
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => (Number(a.price_project_only) || 0) - (Number(b.price_project_only) || 0))
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => (Number(b.price_project_only) || 0) - (Number(a.price_project_only) || 0))
    if (sortBy === 'name_asc') result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''))

    return result
  }, [activeProjects, activeCategory, searchQuery, maxPrice, sortBy])

  const stats = [
    { value: `${activeProjects.length}+`, label: 'Ready Projects' },
    { value: `${Math.max(uniqueCategories.length, 1)}`, label: 'Categories' },
    { value: 'Fast', label: 'Delivery' },
  ]

  const getButtonClasses = (slug) => {
    const isActive = activeCategory === slug
    const colors = categoryColors[slug] || categoryColors.default
    if (isActive) {
      return `bg-gradient-to-r ${colors.active} text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:-translate-y-0.5`
    }
    return `border bg-white/80 dark:bg-white/4 font-semibold px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:-translate-y-0.5 ${colors.inactive}`
  }

  const hasActiveFilters = searchQuery.trim() || activeCategory !== 'all' || maxPrice < maxAvailablePrice || sortBy !== 'default'

  const clearFilters = () => {
    setSearchQuery('')
    setActiveCategory('all')
    setMaxPrice(maxAvailablePrice)
    setSortBy('default')
  }

  return (
    <>
      <SEO
        title="Our Projects | AmitSolutionHub"
        description="Browse ready-to-deploy professional projects — web apps, dashboards, and custom systems across all complexity levels."
      />

      <PublicPageShell hideHeader>
        <PublicSection className="space-y-8">
          {/* Search + Sort Controls */}
          <PublicGlassCard className="p-7 space-y-6">
            <PublicSectionHeading
              badge="Project Catalogue"
              title="Find your perfect project"
              description="Search, filter by category, sort by price — find exactly what you need."
            />

            {/* Search bar + Sort + Clear */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects by name, description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200/80 bg-white/80 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-slate-200/80 bg-white/80 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer transition-all"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 text-sm font-bold hover:-translate-y-0.5 transition-all"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Max Price</label>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={maxAvailablePrice || 10000}
                step={100}
                value={maxPrice > (maxAvailablePrice || 10000) ? (maxAvailablePrice || 10000) : maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>₹0</span>
                <span>₹{(maxAvailablePrice || 10000).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={getButtonClasses('all')}
              >
                All Projects
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className={getButtonClasses(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Result count */}
            {hasActiveFilters && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing <span className="font-black text-indigo-600 dark:text-indigo-400">{filteredProjects.length}</span> of {activeProjects.length} projects
              </p>
            )}
          </PublicGlassCard>

          {/* Project Grid */}
          {activeProjects.length === 0 ? (
            <PublicGlassCard className="py-20 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 mb-5">
                <svg className="h-10 w-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.5 7.5 12 3l8.5 4.5V17L12 21l-8.5-4V7.5ZM12 21V11.5M3.5 7.5 12 12l8.5-4.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No projects yet</h3>
              <p className="mx-auto max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Projects will appear here once added. Check back soon or request a custom build.
              </p>
            </PublicGlassCard>
          ) : filteredProjects.length === 0 ? (
            <PublicGlassCard className="py-20 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 mb-5">
                <svg className="h-10 w-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No matching projects</h3>
              <p className="mx-auto max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Try adjusting your search, category, or price range.
              </p>
              <button
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all"
              >
                Clear All Filters
              </button>
            </PublicGlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* Custom Build CTA */}
          <PublicGlassCard className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 opacity-[0.06] dark:opacity-[0.12]" />
            <div className="relative grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5 p-8 sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Custom Build
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Don't see what you need? We'll build it for you.
                </h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Share your requirements and we'll create a custom project with the same professional quality and fast delivery.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/custom-project"
                    className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-12px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Start Custom Project →
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-6 py-3 text-sm font-bold text-slate-700 hover:-translate-y-0.5 hover:border-indigo-200 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    Contact Team
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 via-violet-50/30 to-white p-8 sm:p-10 dark:from-slate-900/50 dark:via-violet-900/10 dark:to-slate-900/50">
                <div className="rounded-2xl border border-white/90 bg-white/85 p-6 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.3)] dark:border-white/8 dark:bg-white/4 dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">What buyers look for</div>
                  {[
                    'Clear category and pricing structure',
                    'Professional presentation and screenshots',
                    'Fast route to details or customization',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300 mb-2.5 last:mb-0">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PublicGlassCard>
        </PublicSection>
      </PublicPageShell>
    </>
  )
}

export default Projects
