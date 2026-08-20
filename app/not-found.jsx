'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const router = useRouter()
  const [dots, setDots] = useState('.')
  const [progress, setProgress] = useState(0)
  const [retrying, setRetrying] = useState(false)

  // Animated dots for "connecting..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Progress bar animation on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 73) { clearInterval(timer); return 73 }
        return prev + 1
      })
    }, 18)
    return () => clearInterval(timer)
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    setProgress(0)
    setTimeout(() => {
      setRetrying(false)
      setProgress(73)
      router.refresh()
    }, 2000)
  }

  const statusItems = [
    { label: 'DNS Resolution', status: 'ok' },
    { label: 'SSL Handshake', status: 'ok' },
    { label: 'Server Response', status: 'error' },
    { label: 'Page Rendering', status: 'pending' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at top left, #0f0a2e 0%, #0a0a1a 40%, #050510 100%)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Animated background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08,
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'gridMove 20s linear infinite',
      }} />

      {/* Glowing orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'pulse 4s ease-in-out infinite 2s',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes gridMove { from { backgroundPosition: 0 0; } to { backgroundPosition: 60px 60px; } }
        @keyframes pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.1); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes scanline { from { top: -2px; } to { top: 100%; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-4px); } 40%,80% { transform:translateX(4px); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .fade-up { animation: fadeInUp 0.6s ease forwards; }
        .card-glow:hover { box-shadow: 0 0 40px rgba(239,68,68,0.15), 0 20px 60px rgba(0,0,0,0.5) !important; }
      `}</style>

      {/* Main Card */}
      <div className="card-glow" style={{
        position: 'relative', zIndex: 10,
        maxWidth: '580px', width: '100%',
        background: 'rgba(15,10,46,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '28px',
        padding: '2.5rem',
        boxShadow: '0 0 60px rgba(239,68,68,0.08), 0 40px 80px rgba(0,0,0,0.6)',
        animation: 'fadeInUp 0.7s ease forwards',
      }}>

        {/* Scanline effect */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '28px',
          overflow: 'hidden', pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)',
            animation: 'scanline 3s linear infinite',
          }} />
        </div>

        {/* Top Status Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '0.6rem 1rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#ef4444',
              animation: 'blink 1s ease-in-out infinite',
              boxShadow: '0 0 8px #ef4444',
            }} />
            <span style={{ fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: '#f87171', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ERR_CONNECTION_FAILED
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#475569' }}>
            HTTP 404 • amitsolutionhub.com
          </span>
        </div>

        {/* Icon + Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Server icon */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
            border: '1px solid rgba(239,68,68,0.3)',
            marginBottom: '1.25rem',
            animation: 'shake 0.6s ease 1s both',
            position: 'relative',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
              <circle cx="6" cy="6" r="1" fill="#f87171" />
              <circle cx="6" cy="18" r="1" fill="#f87171" />
              <line x1="10" y1="6" x2="16" y2="6" stroke="#f87171" strokeWidth="2" />
              <line x1="10" y1="18" x2="16" y2="18" stroke="#f87171" strokeWidth="2" />
            </svg>
            {/* Red X badge */}
            <div style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 900, color: 'white',
              boxShadow: '0 0 10px rgba(239,68,68,0.6)',
            }}>✕</div>
          </div>

          <h1 style={{
            fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.02em',
            color: 'white', margin: '0 0 0.5rem',
            lineHeight: 1.2,
          }}>
            Oops! Page Not Found
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            The server couldn't locate this page. It may have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Connection Diagnostics */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace",
            color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '0.9rem', fontWeight: 700,
          }}>
            ◎ Connection Diagnostics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {statusItems.map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    background: item.status === 'ok' ? '#22c55e' : item.status === 'error' ? '#ef4444' : '#f59e0b',
                    boxShadow: `0 0 6px ${item.status === 'ok' ? '#22c55e' : item.status === 'error' ? '#ef4444' : '#f59e0b'}`,
                    ...(item.status !== 'ok' && { animation: 'blink 1.2s ease-in-out infinite' }),
                  }} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  color: item.status === 'ok' ? '#22c55e' : item.status === 'error' ? '#f87171' : '#fbbf24',
                }}>
                  {item.status === 'ok' ? '✓ OK' : item.status === 'error' ? '✕ FAILED' : `~ WAITING${dots}`}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '0.4rem',
            }}>
              <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#475569' }}>
                Load progress
              </span>
              <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#ef4444' }}>
                {progress}%
              </span>
            </div>
            <div style={{
              height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #ef4444)',
                borderRadius: '4px', transition: 'width 0.05s linear',
                boxShadow: '0 0 10px rgba(239,68,68,0.5)',
              }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRetry}
            disabled={retrying}
            style={{
              flex: 1, minWidth: '120px',
              padding: '0.85rem 1.25rem',
              borderRadius: '14px',
              background: retrying
                ? 'rgba(99,102,241,0.15)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: 'white', fontWeight: 700, fontSize: '0.85rem',
              cursor: retrying ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: retrying ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
              opacity: retrying ? 0.7 : 1,
            }}
          >
            {retrying ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Retrying{dots}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                Retry
              </>
            )}
          </button>

          <Link href="/" style={{
            flex: 2, minWidth: '160px',
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontWeight: 700, fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div style={{
          marginTop: '1.5rem', paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center',
        }}>
          {[
            { href: '/projects', label: 'Projects' },
            { href: '/courses', label: 'Courses' },
            { href: '/services', label: 'Services' },
            { href: '/contact', label: 'Support' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
              fontSize: '0.75rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', marginTop: '1.25rem',
          fontSize: '0.7rem', color: '#334155', fontWeight: 500,
        }}>
          © 2026 Amit Solution Hub Technology Pvt Ltd &nbsp;·&nbsp;
          <a href="mailto:support@amitsolutionhub.com" style={{ color: '#475569', textDecoration: 'none' }}>
            Report an issue
          </a>
        </p>
      </div>
    </div>
  )
}
