'use client'
import { useState } from 'react'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { api } from '../config/api'

const inputClasses =
  'w-full rounded-2xl border bg-white/80 px-5 py-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/10 dark:focus:bg-white/8 border-slate-200/80 font-medium'

const contactInfo = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'support@Ashnexa Systems.com',
    href: 'mailto:support@Ashnexa Systems.com',
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+91 7874248481',
    href: 'tel:+917874248481',
    color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Location',
    value: 'Godhra, Gujarat, India',
    color: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10',
  },
]

const Contact = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', mobile: '', message: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      await fetch(`${api.base}/api/db/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'unread' }),
      })
      const response = await fetch(api.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed')
      setStatus('success')
      setFormData({ firstName: '', lastName: '', email: '', mobile: '', message: '' })
      setTimeout(() => setStatus(''), 6000)
    } catch {
      setStatus('error')
    }
    setLoading(false)
  }

  return (
    <>
      <SEO
        title="Contact | Ashnexa Systems"
        description="Get in touch with Ashnexa Systems for web development, technical support, and custom project inquiries."
      />

      <PublicPageShell
        badge="Let's Connect"
        title={
          <>
            Reach out for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              fast, professional
            </span>{' '}
            support
          </>
        }
        description="Whether it's a project inquiry, internship request, or technical help — we respond within 24 hours and deliver with care."
        actions={[
          { label: 'Chat with Team', to: '/chat' },
          { label: 'Call Support', href: 'tel:+917874248481', variant: 'secondary' },
        ]}
        pills={['24/7 Response', 'MSME Registered', 'India-Based Team', 'Professional Support']}
        stats={[
          { value: '24h', label: 'Response Time' },
          { value: '< 1 Day', label: 'Typical Reply' },
          { value: 'India', label: 'Support Base' },
        ]}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">Direct Contact</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
                We're always here to help you succeed
              </h3>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-3">
              {contactInfo.map((item) => (
                <div key={item.label} className="group rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition-all hover:-translate-y-0.5 dark:border-white/8 dark:bg-white/4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{item.label}</div>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors dark:text-slate-200 dark:hover:text-indigo-400">
                          {item.value}
                        </a>
                      ) : (
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Response time card */}
            <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-blue-50/50 p-5 dark:border-indigo-500/15 dark:from-indigo-500/8 dark:to-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">We're actively responding</div>
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Expect a reply within 24 hours. For urgent support, call us directly.
              </p>
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            {/* Left: Before you submit */}
            <PublicGlassCard className="space-y-6 p-7">
              <PublicSectionHeading
                badge="Before You Submit"
                title="Help us respond faster"
                description="Include enough detail about your project, inquiry, or issue so we can give you a precise and helpful response."
              />

              <div className="grid gap-3">
                {[
                  { emoji: '💻', title: 'Project or Service Enquiry', text: 'Mention your goals, timeline, and the type of deliverable you need.' },
                  { emoji: '🎓', title: 'Internship or Training', text: 'Share your current role, learning interest, and expected outcomes.' },
                  { emoji: '🔧', title: 'Technical Help', text: 'Include the exact problem, device/stack details, and any blockers.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 dark:border-white/8 dark:bg-white/4 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{item.emoji}</span>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</div>
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 pl-9">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5 dark:border-white/8 dark:bg-white/3">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Quick links</div>
                <div className="flex flex-wrap gap-2">
                  <a href="mailto:support@Ashnexa Systems.com" className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                    📧 Email Support
                  </a>
                  <a href="tel:+917874248481" className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                    📞 Call Now
                  </a>
                </div>
              </div>
            </PublicGlassCard>

            {/* Right: Contact Form */}
            <PublicGlassCard className="p-7">
              <div className="space-y-6">
                <PublicSectionHeading
                  badge="Contact Form"
                  title="Send your message"
                  description="Fill in the details below and we'll get back to you promptly."
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Amit" required className={inputClasses} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Patel" required className={inputClasses} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className={inputClasses} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+91 98765 43210" required className={inputClasses} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Your Message</label>
                    <textarea
                      rows="5"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what you need, your goals, and any relevant details..."
                      required
                      className={`${inputClasses} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-base font-bold text-white shadow-[0_16px_40px_-12px_rgba(99,102,241,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-12px_rgba(99,102,241,0.65)] disabled:cursor-not-allowed disabled:opacity-60 group"
                  >
                    {/* Shimmer */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        <span>Sending your message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>

                  {status === 'success' && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        Message sent! We'll get back to you within 24 hours.
                      </span>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 dark:border-rose-500/20 dark:bg-rose-500/10">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                        Failed to send. Please try again or email us directly.
                      </span>
                    </div>
                  )}
                </form>
              </div>
            </PublicGlassCard>
          </div>
        </PublicSection>
      </PublicPageShell>
    </>
  )
}

export default Contact
