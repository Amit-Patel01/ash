'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  MessageSquare,
  AlertCircle,
  X,
  Search,
  Filter,
  Check,
  RefreshCw,
  Plus,
  Sparkles,
  Send,
  Trash2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStore } from '../store/StoreContext'

const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

export default function MentorAssignments() {
  const { currentUser, userProfile } = useAuth()
  const { courses } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [activeTab, setActiveTab] = useState('pending')
  const [selectedSub, setSelectedSub] = useState(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Real-time Submissions state
  const [submissions, setSubmissions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Create Submission Modal (for instant testing & student simulation)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSub, setNewSub] = useState({
    studentName: '',
    studentEmail: '',
    courseTitle: 'Full-Stack Web Development',
    assignmentTitle: '',
    repoUrl: '',
    liveUrl: '',
    studentNotes: ''
  })

  // 1. Fetch Real-time Assignments from API
  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/mentor/assignments', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.assignments)) {
          setSubmissions(data.assignments)
        }
      }
    } catch (err) {
      console.error('Failed to sync assignments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load + Real-time Background Polling (Every 4 seconds)
  useEffect(() => {
    fetchAssignments()
    const interval = setInterval(fetchAssignments, 4000)
    return () => clearInterval(interval)
  }, [fetchAssignments])

  // 2. Submit Grade & Feedback in Realtime
  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSub || !score) return

    setIsSubmitting(true)
    try {
      const finalScore = score.includes('/') ? score : `${score}/100`
      const res = await fetch('/api/mentor/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSub.id || selectedSub._id,
          score: finalScore,
          feedback: feedback.trim() || 'Great submission! Code verified.',
          status: 'graded'
        })
      })

      if (res.ok) {
        setSuccessMsg(`Graded ${selectedSub.studentName}'s assignment (${finalScore}) successfully!`)
        setSelectedSub(null)
        setScore('')
        setFeedback('')
        fetchAssignments()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Failed to save grade:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Request Revision in Realtime
  const handleRequestRevision = async () => {
    if (!selectedSub) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mentor/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSub.id || selectedSub._id,
          feedback: feedback.trim() || 'Please check feedback and resubmit revised code.',
          status: 'revision_requested'
        })
      })

      if (res.ok) {
        setSuccessMsg(`Revision requested for ${selectedSub.studentName}!`)
        setSelectedSub(null)
        setScore('')
        setFeedback('')
        fetchAssignments()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Failed to request revision:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Create New Realtime Assignment Submission
  const handleCreateSubmission = async (e) => {
    e.preventDefault()
    if (!newSub.studentName || !newSub.assignmentTitle) return

    try {
      const res = await fetch('/api/mentor/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      })

      if (res.ok) {
        setShowCreateModal(false)
        setNewSub({
          studentName: '',
          studentEmail: '',
          courseTitle: 'Full-Stack Web Development',
          assignmentTitle: '',
          repoUrl: '',
          liveUrl: '',
          studentNotes: ''
        })
        setSuccessMsg('New assignment submission added to live queue!')
        fetchAssignments()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Failed to submit assignment:', err)
    }
  }

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Delete this submission?')) return
    try {
      const res = await fetch(`/api/mentor/assignments?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg('Submission deleted')
        fetchAssignments()
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleClearAllSubmissions = async () => {
    if (!window.confirm('Clear all demo/old submissions to keep only real data?')) return
    try {
      const res = await fetch('/api/mentor/assignments?clearAll=true', { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg('Queue cleared! Ready for real student submissions.')
        fetchAssignments()
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (err) {
      console.error('Clear failed:', err)
    }
  }

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = (s.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.assignmentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.courseTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (activeTab === 'pending') return s.status === 'pending'
    if (activeTab === 'graded') return s.status === 'graded'
    if (activeTab === 'revision') return s.status === 'revision_requested'
    return true
  })

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Assignment & Project Evaluations 📝
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
              ● Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time student code submissions from MongoDB with live GitHub checks and score publishing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {submissions.length > 0 && (
            <button
              onClick={handleClearAllSubmissions}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Clear all demo/old submissions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Project</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review ({submissions.filter(s => s.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('graded')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'graded'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Graded & Completed ({submissions.filter(s => s.status === 'graded').length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-10 pr-3 py-2 rounded-xl outline-none border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Queue is clear!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              No submissions waiting in this tab. Click "+ Submit New Project" to add one in real time.
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id || sub._id}
              className={`p-6 rounded-3xl border transition-all duration-200 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sub.studentName}
                    </h3>
                    <span className="text-xs text-slate-400">({sub.studentEmail})</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      sub.status === 'graded'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : sub.status === 'revision_requested'
                          ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {sub.status === 'graded' ? `Score: ${sub.score}` : sub.status === 'revision_requested' ? 'Revision Needed' : 'Needs Review'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {sub.courseTitle}
                  </p>
                  
                  <div className={`p-3 rounded-2xl text-xs ${
                    isDark ? 'bg-slate-950/80 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}>
                    <strong className="block mb-1 text-slate-900 dark:text-white font-black">
                      Assignment: {sub.assignmentTitle}
                    </strong>
                    {sub.studentNotes && (
                      <p className="text-slate-500 dark:text-slate-400">
                        "{sub.studentNotes}"
                      </p>
                    )}
                  </div>

                  {sub.feedback && (
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800 text-xs">
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold block">Mentor Feedback:</strong>
                      <span className="text-slate-700 dark:text-slate-300">{sub.feedback}</span>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {sub.repoUrl && (
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 text-white dark:bg-slate-800 hover:opacity-90 transition-opacity"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Source Code Repo</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                    {sub.liveUrl && (
                      <a
                        href={sub.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Deployment URL</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDeleteSubmission(sub.id || sub._id)}
                    className="p-2.5 rounded-2xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Delete submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSub(sub)
                      setScore(sub.score ? sub.score.replace('/100', '') : '')
                      setFeedback(sub.feedback || '')
                    }}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    {sub.status === 'graded' ? 'Update Grade' : 'Grade & Score'}
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Grade Evaluation Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black">Evaluate Assignment</h3>
                <p className="text-xs text-slate-500">{selectedSub.studentName} • {selectedSub.assignmentTitle}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Score / Points (e.g. 90 or 95/100)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 90"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className={`w-full text-sm px-4 py-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mentor Feedback & Review Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide constructive feedback on architecture, code quality, and best practices..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className={`w-full text-xs p-3.5 rounded-xl border outline-none resize-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRequestRevision}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                >
                  Request Revision
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all"
                >
                  {isSubmitting ? 'Publishing...' : 'Save & Publish Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Submission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black">Submit Project for Review</h3>
                <p className="text-xs text-slate-500">Add a live code submission to the real-time queue</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmission} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Kumar"
                    value={newSub.studentName}
                    onChange={(e) => setNewSub({ ...newSub, studentName: e.target.value })}
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
                    placeholder="vikas@example.com"
                    value={newSub.studentEmail}
                    onChange={(e) => setNewSub({ ...newSub, studentEmail: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course Title</label>
                <select
                  value={newSub.courseTitle}
                  onChange={(e) => setNewSub({ ...newSub, courseTitle: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {(courses || []).length > 0 ? (
                    courses.map(c => <option key={c.id || c._id} value={c.title}>{c.title}</option>)
                  ) : (
                    <>
                      <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                      <option value="AI & Machine Learning Internship">AI & Machine Learning Internship</option>
                      <option value="Python & Data Science Bootcamp">Python & Data Science Bootcamp</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Assignment / Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js SaaS Auth & Payment Gateway"
                  value={newSub.assignmentTitle}
                  onChange={(e) => setNewSub({ ...newSub, assignmentTitle: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/user/project"
                    value={newSub.repoUrl}
                    onChange={(e) => setNewSub({ ...newSub, repoUrl: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Live URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://project.vercel.app"
                    value={newSub.liveUrl}
                    onChange={(e) => setNewSub({ ...newSub, liveUrl: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Student Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes about implementation or features completed..."
                  value={newSub.studentNotes}
                  onChange={(e) => setNewSub({ ...newSub, studentNotes: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border outline-none resize-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  Submit to Live Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
