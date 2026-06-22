import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'

export default function LoginPage() {
  const { login, loginWithGoogle, currentUser, loading: authLoading, authError, clearAuthError } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate(redirectPath || getHomePathForRole(currentUser.role), { replace: true })
    }
  }, [authLoading, currentUser, navigate, redirectPath])

  useEffect(() => {
    if (!authLoading) setGoogleLoading(false)
  }, [authLoading])

  useEffect(() => {
    if (!authError) return
    setError(authError)
    setGoogleLoading(false)
    clearAuthError()
  }, [authError, clearAuthError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(redirectPath || getHomePathForRole(user?.role), { replace: true })
    } catch (err) {
      const raw = String(err?.message || '').toLowerCase()
      let msg = 'Invalid email or password.'
      if (raw.includes('not found') || raw.includes('no account')) msg = 'No account found with this email.'
      else if (raw.includes('inactive')) msg = 'Your account is inactive. Please contact support.'
      else if (raw.includes('reset your password')) msg = 'Please reset your password to continue.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const user = await loginWithGoogle()
      if (user) navigate(redirectPath || getHomePathForRole(user.role), { replace: true })
    } catch (err) {
      let msg = err?.message || 'Google sign-in failed. Please try again.'
      if (err.code === 'auth/user-not-found' || msg.toLowerCase().includes('no account found')) {
        msg = 'No account found with this Google email. Please register first.'
      }
      setError(msg)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4" style={{ background: '#030712' }}>
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-float-slow" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[160px]" />
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] [background-size:56px_56px] opacity-60" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(99,102,241,0.6)] group-hover:scale-110 group-hover:shadow-[0_12px_32px_-6px_rgba(99,102,241,0.7)] transition-all duration-500">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-white/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black text-white tracking-tight">
                Solution<span className="text-blue-400">Hub</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Member Portal</div>
            </div>
          </Link>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm font-medium">Sign in to access your dashboard and tools.</p>
        </div>

        {/* Card */}
        <div className="relative rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 sm:p-9 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
          {/* Card top shimmer */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <span className="text-sm text-red-400 font-medium leading-tight">{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 focus:bg-white/8 transition-all duration-300 text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Password</label>
                <Link to="/forgot-password?from=student" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-5 py-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 focus:bg-white/8 transition-all duration-300 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white py-4 font-bold text-sm shadow-[0_16px_40px_-12px_rgba(99,102,241,0.6)] hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Google - Coming Soon */}
          <div className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/[0.03] border border-white/8 rounded-2xl text-sm font-bold text-slate-600 cursor-not-allowed select-none">
            <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google Sign-in</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/8 text-slate-500">Coming Soon</span>
          </div>

          {/* Bottom Links */}
          <div className="mt-6 pt-5 border-t border-white/6">
            <p className="text-center text-xs text-slate-500 font-medium mb-4">Don't have an account?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/join-us" className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                Become Member
              </Link>
              <Link to="/" className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.18em]">
          Secured by SolutionHub Security • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
