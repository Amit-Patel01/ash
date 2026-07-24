import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'

import { useStore } from '../store/StoreContext'

const FAILED_KEY = 'solutionhub:login_fails'

function getStoredFails() {
  try { return Number(sessionStorage.getItem(FAILED_KEY)) || 0 } catch { return 0 }
}

export default function LoginPage() {
  const { login, loginWithGoogle, currentUser, loading: authLoading, authError, clearAuthError } = useAuth()
  const { submitReinstatementRequest } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(getStoredFails)

  // Reinstatement Modal on Login Page
  const [showReinstatementModal, setShowReinstatementModal] = useState(false)
  const [reinstatementEmailInput, setReinstatementEmailInput] = useState('')
  const [reinstatementMsg, setReinstatementMsg] = useState('')
  const [submittingReinstatement, setSubmittingReinstatement] = useState(false)

  const openReinstatementFromLogin = () => {
    setReinstatementEmailInput(email.trim())
    setReinstatementMsg('')
    setShowReinstatementModal(true)
  }

  const handleSendReinstatementFromLogin = async (e) => {
    if (e) e.preventDefault()
    if (!reinstatementEmailInput.trim() || !reinstatementMsg.trim()) return
    setSubmittingReinstatement(true)
    try {
      const res = await submitReinstatementRequest(reinstatementMsg.trim(), reinstatementEmailInput.trim())
      alert(res.message || "Your reinstatement request has been submitted to the Founder & CEO successfully!")
      setShowReinstatementModal(false)
      setReinstatementMsg('')
    } catch (err) {
      alert(err.message || "Failed to submit request. Please check the email entered.")
    } finally {
      setSubmittingReinstatement(false)
    }
  }

  useEffect(() => {
    if (!authLoading && currentUser && !dashboardLoading) {
      navigate(redirectPath || getHomePathForRole(currentUser.role), { replace: true })
    }
  }, [authLoading, currentUser, navigate, redirectPath, dashboardLoading])

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
    setErrorCode('')
    setLoading(true)
    try {
      const user = await login(email, password)
      sessionStorage.removeItem(FAILED_KEY)
      setFailedAttempts(0)
      setDashboardLoading(true)
      setTimeout(() => {
        navigate(redirectPath || getHomePathForRole(user?.role), { replace: true })
      }, 2000)
    } catch (err) {
      const code = err.code || ''
      setErrorCode(code)
      const newFails = failedAttempts + 1
      setFailedAttempts(newFails)
      try { sessionStorage.setItem(FAILED_KEY, String(newFails)) } catch {}

      if (code === 'invalid_email') {
        setError('No account found with this email.')
      } else if (code === 'invalid_password') {
        setError('Incorrect password.')
      } else if (code === 'forgot_password_required') {
        setError('Too many failed attempts. Please reset your password.')
      } else if (code === 'inactive') {
        setError('Your account is inactive. Please contact support.')
      } else if (code === 'no_password') {
        setError('Please reset your password to continue.')
      } else {
        setError(err.message || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError('')
    setGoogleLoading(true)
    loginWithGoogle()
  }

  if (dashboardLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 bg-slate-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] animate-float-slow" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-550/10 blur-[120px] animate-float-slow" style={{ animationDelay: '-5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-550/5 blur-[160px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Welcome Back!</h2>
          <p className="text-slate-550 text-sm font-medium">Preparing your dashboard...</p>
          <div className="mt-8 flex justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-float-slow" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-[160px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] [background-size:56px_56px] opacity-60" />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(99,102,241,0.6)] group-hover:scale-110 group-hover:shadow-[0_12px_32px_-6px_rgba(99,102,241,0.7)] transition-all duration-500">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-white/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black text-slate-800 tracking-tight">
                Solution<span className="text-blue-600">Hub</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Member Portal</div>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to access your dashboard and tools.</p>
        </div>

        <div className="relative rounded-[28px] border border-slate-200 bg-white/80 backdrop-blur-2xl p-8 sm:p-9 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.08)]">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {errorCode === 'forgot_password_required' ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <span className="text-sm text-amber-600 font-medium leading-tight">{error}</span>
              </div>
              <Link
                to="/forgot-password?from=student"
                className="block w-full text-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 font-bold text-sm shadow-lg hover:opacity-90 transition-all"
              >
                Reset Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl border bg-red-500/10 border-red-200 text-red-700">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <span className="text-sm text-red-650 font-semibold leading-tight">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className={`w-full px-5 py-4 bg-slate-50/50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:bg-white transition-all duration-300 text-sm font-medium ${errorCode === 'invalid_email' ? 'border-red-500' : 'border-slate-200'}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Password</label>
                  <Link to="/forgot-password?from=student" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
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
                    className={`w-full px-5 py-4 pr-12 bg-slate-50/50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:bg-white transition-all duration-300 text-sm font-medium ${errorCode === 'invalid_password' ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white py-4 font-bold text-sm shadow-[0_16px_40px_-12px_rgba(99,102,241,0.4)] hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

              {failedAttempts >= 3 && errorCode !== 'forgot_password_required' && (
                <div className="text-center mt-2">
                  <Link
                    to="/forgot-password?from=student"
                    className="text-sm font-bold text-amber-600 hover:text-amber-500 transition-colors underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </form>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-350 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="mt-6 pt-5 border-t border-slate-150">
            <p className="text-center text-xs text-slate-400 font-medium mb-3">Former Staff Member?</p>
            <button
              type="button"
              onClick={openReinstatementFromLogin}
              className="w-full mb-4 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>📩</span> Request Staff Reinstatement / Re-employment
            </button>

            <p className="text-center text-xs text-slate-400 font-medium mb-4">Don't have an account?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/join-us" className="flex items-center justify-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                Become Member
              </Link>
              <Link to="/" className="flex items-center justify-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Reinstatement Request Modal on Login Page */}
        {showReinstatementModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !submittingReinstatement && setShowReinstatementModal(false)} />
            <div className="relative bg-white border border-rose-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-xl">
                    📩
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Staff Reinstatement Request</h3>
                    <p className="text-xs text-slate-500">Send direct request to Founder, CEO & Admin Team</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReinstatementModal(false)}
                  disabled={submittingReinstatement}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendReinstatementFromLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Staff Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={reinstatementEmailInput}
                    onChange={(e) => setReinstatementEmailInput(e.target.value)}
                    placeholder="your-staff-email@example.com"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Message for Founder, CEO & Admin <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reinstatementMsg}
                    onChange={(e) => setReinstatementMsg(e.target.value)}
                    placeholder="Explain why you would like to request re-employment or reinstatement..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={submittingReinstatement}
                    onClick={() => setShowReinstatementModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReinstatement}
                    className="flex-[2] py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                  >
                    {submittingReinstatement ? 'Submitting...' : '📩 Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.18em]">
          Secured by SolutionHub Security • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
