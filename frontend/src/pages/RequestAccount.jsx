import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'

const departments = ['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Sales', 'Editor', 'Technician', 'Other']
const roles = ['Developer', 'Designer', 'Project Manager', 'Marketing Executive', 'Support Agent', 'Sales Executive', 'Video Editor', 'Technician', 'Other']

export default function RequestAccount() {
  const { createAccountRequest } = useAuth()
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedMessage, setSubmittedMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: '', role: '', reason: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) { setError('You must agree to Terms & Conditions'); return }
    if (!form.name || !form.email || !form.department || !form.role || !form.phone) {
      setError('Please fill all required fields')
      return
    }
    const cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number.')
      return
    }

    setError('')
    setLoading(true)

    const submissionData = {
      ...form,
      department: form.department === 'Other' ? form.customDepartment : form.department,
      role: form.role === 'Other' ? form.customRole : form.role
    }

    try {
      const result = await createAccountRequest({
        ...submissionData,
        phone: cleanPhone,
      })
      setSubmittedMessage(result.message || 'Your request has been submitted successfully.')
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit request.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-20 px-4">
        <div className="relative z-20 max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl rounded-3xl p-10 border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-blue-900/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Request Submitted</h2>
            <p className="text-slate-500 mb-6">{submittedMessage || 'Your account creation request has been sent to the administrator for review.'}</p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100 text-left">
              <p className="text-sm text-slate-700"><strong>Name:</strong> {form.name}</p>
              <p className="text-sm text-slate-700"><strong>Email:</strong> {form.email}</p>
              <p className="text-sm text-slate-700"><strong>Department:</strong> {form.department}</p>
              <p className="text-sm text-slate-700"><strong>Status:</strong> Awaiting Review</p>
            </div>
            <button onClick={() => navigate('/')} className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all">
              Back to Home
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-20 px-4">
      <div className="relative z-20 max-w-lg mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Team</span></h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Submit a request to join SolutionHub. Admin approval required.</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-blue-900/20 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="your@email.com" className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department *</label>
                <div className="space-y-3">
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value, customDepartment: '' })}
                    required
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all"
                  >
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {form.department === 'Other' && (
                    <input
                      type="text"
                      value={form.customDepartment || ''}
                      onChange={e => setForm({ ...form, customDepartment: e.target.value })}
                      required
                      placeholder="Enter custom department"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role *</label>
              <div className="space-y-3">
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value, customRole: '' })}
                  required
                  className="w-full px-3 py-2.5 bg-white/60 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                >
                  <option value="">Select role</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {form.role === 'Other' && (
                  <input
                    type="text"
                    value={form.customRole || ''}
                    onChange={e => setForm({ ...form, customRole: e.target.value })}
                    required
                    placeholder="Enter custom role"
                    className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
              If your request is approved, we will create your account and email you a secure password reset link. No default password will be assigned.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Why do you want to join?</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Brief description..." className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all resize-none" />
            </div>

            <div className="bg-white/50 rounded-xl p-4 border border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-500 focus:ring-blue-400" />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true) }} className="text-blue-600 underline hover:text-blue-700 font-medium">Terms & Conditions</button>
                </span>
              </label>
            </div>

            <button type="submit" disabled={!agreed || loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit Request
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="h-px w-full bg-slate-200 mb-4"></div>
            <Link to="/employee-login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {showTerms && <TermsAndConditions onAgree={() => { setAgreed(true); setShowTerms(false) }} onCancel={() => setShowTerms(false)} />}
    </section>
  )
}
