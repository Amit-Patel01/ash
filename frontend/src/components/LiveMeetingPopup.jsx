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

  // Find if there's any session marked as live
  useEffect(() => {
    if (!tradingSessions) return

    const liveSession = tradingSessions.find(s => s.isLive === true)
    
    if (liveSession) {
      setActiveSession(liveSession)
      // Show popup if not dismissed and not on sensitive pages
      const isSensitivePage = ['/login', '/signup', '/admin', '/employee'].some(path => location.pathname.startsWith(path))
      if (!isDismissed && !isSensitivePage) {
        setIsVisible(true)
      }
    } else {
      setIsVisible(false)
      setActiveSession(null)
      setIsDismissed(false) // Reset dismiss state when no session is live
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
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative md:w-96 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 overflow-hidden">
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
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600 uppercase tracking-tighter">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                  Live Now
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getCourseName(activeSession.course_id)}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 line-clamp-1">{activeSession.topic}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                {isEnrolled ? "Jump into the session right now to clarify your doubts." : "Our experts are analyzing the markets live. Enroll now to access the link."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {isEnrolled ? (
              <button 
                onClick={handleJoin}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black py-2.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:scale-[1.02] active:scale-95"
              >
                Join Meeting
              </button>
            ) : (
              <Link 
                to="/services/trading-mentorship" 
                onClick={() => setIsVisible(false)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black py-2.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 text-center transition-all hover:scale-[1.02] active:scale-95"
              >
                Enroll to Join
              </Link>
            )}
            <button 
              onClick={() => setIsDismissed(true)}
              className="px-4 bg-slate-100 text-slate-500 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMeetingPopup
