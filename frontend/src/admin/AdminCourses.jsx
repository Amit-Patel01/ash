import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'

export default function AdminCourses() {
  const {
    courses, addCourse, updateCourse, deleteCourse,
    courseCategories, seedCourseCategories,
    users, enrollments
  } = useStore()

  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [saving, setSaving] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const blankForm = {
    title: '', category: '', level: 'Beginner',
    description: '',
    published: false,
    assignedEmployeeId: '', assignedEmployeeName: ''
  }
  const [form, setForm] = useState(blankForm)

  // Seed categories on first load
  useEffect(() => {
    if (!seeded && courseCategories.length === 0) {
      seedCourseCategories().then(() => setSeeded(true))
    }
  }, [courseCategories, seeded, seedCourseCategories])

  // Employees list for assignment
  const employees = users.filter(u => u.role === 'employee' || u.role === 'mentor')

  const filtered = filterCategory === 'All'
    ? courses
    : courses.filter(c => c.category === filterCategory)

  const openCreate = () => {
    setEditingCourse(null)
    setForm(blankForm)
    setShowModal(true)
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setForm({
      title: course.title || '',
      category: course.category || '',
      level: course.level || 'Beginner',
      description: course.description || '',
      published: course.published || false,
      assignedEmployeeId: course.assignedEmployeeId || '',
      assignedEmployeeName: course.assignedEmployeeName || ''
    })
    setShowModal(true)
  }

  const handleAssignEmployee = (uid) => {
    const emp = employees.find(e => e.uid === uid)
    setForm(f => ({
      ...f,
      assignedEmployeeId: uid,
      assignedEmployeeName: emp ? (emp.displayName || emp.name || emp.email) : ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = { ...form }
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload)
      } else {
        // New course: inherit existing fields if any
        await addCourse(payload)
      }
      setShowModal(false)
    } catch (err) {
      alert('Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return
    await deleteCourse(course.id).catch(() => alert('Delete failed'))
  }

  const togglePublish = async (course) => {
    await updateCourse(course.id, { published: !course.published }).catch(() => alert('Failed'))
  }

  const getEnrollCount = (courseId) =>
    enrollments.filter(e => e.courseId === courseId && e.status === 'active').length

  const categoryColors = {
    'Trading': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Web Development': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Python': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Digital Marketing': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    'Graphic Design': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Excel / Data': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    'Other': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  }
  const getCatColor = (cat) => categoryColors[cat] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'

  const allCategories = ['All', ...new Set([
    ...(courseCategories.map(c => c.name)),
    ...courses.map(c => c.category).filter(Boolean)
  ])]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Courses</h1>
          <p className="text-sm text-gray-400 mt-1">
            {courses.length} total &nbsp;·&nbsp;
            <span className="text-emerald-400">{courses.filter(c => c.published).length} published</span>
            &nbsp;·&nbsp;
            <span className="text-gray-500">{courses.filter(c => !c.published).length} draft</span>
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Course
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <span className="font-bold text-blue-200">Published</span> courses appear on the public /courses page.
          Assign an <span className="font-bold text-blue-200">Employee</span> to let them manage the course content, materials, and meeting links.
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}>
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {courses.filter(c => c.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-400 font-medium mb-1">No courses yet</p>
          <p className="text-sm text-gray-600">Click "Add Course" to create your first course</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(course => (
            <div key={course.id}
              className={`relative bg-gray-900/50 border rounded-2xl p-5 transition-all group ${
                course.published ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-white/5 opacity-70 hover:border-white/10'
              }`}>
              {/* Status badge */}
              <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                course.published ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-gray-700/50 text-gray-500 border-gray-600/25'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${course.published ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                {course.published ? 'Published' : 'Draft'}
              </div>

              {/* Thumbnail */}
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-28 object-cover rounded-xl mb-3" onError={e => e.target.style.display='none'} />
              ) : (
                <div className="w-full h-28 rounded-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center mb-3 text-3xl">
                  {courseCategories.find(c => c.name === course.category)?.icon || '📚'}
                </div>
              )}

              {/* Category + Badge */}
              <div className="flex items-center gap-2 mb-2 pr-16">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCatColor(course.category)}`}>
                  {course.category || 'Uncategorized'}
                </span>
                {course.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {course.badge}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-white mb-1 line-clamp-1">{course.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>

              {/* Stats row */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-3 text-gray-500">
                  {course.duration && <span>⏱ {course.duration}</span>}
                  {course.level && <span>📊 {course.level}</span>}
                </div>
                <div className="font-bold text-blue-400">
                  {course.isFree ? <span className="text-emerald-400">FREE</span> : `₹${Number(course.price || 0).toLocaleString('en-IN')}`}
                </div>
              </div>

              {/* Instructor + Enrollments */}
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                {course.assignedEmployeeName ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white">
                      {course.assignedEmployeeName.charAt(0).toUpperCase()}
                    </div>
                    <span>{course.assignedEmployeeName}</span>
                  </div>
                ) : (
                  <span className="text-gray-600 italic">No instructor assigned</span>
                )}
                <span className="text-gray-500">
                  👥 {getEnrollCount(course.id)} enrolled
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={() => togglePublish(course)}
                  title={course.published ? 'Hide' : 'Publish'}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    course.published
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {course.published ? '👁 Visible' : '🙈 Hidden'}
                </button>
                <button onClick={() => openEdit(course)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(course)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl mb-10">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-gray-900 rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-white">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <span className="text-base flex-shrink-0">💡</span>
                <span>Admin creates the course structure. The <strong>assigned employee</strong> will add pricing plans, study materials, meeting links &amp; features from their panel.</span>
              </div>

              {/* Title */}
              <div>
                <label className="label">Course Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Full Stack Web Development" className="input" />
              </div>

              {/* Category + Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="input">
                    <option value="">Select Category</option>
                    {courseCategories.length > 0
                      ? courseCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)
                      : ['Trading','Web Development','Python','Digital Marketing','Graphic Design','Excel / Data','Other'].map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="label">Level</label>
                  <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="input">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Short Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Brief course description..." className="input resize-none" />
              </div>

              {/* Assign Employee */}
              <div>
                <label className="label">Assign Employee / Instructor *</label>
                <select
                  value={form.assignedEmployeeId}
                  onChange={e => handleAssignEmployee(e.target.value)}
                  className="input"
                >
                  <option value="">— Select an employee —</option>
                  {employees.length === 0 && <option disabled>No employees found</option>}
                  {employees.map(emp => (
                    <option key={emp.uid} value={emp.uid}>
                      {emp.displayName || emp.name || emp.email} ({emp.role})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">The assigned employee will manage plans, materials, and meeting links from their Employee Panel</p>
              </div>

              {/* Published toggle */}
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Published</p>
                  <p className="text-[10px] text-gray-500">Make visible to students on /courses</p>
                </div>
                <button type="button" onClick={() => setForm({...form, published: !form.published})}
                  className={`w-11 h-6 rounded-full relative transition-all ${form.published ? 'bg-blue-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.published ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 600; color: #9ca3af; margin-bottom: 6px; }
        .input { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 0.875rem; color: white; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: rgba(59,130,246,0.5); }
        .input option { background: #1f2937; color: white; }
      `}</style>
    </div>
  )
}
