import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { refreshCurrentUser } = useAuth()
  const [status, setStatus] = useState('loading') // loading | error

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const error = params.get('error')

      if (error) {
        const messages = {
          google_denied:       'You cancelled Google sign-in.',
          account_inactive:    'Your account is inactive. Please contact support.',
          google_token_failed: 'Google authentication failed. Please try again.',
          google_no_email:     'Could not retrieve your email from Google.',
          google_server_error: 'A server error occurred. Please try again.',
        }
        sessionStorage.setItem('auth_error', messages[error] || 'Google sign-in failed.')
        return navigate('/login', { replace: true })
      }

      if (!token) {
        sessionStorage.setItem('auth_error', 'No authentication token received.')
        return navigate('/login', { replace: true })
      }

      // Save token and load user profile
      localStorage.setItem('token', token)
      try {
        const user = await refreshCurrentUser()
        if (!user) throw new Error('Could not load profile')

        const role = String(user.role || 'customer').toLowerCase()
        if (role === 'admin') {
          navigate('/admin', { replace: true })
        } else if (['employee', 'mentor', 'developer', 'staff'].includes(role)) {
          navigate('/employee', { replace: true })
        } else {
          navigate('/user', { replace: true })
        }
      } catch {
        setStatus('error')
        localStorage.removeItem('token')
      }
    }

    run()
  }, [navigate, refreshCurrentUser])

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        background: '#0f172a',
        color: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Sign-in Failed</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            Something went wrong while signing in with Google.
          </p>
          <a href="/login" style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.30)',
            color: '#818cf8',
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      fontFamily: 'Inter, sans-serif',
      gap: 20,
    }}>
      {/* Spinner */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        border: '4px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 16, margin: 0 }}>
          Signing you in with Google...
        </p>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
          Please wait a moment
        </p>
      </div>
    </div>
  )
}
