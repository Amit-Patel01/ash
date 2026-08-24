'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import TermsAndConditions from '../components/TermsAndConditions'
import { ShieldCheck, Sparkles, ArrowRight, User, Mail, Phone, CheckCircle2, Award, Laptop, Users, Code, ShoppingBag } from 'lucide-react'

export default function StudentSignup() {
  const { signup } = useAuth()
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', interestTrack: 'Buying Projects / Source Code'
  })

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
        phone: form.phone.replace(/\D/g, ''),
        interestTrack: form.interestTrack
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
      <div className="relative w-screen h-screen min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white font-['Outfit',sans-serif]">
        <div className="relative z-10 max-w-md w-full bg-white text-slate-900 rounded-[32px] p-8 sm:p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30 text-white">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Account Created</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your SolutionHub account has been created successfully. Please check your email to set your password and access your dashboard.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2.5 border border-slate-200/80 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase">Name</span>
              <span className="text-slate-800 font-bold">{form.name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase">Email</span>
              <span className="text-slate-800 font-bold">{form.email}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-400 font-bold uppercase">Primary Interest</span>
              <span className="text-blue-600 font-bold">{form.interestTrack}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase">Account Type</span>
              <span className="text-emerald-600 font-black uppercase tracking-wider">User / Client</span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden bg-white text-slate-800 font-['Outfit',sans-serif]">
      
      {/* FULL SCREEN DUAL COLUMN LAYOUT */}
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
        
        {/* ── LEFT COLUMN: 3D Tech Showcase & Trust Badges ── */}
        <div className="lg:col-span-6 relative h-72 lg:h-full w-full bg-slate-900 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden group">
          
          {/* Background 3D Tech Illustration */}
          <img
            src="/login_hero_banner.png"
            alt="Amit Solution Hub Technology"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.05] transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 shadow-lg">
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

          {/* Bottom Trust & Feature Stats */}
          <div className="relative z-10 text-white mt-auto pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider mb-3 border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> User & Client Portal
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              Projects, Services & Courses
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium max-w-md drop-shadow-xs leading-relaxed">
              Create your account to buy readymade source codes, order custom tech projects, or access training courses.
            </p>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Source Code</p>
                  <p className="text-[10px] text-slate-300 font-bold">Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Custom Dev</p>
                  <p className="text-[10px] text-slate-300 font-bold">Services</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Interactive</p>
                  <p className="text-[10px] text-slate-300 font-bold">Courses</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── RIGHT COLUMN: User Signup Form ── */}
        <div className="lg:col-span-6 h-full w-full bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Header Link */}
          <div className="hidden lg:block text-right">
            <span className="text-xs text-slate-500 font-medium mr-2">Already registered?</span>
            <Link href="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Sign In →
            </Link>
          </div>

          {/* Form Content Container */}
          <div className="my-auto max-w-md w-full mx-auto py-6">
            
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Create User Account</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">Join thousands of developers, clients, and learners at Amit Solution Hub.</p>
              
              {/* Feature Pill Highlights */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase">
                  📁 Readymade Source Code
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                  🛠️ Custom Tech Services
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase">
                  🎓 Training Courses
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="name@domain.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">+91</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full pl-20 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Primary Purpose / Interest */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  What are you primarily looking for?
                </label>
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={form.interestTrack}
                    onChange={e => setForm({ ...form, interestTrack: e.target.value })}
                    className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="Buying Projects / Source Code">Buying Readymade Projects & Source Code</option>
                    <option value="Custom Project Development">Custom Software & App Development Service</option>
                    <option value="Training Courses">Enrolling in Technical Training & Courses</option>
                    <option value="College Certification Course & Projects">College Certification Course & Major Project</option>
                    <option value="General User">General Inquiry / Browsing</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      Terms & Conditions
                    </button>{' '}
                    and Privacy Policy.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create User Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center lg:hidden">
              <span className="text-xs text-slate-500">Already registered? </span>
              <Link href="/login" className="text-xs font-bold text-indigo-600">
                Sign In
              </Link>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} Amit Solution Hub Technology Pvt Ltd</span>
            <Link href="/contact" className="hover:text-indigo-600 transition-colors">Support</Link>
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
