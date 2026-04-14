import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'

const TabIcon = ({ name, size = 18, color = 'currentColor', strokeWidth = 2 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' }
  if (name === 'custom') return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.4 4.8L20 10l-4 4 1 6-5-2.7L7 20l1-6-4-4 5.6-2.2L12 3Z" /></svg>
  if (name === 'phone') return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 4h3l1.5 4-2 1.5a15 15 0 0 0 5.5 5.5l1.5-2 4 1.5v3A2 2 0 0 1 18 20C10.8 20 5 14.2 5 7a2 2 0 0 1 1.5-3Z" /></svg>
  if (name === 'box') return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 7.5 12 3l8.5 4.5V17L12 21l-8.5-4V7.5Z" /><path d="M12 21V11.5M3.5 7.5 12 12l8.5-4.5" /></svg>
  return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
}

const Projects = () => {
  const { projects: storeProjects, categories: storeCategories } = useStore()
  const [activeCategory, setActiveCategory] = useState('all')

  const activeProjects = useMemo(() => {
    return storeProjects.filter((project) => project.status === 'active')
  }, [storeProjects])

  const uniqueCategories = useMemo(() => {
    return storeCategories.reduce((accumulator, current) => {
      if (accumulator.find((category) => category.slug === current.slug)) {
        return accumulator
      }

      return [...accumulator, current]
    }, [])
  }, [storeCategories])

  const filteredProjects =
    activeCategory === 'all'
      ? activeProjects
      : activeProjects.filter((project) => project.category_slug === activeCategory)

  const stats = [
    { value: `${activeProjects.length}+`, label: 'Ready Projects' },
    { value: `${Math.max(uniqueCategories.length, 1)}`, label: 'Project Bands' },
    { value: 'Fast', label: 'Prebuilt Delivery' },
  ]

  const buttonClasses = (slug) => {
    if (activeCategory === slug) {
      if (slug === 'basic') return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_18px_38px_-20px_rgba(22,163,74,0.65)]'
      if (slug === 'medium') return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_18px_38px_-20px_rgba(245,158,11,0.7)]'
      if (slug === 'advanced') return 'bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-[0_18px_38px_-20px_rgba(147,51,234,0.7)]'
      return 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.8)]'
    }

    return 'border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
  }

  return (
    <>
      <SEO
        title="Our Projects | AmitSolutionHub"
        description="Browse ready-to-deploy professional projects in a cleaner, mobile-friendly showcase."
      />

      <PublicPageShell
        badge="Ready-to-Deploy Projects"
        title={
          <>
            Showcase source code projects in a
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> cleaner, more premium </span>
            catalogue
          </>
        }
        description="The projects listing now feels lighter, more professional, and easier to browse on mobile so buyers can quickly compare categories and move to the right detail page."
        actions={[
          { label: 'Explore Custom Build', to: '/custom-project', icon: <TabIcon name="custom" size={16} /> },
          { label: 'Talk to Us', to: '/contact', variant: 'secondary', icon: <TabIcon name="phone" size={16} /> },
        ]}
        pills={['White-glow catalogue', 'Faster category scanning', 'Prebuilt and custom options', 'Mobile-ready buyer flow']}
        stats={stats}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Why it matters</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">A project showcase should feel organized before it feels technical</h3>
            </div>
            <div className="grid gap-3">
              {[
                { title: 'Better filtering', text: 'Visitors can focus on budget level or complexity without getting lost.' },
                { title: 'Professional presentation', text: 'The catalogue feels aligned with a modern service and internship brand.' },
                { title: 'Cleaner handoff', text: 'Project cards lead naturally into details or custom requirement conversations.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200/80 bg-white/90 p-4">
                  <div className="text-sm font-bold text-slate-900">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          <PublicGlassCard className="space-y-6">
            <PublicSectionHeading
              badge="Project Catalogue"
              title="Filter by project band"
              description="Pick a category to narrow the catalogue while keeping the same clean visual structure on every screen size."
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${buttonClasses('all')}`}
              >
                All Projects
              </button>
              {uniqueCategories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setActiveCategory(category.slug)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${buttonClasses(category.slug)}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </PublicGlassCard>

          {activeProjects.length === 0 ? (
            <PublicGlassCard className="py-16 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <TabIcon name="box" size={30} />
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900">No active projects yet</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Once projects are added from admin, they will appear here in the refined public catalogue.
              </p>
            </PublicGlassCard>
          ) : filteredProjects.length === 0 ? (
            <PublicGlassCard className="py-16 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <TabIcon name="search" size={30} />
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900">No projects in this category</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Try a different filter or browse all projects.</p>
            </PublicGlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <PublicGlassCard className="overflow-hidden p-0">
            <div className="grid lg:grid-cols-[1fr_0.92fr]">
              <div className="space-y-4 p-7 sm:p-9">
                <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Need Something Unique?
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900">Custom build request with the same premium presentation</h3>
                <p className="text-sm leading-7 text-slate-600">
                  If the prebuilt catalogue does not match your use case, we can prepare a custom project workflow and requirement discussion.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/custom-project" className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.85)]">
                    Start Custom Project
                  </Link>
                  <Link to="/contact" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                    Contact Team
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-7 sm:p-9">
                <div className="rounded-[28px] border border-white/90 bg-white/85 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)]">
                  <div className="text-sm font-bold text-slate-900">What buyers look for first</div>
                  <div className="mt-4 space-y-3">
                    {[
                      'Clear category and pricing structure',
                      'Professional screenshots and concise descriptions',
                      'A fast route to details, support, or customization',
                    ].map((point) => (
                      <div key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-sky-500" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
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
