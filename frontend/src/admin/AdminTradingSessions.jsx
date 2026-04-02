import { useState } from 'react'
import { useStore } from '../store/StoreContext'

export default function AdminTradingSessions() {
  const { tradingSessions, tradingCourses, addTradingSession, updateTradingSession, deleteTradingSession } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [formData, setFormData] = useState({
    topic: '',
    date: '',
    time: '',
    platform: 'Google Meet',
    meeting_link: '',
    course_id: '',
  })
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingSession(null)
    setFormData({ topic: '', date: '', time: '', platform: 'Google Meet', meeting_link: '', course_id: '' })
    setShowModal(true)
  }

  const openEdit = (session) => {
    setEditingSession(session)
    setFormData({
      topic: session.topic || '',
      date: session.date || '',
      time: session.time || '',
      platform: session.platform || 'Google Meet',
      meeting_link: session.meeting_link || '',
      course_id: session.course_id || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSession) {
        await updateTradingSession(editingSession.id, formData)
      } else {
        await addTradingSession(formData)
      }
      setShowModal(false)
    } catch (err) {
      alert('Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (session) => {
    if (!window.confirm(`Delete session "${session.topic}"?`)) return
    try {
      await deleteTradingSession(session.id)
    } catch (err) {
      alert('Failed to delete session')
    }
  }

  const getCourseName = (courseId) => {
    const course = tradingCourses.find(c => c.id === courseId)
    return course?.name || 'General'
  }

  const platforms = ['Google Meet', 'Zoom', 'Jitsi', 'Microsoft Teams']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Sessions</h1>
          <p className="text-sm text-gray-400 mt-1">{tradingSessions.length} sessions scheduled</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Session
        </button>
      </div>

      {/* Session List */}
      {tradingSessions.length === 0 ? (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-gray-400 mb-4">No sessions scheduled</p>
          <p className="text-sm text-gray-500">Default sessions will be shown on the page until you create real ones.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tradingSessions.map(session => (
            <div key={session.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white">{session.topic}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/30 text-blue-400 bg-blue-500/10">
                      {session.platform || 'Google Meet'}
                    </span>
                    {session.course_id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-500/30 text-purple-400 bg-purple-500/10">
                        {getCourseName(session.course_id)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {session.time}
                    </span>
                    {session.meeting_link && session.meeting_link !== '#' && (
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Join Link
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(session)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(session)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
                </div>
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
              <h2 className="text-lg font-bold text-white">{editingSession ? 'Edit Session' : 'Create Session'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Topic *</label>
                <input type="text" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} required placeholder="e.g. Technical Analysis Deep Dive" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Date *</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Time *</label>
                  <input type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required placeholder="10:00 AM" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Platform</label>
                <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                  {platforms.map(p => <option key={p} value={p} className="bg-gray-900">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Meeting Link</label>
                <input type="url" value={formData.meeting_link} onChange={e => setFormData({ ...formData, meeting_link: e.target.value })} placeholder="https://meet.google.com/..." className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Assign to Course</label>
                <select value={formData.course_id} onChange={e => setFormData({ ...formData, course_id: e.target.value })} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                  <option value="" className="bg-gray-900">General (No specific course)</option>
                  {tradingCourses.map(c => (
                    <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white hover:shadow-lg disabled:opacity-50 transition-all">
                  {saving ? 'Saving...' : (editingSession ? 'Update Session' : 'Create Session')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
