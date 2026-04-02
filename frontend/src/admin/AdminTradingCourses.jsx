import { useState } from 'react'
import { useStore } from '../store/StoreContext'

export default function AdminTradingCourses() {
  const { tradingCourses, addTradingCourse, updateTradingCourse, deleteTradingCourse } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: '',
    highlighted: false,
    badge: '',
    active: true,
  })
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingCourse(null)
    setFormData({ name: '', price: '', description: '', features: '', highlighted: false, badge: '', active: true })
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
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const featuresArr = formData.features.split('\n').map(s => s.trim()).filter(Boolean)
      const payload = {
        ...formData,
        price: Number(formData.price),
        features: featuresArr,
      }
      if (editingCourse) {
        await updateTradingCourse(editingCourse.id, payload)
      } else {
        await addTradingCourse(payload)
      }
      setShowModal(false)
    } catch (err) {
      alert('Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.name}"?`)) return
    try {
      await deleteTradingCourse(course.id)
    } catch (err) {
      alert('Failed to delete course')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Courses</h1>
          <p className="text-sm text-gray-400 mt-1">{tradingCourses.length} courses configured</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Course
        </button>
      </div>

      {/* Course List */}
      {tradingCourses.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-gray-400 mb-4">No courses created yet</p>
          <p className="text-sm text-gray-500">The default pricing plans will be shown on the Trading Mentorship page until you create custom courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradingCourses.map(course => (
            <div key={course.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white">{course.name}</h3>
                  {course.badge && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {course.badge}
                    </span>
                  )}
                </div>
                <span className="text-lg font-extrabold text-blue-400">₹{Number(course.price || 0).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
              {Array.isArray(course.features) && course.features.length > 0 && (
                <div className="mb-4">
                  {course.features.slice(0, 3).map((f, i) => (
                    <p key={i} className="text-xs text-gray-500">• {f}</p>
                  ))}
                  {course.features.length > 3 && (
                    <p className="text-xs text-gray-600">+{course.features.length - 3} more</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(course)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">Edit</button>
                <button onClick={() => handleDelete(course)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Course Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Pro Plan" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Price (₹) *</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required placeholder="9999" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Badge</label>
                  <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="MOST POPULAR" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Brief description of the plan" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Features (one per line)</label>
                <textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} rows={5} placeholder="Market Basics Course&#10;Technical Analysis Fundamentals&#10;5 Live Sessions" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none font-mono" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Highlighted</p>
                  <p className="text-[10px] text-gray-500">Show as "Most Popular" on the page</p>
                </div>
                <button type="button" onClick={() => setFormData({...formData, highlighted: !formData.highlighted})} className={`w-12 h-6 rounded-full transition-all relative ${formData.highlighted ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.highlighted ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
