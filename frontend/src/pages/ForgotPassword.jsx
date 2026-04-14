import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const { resetPassword, verifyResetCode, confirmReset } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const MIN_PASSWORD_LENGTH = 8
  const passwordNotice = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long. You can use letters, numbers, and symbols.`
  
  // URL Params
  const from = searchParams.get('from')
  const resetToken = searchParams.get('token')
  
  // States
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(Boolean(resetToken))
  const [userEmail, setUserEmail] = useState('') // Verified email from code

  const getBackPath = () => {
    if (from === 'admin') return '/admin-login'
    if (from === 'employee') return '/employee-login'
    return '/login'
  }

  // Effect to verify code if in reset mode
  useEffect(() => {
    if (resetToken) {
      const verify = async () => {
        try {
          const email = await verifyResetCode(resetToken)
          setUserEmail(email)
        } catch (err) {
          setError('This password reset link is invalid or has expired.')
        } finally {
          setVerifyingCode(false)
        }
      }
      verify()
    }
  }, [resetToken, verifyResetCode])

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email, from)
      setSent(true)
    } catch (err) {
      let msg = 'Failed to send reset email. Please try again.'
      const rawMessage = String(err?.message || '').toLowerCase()
      if (
        rawMessage.includes('not found') ||
        rawMessage.includes('no user record corresponding') ||
        rawMessage.includes('provided identifier')
      ) {
        msg = 'No account found with this email.'
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
    }
    
    setError('')
    setLoading(true)
    try {
      await confirmReset(resetToken, newPassword)
      setSuccess(true)
      setTimeout(() => navigate(getBackPath()), 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired. (Eg. use like abc123)')
    } finally {
      setLoading(false)
    }
  }

  // --- RENDERING ---

  // 1. Loading/Verifying State
  if (verifyingCode) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#030712] overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Verifying security link...</p>
        </div>
      </div>
    )
  }

  // 2. Success State
  if (success) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#030712] overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none delay-700"></div>
        
        <div className="relative z-10 w-full max-w-[440px] animate-in zoom-in duration-700">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Password Updated</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Your password has been reset successfully. Redirecting you to login...</p>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full animate-[progress_3s_linear]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. Sent Confirmation State
  if (sent) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#030712] overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none delay-700"></div>

        <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out text-center">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-black/50">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Check Your Email</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">We've sent a password reset link to <span className="text-blue-400 font-bold">{email}</span>. Please check your inbox to continue.</p>
            
            <div className="bg-blue-500/5 rounded-2xl p-6 mb-8 border border-blue-500/10">
              <p className="text-sm text-blue-400 font-medium">Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
            </div>

            <Link to={getBackPath()} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-all group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. MAIN FORM (Request link OR Reset password)
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#030712] overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" strokeOpacity="0.3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" strokeOpacity="0.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.5c-2.5 1.5-4 4-4 7s1.5 5.5 4 7m6-14c2.5 1.5 4 4 4 7s-1.5 5.5-4 7" />
                <circle cx="12" cy="12" r="2.5" className="fill-blue-500/20" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
              Solution<span className="text-blue-500">Hub</span> <span className="text-xs not-italic font-medium text-slate-500 ml-1 opacity-50">SECURITY</span>
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {resetToken ? 'New Password' : 'Reset Password'}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {resetToken 
              ? `Creating a new password for ${userEmail || 'your account'}` 
              : "Enter your email and we'll send you a recovery link."}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-black/50">
          <form onSubmit={resetToken ? handleConfirmReset : handleRequestReset} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake duration-500">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <span className="text-sm text-red-400 font-medium leading-tight">{error}</span>
              </div>
            )}

            {resetToken ? (
              <>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                  <p className="text-sm text-blue-200 leading-relaxed">
                    {passwordNotice}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm font-medium"
                  />
                  <p className="text-xs text-slate-500 ml-1">
                    {passwordNotice}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm font-medium"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    required 
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm font-medium"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (!resetToken && !email)} 
              className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-900/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{resetToken ? 'Updating Password...' : 'Processing Request...'}</span>
                  </>
                ) : (
                  <>
                    <span>{resetToken ? 'Update Password' : 'Send Reset Link'}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={resetToken ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" : "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"} />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <Link to={getBackPath()} className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-500 transition-all group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to login</span>
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
          Secured Infrastructure Provided • SolHub
        </p>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
      `}} />
    </div>
  )
}
