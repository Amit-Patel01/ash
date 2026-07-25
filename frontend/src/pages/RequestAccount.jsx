import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Sparkles,
  Link2,
  Building2,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'

const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Management',
  'Support',
  'Sales',
  'Editor',
  'Technician',
  'HR',
  'Operations',
  'Placement',
  'Other'
]

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

export default function RequestAccount() {
  const { createAccountRequest } = useAuth()
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
      setError('Please enter a valid 10-digit mobile number.')
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
      setSubmittedMessage(result.message || 'Your staff account request has been submitted successfully.')
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit request.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="relative w-screen h-screen min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white font-['Outfit',sans-serif]">
        <div className="relative z-10 max-w-md w-full bg-white text-slate-900 rounded-[32px] p-8 sm:p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 text-white">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Request Submitted</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {submittedMessage || 'Your staff account application is under review by Founder, CEO & Admin.'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2.5 border border-slate-200/80 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase">Applicant</span>
              <span className="text-slate-800 font-bold">{form.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase">Department</span>
              <span className="text-slate-800 font-bold">{finalDepartment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase">Role</span>
              <span className="text-indigo-600 font-black uppercase tracking-wider">{finalRole}</span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-white text-slate-800 font-['Outfit',sans-serif]">
      
      {/* FULL SCREEN DUAL COLUMN LAYOUT (100vh Edge-to-Edge) */}
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
        
        {/* ── LEFT COLUMN: Full Screen Height 3D Hero Image Showcase ── */}
        <div className="lg:col-span-5 relative h-64 lg:h-full w-full bg-slate-900 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden group">
          
          {/* Background 3D Tech Illustration */}
          <img
            src="/login_hero_banner.png"
            alt="Amit Solution Hub Technology"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.05] transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Overlay */}
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
              <BriefcaseBusiness className="w-3.5 h-3.5 text-blue-300" /> Employee & Staff Onboarding
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              Join Our Engineering Team
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium max-w-md drop-shadow-xs leading-relaxed">
              Request an official staff account to access internal dashboards, projects, LMS tools, and enterprise workflows.
            </p>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Full Screen Height Light Request Form ── */}
        <div className="lg:col-span-7 h-full w-full bg-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Header Link */}
          <div className="hidden lg:block text-right">
            <span className="text-xs text-slate-500 font-medium mr-2">Already have credentials?</span>
            <Link to="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Sign In →
            </Link>
          </div>

          {/* Form Content Container */}
          <div className="my-auto max-w-xl w-full mx-auto py-4">
            
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Request Staff Account</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Submit your details and CV drive link for Admin approval.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Enter full name"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Work Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                      placeholder="you@domain.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      required
                      placeholder="+91 10-digit mobile"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Applied Role / Designation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CV / Resume Drive Link */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Resume / CV Drive Link (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={form.cvFilePath}
                    onChange={e => setForm({ ...form, cvFilePath: e.target.value })}
                    required
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>
                    I confirm that the information provided is accurate and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      Terms & Conditions
                    </button>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit Staff Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center lg:hidden">
              <span className="text-xs text-slate-500">Already have credentials? </span>
              <Link to="/login" className="text-xs font-bold text-indigo-600">
                Sign In
              </Link>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} Amit Solution Hub Technology Pvt Ltd</span>
            <Link to="/contact" className="hover:text-indigo-600 transition-colors">Support</Link>
          </div>

        </div>

      </div>

      <TermsAndConditions
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={() => {
          setAgreed(true)
          setShowTerms(false)
        }}
      />

    </div>
  )
}
