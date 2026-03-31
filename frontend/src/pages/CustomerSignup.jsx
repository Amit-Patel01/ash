import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'

export default function CustomerSignup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError('You must agree to Terms & Conditions'); return }
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all required fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password should be at least 6 characters')
      return
    }

    setError('')
    setLoading(true)

    try {
      const user = await signup(form.email, form.password, form.name)

      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../config/firebase')
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: form.email,
        displayName: form.name,
        phone: form.phone || '',
        role: 'customer',
        status: 'active',
        avatar: form.name.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString()
      })

      setSubmitted(true)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.')
      } else {
        setError(err.message || 'Failed to create account.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-20 px-4">
        <div className="relative z-20 max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl rounded-3xl p-10 border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-emerald-900/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Account Created!</h2>
            <p className="text-slate-500 mb-6">Your customer account has been created successfully. You can now sign in and start exploring our services.</p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100 text-left">
              <p className="text-sm text-slate-700"><strong>Name:</strong> {form.name}</p>
              <p className="text-sm text-slate-700"><strong>Email:</strong> {form.email}</p>
              <p className="text-sm text-slate-700"><strong>Account Type:</strong> Customer</p>
            </div>
            <Link to="/login" className="block w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-200 transition-all text-center">
              Sign In Now
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-20 px-4">
      <div className="relative z-20 max-w-lg mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 mb-4 shadow-lg shadow-emerald-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">Customer Account</span></h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sign up to access services, orders, and support</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-emerald-900/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="your@email.com" className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="Re-enter password" className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all" />
              </div>
            </div>

            <div className="bg-white/50 rounded-xl p-4 border border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-400 transition-colors" />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true) }} className="text-emerald-600 underline hover:text-emerald-700 font-medium">Terms & Conditions</button>
                </span>
              </label>
            </div>

            <button type="submit" disabled={!agreed || loading} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="h-px w-full bg-slate-200 mb-4"></div>
            <p className="text-xs text-slate-500 mb-2">Already have an account?</p>
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-semibold">
              Sign In
            </Link>
            <p className="text-[10px] text-slate-400 mt-3">Employee & Team Member accounts are provided by admin</p>
          </div>
        </div>

        {showTerms && <TermsAndConditions onAgree={() => { setAgreed(true); setShowTerms(false) }} onCancel={() => setShowTerms(false)} />}
      </div>
    </section>
  )
}
