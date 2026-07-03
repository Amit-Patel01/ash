import { useState } from 'react'
import { useStore } from '../store/StoreContext'

const EMOJI_OPTIONS = ['👨‍🎓', '👩‍🎓', '💻', '📈', '🚀', '⭐', '🔥', '✨', '🎓', '👦', '👧', '👤']

export default function AdminTestimonials() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    role: '',
    text: '',
    rating: 5,
    avatar: '👨‍🎓'
  })

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      role: '',
      text: '',
      rating: 5,
      avatar: '👨‍🎓'
    })
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({
      name: t.name || '',
      role: t.role || '',
      text: t.text || '',
      rating: Number(t.rating) || 5,
      avatar: t.avatar || '👨‍🎓'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateTestimonial(editing.id, form)
      } else {
        await addTestimonial(form)
      }
      setShowModal(false)
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`Are you sure you want to delete the testimonial from "${t.name}"?`)) return
    try {
      await deleteTestimonial(t.id)
    } catch (err) {
      alert('Delete failed')
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Testimonials</h1>
          <p className="text-sm text-slate-500 mt-1">{testimonials?.length || 0} reviews</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {(!testimonials || testimonials.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-slate-500 font-medium mb-3">No testimonials found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "Add Testimonial" to create dynamic reviews that will display on the Home page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white/60 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between group hover:border-slate-300 transition-all relative overflow-hidden">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-2xl flex-shrink-0">
                      {t.avatar || '👨‍🎓'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{t.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                    {renderStars(t.rating || 5)}
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-600 text-sm leading-relaxed italic line-clamp-4">
                  "{t.text}"
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(t)} className="flex-1 py-2 text-center rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                  Edit Testimonial
                </button>
                <button onClick={() => handleDelete(t)} className="py-2 px-3 text-center rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white border border-slate-300 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Student Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. John Doe"
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Course / Role *</label>
                  <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} required placeholder="e.g. MERN Stack Student"
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Avatar Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button type="button" key={emoji} onClick={() => setForm({...form, avatar: emoji})}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all border ${form.avatar === emoji ? 'bg-blue-500/10 border-blue-500 text-slate-900' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rating (1 to 5 Stars)</label>
                <select value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50">
                  <option value="5" className="bg-slate-50">5 Stars (⭐⭐⭐⭐⭐)</option>
                  <option value="4" className="bg-slate-50">4 Stars (⭐⭐⭐⭐)</option>
                  <option value="3" className="bg-slate-50">3 Stars (⭐⭐⭐)</option>
                  <option value="2" className="bg-slate-50">2 Stars (⭐⭐)</option>
                  <option value="1" className="bg-slate-50">1 Star (⭐)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Review Message *</label>
                <textarea value={form.text} onChange={e => setForm({...form, text: e.target.value})} required rows={4} placeholder="What did this student say about their experience?"
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
