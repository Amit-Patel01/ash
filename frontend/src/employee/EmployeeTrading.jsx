import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

export default function EmployeeTrading() {
  const { tradingCourses, tradingSessions, employeePermissions, addTradingCourse, updateTradingCourse, deleteTradingCourse, addTradingSession, updateTradingSession, deleteTradingSession, tradingCurriculum, addCurriculumModule, updateCurriculumModule, deleteCurriculumModule, seedDefaultCurriculum } = useStore()
  const { currentUser, userProfile } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [courseForm, setCourseForm] = useState({ name: '', price: '', description: '', features: '', highlighted: false, badge: '' })
  const [sessionForm, setSessionForm] = useState({ topic: '', date: '', time: '', platform: 'Google Meet', meeting_link: '', course_id: '' })

  // Get current user permissions
  const userId = currentUser?.uid
  const perms = employeePermissions[userId] || {}
  const canManageCourses = perms.can_manage_courses === true
  const canManagePricing = perms.can_manage_pricing === true
  const canCreateSessions = perms.can_create_sessions === true
  const canEditCurriculum = perms.can_edit_curriculum === true
  const hasAnyPermission = canManageCourses || canManagePricing || canCreateSessions || canEditCurriculum

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Course handlers
  const openCreateCourse = () => {
    setEditingCourse(null)
    setCourseForm({ name: '', price: '', description: '', features: '', highlighted: false, badge: '' })
    setShowCourseModal(true)
  }
  const openEditCourse = (c) => {
    setEditingCourse(c)
    setCourseForm({
      name: c.name || '', price: c.price || '', description: c.description || '',
      features: Array.isArray(c.features) ? c.features.join('\n') : (c.features || ''),
      highlighted: c.highlighted || false, badge: c.badge || ''
    })
    setShowCourseModal(true)
  }
  const handleCourseSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...courseForm, price: Number(courseForm.price), features: courseForm.features.split('\n').map(s => s.trim()).filter(Boolean) }
      if (editingCourse) await updateTradingCourse(editingCourse.id, payload)
      else await addTradingCourse(payload)
      setShowCourseModal(false)
      showSuccess('Course saved!')
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }
  const handleDeleteCourse = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return
    try { await deleteTradingCourse(c.id); showSuccess('Course deleted') } catch { alert('Failed') }
  }

  // Session handlers
  const openCreateSession = () => {
    setEditingSession(null)
    setSessionForm({ topic: '', date: '', time: '', platform: 'Google Meet', meeting_link: '', course_id: '' })
    setShowSessionModal(true)
  }
  const openEditSession = (s) => {
    setEditingSession(s)
    setSessionForm({ topic: s.topic || '', date: s.date || '', time: s.time || '', platform: s.platform || 'Google Meet', meeting_link: s.meeting_link || '', course_id: s.course_id || '' })
    setShowSessionModal(true)
  }
  const handleSessionSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSession) await updateTradingSession(editingSession.id, sessionForm)
      else await addTradingSession(sessionForm)
      setShowSessionModal(false)
      showSuccess('Session saved!')
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }
  const handleDeleteSession = async (s) => {
    if (!window.confirm(`Delete "${s.topic}"?`)) return
    try { await deleteTradingSession(s.id); showSuccess('Session deleted') } catch { alert('Failed') }
  }

  // Curriculum state
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [moduleForm, setModuleForm] = useState({ label: '', iconName: 'book', topics: '' })
  const [topicInput, setTopicInput] = useState('')

  const ICON_OPTIONS = [
    { key: 'book', label: 'Book' },
    { key: 'chart', label: 'Chart' },
    { key: 'bolt', label: 'Bolt' },
    { key: 'trending', label: 'Trending' },
    { key: 'shield', label: 'Shield' },
    { key: 'sparkle', label: 'Sparkle' },
  ]

  const openCreateModule = () => {
    setEditingModule(null)
    setModuleForm({ label: '', iconName: 'book', topics: '' })
    setShowModuleModal(true)
  }
  const openEditModule = (m) => {
    setEditingModule(m)
    setModuleForm({
      label: m.label || '',
      iconName: m.iconName || 'book',
      topics: Array.isArray(m.topics) ? m.topics.join('\n') : (m.topics || '')
    })
    setShowModuleModal(true)
  }
  const handleModuleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        label: moduleForm.label,
        iconName: moduleForm.iconName,
        topics: moduleForm.topics.split('\n').map(s => s.trim()).filter(Boolean)
      }
      if (editingModule) await updateCurriculumModule(editingModule.id, payload)
      else await addCurriculumModule(payload)
      setShowModuleModal(false)
      showSuccess('Module saved!')
    } catch { alert('Failed to save') }
    finally { setSaving(false) }
  }
  const handleDeleteModule = async (m) => {
    if (!window.confirm(`Delete "${m.label}" module?`)) return
    try { await deleteCurriculumModule(m.id); showSuccess('Module deleted') } catch { alert('Failed') }
  }

  if (!hasAnyPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Trading Access Restricted</h2>
        <p className="text-gray-400 text-sm max-w-sm">You don't have any trading mentorship permissions yet. Contact your admin to request access.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trading Mentorship</h1>
        <p className="text-sm text-gray-400 mt-1">Manage courses, pricing, and live sessions</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-in fade-in">
          {successMsg}
        </div>
      )}

      {/* Permission Badges */}
      <div className="flex flex-wrap gap-2">
        {canManageCourses && <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Can Manage Courses</span>}
        {canManagePricing && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Can Manage Pricing</span>}
        {canCreateSessions && <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Can Create Sessions</span>}
        {canEditCurriculum && <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Can Edit Curriculum</span>}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button onClick={() => setActiveSection('overview')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeSection === 'overview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Overview</button>
        {canManageCourses && (
          <button onClick={() => setActiveSection('courses')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeSection === 'courses' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Courses</button>
        )}
        {(canManagePricing || canManageCourses) && (
          <button onClick={() => setActiveSection('pricing')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeSection === 'pricing' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Pricing</button>
        )}
        {canCreateSessions && (
          <button onClick={() => setActiveSection('sessions')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeSection === 'sessions' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Live Sessions</button>
        )}
        {canEditCurriculum && (
          <button onClick={() => setActiveSection('curriculum')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeSection === 'curriculum' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Curriculum</button>
        )}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 text-center">
            <p className="text-3xl font-extrabold text-blue-400">{tradingCourses.length}</p>
            <p className="text-sm text-gray-400 mt-1">Courses</p>
          </div>
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 text-center">
            <p className="text-3xl font-extrabold text-purple-400">{tradingSessions.length}</p>
            <p className="text-sm text-gray-400 mt-1">Sessions</p>
          </div>
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 text-center">
            <p className="text-3xl font-extrabold text-emerald-400">{[canManageCourses, canManagePricing, canCreateSessions].filter(Boolean).length}</p>
            <p className="text-sm text-gray-400 mt-1">Your Permissions</p>
          </div>
        </div>
      )}

      {/* Courses Section */}
      {activeSection === 'courses' && canManageCourses && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openCreateCourse} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Course
            </button>
          </div>
          {tradingCourses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No courses yet. Click "Add Course" to create one.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tradingCourses.map(c => (
                <div key={c.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 group hover:border-white/10 transition-all">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-white">{c.name}</h4>
                    <span className="text-blue-400 font-bold">₹{Number(c.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEditCourse(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Edit</button>
                    <button onClick={() => handleDeleteCourse(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pricing Section */}
      {activeSection === 'pricing' && (canManagePricing || canManageCourses) && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Edit pricing for each course. Changes reflect on the public Trading Mentorship page.</p>
          {tradingCourses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No courses to edit pricing for.</p>
          ) : (
            <div className="space-y-3">
              {tradingCourses.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-gray-900/50 border border-white/5 rounded-xl p-4">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.badge || 'No badge'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-blue-400">₹{Number(c.price || 0).toLocaleString('en-IN')}</span>
                    <button onClick={() => openEditCourse(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sessions Section */}
      {activeSection === 'sessions' && canCreateSessions && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openCreateSession} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-sm font-medium text-white hover:shadow-lg transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Create Live Session
            </button>
          </div>
          {tradingSessions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No sessions yet. Click "Create Live Session" to schedule one.</p>
          ) : (
            <div className="space-y-3">
              {tradingSessions.map(s => (
                <div key={s.id} className="bg-gray-900/50 border border-white/5 rounded-xl p-4 group hover:border-white/10 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">{s.topic}</h4>
                      <p className="text-sm text-gray-400">{s.date} at {s.time} — {s.platform}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {s.meeting_link && s.meeting_link !== '#' && (
                        <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Join</a>
                      )}
                      <button onClick={() => openEditSession(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Edit</button>
                      <button onClick={() => handleDeleteSession(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Curriculum Section */}
      {activeSection === 'curriculum' && canEditCurriculum && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Manage curriculum modules shown on the public Trading Mentorship page.</p>
            <div className="flex gap-2">
              {tradingCurriculum.length === 0 && (
                <button onClick={async () => { setSaving(true); try { await seedDefaultCurriculum(); showSuccess('Default curriculum seeded!') } catch { alert('Failed') } finally { setSaving(false) }}} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                  Seed Defaults
                </button>
              )}
              <button onClick={openCreateModule} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-sm font-medium text-white hover:shadow-lg transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Module
              </button>
            </div>
          </div>
          {tradingCurriculum.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              </div>
              <p className="text-gray-500 text-sm">No curriculum modules yet. Click "Seed Defaults" to load default modules or "Add Module" to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tradingCurriculum.map((m, idx) => (
                <div key={m.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 group hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{m.label}</h4>
                        <p className="text-xs text-gray-500">{(m.topics || []).length} topics</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditModule(m)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">Edit</button>
                      <button onClick={() => handleDeleteModule(m)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-13">
                    {(m.topics || []).map((topic, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-gray-400">{topic}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCourseModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setShowCourseModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Course Name *</label>
                <input type="text" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Price (₹) *</label>
                  <input type="number" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" disabled={!canManagePricing} />
                  {!canManagePricing && <p className="text-[10px] text-amber-400 mt-1">Pricing permission required</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Badge</label>
                  <input type="text" value={courseForm.badge} onChange={e => setCourseForm({...courseForm, badge: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} rows={3} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Features (one per line)</label>
                <textarea value={courseForm.features} onChange={e => setCourseForm({...courseForm, features: e.target.value})} rows={4} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none font-mono" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <p className="text-sm font-semibold text-white">Highlighted</p>
                <button type="button" onClick={() => setCourseForm({...courseForm, highlighted: !courseForm.highlighted})} className={`w-12 h-6 rounded-full transition-all relative ${courseForm.highlighted ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseForm.highlighted ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white disabled:opacity-50">
                  {saving ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSessionModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingSession ? 'Edit Session' : 'Create Session'}</h2>
              <button onClick={() => setShowSessionModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSessionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Topic *</label>
                <input type="text" value={sessionForm.topic} onChange={e => setSessionForm({...sessionForm, topic: e.target.value})} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Date *</label>
                  <input type="date" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Time *</label>
                  <input type="text" value={sessionForm.time} onChange={e => setSessionForm({...sessionForm, time: e.target.value})} required placeholder="10:00 AM" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform</label>
                <select value={sessionForm.platform} onChange={e => setSessionForm({...sessionForm, platform: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                  {['Google Meet', 'Zoom', 'Jitsi', 'Microsoft Teams'].map(p => <option key={p} value={p} className="bg-gray-900">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Meeting Link</label>
                <input type="url" value={sessionForm.meeting_link} onChange={e => setSessionForm({...sessionForm, meeting_link: e.target.value})} placeholder="https://meet.google.com/..." className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Assign to Course</label>
                <select value={sessionForm.course_id} onChange={e => setSessionForm({...sessionForm, course_id: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                  <option value="" className="bg-gray-900">General</option>
                  {tradingCourses.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSessionModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-bold text-white disabled:opacity-50">
                  {saving ? 'Saving...' : (editingSession ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModuleModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingModule ? 'Edit Module' : 'Add Module'}</h2>
              <button onClick={() => setShowModuleModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleModuleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Module Name *</label>
                <input type="text" value={moduleForm.label} onChange={e => setModuleForm({...moduleForm, label: e.target.value})} required placeholder="e.g. Market Basics" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Icon</label>
                <select value={moduleForm.iconName} onChange={e => setModuleForm({...moduleForm, iconName: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                  {ICON_OPTIONS.map(opt => <option key={opt.key} value={opt.key} className="bg-gray-900">{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Topics (one per line) *</label>
                <textarea value={moduleForm.topics} onChange={e => setModuleForm({...moduleForm, topics: e.target.value})} required rows={6} placeholder={"Topic 1\nTopic 2\nTopic 3"} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none font-mono" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModuleModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-sm font-bold text-white disabled:opacity-50">
                  {saving ? 'Saving...' : (editingModule ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
