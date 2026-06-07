import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'

export default function CustomerSignup() {
  const { signup } = useAuth()
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: ''
  })

  // Animate blobs for that premium feel
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError('You must agree to Terms & Conditions'); return }
    if (!form.name || !form.email) {
      setError('Please fill all required fields')
      return
    }
    if (!form.phone) {
      setError('Mobile number is required — so our team can reach you')
      return
    }
    const cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid 10-digit Indian mobile number (starts with 6-9)')
      return
    }
    setError('')
    setLoading(true)

    try {
      await signup({
        name: form.name,
        email: form.email,
        phone: form.phone.replace(/\D/g, '')
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-20 px-4 bg-[#0B1120] overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-blob delay-75" />

        <div className="relative z-20 max-w-md mx-auto">
          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl shadow-emerald-500/5 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Account Created</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Your customer account has been created. Please check your email and reset your password to access your dashboard.</p>

            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 mb-8 border border-white/5 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">User</span>
                <span className="text-sm text-emerald-400 font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</span>
                <span className="text-sm text-emerald-400 font-medium">{form.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Role</span>
                <span className="text-sm text-emerald-400 font-medium uppercase tracking-tighter font-black">Customer</span>
              </div>
            </div>

            <Link to="/login" className="block w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-cyan-700 shadow-xl shadow-emerald-500/20 transition-all duration-300 text-center transform hover:-translate-y-1">
              Go to Sign In
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-20 px-4 bg-[#0B1120] overflow-hidden flex flex-col items-center">
      {/* Immersive Background Elements */}
      <div className={`transition-all duration-[2000ms] ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-cyan-700/10 rounded-full blur-[120px] animate-blob delay-1000" />
      </div>

      <div className="relative z-20 w-full max-w-lg mx-auto">
        <div className="text-center mb-10 transition-all duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 mb-6 shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/10 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Journey</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-md mx-auto">Create a customer account and explore our premium services.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl shadow-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500 group">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                </div>
                <span className="text-sm font-semibold text-red-400">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Enter full name" className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="your@email.com" className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-inner" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">+91</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full pl-14 pr-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-600 ml-1">📞 Required so our team can contact you about your courses</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-4 text-sm text-slate-300">
              We will send a secure password reset link after your account is created. No default password is assigned.
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <label className="flex items-center gap-4 cursor-pointer">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="peer appearance-none w-6 h-6 rounded-lg border-2 border-slate-700 bg-slate-800 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                  <svg className="absolute w-4 h-4 text-white left-1 bottom-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm text-slate-400 select-none">
                  I accept the <button type="button" onClick={() => setShowTerms(true)} className="text-emerald-400 font-bold hover:underline">Terms & Conditions</button>
                </span>
              </label>
            </div>

            <button type="submit" disabled={!agreed || loading} className="group/btn relative w-full overflow-hidden px-6 py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest hover:from-emerald-700 hover:to-cyan-700 shadow-2xl shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Processing...</>
                ) : (
                  <>
                    Create Account
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-600 bg-[#0B1120] transition-colors"><span className="px-3">Social Auth (Coming Soon)</span></div>
            </div>

            <p className="text-sm text-slate-500 font-medium">Already part of our community?</p>
            <Link to="/employee-login" className="inline-block mt-2 text-emerald-400 font-black tracking-tighter hover:text-emerald-300 transition-colors border-b-2 border-emerald-500/20 hover:border-emerald-400">
              SIGN IN
            </Link>

            <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
              * Dedicated support & real-time updates for all customers
            </p>
          </div>
        </div>

        {showTerms && <TermsAndConditions onAgree={() => { setAgreed(true); setShowTerms(false) }} onCancel={() => setShowTerms(false)} />}
      </div>
    </section>
  )
}
