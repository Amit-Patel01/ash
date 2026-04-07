import { useState } from 'react'
import { useStore } from '../store/StoreContext'

const GRADIENT_MAP = [
  'from-blue-500 via-indigo-500 to-purple-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-pink-500 via-purple-500 to-indigo-600',
  'from-cyan-500 via-blue-500 to-violet-600',
  'from-lime-500 via-emerald-500 to-teal-600',
]

export default function AdminTradingCourses() {
  const { tradingCourses, addTradingCourse, updateTradingCourse, deleteTradingCourse } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', features: '',
    highlighted: false, badge: '', active: true, published: true,
  })
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingCourse(null)
    setFormData({ name: '', price: '', description: '', features: '', highlighted: false, badge: '', active: true, published: true })
    setShowModal(true)
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name || '',
      price: course.price || '',
      description: course.description || '',
      features: Array.isArray(course.features) ? course.features.join('\n') : (course.features || ''),
      highlighted: course.highlighted || false,
      badge: course.badge || '',
      active: course.active !== false,
      published: course.published !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const featuresArr = formData.features.split('\n').map(s => s.trim()).filter(Boolean)
      const payload = { ...formData, price: Number(formData.price), features: featuresArr }
      if (editingCourse) {
        await updateTradingCourse(editingCourse.id, payload)
      } else {
        await addTradingCourse(payload)
      }
      setShowModal(false)
    } catch {
      alert('Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.name}"?`)) return
    try { await deleteTradingCourse(course.id) } catch { alert('Failed to delete') }
  }

  const togglePublished = async (course) => {
    try { await updateTradingCourse(course.id, { published: !course.published }) } catch { alert('Failed') }
  }

  const published = tradingCourses.filter(c => c.published !== false).length
  const hidden = tradingCourses.filter(c => c.published === false).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trading Courses</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm text-gray-500">{tradingCourses.length} total</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="text-sm text-emerald-400 font-medium">{published} published</span>
            {hidden > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="text-sm text-gray-500">{hidden} hidden</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Course
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
        <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Only <span className="font-bold text-blue-200 mx-1">Published</span> courses appear on the public Trading Mentorship page.
      </div>

      {/* Courses grid */}
      {tradingCourses.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg mb-2">No courses yet</p>
          <p className="text-sm text-gray-500 mb-6">Create your first trading mentorship plan and publish it for students.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tradingCourses.map((course, idx) => {
            const gradient = GRADIENT_MAP[idx % GRADIENT_MAP.length]
            const isPublished = course.published !== false
            const features = Array.isArray(course.features) ? course.features : []
            return (
              <div
                key={course.id}
                className={`relative group rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isPublished
                    ? 'border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    : 'border-white/5 opacity-60 hover:opacity-80'
                } bg-gray-900/80 backdrop-blur-xl`}
              >
                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

                {/* Glow effect behind card on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br ${gradient} blur-2xl -z-10 scale-110`} style={{opacity: 0.04}} />

                <div className="p-5">
                  {/* Top row: name + price + status */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-base leading-tight">{course.name}</h3>
                        {course.highlighted && (
                          <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                            ★ Hot
                          </span>
                        )}
                      </div>
                      {course.badge && (
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/20">
                          {course.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        ₹{Number(course.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Published chip */}
                  <div className="mt-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-gray-700/50 text-gray-500 border-gray-600/25'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                      {isPublished ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  {/* Description */}
                  {course.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">{course.description}</p>
                  )}

                  {/* Feature pills */}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {features.slice(0, 4).map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/5 text-[11px] text-gray-400">
                          <span className="text-emerald-400">✓</span>
                          {f}
                        </span>
                      ))}
                      {features.length > 4 && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/5 text-[11px] text-gray-600">
                          +{features.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-white/5 mb-3" />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublished(course)}
                      title={isPublished ? 'Hide from students' : 'Publish to students'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-gray-700/40 text-gray-500 hover:bg-gray-700/60 hover:text-gray-300'
                      }`}
                    >
                      {isPublished ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      )}
                      {isPublished ? 'Published' : 'Publish'}
                    </button>
                    <button
                      onClick={() => openEdit(course)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="ml-auto p-1.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add new card */}
          <button
            onClick={openCreate}
            className="group rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/40 bg-transparent hover:bg-blue-500/5 transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-blue-400"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm font-bold">Add Course</span>
          </button>
        </div>
      )}

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-950 border border-white/10 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Modal gradient top bar */}
            <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />

            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingCourse ? 'Edit Course' : '✦ New Trading Course'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingCourse ? 'Update course details' : 'Create a new mentorship plan for students'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. Pro Mentorship Plan"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.07] transition-all"
                />
              </div>

              {/* Price + Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="9999"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Badge Label</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({...formData, badge: e.target.value})}
                    placeholder="MOST POPULAR"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Brief description of this plan..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all resize-none"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Features <span className="text-gray-600 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  rows={5}
                  placeholder={"Market Basics Course\nTechnical Analysis\n5 Live Sessions\nWhatsApp Support\nCertificate"}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all resize-none font-mono"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Highlighted toggle */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">★ Mark as Most Popular</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Adds a golden badge & highlight border</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, highlighted: !formData.highlighted})}
                    className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${formData.highlighted ? 'bg-amber-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${formData.highlighted ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Published toggle */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">🌐 Publish to Students</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Visible on the public Trading Mentorship page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, published: !formData.published})}
                    className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${formData.published ? 'bg-blue-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${formData.published ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Saving...
                    </span>
                  ) : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
