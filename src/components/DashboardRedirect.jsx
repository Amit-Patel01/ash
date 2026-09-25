'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'

export default function DashboardRedirect() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!currentUser) {
      router.replace('/login')
      return
    }
    const path = getHomePathForRole(currentUser.role)
    router.replace(path)
  }, [currentUser, loading, router])

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Soft light orbs */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounceDot { 0%,80%,100%{transform:translateY(0);opacity:0.3} 40%{transform:translateY(-7px);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease forwards',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        {/* Spinner */}
        <div style={{ position: 'relative', width: '72px', height: '72px' }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid #e0e7ff',
            borderTopColor: '#6366f1',
            animation: 'spinRing 0.9s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '10px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
            border: '1px solid #e0e7ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.12)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
            Redirecting you...
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Setting up your dashboard
          </p>
        </div>

        {/* Bouncing dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#a5b4fc',
              animation: `bounceDot 1.2s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* Bottom brand */}
      <div style={{
        position: 'absolute', bottom: '2rem',
        fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.05em',
      }}>
        © 2026 Ashnexa Systems Pvt Ltd
      </div>
    </div>
  )
}
