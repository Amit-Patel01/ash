import React, { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

const LiveMeetingPopup = () => {
  const { tradingSessions, tradingEnrollments, tradingCourses } = useStore()
  const { currentUser } = useAuth()
  const location = useLocation()
  
  const [isVisible, setIsVisible] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const [isDismissed, setIsDismissed] = useState(false)

  // Find if there's any session marked as live or starting soon
  useEffect(() => {
    if (!tradingSessions) return

    // 1. Check for LIVE sessions first
    let current = tradingSessions.find(s => s.isLive === true)
    
    // 2. If no live sessions, check for upcoming sessions (next 60 mins)
    if (!current) {
        const now = new Date();
        current = tradingSessions.find(s => {
          if (!s.date || !s.time) return false;
          const sessionDate = new Date(`${s.date}T${s.time}`);
          const diffMs = sessionDate - now;
          const diffMins = diffMs / (1000 * 60);
          return diffMins > 0 && diffMins <= 60;
        });
    }
    
    if (current) {
      setActiveSession(current)
      // Show popup if not dismissed and not on sensitive pages
      const isSensitivePage = ['/login', '/signup', '/admin', '/employee'].some(path => location.pathname.startsWith(path))
      if (!isDismissed && !isSensitivePage) {
        setIsVisible(true)
      }
    } else {
      setIsVisible(false)
      setActiveSession(null)
    }
  }, [tradingSessions, location.pathname, isDismissed])

  if (!isVisible || !activeSession) return null

  // Check if user is enrolled in the course assigned to this session
  const isEnrolled = currentUser && tradingEnrollments?.some(e => 
    e.userId === currentUser.uid && 
    (e.courseId === activeSession.course_id || e.status === 'active')
  )

  const getCourseName = (courseId) => {
    const course = tradingCourses?.find(c => c.id === courseId)
    return course?.name || 'Blueprint Mentorship'
  }

  const handleJoin = () => {
    if (activeSession.meeting_link && activeSession.meeting_link !== '#') {
      window.open(activeSession.meeting_link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-[999] animate-in slide-in-from-left-10 duration-500">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative md:w-[420px] bg-white/90 backdrop-blur-2xl border-2 border-white/40 rounded-3xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] p-7 overflow-hidden">
          {/* Close Button */}
          <button 
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 animate-bounce cursor-default">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${activeSession.isLive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {activeSession.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>}
                  {activeSession.isLive ? 'Live Now' : 'Starting Soon'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getCourseName(activeSession.course_id)}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 line-clamp-1">{activeSession.topic}</h3>
              <p className="text-[11px] font-bold text-slate-500 mt-2 line-clamp-2 leading-tight">
                {activeSession.isLive 
                  ? (isEnrolled ? "You're enrolled! Jump into the live session right now." : "🔥 LIVE MARKET ANALYSIS: Enroll now to get the meeting access link and join the stream!")
                  : (isEnrolled ? "A session is starting soon! Get ready to join." : "🚀 UPCOMING SESSION: Enroll now to receive the access link once we go live!")
                }
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {isEnrolled ? (
              <button 
                onClick={handleJoin}
                className={`flex-1 text-white text-xs font-black py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${activeSession.isLive ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-200 hover:shadow-red-300' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:shadow-blue-300'}`}
              >
                {activeSession.isLive ? 'Join Meeting' : 'Join Link In Session'}
              </button>
            ) : (
              <Link 
                to="/services/trading-mentorship" 
                onClick={() => setIsVisible(false)}
                className="flex-[3] bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white text-[14px] font-black py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(225,29,72,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(225,29,72,0.6)] text-center transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 border-2 border-white/20"
              >
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </div>
                <span className="uppercase tracking-tight">Enroll to Access Link</span>
              </Link>
            )}
            <button 
              onClick={() => setIsDismissed(true)}
              className="flex-1 bg-slate-100 text-slate-500 text-[11px] font-black py-4 rounded-2xl hover:bg-slate-200 transition-all text-center border-2 border-transparent"
            >
              LATER
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMeetingPopup
