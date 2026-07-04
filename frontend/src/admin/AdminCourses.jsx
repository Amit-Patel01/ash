import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { formatEnrollmentDeadline, isEnrollmentClosed, normalizeEnrollmentDeadline } from '../utils/enrollmentDeadline'
import { getLearningTypeLabel, normalizeLearningType } from '../utils/learningType'
import { CategoryIcon } from '../utils/CategoryIcon'
import { Clock, BarChart, Users, Eye, EyeOff, Lightbulb } from 'lucide-react'
import { isEmployeeRole } from '../utils/roles'

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
    deliveryType: 'course',
    title: '', category: '', level: 'Beginner',
    description: '',
    thumbnail: '',
    enrollmentDeadline: '',
    published: false,
    availableSoon: false,
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
  const employees = users.filter(u => isEmployeeRole(u.role))

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
      deliveryType: normalizeLearningType(course),
      title: course.title || '',
      category: course.category || '',
      level: course.level || 'Beginner',
      description: course.description || '',
      thumbnail: course.thumbnail || course.image || course.imageUrl || '',
      enrollmentDeadline: normalizeEnrollmentDeadline(course.enrollmentDeadline),
      published: course.published || false,
      availableSoon: course.availableSoon === true,
      assignedEmployeeId: course.assignedEmployeeId || '',
      assignedEmployeeName: course.assignedEmployeeName || ''
    })
    setShowModal(true)
  }

  const handleAssignEmployee = (uid) => {
    const emp = employees.find(e => (e.uid || e.id) === uid)
    const assignedId = emp ? (emp.uid || emp.id) : uid
    setForm(f => ({
      ...f,
      assignedEmployeeId: assignedId,
      assignedEmployeeName: emp ? (emp.displayName || emp.name || emp.email) : ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        deliveryType: normalizeLearningType(form),
        title: form.title.trim(),
        description: form.description.trim(),
        thumbnail: form.thumbnail.trim(),
        enrollmentDeadline: normalizeEnrollmentDeadline(form.enrollmentDeadline),
        availableSoon: form.availableSoon === true,
        assignedEmployeeId: form.assignedEmployeeId || '',
        assignedEmployeeName: form.assignedEmployeeName || '',
      }
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload)
      } else {
        // New course: inherit existing fields if any
        await addCourse(payload)
      }
      setShowModal(false)
    } catch {
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

  const getCourseThumbnail = (course) =>
    course?.thumbnail || course?.image || course?.imageUrl || ''

  const categoryColors = {
    'Trading': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'Web Development': 'text-blue-600 bg-blue-50 border-blue-200',
    'Python': 'text-amber-600 bg-amber-50 border-amber-200',
    'Digital Marketing': 'text-pink-600 bg-pink-50 border-pink-200',
    'Graphic Design': 'text-purple-600 bg-purple-50 border-purple-200',
    'Excel / Data': 'text-cyan-600 bg-cyan-50 border-cyan-200',
    'Other': 'text-slate-500 bg-slate-100 border-slate-200',
  }
  const getCatColor = (cat) => categoryColors[cat] || 'text-slate-500 bg-slate-100 border-slate-200'

  const allCategories = ['All', ...new Set([
    ...(courseCategories.map(c => c.name)),
    ...courses.map(c => c.category).filter(Boolean)
  ])]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            {courses.length} total &nbsp;·&nbsp;
            <span className="text-emerald-600 font-semibold">{courses.filter(c => c.published).length} published</span>
            &nbsp;·&nbsp;
            <span className="text-slate-400">{courses.filter(c => !c.published).length} draft</span>
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Course
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <span className="font-bold text-blue-800">Published</span> courses appear on the public /courses page.
          Use <span className="font-bold text-blue-800">Available Soon</span> when you want to announce a program publicly before enrollment opens.
          Assign an <span className="font-bold text-blue-800">Employee</span> later to let them manage the course content, materials, and meeting links.
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
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
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-[0_10px_30px_rgba(148,163,184,0.2)]">
          <div className="flex justify-center mb-4 text-slate-400">
            <CategoryIcon icon="BookOpen" className="w-12 h-12" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No courses yet</p>
          <p className="text-sm text-slate-500">Click "Add Course" to create your first course</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(course => {
            const enrollmentClosed = isEnrollmentClosed(course)
            const deadlineText = formatEnrollmentDeadline(course.enrollmentDeadline)
            const actionLabel = normalizeLearningType(course) === 'webinar' ? 'Registration' : 'Enrollment'

            return (
            <div key={course.id}
              className={`relative bg-white border rounded-2xl p-5 transition-all group shadow-[0_10px_30px_rgba(148,163,184,0.15)] ${
                course.published ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 opacity-80 hover:border-slate-300'
              }`}>
              {/* Status badge */}
              <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                course.published ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${course.published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {course.published ? 'Published' : 'Draft'}
              </div>

              {/* Thumbnail */}
              {getCourseThumbnail(course) ? (
                <div className="relative w-full h-28 overflow-hidden rounded-xl mb-3 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    <CategoryIcon icon={courseCategories.find(c => c.name === course.category)?.icon || 'BookOpen'} className="w-10 h-10 text-slate-300" />
                  </div>
                  <img
                    key={getCourseThumbnail(course)}
                    src={getCourseThumbnail(course)}
                    alt={course.title}
                    className="relative z-10 w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              ) : (
                <div className="w-full h-28 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-3 text-3xl">
                  <CategoryIcon icon={courseCategories.find(c => c.name === course.category)?.icon || 'BookOpen'} className="w-12 h-12 text-blue-400" />
                </div>
              )}

              {/* Category + Badge */}
              <div className="flex items-center gap-2 mb-2 pr-16 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCatColor(course.category)}`}>
                  {course.category || 'Uncategorized'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200">
                  {getLearningTypeLabel(course)}
                </span>
                {course.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    {course.badge}
                  </span>
                )}
                {course.availableSoon && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200">
                    Available Soon
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{course.title}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.description}</p>
              {deadlineText && (
                <p className={`mb-3 text-[11px] font-semibold ${enrollmentClosed ? 'text-rose-600' : 'text-amber-600'}`}>
                  {enrollmentClosed ? `${actionLabel} closed on ${deadlineText}` : `${actionLabel} closes on ${deadlineText}`}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  {course.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>}
                  {course.level && <span className="flex items-center gap-1"><BarChart className="w-3.5 h-3.5" /> {course.level}</span>}
                </div>
                <div className="font-bold text-blue-600">
                  {course.isFree ? <span className="text-emerald-600">FREE</span> : `₹${Number(course.price || 0).toLocaleString('en-IN')}`}
                </div>
              </div>

              {/* Instructor + Enrollments */}
              <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
                {course.assignedEmployeeName ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white">
                      {course.assignedEmployeeName.charAt(0).toUpperCase()}
                    </div>
                    <span>{course.assignedEmployeeName}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No instructor assigned</span>
                )}
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="w-3.5 h-3.5" /> {getEnrollCount(course.id)} enrolled
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button onClick={() => togglePublish(course)}
                  title={course.published ? 'Hide' : 'Publish'}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    course.published
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                  {course.published ? <><Eye className="w-3.5 h-3.5" /> Visible</> : <><EyeOff className="w-3.5 h-3.5" /> Hidden</>}
                </button>
                <button onClick={() => openEdit(course)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(course)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl mb-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-slate-900">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Admin creates the course structure. The <strong>assigned employee</strong> will add pricing plans, study materials, meeting links &amp; features from their panel.</span>
              </div>

              {/* Title */}
              <div>
                <label className="label">{getLearningTypeLabel(form)} Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Full Stack Web Development" className="input" />
              </div>

              {/* Type + Category + Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select value={form.deliveryType} onChange={e => setForm({...form, deliveryType: e.target.value})} className="input">
                    <option value="course">Course</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="input">
                    <option value="">Select Category</option>
                    {courseCategories.length > 0
                      ? courseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                      : ['Trading','Web Development','Python','Digital Marketing','Graphic Design','Excel / Data','Other'].map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Level</label>
                  <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="input">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Enrollment Deadline</label>
                  <input
                    type="date"
                    value={form.enrollmentDeadline}
                    onChange={e => setForm({ ...form, enrollmentDeadline: e.target.value })}
                    className="input"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Leave this empty to keep enrollment open without a deadline.</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Short Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Brief course description..." className="input resize-none" />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="label">Course Image URL</label>
                <input
                  value={form.thumbnail}
                  onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="https://example.com/course-image.jpg"
                  className="input"
                />
                <p className="text-[11px] text-slate-500 mt-1">Enter a direct image URL. It appears on the admin course card, the public courses page, and the student panel.</p>
                <div className="mt-3 relative w-full h-36 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="absolute inset-0 flex items-center justify-center text-3xl text-slate-300">
                    <CategoryIcon icon={courseCategories.find(c => c.name === form.category)?.icon || 'ImageIcon'} className="w-12 h-12 text-slate-300" />
                  </div>
                  {form.thumbnail ? (
                    <img
                      key={form.thumbnail}
                      src={form.thumbnail}
                      alt="Course preview"
                      className="relative z-10 w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : null}
                </div>
              </div>

              {/* Assign Employee */}
              <div>
                <label className="label">Assign Employee / Instructor</label>
                <select
                  value={form.assignedEmployeeId}
                  onChange={e => handleAssignEmployee(e.target.value)}
                  className="input"
                >
                  <option value="">— Select an employee —</option>
                  {employees.length === 0 && <option disabled>No employees found</option>}
                  {employees.map(emp => {
                    const employeeKey = emp.uid || emp.id
                    return (
                      <option key={employeeKey} value={employeeKey}>
                        {emp.displayName || emp.name || emp.email} ({emp.role})
                      </option>
                    )
                  })}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Optional. You can assign this later when the instructor is finalized.</p>
              </div>

              {/* Visibility toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Published</p>
                    <p className="text-[10px] text-slate-500">Make visible to students on /courses</p>
                  </div>
                  <button type="button" onClick={() => setForm({...form, published: !form.published})}
                    className={`w-11 h-6 rounded-full relative transition-all ${form.published ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.published ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Available Soon</p>
                    <p className="text-[10px] text-slate-500">Show publicly as an upcoming program and pause enrollment for now</p>
                  </div>
                  <button type="button" onClick={() => setForm({...form, availableSoon: !form.availableSoon})}
                    className={`w-11 h-6 rounded-full relative transition-all ${form.availableSoon ? 'bg-fuchsia-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.availableSoon ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 6px; }
        .input { width: 100%; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.875rem; color: #0f172a; outline: none; transition: border-color 0.2s, background 0.2s; }
        .input:focus { border-color: #3b82f6; background: #ffffff; }
        .input option { background: #ffffff; color: #0f172a; }
      `}</style>
    </div>
  )
}