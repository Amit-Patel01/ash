import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

const PLAN_BLANK = { label: '', duration: '', price: '', isFree: false, highlighted: false, features: '' }

export default function EmployeeCourseManage() {
  const { courses, updateCourse, enrollments } = useStore()
  const { currentUser } = useAuth()

  const myCourses = courses.filter(c => c.assignedEmployeeId === currentUser?.uid)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('plans') // plans | materials | meeting | students

  // ─── Plan states ───────────────────────────────────
  const [planForm, setPlanForm] = useState(PLAN_BLANK)
  const [editingPlanIdx, setEditingPlanIdx] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)

  // ─── Material states ────────────────────────────────
  const [matForm, setMatForm] = useState({ title: '', url: '' })

  // ─── Meeting link states ────────────────────────────
  const [meetingLink, setMeetingLink] = useState('')
  const [editMeet, setEditMeet] = useState(false)

  const openCourse = (course) => {
    setSelectedCourse(course)
    setMeetingLink(course.meetingLink || '')
    setActiveTab('plans')
    setEditMeet(false)
  }

  // ─── Plans CRUD ─────────────────────────────────────
  const openAddPlan = () => {
    setPlanForm(PLAN_BLANK)
    setEditingPlanIdx(null)
    setShowPlanModal(true)
  }
  const openEditPlan = (plan, idx) => {
    setPlanForm({
      label: plan.label || '',
      duration: plan.duration || '',
      price: plan.price || '',
      isFree: plan.isFree || plan.price === 0 || false,
      highlighted: plan.highlighted || false,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : ''
    })
    setEditingPlanIdx(idx)
    setShowPlanModal(true)
  }

  const savePlan = async () => {
    if (!planForm.label.trim() || !planForm.duration.trim()) return
    setSaving(true)
    try {
      const plans = Array.isArray(selectedCourse.plans) ? [...selectedCourse.plans] : []
      const planData = {
        id: planForm.label.toLowerCase().replace(/\s+/g, '-'),
        label: planForm.label.trim(),
        duration: planForm.duration.trim(),
        price: planForm.isFree ? 0 : Number(planForm.price) || 0,
        isFree: planForm.isFree,
        highlighted: planForm.highlighted,
        features: planForm.features.split('\n').map(s => s.trim()).filter(Boolean)
      }
      if (editingPlanIdx !== null) {
        plans[editingPlanIdx] = planData
      } else {
        plans.push(planData)
      }
      await updateCourse(selectedCourse.id, { plans })
      setSelectedCourse({ ...selectedCourse, plans })
      setShowPlanModal(false)
    } finally {
      setSaving(false)
    }
  }

  const deletePlan = async (idx) => {
    if (!window.confirm('Delete this plan?')) return
    const plans = (selectedCourse.plans || []).filter((_, i) => i !== idx)
    await updateCourse(selectedCourse.id, { plans })
    setSelectedCourse({ ...selectedCourse, plans })
  }

  const movePlan = async (idx, dir) => {
    const plans = [...(selectedCourse.plans || [])]
    const to = idx + dir
    if (to < 0 || to >= plans.length) return
    ;[plans[idx], plans[to]] = [plans[to], plans[idx]]
    await updateCourse(selectedCourse.id, { plans })
    setSelectedCourse({ ...selectedCourse, plans })
  }

  // ─── Materials CRUD ──────────────────────────────────
  const addMaterial = async () => {
    if (!matForm.title.trim() || !matForm.url.trim()) return
    setSaving(true)
    try {
      const mats = [...(selectedCourse.materials || []), { title: matForm.title.trim(), url: matForm.url.trim() }]
      await updateCourse(selectedCourse.id, { materials: mats })
      setSelectedCourse({ ...selectedCourse, materials: mats })
      setMatForm({ title: '', url: '' })
    } finally { setSaving(false) }
  }
  const removeMaterial = async (idx) => {
    const mats = (selectedCourse.materials || []).filter((_, i) => i !== idx)
    await updateCourse(selectedCourse.id, { materials: mats })
    setSelectedCourse({ ...selectedCourse, materials: mats })
  }

  // ─── Meeting link ────────────────────────────────────
  const saveMeeting = async () => {
    setSaving(true)
    try {
      await updateCourse(selectedCourse.id, { meetingLink })
      setSelectedCourse({ ...selectedCourse, meetingLink })
      setEditMeet(false)
    } finally { setSaving(false) }
  }

  const courseEnrollments = selectedCourse
    ? enrollments.filter(e => e.courseId === selectedCourse.id && e.status === 'active')
    : []

  if (myCourses.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">My Assigned Courses</h1>
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-white mb-2">No courses assigned</h3>
          <p className="text-gray-400 text-sm">Ask the admin to assign you as instructor for a course</p>
        </div>
      </div>
    )
  }

  const TABS = [
    { id: 'plans', label: '💰 Plans', title: 'Duration Plans & Pricing' },
    { id: 'materials', label: '📄 Materials', title: 'Study Materials' },
    { id: 'meeting', label: '📹 Session Link', title: 'Meeting / Session Link' },
    { id: 'students', label: '👥 Students', title: 'Enrolled Students' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Assigned Courses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course list */}
        <div className="lg:col-span-1 space-y-2">
          {myCourses.map(course => {
            const cnt = enrollments.filter(e => e.courseId === course.id && e.status === 'active').length
            const planCount = (course.plans || []).length
            return (
              <button key={course.id} onClick={() => openCourse(course)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedCourse?.id === course.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-gray-900/50 hover:border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center text-lg flex-shrink-0">
                    📚
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{course.title}</h4>
                    <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                      <span>{planCount} plans</span>
                      <span>·</span>
                      <span>{cnt} students</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-3">
          {!selectedCourse ? (
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
              <p className="text-gray-500">Select a course to manage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedCourse.title}</h2>
                  <p className="text-sm text-gray-400">{selectedCourse.category} · {selectedCourse.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-400">
                    {(selectedCourse.plans || []).length} plan{(selectedCourse.plans || []).length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500">{courseEnrollments.length} enrolled</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-white/5">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ─── PLANS TAB ─────────────────────────────────── */}
              {activeTab === 'plans' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Duration Plans & Pricing</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Students see these plans on the course page</p>
                    </div>
                    <button onClick={openAddPlan}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add Plan
                    </button>
                  </div>

                  {!(selectedCourse.plans || []).length ? (
                    <div className="py-10 text-center">
                      <p className="text-3xl mb-2">💰</p>
                      <p className="text-gray-500 text-sm mb-1">No plans added yet</p>
                      <p className="text-xs text-gray-600">Add plans like Basic 1-Month, Standard 3-Months, Premium 6-Months</p>
                      <button onClick={openAddPlan} className="mt-4 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-600/30 transition-all">
                        Add First Plan
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(selectedCourse.plans || []).map((plan, idx) => (
                        <div key={idx} className={`relative rounded-2xl border p-5 ${plan.highlighted ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/5 bg-white/[0.02]'}`}>
                          {plan.highlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                              ★ Most Popular
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-white">{plan.label}</h4>
                              <p className="text-xs text-gray-500">{plan.duration}</p>
                            </div>
                            <p className={`text-lg font-black ${plan.highlighted ? 'text-blue-400' : 'text-white'}`}>
                              {plan.isFree || plan.price === 0 ? 'FREE' : `₹${Number(plan.price).toLocaleString('en-IN')}`}
                            </p>
                          </div>
                          {plan.features?.length > 0 && (
                            <ul className="space-y-1 mb-3">
                              {plan.features.slice(0, 3).map((f, fi) => (
                                <li key={fi} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <span className="text-emerald-400">✓</span> {f}
                                </li>
                              ))}
                              {plan.features.length > 3 && <li className="text-[10px] text-gray-600">+{plan.features.length - 3} more</li>}
                            </ul>
                          )}
                          <div className="flex gap-1 mt-auto">
                            <button onClick={() => movePlan(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/10 disabled:opacity-30 text-xs">↑</button>
                            <button onClick={() => movePlan(idx, 1)} disabled={idx === (selectedCourse.plans || []).length - 1} className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/10 disabled:opacity-30 text-xs">↓</button>
                            <button onClick={() => openEditPlan(plan, idx)} className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors">Edit</button>
                            <button onClick={() => deletePlan(idx)} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── MATERIALS TAB ──────────────────────────────── */}
              {activeTab === 'materials' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Study Materials</h3>
                  <div className="flex gap-2 mb-4">
                    <input value={matForm.title} onChange={e => setMatForm({...matForm, title: e.target.value})} placeholder="Material title" className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                    <input value={matForm.url} onChange={e => setMatForm({...matForm, url: e.target.value})} placeholder="URL / link" className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                    <button onClick={addMaterial} disabled={saving || !matForm.title || !matForm.url} className="px-4 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 transition-all">Add</button>
                  </div>
                  {!(selectedCourse.materials || []).length ? (
                    <p className="text-sm text-gray-600 italic py-4">No materials added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(selectedCourse.materials || []).map((mat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                          <span className="text-xl">📄</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{mat.title}</p>
                            <p className="text-[10px] text-gray-500 truncate">{mat.url}</p>
                          </div>
                          <button onClick={() => removeMaterial(i)} className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── MEETING LINK TAB ───────────────────────────── */}
              {activeTab === 'meeting' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Meeting / Live Session Link</h3>
                    <button onClick={() => setEditMeet(!editMeet)} className="text-xs font-bold text-blue-400 hover:text-blue-300">{editMeet ? 'Cancel' : 'Edit'}</button>
                  </div>
                  {editMeet ? (
                    <div className="flex gap-2">
                      <input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/... or Zoom link"
                        className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                      <button onClick={saveMeeting} disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">Save</button>
                    </div>
                  ) : selectedCourse.meetingLink ? (
                    <a href={selectedCourse.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 underline break-all">{selectedCourse.meetingLink}</a>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No meeting link set. Click Edit to add.</p>
                  )}
                </div>
              )}

              {/* ─── STUDENTS TAB ───────────────────────────────── */}
              {activeTab === 'students' && (
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Enrolled Students ({courseEnrollments.length})</h3>
                  {courseEnrollments.length === 0 ? <p className="text-sm text-gray-600 italic py-4">No students enrolled yet</p> : (
                    <div className="space-y-2">
                      {courseEnrollments.map(enr => (
                        <div key={enr.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {(enr.userName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{enr.userName || '—'}</p>
                            <p className="text-[10px] text-gray-500">{enr.userEmail} · {enr.planLabel || 'Standard'}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-blue-400">{Number(enr.amount) === 0 ? 'FREE' : `₹${Number(enr.amount).toLocaleString('en-IN')}`}</p>
                            {enr.userMobile && <p className="text-[10px] text-gray-500">{enr.userMobile}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── PLAN MODAL ──────────────────────────────────────── */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPlanModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl mb-10">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingPlanIdx !== null ? 'Edit Plan' : 'Add Duration Plan'}</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="label">Plan Name *</label>
                <input value={planForm.label} onChange={e => setPlanForm({...planForm, label: e.target.value})} placeholder="e.g. Basic / Standard / Premium" className="input" />
              </div>
              {/* Duration */}
              <div>
                <label className="label">Duration *</label>
                <input value={planForm.duration} onChange={e => setPlanForm({...planForm, duration: e.target.value})} placeholder="e.g. 1 Month / 3 Months / 6 Months" className="input" />
              </div>
              {/* Price */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="label">Price (₹)</label>
                  <input type="number" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} disabled={planForm.isFree} placeholder="4999" className="input disabled:opacity-40" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <button type="button" onClick={() => setPlanForm({...planForm, isFree: !planForm.isFree})}
                    className={`w-10 h-5 rounded-full relative transition-all ${planForm.isFree ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${planForm.isFree ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm text-gray-400">Free</span>
                </div>
              </div>
              {/* Features */}
              <div>
                <label className="label">Features (one per line)</label>
                <textarea value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} rows={5}
                  placeholder="30 Recorded Videos&#10;Weekly Live Sessions&#10;1-on-1 Doubt Clearing&#10;Certificate on Completion&#10;WhatsApp Support Group"
                  className="input resize-none font-mono text-xs" />
              </div>
              {/* Highlighted */}
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Mark as "Most Popular"</p>
                  <p className="text-[10px] text-gray-500">Shows a highlighted badge on this plan</p>
                </div>
                <button type="button" onClick={() => setPlanForm({...planForm, highlighted: !planForm.highlighted})}
                  className={`w-11 h-6 rounded-full relative transition-all ${planForm.highlighted ? 'bg-amber-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${planForm.highlighted ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={savePlan} disabled={saving || !planForm.label || !planForm.duration}
                  className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : editingPlanIdx !== null ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 600; color: #9ca3af; margin-bottom: 6px; }
        .input { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 0.875rem; color: white; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: rgba(59,130,246,0.5); }
      `}</style>
    </div>
  )
}
