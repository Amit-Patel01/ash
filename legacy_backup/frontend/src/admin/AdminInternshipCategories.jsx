import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { 
  Code, 
  Cpu, 
  Shield, 
  Database, 
  Layers, 
  Globe, 
  Terminal, 
  Cloud, 
  LineChart, 
  MessageSquare, 
  Sparkles,
  HelpCircle
} from 'lucide-react'

const COLOR_OPTIONS = [
  { label: 'Blue',   value: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { label: 'Purple', value: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { label: 'Red',    value: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { label: 'Teal',   value: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
  { label: 'Orange', value: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { label: 'Cyan',   value: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  { label: 'Violet', value: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  { label: 'Sky',    value: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  { label: 'Emerald',value: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Pink',   value: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
]

const ICON_OPTIONS = [
  'Code', 'Cpu', 'Shield', 'Database', 'Layers', 'Globe',
  'Terminal', 'Cloud', 'BarChart', 'Smartphone', 'Lock', 'Zap'
]

const ICON_MAP = {
  Code, Cpu, Shield, Database, Layers, Globe, Terminal, Cloud,
  BarChart: LineChart, Smartphone: MessageSquare, Lock: Shield, Zap: Sparkles
}

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

const EMPTY_FORM = {
  title: '',
  desc: '',
  icon: 'Code',
  duration: '4-8 Weeks',
  level: 'Beginner',
  color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  order: 0,
}

export default function AdminInternshipCategories() {
  const { internshipCategories, addInternshipCategory, updateInternshipCategory, deleteInternshipCategory } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, order: (internshipCategories?.length ?? 0) + 1 })
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      title: cat.title || '',
      desc: cat.desc || '',
      icon: cat.icon || 'Code',
      duration: cat.duration || '4-8 Weeks',
      level: cat.level || 'Beginner',
      color: cat.color || COLOR_OPTIONS[0].value,
      order: cat.order ?? 0,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateInternshipCategory(editing.id, form)
      } else {
        await addInternshipCategory(form)
      }
      setShowModal(false)
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.title}"? It will be removed from the home page.`)) return
    try {
      await deleteInternshipCategory(cat.id)
    } catch {
      alert('Delete failed')
    }
  }

  const colorDot = (colorClass) => {
    const textColor = colorClass.split(' ')[0]
    return <span className={`inline-block w-3 h-3 rounded-full border-2 ${textColor.replace('text-', 'bg-')} border-current`} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internship Categories</h1>
          <p className="text-sm text-slate-500 mt-1">
            {internshipCategories?.length || 0} categories &middot; Displayed on the home page hero section
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">Dynamic Home Page Categories</p>
          <p className="text-xs text-blue-600 mt-0.5">
            These categories are displayed in the <strong>"Internship Categories"</strong> section on the home page.
            When no categories exist in the database, the home page shows built-in defaults as fallback.
            Add at least one category here to switch to dynamic content.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {(!internshipCategories || internshipCategories.length === 0) ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <p className="text-slate-500 font-medium mb-2">No internship categories yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Add Category" to create dynamic internship tracks displayed on the home page.
            Until you add one, the home page will show built-in default categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {internshipCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Order badge */}
              <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                #{cat.order ?? '-'}
              </span>

              {/* Icon chip */}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${cat.color || 'text-blue-500 bg-blue-500/10 border-blue-500/20'}`}>
                {(() => {
                  const IconComp = ICON_MAP[cat.icon] || HelpCircle
                  return <IconComp className="w-5 h-5" />
                })()}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 leading-tight mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{cat.desc}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                  {cat.level}
                </span>
                <span className="text-[10px] text-slate-400">{cat.duration}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 py-1.5 text-center rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? 'Edit Category' : 'Add Internship Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Full Stack Development"
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description *</label>
                <textarea
                  value={form.desc}
                  onChange={e => setForm({ ...form, desc: e.target.value })}
                  required
                  rows={3}
                  placeholder="Brief description of what students learn in this track..."
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              {/* Icon & Level & Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Icon Name</label>
                  <select
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                  >
                    {ICON_OPTIONS.map(ic => (
                      <option key={ic} value={ic} className="bg-slate-50">{ic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Level</label>
                  <select
                    value={form.level}
                    onChange={e => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                  >
                    {LEVEL_OPTIONS.map(l => (
                      <option key={l} value={l} className="bg-slate-50">{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Duration</label>
                  <input
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="4-8 Weeks"
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Card Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setForm({ ...form, color: c.value })}
                      title={c.label}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        form.color === c.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {colorDot(c.value)} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Display Order</label>
                <input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-1">Lower number = shown first</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving...' : editing ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
