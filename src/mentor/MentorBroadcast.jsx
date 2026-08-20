'use client'
import React, { useState } from 'react'
import {
  Megaphone,
  Send,
  Video,
  Calendar,
  Sparkles,
  CheckCircle2,
  Bell,
  Users,
  Link2,
  Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'

export default function MentorBroadcast() {
  const { currentUser, userProfile } = useAuth()
  const { courses } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [title, setTitle] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('All Batches')
  const [sessionType, setSessionType] = useState('live_class')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [successAlert, setSuccessAlert] = useState('')

  const [announcements, setAnnouncements] = useState([
    {
      id: 'ann-1',
      title: '🔴 Live Mentorship: React State Management & Redux Toolkit Deep Dive',
      batch: 'Full-Stack Web Development',
      type: 'Live Session',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      message: 'Join today at 7:00 PM IST. We will build a production-grade store with slice reducers and thunk async handlers.',
      date: 'Today at 2:00 PM',
      pinned: true
    },
    {
      id: 'ann-2',
      title: '📁 Milestone 2 Project Submissions Deadline Extended',
      batch: 'AI & Machine Learning Internship',
      type: 'Announcement',
      meetingUrl: '',
      message: 'Based on student requests, the deadline for submitting the Churn Model repository has been extended to Sunday 11:59 PM.',
      date: 'Yesterday',
      pinned: false
    }
  ])

  const handlePublish = (e) => {
    e.preventDefault()
    if (!title || !message) return

    setIsSending(true)
    setTimeout(() => {
      const newAnn = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        batch: selectedBatch,
        type: sessionType === 'live_class' ? 'Live Session' : 'Announcement',
        meetingUrl: meetingUrl.trim(),
        message: message.trim(),
        date: 'Just now',
        pinned: false
      }

      setAnnouncements([newAnn, ...announcements])
      setTitle('')
      setMeetingUrl('')
      setMessage('')
      setIsSending(false)
      setSuccessAlert(`Broadcast published and notification sent to ${selectedBatch}!`)
      setTimeout(() => setSuccessAlert(''), 5000)
    }, 600)
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Batch Announcements & Live Sessions 📢
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Broadcast class announcements, share live Google Meet/Zoom links, and notify enrolled students
          </p>
        </div>
      </div>

      {successAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* Two Column Layout: Form & Existing Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left 3 cols: Create Broadcast */}
        <div className={`lg:col-span-3 p-6 sm:p-7 rounded-3xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h2 className={`text-lg font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Create New Broadcast
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Post an update or live meeting link to students in your batches
          </p>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Broadcast Title / Class Topic
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Live Q&A Session on Async JavaScript & Promises"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-xs px-4 py-3 rounded-2xl outline-none border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Batch
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className={`w-full text-xs px-4 py-3 rounded-2xl outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="All Batches">All My Enrolled Batches</option>
                  {(courses || []).map(c => (
                    <option key={c.id || c._id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Type of Update
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className={`w-full text-xs px-4 py-3 rounded-2xl outline-none border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="live_class">🔴 Live Session / Video Class</option>
                  <option value="announcement">📢 Batch Announcement / Resource</option>
                </select>
              </div>
            </div>

            {sessionType === 'live_class' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Live Class Link (Google Meet / Zoom / YouTube)
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    className={`w-full text-xs pl-10 pr-4 py-3 rounded-2xl outline-none border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Message & Agenda Notes
              </label>
              <textarea
                rows={4}
                required
                placeholder="Detail what will be covered, prerequisites, or preparation notes for students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full text-xs p-4 rounded-2xl outline-none border resize-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Broadcasting...' : 'Publish to Batch'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 cols: Recent Broadcast Feed */}
        <div className={`lg:col-span-2 p-6 sm:p-7 rounded-3xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h2 className={`text-lg font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Announcements
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Active notifications currently visible to students
          </p>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-2xl border transition-all ${
                  ann.pinned
                    ? isDark ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'
                    : isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    {ann.type}
                  </span>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>

                <h3 className={`text-xs font-black line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {ann.title}
                </h3>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {ann.message}
                </p>

                {ann.meetingUrl && (
                  <div className="mt-3">
                    <a
                      href={ann.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Session</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
