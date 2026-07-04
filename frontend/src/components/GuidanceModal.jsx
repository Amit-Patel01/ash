import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Mail, GraduationCap, School, X } from 'lucide-react'
import { api } from '../config/api'

export default function GuidanceModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 500) // 500ms delay for immediate yet smooth trigger
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName || !phone || !college || !email || !department) {
      setError('Please fill in all fields.')
      return
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        firstName: fullName,
        lastName: '(Guidance Request)',
        email: email,
        mobile: `+91 ${phone}`,
        message: `Personalized Guidance Request\nCollege: ${college}\nDepartment: ${department}`
      }

      await fetch(`${api.base}/api/db/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          status: 'unread',
          createdAt: new Date().toISOString()
        }),
      })

      const response = await fetch(api.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to submit details')

      localStorage.setItem('solutionhub:guidance_submitted', 'true')
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full sm:max-w-[480px] bg-white sm:rounded-[32px] rounded-t-[28px] border border-slate-100 shadow-[0_32px_80px_-20px_rgba(79,70,229,0.22)] flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            {/* Decorative color wash */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-br from-indigo-400/15 via-purple-400/10 to-transparent blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-300/10 to-transparent blur-2xl" />

            {/* ── Sticky Close Bar ── always visible, never scrolls away */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto sm:hidden" />
              <div className="hidden sm:block" />
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 sm:px-8 sm:pb-8">

            {success ? (
              <div className="relative py-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Thank You!</h3>
                <p className="text-slate-550 text-sm mt-2 font-medium">Our team will connect with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative space-y-5">
                {/* Header */}
                <div className="text-center pb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-500/10 mb-3">
                    Free Guidance
                  </div>
                  <h2 className="text-[22px] font-black text-slate-900 leading-tight tracking-tight">
                    Share your details for{' '}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      personalized guidance
                    </span>.
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed font-semibold mt-2.5">
                    Our team will connect with you to suggest the most relevant program / track.
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="w-16 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-550 text-sm font-bold">
                      +91
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-emerald-500" />
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10 digit mobile number"
                        required
                        className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* College Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">College Name</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <School className="w-4 h-4 text-amber-500" />
                    </div>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Example: XYZ Institute of Technology"
                      required
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email and Department Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-rose-500" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center z-10">
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                      </div>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all font-medium appearance-none"
                      >
                        <option value="" disabled>Choose</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics & Comm</option>
                        <option value="Mechanical Engineering">Mechanical Eng</option>
                        <option value="Civil Engineering">Civil Eng</option>
                        <option value="Business Administration">Business Admin</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-bold text-sm tracking-wide shadow-[0_12px_32px_-8px_rgba(99,102,241,0.45)] hover:shadow-[0_16px_40px_-8px_rgba(147,51,234,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Details...
                    </>
                  ) : (
                    'Submit details'
                  )}
                </button>

                {/* Disclaimer */}
                <p className="text-[10px] leading-relaxed text-slate-400 text-center font-medium px-4">
                  By submitting, you consent to be contacted by the SolutionHub team via WhatsApp / call for counselling purposes.
                </p>
              </form>
            )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}