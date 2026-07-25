import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
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

  // Automatic Reinstatement Modal for Former Staff
  const [showReinstatementModal, setShowReinstatementModal] = useState(false)

  // Auto-detect former staff member upon page load if already logged in or profile loaded
  useEffect(() => {
    if (!authLoading && currentUser) {
      const isTerminated = Boolean(
        userProfile?.status === 'terminated' ||
        userProfile?.isTerminated ||
        userProfile?.previousRole ||
        currentUser?.status === 'terminated' ||
        currentUser?.isTerminated ||
        currentUser?.previousRole
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
        user?.isTerminated ||
        user?.previousRole
      )

      if (isTerminated) {
        setShowReinstatementModal(true)
        setLoading(false)
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
      <div className="relative h-screen w-screen flex items-center justify-center bg-white text-slate-900 font-['Outfit',sans-serif]">
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin shadow-lg shadow-indigo-500/10" />
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Welcome Back!</h2>
          <p className="text-slate-500 text-sm font-medium">Preparing your secure portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-white text-slate-800 font-['Outfit',sans-serif]">
      
      {/* FULL SCREEN DUAL COLUMN LAYOUT (100vh Edge-to-Edge) */}
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
        
        {/* ── LEFT COLUMN: Full Screen Height 3D Hero Image Showcase ── */}
        <div className="lg:col-span-6 relative h-64 lg:h-full w-full bg-slate-900 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden group">
          
          {/* Background 3D Tech Illustration (Full Height Object Cover) */}
          <img
            src="/login_hero_banner.png"
            alt="Amit Solution Hub Technology"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.05] transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/50" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none">
                  Amit Solution Hub
                </h2>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Technology Pvt Ltd</span>
              </div>
            </Link>
          </div>

          {/* Bottom Caption Overlay */}
          <div className="relative z-10 text-white mt-auto pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider mb-3 border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Enterprise Tech Platform
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              Empowering Digital Innovation
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium max-w-md drop-shadow-xs leading-relaxed">
              Access your training tracks, source code repositories, and workspace tools.
            </p>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Full Screen Height Light Sign In Form ── */}
        <div className="lg:col-span-6 h-full w-full bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Header Spacer */}
          <div className="hidden lg:block text-right">
            <Link to="/" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
              ← Back to Main Website
            </Link>
          </div>

          {/* Form Content Container */}
          <div className="my-auto max-w-md w-full mx-auto py-6">
            
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Member Sign In</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">Enter your credentials to access your dashboard.</p>
            </div>

            {errorCode === 'forgot_password_required' ? (
              <div className="space-y-4 my-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
                <Link
                  to="/forgot-password?from=student"
                  className="block w-full text-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3.5 font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-opacity"
                >
                  Reset Password
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
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
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Password
                    </label>
                    <Link to="/forgot-password?from=student" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
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
                      className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
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
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
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
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} Amit Solution Hub Technology Pvt Ltd</span>
            <Link to="/contact" className="hover:text-indigo-600 transition-colors">Support</Link>
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
