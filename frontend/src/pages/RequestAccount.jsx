import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'

const departments = ['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Sales', 'Editor', 'Technician']
const roles = ['Developer', 'Designer', 'Project Manager', 'Marketing Executive', 'Support Agent', 'Sales Executive', 'Video Editor', 'Technician']

export default function RequestAccount() {
  const { createAccountRequest } = useAuth()
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: '', role: '', reason: '',
    password: '', confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError('You must agree to Terms & Conditions'); return }
    if (!form.name || !form.email || !form.department || !form.role || !form.password) { 
      setError('Please fill all required fields'); 
      return 
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return
    }
    if (form.password.length < 6) {
      setError('Password should be at least 6 characters');
      return
    }
    
    setError('')
    try {
      await createAccountRequest(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit request.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Request Submitted!</h2>
            <p className="text-gray-400 mb-6">Your account creation request has been sent to the admin for approval. You will receive your login credentials via email once approved.</p>
            <div className="bg-blue-500/10 rounded-xl p-4 mb-6 border border-blue-500/20 text-left">
              <p className="text-sm text-blue-300"><strong>Name:</strong> {form.name}</p>
              <p className="text-sm text-blue-300"><strong>Email:</strong> {form.email}</p>
              <p className="text-sm text-blue-300"><strong>Department:</strong> {form.department}</p>
              <p className="text-sm text-blue-300"><strong>Status:</strong> Pending Approval</p>
            </div>
            <button onClick={() => navigate('/')} className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px] animate-[spin_15s_linear_infinite]"></div>
        <div className="absolute bottom-1/4 -right-32 w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 mb-4 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Request Account</h1>
          <p className="text-sm text-gray-500 mt-1">Submit a request to join SolutionHub. Admin approval required.</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="your@email.com" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Department *</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all">
                  <option value="" className="bg-gray-900">Select department</option>
                  {departments.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Role *</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all">
                <option value="" className="bg-gray-900">Select role</option>
                {roles.map(r => <option key={r} value={r} className="bg-gray-900">{r}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Why do you want to join?</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Brief description..." className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30" />
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true) }} className="text-emerald-400 underline hover:text-emerald-300">Terms & Conditions</button>
                </span>
              </label>
            </div>

            <button type="submit" disabled={!agreed} className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
              <div className="relative w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2">
                Submit Request
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </div>
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/employee-login" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>

      {showTerms && <TermsAndConditions onAgree={() => { setAgreed(true); setShowTerms(false) }} onCancel={() => setShowTerms(false)} />}
    </div>
  )
}
