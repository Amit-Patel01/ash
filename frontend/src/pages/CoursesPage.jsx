import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

export default function CoursesPage() {
  const { courses, courseCategories, isUserEnrolled } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [filterCat, setFilterCat] = useState('All')
  const [search, setSearch] = useState('')

  const published = useMemo(() =>
    courses.filter(c => c.published !== false),
    [courses]
  )

  const filtered = useMemo(() =>
    published.filter(c => {
      const matchCat = filterCat === 'All' || c.category === filterCat
      const q = search.toLowerCase()
      const matchSearch = !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
      return matchCat && matchSearch
    }),
    [published, filterCat, search]
  )

  const allCats = useMemo(() => {
    const fromCourses = [...new Set(published.map(c => c.category).filter(Boolean))]
    return ['All', ...fromCourses]
  }, [published])

  const getCatMeta = (name) => courseCategories.find(c => c.name === name)

  const levelColors = {
    Beginner: 'text-emerald-400 bg-emerald-500/10',
    Intermediate: 'text-amber-400 bg-amber-500/10',
    Advanced: 'text-red-400 bg-red-500/10',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Courses — Amit Solution Hub</title>
        <meta name="description" content="Browse our professional courses in Trading, Web Development, Python, Digital Marketing and more." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Learn from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Industry Experts</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Professional courses designed for real-world success. Enroll, learn, and grow.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/60 backdrop-blur"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-8 -mx-1">
          {allCats.map(cat => {
            const meta = getCatMeta(cat)
            return (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filterCat === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}>
                {meta?.icon && <span className="mr-1">{meta.icon}</span>}
                {cat}
                {cat !== 'All' && (
                  <span className={`ml-1.5 text-[10px] ${filterCat === cat ? 'opacity-70' : 'opacity-50'}`}>
                    ({published.filter(c => c.category === cat).length})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-6">
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          {filterCat !== 'All' && ` in ${filterCat}`}
          {search && ` for "${search}"`}
        </p>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500">Try adjusting your search or filter</p>
            <button onClick={() => { setSearch(''); setFilterCat('All') }}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => {
              const enrolled = currentUser ? isUserEnrolled(currentUser.uid, course.id) : false
              const catMeta = getCatMeta(course.category)
              return (
                <div key={course.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/courses/${course.slug || course.id}`)}>
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl"
                        style={{ background: `linear-gradient(135deg, ${catMeta?.color || '#3b82f6'}22, ${catMeta?.color || '#3b82f6'}44)` }}>
                        {catMeta?.icon || '📚'}
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {course.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wide">
                          {course.badge}
                        </span>
                      )}
                      {course.highlighted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wide">★ Featured</span>
                      )}
                      {enrolled && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wide">✓ Enrolled</span>
                      )}
                    </div>
                    {/* Plans count badge */}
                    {Array.isArray(course.plans) && course.plans.length > 0 && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/60 text-white backdrop-blur-sm">
                        {course.plans.length} plans
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Category + Level */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold" style={{ color: catMeta?.color }}>
                        {catMeta?.icon} {course.category}
                      </span>
                      {course.level && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColors[course.level] || 'text-slate-400 bg-slate-100'}`}>
                          {course.level}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 mb-1 line-clamp-2 leading-tight">{course.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{course.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                      {course.instructor && <span>👨‍🏫 {course.instructor}</span>}
                      {course.duration && <span>⏱ {course.duration}</span>}
                      {course.enrolledCount > 0 && <span>👥 {course.enrolledCount}</span>}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        {Array.isArray(course.plans) && course.plans.length > 0 ? (
                          <div>
                            <span className="text-xs text-slate-400">Starting at</span>
                            <p className="text-xl font-black text-slate-900">
                              ₹{Math.min(...course.plans.map(p => Number(p.price) || 0)).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ) : course.isFree ? (
                          <span className="text-2xl font-black text-emerald-600">FREE</span>
                        ) : (
                          <span className="text-2xl font-black text-slate-900">₹{Number(course.price || 0).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/courses/${course.slug || course.id}`) }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          enrolled
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25'
                        }`}>
                        {enrolled ? '✓ View Course' : 'View Details →'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
