import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Link2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'
import brandLogo from '../assets/brand-logo.png'

const departments = ['Engineering', 'Design', 'Marketing', 'Management', 'Support', 'Sales', 'Editor', 'Technician', 'HR', 'Operations', 'Placement', 'Other']
const roles = [
  'HR & Recruitment Executive',
  'Student Support Executive',
  'Business Development Executive (BDE)',
  'Marketing Executive',
  'Content Writer',
  'LMS Coordinator',
  'Training Coordinator',
  'Project Coordinator',
  'Graphic Designer',
  'Web Development Intern/Executive',
  'Operations Executive',
  'Placement & Career Support Executive',
  'Developer',
  'Designer',
  'Project Manager',
  'Support Agent',
  'Sales Executive',
  'Video Editor',
  'Technician',
  'Other'
]

const initialForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  customDepartment: '',
  role: '',
  customRole: '',
  reason: '',
  cvFilePath: '',
}

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/10'
const labelClass = 'mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300'

export default function RequestAccount() {
  const { createAccountRequest } = useAuth()
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedMessage, setSubmittedMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialForm)

  const finalDepartment = useMemo(
    () => (form.department === 'Other' ? form.customDepartment.trim() : form.department),
    [form.customDepartment, form.department]
  )
  const finalRole = useMemo(
    () => (form.role === 'Other' ? form.customRole.trim() : form.role),
    [form.customRole, form.role]
  )

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!agreed) {
      setError('Please accept the Terms & Conditions to continue.')
      return
    }

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !finalDepartment || !finalRole || !form.cvFilePath.trim()) {
      setError('Please complete all required fields.')
      return
    }

    const cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await createAccountRequest({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: cleanPhone,
        department: finalDepartment,
        role: finalRole,
        cvFilePath: form.cvFilePath.trim(),
        reason: form.reason.trim(),
      })
      setSubmittedMessage(result.message || 'Your request has been submitted successfully.')
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_46%,#f4fbf7_100%)] px-4 py-6 text-slate-900 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#071b18_100%)] dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200 transition hover:bg-white dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10">
            <img src={brandLogo} alt="SolutionHub" className="h-8 w-auto object-contain" />
          </Link>

          <Link to="/join-us" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Join Us
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-12">
          <div className="max-w-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-300/50 dark:bg-white dark:text-slate-950 dark:shadow-black/30">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>
            <h1 className="max-w-lg text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
              Request your SolutionHub employee account.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
              Share your details once. The admin team reviews the request and sends a secure password reset link after approval.
            </p>

            <div className="mt-8 space-y-5">
              {[
                { icon: Clock3, title: 'Admin review', text: 'Your request stays pending until the team verifies it.' },
                { icon: LockKeyhole, title: 'Secure invite', text: 'No default password is created for your account.' },
                { icon: ShieldCheck, title: 'Role access', text: 'Department and role decide the workspace access.' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl">
            <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-2xl shadow-slate-300/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/40">
              {submitted ? (
                <div className="p-6 sm:p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-950/40">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div className="mx-auto mt-6 max-w-md text-center">
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">Request submitted</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {submittedMessage || 'Your account creation request has been sent to the administrator for review.'}
                    </p>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                    {[
                      ['Name', form.name],
                      ['Email', form.email],
                      ['Department', finalDepartment],
                      ['Status', 'Awaiting Review'],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-slate-200 px-4 py-3 text-sm last:border-b-0 dark:border-white/10">
                        <span className="font-bold text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:shadow-black/20 dark:hover:bg-slate-100"
                  >
                    Back to Home
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-200 px-6 py-6 dark:border-white/10 sm:px-8">
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">Employee account request</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Fill the required fields and accept the terms before submitting.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
                    {error && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Full Name *</span>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => updateField('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Your full name"
                            className={`${fieldClass} pl-11`}
                          />
                        </div>
                      </label>

                      <label>
                        <span className={labelClass}>Email *</span>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => updateField('email', e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="name@example.com"
                            className={`${fieldClass} pl-11`}
                          />
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Phone *</span>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            inputMode="tel"
                            value={form.phone}
                            onChange={e => updateField('phone', e.target.value)}
                            required
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            className={`${fieldClass} pl-11`}
                          />
                        </div>
                      </label>

                      <label>
                        <span className={labelClass}>Department *</span>
                        <select
                          value={form.department}
                          onChange={e => setForm(prev => ({ ...prev, department: e.target.value, customDepartment: '' }))}
                          required
                          className={fieldClass}
                        >
                          <option value="">Select department</option>
                          {departments.map(department => <option key={department} value={department}>{department}</option>)}
                        </select>
                      </label>
                    </div>

                    {form.department === 'Other' && (
                      <label>
                        <span className={labelClass}>Custom Department *</span>
                        <input
                          type="text"
                          value={form.customDepartment}
                          onChange={e => updateField('customDepartment', e.target.value)}
                          required
                          placeholder="Enter department"
                          className={fieldClass}
                        />
                      </label>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Role *</span>
                        <select
                          value={form.role}
                          onChange={e => setForm(prev => ({ ...prev, role: e.target.value, customRole: '' }))}
                          required
                          className={fieldClass}
                        >
                          <option value="">Select role</option>
                          {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </label>

                      {form.role === 'Other' ? (
                        <label>
                          <span className={labelClass}>Custom Role *</span>
                          <input
                            type="text"
                            value={form.customRole}
                            onChange={e => updateField('customRole', e.target.value)}
                            required
                            placeholder="Enter role"
                            className={fieldClass}
                          />
                        </label>
                      ) : (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-slate-300">
                          <div className="flex gap-3">
                            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-cyan-300" />
                            <p>Approved accounts receive a secure password reset link by email.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <label>
                      <span className={labelClass}>Google Drive Resume Link *</span>
                      <div className="relative">
                        <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="url"
                          value={form.cvFilePath}
                          onChange={e => updateField('cvFilePath', e.target.value)}
                          required
                          placeholder="https://drive.google.com/file/d/..."
                          className={`${fieldClass} pl-11`}
                        />
                      </div>
                    </label>

                    <label>
                      <span className={labelClass}>Why do you want to join?</span>
                      <textarea
                        value={form.reason}
                        onChange={e => updateField('reason', e.target.value)}
                        rows={4}
                        placeholder="Brief description"
                        className={`${fieldClass} min-h-[118px] resize-none`}
                      />
                    </label>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={e => setAgreed(e.target.checked)}
                          className="mt-0.5 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-white/20 dark:bg-slate-900"
                        />
                        <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowTerms(true)
                            }}
                            className="font-bold text-blue-700 underline underline-offset-4 transition hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                          >
                            Terms & Conditions
                          </button>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={!agreed || loading}
                      className="inline-flex h-[52px] min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:shadow-black/30 dark:hover:bg-slate-100"
                    >
                      {loading ? (
                        <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/20 dark:border-t-slate-950 motion-safe:animate-spin" />
                      ) : (
                        <>
                          Submit Request
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <div className="border-t border-slate-200 pt-5 text-center dark:border-white/10">
                      <Link to="/employee-login" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700 dark:text-slate-400 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                        Already have an account? Sign in
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTerms && <TermsAndConditions onAgree={() => { setAgreed(true); setShowTerms(false) }} onCancel={() => setShowTerms(false)} />}
    </section>
  )
}
