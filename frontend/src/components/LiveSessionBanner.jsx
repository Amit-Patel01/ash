import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const LiveSessionBanner = () => {
  const { tradingSessions, tradingEnrollments, tradingCourses } = useStore();
  const { currentUser } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [status, setStatus] = useState(null); // 'live' or 'soon'

  useEffect(() => {
    if (!tradingSessions) return;

    // 1. Check for LIVE sessions first
    const live = tradingSessions.find(s => s.isLive === true);
    if (live) {
      setActiveSession(live);
      setStatus('live');
      return;
    }

    // 2. Check for "Starting Soon" (within 60 mins)
    const now = new Date();
    const upcoming = tradingSessions.find(s => {
      if (!s.date || !s.time) return false;
      const sessionDate = new Date(`${s.date}T${s.time}`);
      const diffMs = sessionDate - now;
      const diffMins = diffMs / (1000 * 60);
      return diffMins > 0 && diffMins <= 60;
    });

    if (upcoming) {
      setActiveSession(upcoming);
      setStatus('soon');
    } else {
      setActiveSession(null);
      setStatus(null);
    }
  }, [tradingSessions]);

  if (!activeSession) return null;

  const isEnrolled = currentUser && tradingEnrollments?.some(e => 
    e.userId === currentUser.uid && 
    (e.courseId === activeSession.course_id || e.status === 'active')
  );

  const courseName = tradingCourses?.find(c => c.id === activeSession.course_id)?.name || 'Mentorship';

  return (
    <div className="hp-in d1" style={{ width: '100%', maxWidth: '800px', margin: '0 auto 24px' }}>
      <div style={{
        background: status === 'live' 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(225, 29, 72, 0.05))' 
          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(79, 70, 229, 0.05))',
        border: `1.5px solid ${status === 'live' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.2)'}`,
        borderRadius: '24px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '280px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: status === 'live' ? '#ef4444' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${status === 'live' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
            animation: status === 'live' ? 'hp-pulse 2s infinite' : 'none'
          }}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '900', 
                textTransform: 'uppercase', 
                color: status === 'live' ? '#ef4444' : '#3b82f6',
                letterSpacing: '0.05em'
              }}>
                {status === 'live' ? '• Live Now' : 'Upcoming Session'}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                {courseName}
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{activeSession.topic}</h4>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Employee Quick Controls */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'employee' || currentUser?.role === 'mentor') && (
            <button 
              onClick={async () => {
                try {
                  await updateTradingSession(activeSession.id, { isLive: !activeSession.isLive });
                } catch (err) {
                  alert("Error updating session status: " + err.message);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: activeSession.isLive ? '#ef4444' : '#22c55e',
                fontSize: '11px',
                fontWeight: '900',
                padding: '8px 16px',
                borderRadius: '99px',
                border: `1px solid ${activeSession.isLive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                cursor: 'pointer',
                transition: '0.3s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
              {activeSession.isLive ? 'End Live' : 'Go Live'}
            </button>
          )}

          {isEnrolled ? (
            <button 
              onClick={() => {
                if (activeSession.meeting_link && activeSession.meeting_link !== '#') {
                  window.open(activeSession.meeting_link, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{
                background: status === 'live' ? '#ef4444' : '#3b82f6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '800',
                padding: '8px 20px',
                borderRadius: '99px',
                border: 'none',
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: `0 4px 14px ${status === 'live' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(37, 99, 235, 0.4)'}`
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'none'}
            >
              {status === 'live' ? 'Join Now' : 'Join Link In Session'}
            </button>
          ) : (
            <Link 
              to="/services/trading-mentorship"
              style={{
                background: '#0f172a',
                color: 'white',
                fontSize: '12px',
                fontWeight: '800',
                padding: '8px 20px',
                borderRadius: '99px',
                textDecoration: 'none',
                transition: '0.3s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'none'}
            >
              Enroll to Join
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionBanner;
