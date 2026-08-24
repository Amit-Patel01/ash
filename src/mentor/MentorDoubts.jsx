'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  User,
  Search,
  Filter,
  Sparkles,
  HelpCircle,
  CornerDownRight,
  Code,
  Plus,
  X,
  Trash2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../store/StoreContext'

export default function MentorDoubts() {
  const { currentUser, userProfile } = useAuth()
  const { courses } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [doubtsList, setDoubtsList] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState({})
  const [activeDoubtId, setActiveDoubtId] = useState(null)
  const [isReplying, setIsReplying] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Ask Doubt modal
  const [showAskModal, setShowAskModal] = useState(false)
  const [newDoubt, setNewDoubt] = useState({
    studentName: '',
    studentEmail: '',
    courseTitle: 'Full-Stack Web Development',
    question: '',
    codeSnippet: ''
  })

  // 1. Fetch Doubts from Real-time API
  const fetchDoubts = useCallback(async () => {
    try {
      const res = await fetch('/api/mentor/doubts', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.doubts)) {
          setDoubtsList(data.doubts)
        }
      }
    } catch (err) {
      console.error('Failed to sync doubts:', err)
    }
  }, [])

  // Initial Load + Auto Background Polling (Every 4 seconds)
  useEffect(() => {
    fetchDoubts()
    const interval = setInterval(fetchDoubts, 4000)
    return () => clearInterval(interval)
  }, [fetchDoubts])

  // 2. Post Solution / Reply in Real-time
  const handlePostReply = async (doubtId) => {
    const text = replyText[doubtId]
    if (!text || !text.trim()) return

    setIsReplying(true)
    try {
      const mentorName = userProfile?.displayName || currentUser?.displayName || 'Mentor'
      const res = await fetch('/api/mentor/doubts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doubtId,
          replyText: text.trim(),
          author: mentorName,
          status: 'resolved'
        })
      })

      if (res.ok) {
        setReplyText(prev => ({ ...prev, [doubtId]: '' }))
        setActiveDoubtId(null)
        setSuccessMsg('Solution published to student discussion thread!')
        fetchDoubts()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Failed to reply to doubt:', err)
    } finally {
      setIsReplying(false)
    }
  }

  // 3. Ask / Create New Real-time Doubt
  const handleCreateDoubt = async (e) => {
    e.preventDefault()
    if (!newDoubt.question.trim()) return

    try {
      const res = await fetch('/api/mentor/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: newDoubt.studentName || currentUser?.displayName || 'Student',
          studentEmail: newDoubt.studentEmail || currentUser?.email || 'student@example.com',
          courseTitle: newDoubt.courseTitle,
          question: newDoubt.question.trim(),
          codeSnippet: newDoubt.codeSnippet.trim()
        })
      })

      if (res.ok) {
        setShowAskModal(false)
        setNewDoubt({
          studentName: '',
          studentEmail: '',
          courseTitle: 'Full-Stack Web Development',
          question: '',
          codeSnippet: ''
        })
        setSuccessMsg('New doubt posted to live mentor board!')
        fetchDoubts()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Failed to post doubt:', err)
    }
  }

  const handleDeleteDoubt = async (id) => {
    if (!window.confirm('Delete this doubt?')) return
    try {
      const res = await fetch(`/api/mentor/doubts?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg('Doubt deleted')
        fetchDoubts()
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleClearAllDoubts = async () => {
    if (!window.confirm('Clear all demo/old questions to start 100% fresh?')) return
    try {
      const res = await fetch('/api/mentor/doubts?clearAll=true', { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg('Doubts board cleared! Ready for real questions.')
        fetchDoubts()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Clear failed:', err)
    }
  }

  const filteredDoubts = doubtsList.filter(d => {
    const matchesSearch = (d.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.courseTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (filterStatus === 'open') return d.status === 'open'
    if (filterStatus === 'resolved') return d.status === 'resolved'
    return true
  })

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Doubt Resolution Board 💬
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
              ● Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time student Q&A threads with code syntax highlighting and instant solution publishing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {doubtsList.length > 0 && (
            <button
              onClick={handleClearAllDoubts}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Clear all demo/old questions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Board</span>
            </button>
          )}
          <button
            onClick={() => setShowAskModal(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ask / Post Doubt</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Questions ({doubtsList.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatus === 'open'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Unresolved ({doubtsList.filter(d => d.status === 'open').length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatus === 'resolved'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Answered ({doubtsList.filter(d => d.status === 'resolved').length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-10 pr-3 py-2 rounded-xl outline-none border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Doubts Feed */}
      <div className="space-y-6">
        {filteredDoubts.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No questions found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Click "+ Ask / Post Doubt" to post a new question in real time.
            </p>
          </div>
        ) : (
          filteredDoubts.map((doubt) => (
            <div
              key={doubt.id || doubt._id}
              className={`p-6 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      {(doubt.studentName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {doubt.studentName}
                      </h3>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {doubt.courseTitle} • {doubt.postedAt || 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleDeleteDoubt(doubt.id || doubt._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      doubt.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {doubt.status === 'resolved' ? 'Answered' : 'Waiting for Mentor'}
                    </span>
                  </div>
                </div>

                {/* Question Content */}
                <p className={`text-sm leading-relaxed font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {doubt.question}
                </p>

                {/* Code Snippet */}
                {doubt.codeSnippet && (
                  <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-indigo-300 overflow-x-auto border border-slate-800 shadow-inner">
                    <pre>{doubt.codeSnippet}</pre>
                  </div>
                )}

                {/* Existing Mentor Replies */}
                {Array.isArray(doubt.replies) && doubt.replies.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {doubt.replies.map((reply, rIdx) => (
                      <div
                        key={rIdx}
                        className={`p-4 rounded-2xl border ${
                          isDark ? 'bg-indigo-950/30 border-indigo-500/20' : 'bg-indigo-50/70 border-indigo-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <strong className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {reply.author || 'Faculty Mentor'}
                          </strong>
                          <span className="text-[10px] text-slate-400">• {reply.time || 'Recently'}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Box */}
                <div className="pt-2">
                  {activeDoubtId === (doubt.id || doubt._id) ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        placeholder="Write your explanation or code solution..."
                        value={replyText[doubt.id || doubt._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [doubt.id || doubt._id]: e.target.value })}
                        className={`w-full text-xs p-3.5 rounded-2xl border outline-none resize-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveDoubtId(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostReply(doubt.id || doubt._id)}
                          disabled={isReplying}
                          className="px-5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isReplying ? 'Publishing...' : 'Post Solution'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveDoubtId(doubt.id || doubt._id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{(doubt.replies || []).length > 0 ? 'Add Another Answer' : 'Reply & Solve Doubt'}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Ask / Post Doubt Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black">Ask a Technical Doubt</h3>
                <p className="text-xs text-slate-500">Post a question to the real-time mentor queue</p>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={newDoubt.studentName}
                    onChange={(e) => setNewDoubt({ ...newDoubt, studentName: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Student Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={newDoubt.studentEmail}
                    onChange={(e) => setNewDoubt({ ...newDoubt, studentEmail: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course</label>
                <select
                  value={newDoubt.courseTitle}
                  onChange={(e) => setNewDoubt({ ...newDoubt, courseTitle: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {(courses || []).length > 0 ? (
                    courses.map(c => <option key={c.id || c._id} value={c.title}>{c.title}</option>)
                  ) : (
                    <>
                      <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                      <option value="AI & Machine Learning Certification Course">AI & Machine Learning Certification Course</option>
                      <option value="Python & Data Science Bootcamp">Python & Data Science Bootcamp</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Your Question / Doubt</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the problem or error you are facing in detail..."
                  value={newDoubt.question}
                  onChange={(e) => setNewDoubt({ ...newDoubt, question: e.target.value })}
                  className={`w-full text-xs p-3.5 rounded-xl border outline-none resize-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Paste relevant error stack trace or code block here..."
                  value={newDoubt.codeSnippet}
                  onChange={(e) => setNewDoubt({ ...newDoubt, codeSnippet: e.target.value })}
                  className={`w-full text-xs p-3.5 rounded-xl border outline-none font-mono resize-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-indigo-300' : 'bg-slate-50 border-slate-200 text-indigo-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  Post to Live Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
