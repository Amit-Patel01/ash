import { useState } from 'react'
import { useAuth } from '../context/AuthContext'


export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      let msg = 'Failed to send reset email. Please try again.'
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.'
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.'
      if (err.code === 'auth/too-many-requests') msg = 'Too many requests. Please try again later.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] animate-[spin_15s_linear_infinite]"></div>
          <div className="absolute bottom-1/4 -right-32 w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-md w-full text-center relative z-10">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check Your Email!</h2>
            <p className="text-gray-400 mb-6">We've sent a password reset link to <span className="text-white font-medium">{email}</span>. Please check your inbox and follow the instructions to reset your password.</p>
            <div className="bg-blue-500/10 rounded-xl p-4 mb-6 border border-blue-500/20">
              <p className="text-xs text-blue-300">Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
            </div>
            <div className="flex gap-3">
              <a href="/employee-login" className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold text-sm text-center hover:from-emerald-700 hover:to-cyan-700 transition-all">
                Go to Login
              </a>
              <button onClick={() => { setSent(false); setEmail('') }} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
                Try Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] animate-[spin_15s_linear_infinite]"></div>
        <div className="absolute bottom-1/4 -right-32 w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]"></div>



      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 mb-4 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm" />
            </div>

            <button type="submit" disabled={loading || !email} className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
              <div className="relative w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Sending...</> : <>Send Reset Link<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg></>}
              </div>
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <a href="/employee-login" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
