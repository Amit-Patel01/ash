import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHomePathForRole } from '../utils/roles'

export default function EmployeeLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(getHomePathForRole(user?.role), { replace: true })
    } catch (err) {
      console.error(err)
      let msg = 'Invalid email or password.'
      if (err.code === 'auth/user-not-found') msg = 'No user found with this email.'
      if (err.code === 'auth/wrong-password') msg = 'Incorrect password.'
      if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
              Solution<span className="text-blue-500">Hub</span> <span className="text-xs not-italic font-medium text-slate-500 ml-1 opacity-50">PORTAL</span>
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Member Login</h1>
          <p className="text-slate-400 text-sm font-medium">Sign in to access your professional workspace.</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  autoFocus 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm font-medium"
                />
                <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password?from=employee" size="sm" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm font-medium pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !email || !password} 
              className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-900/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <p className="text-center text-sm text-slate-500 font-medium italic">
              New around here?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/join-us" className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                Join Team
              </Link>
              <Link to="/" className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center mt-8 text-[11px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
          Secured by <span className="text-blue-500/80">SolutionHub Infrastructure</span>
        </p>
      </div>
    </div>
  )
}
