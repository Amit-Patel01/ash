import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../config/api'
import { auth } from '../config/firebase'

export default function EmployeeBroadcast() {
  const { courses, enrollments } = useStore()
  const { currentUser, userProfile } = useAuth()

  const assignedEmployeeIds = [currentUser?.uid, userProfile?.uid, userProfile?.employeeId].filter(Boolean)
  // Filter only courses assigned to this employee
  const myCourses = courses.filter(c =>
    assignedEmployeeIds.includes(c.assignedEmployeeId) ||
    assignedEmployeeIds.includes(c.assignedEmployeeRef)
  )

  const [form, setForm] = useState({
    courseId: '',
    planId: '',
    subject: '',
    message: ''
  })
  
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const matchesCourseEnrollment = (enrollment, course) =>
    enrollment.courseId === course.id ||
    (enrollment.courseTitle && enrollment.courseTitle === course.title)

  const selectedCourse = myCourses.find(c => c.id === form.courseId)
  
  // Calculate enrollments for display
  const courseEnrolls = selectedCourse 
    ? enrollments.filter(e => e.status === 'active' && matchesCourseEnrollment(e, selectedCourse))
    : []
    
  const filteredEnrolls = form.planId 
    ? courseEnrolls.filter(e => e.planId === form.planId)
    : courseEnrolls
    
  // Unique plans based on actual enrollments (or you can map from selectedCourse.plans)
  const uniquePlans = [...new Set(courseEnrolls.map(e => e.planLabel || e.planId || 'Unknown').filter(Boolean))]

  const handleSend = async () => {
    if (!form.courseId) return alert('Please select a course first.')
    if (!form.subject.trim() || !form.message.trim()) return alert('Subject and Message are required.')
    
    // Quick confirmation
    if (!window.confirm(`Are you sure you want to broadcast this message to ${filteredEnrolls.length} student(s)?`)) return
    
    setSending(true)
    setResult(null)
    
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('Please log in again to continue.')

      const res = await fetch(api.adminBroadcastEmail, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType: 'course',
          courseId: form.courseId,
          planId: form.planId || null, // null means all plans
          subject: form.subject,
          message: form.message
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send broadcast')
      
      setResult({ success: true, message: data.message })
      setForm({ ...form, subject: '', message: '' }) // wipe the message so we don't double send
    } catch (err) {
      setResult({ success: false, message: err.message })
    } finally {
      setSending(false)
    }
  }

  if (myCourses.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Broadcast Messages</h1>
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-14 text-center">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-xl font-bold text-white mb-2">No courses assigned</h3>
          <p className="text-gray-400 text-sm">You need active courses with students to send targeted broadcasts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Broadcasts</h1>
          <p className="text-sm text-gray-400 mt-1">Send bulk emails to your enrolled students</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium">
          Targeted Reach
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Setup & Stats */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white">Target Audience</h3>
            
            {/* Course Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Select Assigned Course</label>
              <select 
                value={form.courseId} 
                onChange={e => setForm({...form, courseId: e.target.value, planId: ''})}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/50 outline-none"
              >
                <option value="" className="text-gray-900">-- Choose Course --</option>
                {myCourses.map(c => (
                  <option key={c.id} value={c.id} className="text-gray-900">{c.title}</option>
                ))}
              </select>
            </div>

            {/* Plan Select */}
            {selectedCourse && uniquePlans.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Filter by Plan (Optional)</label>
                <select 
                  value={form.planId} 
                  onChange={e => setForm({...form, planId: e.target.value})}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/50 outline-none"
                >
                  <option value="" className="text-gray-900">All Plans</option>
                  {uniquePlans.map(p => {
                    const planMatch = selectedCourse.plans?.find(sp => sp.label === p || sp.id === p);
                    // Match the label or id. Our enrolls keep planLabel usually. 
                    return (
                      <option key={p} value={planMatch?.id || p} className="text-gray-900">{p}</option>
                    )
                  })}
                </select>
              </div>
            )}

            {/* Audience Stats */}
            {selectedCourse && (
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{filteredEnrolls.length}</div>
                <div className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider">Students Selected</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Composer */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 h-full flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Message Composer</h3>
            
            {result && (
              <div className={`p-4 rounded-xl text-sm font-medium ${result.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {result.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Email Subject</label>
              <input 
                value={form.subject} 
                onChange={e => setForm({...form, subject: e.target.value})}
                placeholder="e.g. Schedule Update for Trading Mentorship"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                disabled={!selectedCourse}
              />
            </div>
            
            <div className="flex-1 flex flex-col min-h-[300px]">
              <label className="block text-xs font-semibold text-gray-400 mb-2">Email Body (HTML/Text)</label>
              <textarea 
                value={form.message} 
                onChange={e => setForm({...form, message: e.target.value})}
                placeholder={`Hello students,\n\nWe have an update regarding...`}
                className="flex-1 w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500/50 outline-none resize-none transition-colors"
                disabled={!selectedCourse}
              />
            </div>
            
            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleSend}
                disabled={sending || !selectedCourse || !form.subject.trim() || !form.message.trim() || filteredEnrolls.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    Send to {filteredEnrolls.length} Student{filteredEnrolls.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
