'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'
import { useStore } from '../store/StoreContext'
import FormerStaffModal from '../components/FormerStaffModal'
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'

const FAILED_KEY = 'solutionhub:login_fails'

function getStoredFails() {
  try { return Number(sessionStorage.getItem(FAILED_KEY)) || 0 } catch { return 0 }
}

export default function LoginPage() {
  const { login, loginWithGoogle, currentUser, userProfile, loading: authLoading, authError, clearAuthError } = useAuth()
  const { submitReinstatementRequest } = useStore()
    const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)
  const searchParams = useSearchParams()
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

  // Automatic Reinstatement Modal for Former Staff
  const [showReinstatementModal, setShowReinstatementModal] = useState(false)

  // Auto-detect former staff member upon page load if already logged in or profile loaded
  useEffect(() => {
    if (!authLoading && currentUser) {
      const isTerminated = Boolean(
        userProfile?.status === 'terminated' ||
        userProfile?.isTerminated ||
        currentUser?.status === 'terminated' ||
        currentUser?.isTerminated
      )
      if (isTerminated) {
        setShowReinstatementModal(true)
      } else if (!dashboardLoading) {
        navigate(redirectPath || getHomePathForRole(currentUser.role), { replace: true })
      }
    }
  }, [authLoading, currentUser, userProfile, navigate, redirectPath, dashboardLoading])

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

      // Automated former staff check
      const isTerminated = Boolean(
        user?.status === 'terminated' ||
        user?.isTerminated
      )

      if (isTerminated) {
        setShowReinstatementModal(true)
        return
      }

      setDashboardLoading(true)
      setTimeout(() => {
        navigate(redirectPath || getHomePathForRole(user?.role), { replace: true })
      }, 1500)
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
      } else if (code === 'inactive' || code === 'terminated') {
        // Automatically trigger reinstatement modal for inactive/terminated employee credentials
        setShowReinstatementModal(true)
        setError('Your staff account access was relieved. Please request reinstatement below.')
      } else if (code === 'no_password') {
        setError('Please reset your password to continue.')
      } else {
        setError(err.message || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Google sign in error:', err)
      setGoogleLoading(false)
    }
  }

  if (dashboardLoading) {
    return (
      <div className="relative h-screen w-screen flex items-center justify-center bg-slate-950 text-white font-['Outfit',sans-serif]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <ShieldCheck className="w-7 h-7 text-indigo-400 absolute inset-0 m-auto" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Welcome Back!</h2>
          <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Authenticating your secure session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 font-['Outfit',sans-serif]">
      
      {/* Ambient background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[120px] animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/15 dark:bg-purple-600/20 blur-[120px] animate-blob [animation-delay:3s]" />
      </div>

      {/* FULL SCREEN DUAL COLUMN LAYOUT */}
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden relative z-10">
        
        {/* ── LEFT COLUMN: 3D Tech Showcase Panel ── */}
        <div className="lg:col-span-6 relative h-72 lg:h-full w-full bg-slate-950 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden group">
          
          {/* Background Illustration with Parallax Glow */}
          <img
            src="/login_hero_banner.png"
            alt="Amit Solution Hub Technology"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.1] transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Gradient & Dark Overlay for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/60" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl hover:scale-105 transition-transform">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white leading-none">
                  Amit Solution Hub
                </h2>
                <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">Tech &amp; Learning Portal</span>
              </div>
            </Link>

            <Link
              href="/"
              className="text-xs font-extrabold text-white bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl transition-all border border-white/15 shadow-md"
            >
              ← Website
            </Link>
          </div>

          {/* Bottom Banner Content Card */}
          <div className="relative z-10 text-white mt-auto pt-8">
            <div className="bg-slate-950/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black uppercase tracking-wider border border-indigo-500/40 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> MSME Registered Organization
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">Learn Skills. Build Projects.</span> <br />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">Get Certified.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-md">
                Access your real internship workspace, code repositories, live project milestones, and verified certificates.
              </p>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Glassmorphic Auth Form ── */}
        <div className="lg:col-span-6 h-full w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl p-6 sm:p-10 lg:p-16 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Info Bar */}
          <div className="hidden lg:flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Portal Authentication</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">New student?</span>
              <Link href="/join-us" className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create Account →
              </Link>
            </div>
          </div>

          {/* Form Content Container */}
          <div className="my-auto max-w-md w-full mx-auto py-6">
            
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-100 dark:border-indigo-900/50">
                <Lock className="w-3.5 h-3.5" /> Secure Single Sign-On
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Member Sign In</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Enter your credentials to access your dashboard.</p>
            </div>

            {errorCode === 'forgot_password_required' ? (
              <div className="space-y-4 my-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
                <Link
                  href="/forgot-password?from=student"
                  className="block w-full text-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-opacity"
                >
                  Reset Password
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                      autoFocus
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <Link href="/forgot-password?from=student" className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-12 py-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:shadow-xl hover:shadow-indigo-500/25 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Verifying Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

          </div>

          {/* Bottom Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} Amit Solution Hub Technology Pvt Ltd</span>
            <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Support</Link>
          </div>

        </div>

      </div>

      {/* Former Staff Full Screen Reinstatement Popup Modal */}
      <FormerStaffModal
        isOpen={showReinstatementModal}
        onClose={() => setShowReinstatementModal(false)}
      />

    </div>
  )
}
