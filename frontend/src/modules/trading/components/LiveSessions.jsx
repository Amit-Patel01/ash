import React from 'react'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../../context/AuthContext'

const LiveSessions = () => {
  const { tradingSessions, tradingEnrollments, loading } = useStore()
  const { currentUser, isAdmin, isEmployee } = useAuth()

  // Check if user is enrolled in any trading course
  const isEnrolled = React.useMemo(() => {
    if (!currentUser) return false
    return tradingEnrollments.some(e => e.userId === currentUser.uid && e.status === 'active')
  }, [tradingEnrollments, currentUser])

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const sessions = tradingSessions && tradingSessions.length > 0 ? tradingSessions : []

  if (sessions.length === 0 && !isAdmin && !isEmployee) return null;

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-blue-600 font-black tracking-widest text-xs uppercase">Interactive Experience</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-2 mb-4">
              Upcoming <span className="text-blue-600">Live Sessions</span>
            </h2>
            <p className="text-slate-500 max-w-xl">Join real-time sessions where we analyze current markets and execute trades together.</p>
          </div>
          {!isEnrolled && (
            <button 
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Enroll Now to Join
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session, i) => (
            <div key={session.id || i} className="group p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest bg-emerald-100 text-emerald-700 uppercase">
                  {session.platform}
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{session.topic}</h4>
              <p className="text-slate-500 mb-6 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {session.date} at {session.time}
              </p>
              
              <button
                onClick={() => {
                  if (isEnrolled && session.meeting_link && session.meeting_link !== '#') {
                    window.open(session.meeting_link, '_blank', 'noopener,noreferrer')
                  }
                }}
                disabled={!isEnrolled || !session.meeting_link || session.meeting_link === '#'}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  isEnrolled && session.meeting_link && session.meeting_link !== '#'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                {!isEnrolled ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Enroll to Access Link
                  </span>
                ) : (session.meeting_link && session.meeting_link !== '#' ? 'Join Session' : 'Link Not Available')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LiveSessions
