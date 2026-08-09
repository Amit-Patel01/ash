import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '../utils/CategoryIcon'

export default function AdminCourseCategories() {
  const { courseCategories, addCourseCategory, updateCourseCategory, deleteCourseCategory, seedCourseCategories, courses } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', icon: 'BookOpen', color: '#3b82f6' })
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', icon: 'BookOpen', color: '#3b82f6' })
    setShowModal(true)
  }
  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, icon: cat.icon || 'BookOpen', color: cat.color })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateCourseCategory(editing.id, form)
      } else {
        await addCourseCategory(form)
      }
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    const inUse = courses.filter(c => c.category === cat.name).length
    if (inUse > 0) { alert(`Cannot delete — ${inUse} course(s) use this category.`); return }
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    await deleteCourseCategory(cat.id).catch(() => alert('Delete failed'))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Categories</h1>
          <p className="text-sm text-slate-500 mt-1">{courseCategories.length} categories</p>
        </div>
        <div className="flex gap-3">
          {courseCategories.length === 0 && (
            <button onClick={seedCourseCategories}
              className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-600/30 transition-all">
              Seed Defaults
            </button>
          )}
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {courseCategories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center">
          <div className="flex justify-center mb-4 text-slate-400">
            <CategoryIcon icon="BookOpen" className="w-12 h-12" />
          </div>
          <p className="text-slate-500 font-medium mb-3">No categories yet</p>
          <button onClick={seedCourseCategories}
            className="px-5 py-2.5 bg-blue-600 text-slate-900 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
            Seed Default Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseCategories.map(cat => {
            const courseCount = courses.filter(c => c.category === cat.name).length
            return (
              <div key={cat.id} className="bg-white/60 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 group hover:border-slate-300 transition-all">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: cat.color + '20', border: `1px solid ${cat.color}30`, color: cat.color }}>
                  <CategoryIcon icon={cat.icon} className="w-7 h-7" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-400">{courseCount} course{courseCount !== 1 ? 's' : ''}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] text-slate-500 font-mono">{cat.color}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(cat)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Del</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Web Development"
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Icon</label>
                <div className="grid grid-cols-10 gap-1.5">
                  {CATEGORY_ICON_OPTIONS.map(icon => (
                    <button type="button" key={icon} onClick={() => setForm({...form, icon})}
                      className={`h-9 flex items-center justify-center rounded-lg text-lg transition-all ${form.icon === icon ? 'bg-blue-500/30 ring-1 ring-blue-500 text-blue-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}>
                      <CategoryIcon icon={icon} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    className="w-12 h-10 rounded-xl border border-slate-300 bg-transparent cursor-pointer" />
                  <input value={form.color} onChange={e => setForm({...form, color: e.target.value})
                  } placeholder="#3b82f6"
                    className="flex-1 px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500/50" />
                  <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: form.color }} />
                </div>
                {/* Quick colors */}
                <div className="flex gap-2 mt-2">
                  {['#10b981','#3b82f6','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#ef4444','#6b7280'].map(c => (
                    <button type="button" key={c} onClick={() => setForm({...form, color: c})}
                      className="w-6 h-6 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: form.color + '20', border: `1px solid ${form.color}30`, color: form.color }}>
                  <CategoryIcon icon={form.icon} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{form.name || 'Category Name'}</p>
                  <p className="text-[10px] text-slate-400">Preview</p>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-slate-900 hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
