import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { api } from '../config/api'
import { db } from '../config/firebase'

const inputClasses =
  'w-full rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100'

const ContactTabIcon = ({ name, size = 16, color = 'currentColor', strokeWidth = 2 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' }
  if (name === 'chat') return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M20 14a3 3 0 0 1-3 3H9l-5 4V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7Z" /></svg>
  return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 4h3l1.5 4-2 1.5a15 15 0 0 0 5.5 5.5l1.5-2 4 1.5v3A2 2 0 0 1 18 20C10.8 20 5 14.2 5 7a2 2 0 0 1 1.5-3Z" /></svg>
}

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    github: '',
    message: '',
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread',
      })

      const response = await fetch(api.contact, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email notification')
      }

      setStatus('success')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        github: '',
        message: '',
      })

      setTimeout(() => setStatus(''), 5000)
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setStatus('error')
    }

    setLoading(false)
  }

  return (
    <>
      <SEO
        title="Contact | AmitSolutionHub"
        description="Contact AmitSolutionHub through a cleaner mobile-friendly page with visible trust cues and faster enquiry flow."
      />

      <PublicPageShell
        badge="Let's Connect"
        title={
          <>
            A contact page that feels
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> trustworthy, clear, and responsive </span>
            on mobile too
          </>
        }
        description="Use this page to send project, internship, training, or support enquiries through a cleaner white-glow interface built to look professional on small screens."
        actions={[
          { label: 'Message the Team', to: '/chat', icon: <ContactTabIcon name="chat" /> },
          { label: 'Call Support', href: 'tel:+917874248481', variant: 'secondary', icon: <ContactTabIcon name="phone" /> },
        ]}
        pills={['Fast response flow', 'MSME-backed presence', 'Mobile-first contact form', 'Professional public impression']}
        stats={[
          { value: '24/7', label: 'Message Intake' },
          { value: '< 1 Day', label: 'Typical Response' },
          { value: 'India', label: 'Support Base' },
        ]}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Public Trust</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Keep the first enquiry experience simple and credible</h3>
            </div>

            <div className="grid gap-3">
              {[
                { label: 'Support Email', value: 'support@amitsolutionhub.com' },
                { label: 'Phone', value: '+91 7874248481' },
                { label: 'Location', value: 'Godhra, Gujarat, India' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200/80 bg-white/90 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
              <div className="text-sm font-bold text-slate-900">Presentation Guidance</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A clear contact path, company identity, and direct support details help the site appear more genuine and organized for reviewers.
              </p>
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <PublicGlassCard className="space-y-6 p-6 sm:p-7">
              <PublicSectionHeading
                badge="Reach Out"
                title="Before you submit"
                description="Share enough detail about your project, internship interest, or issue so the team can respond faster."
              />

              <div className="grid gap-4">
                {[
                  {
                    title: 'Project or service enquiry',
                    text: 'Mention goals, preferred timeline, and the kind of deliverable you need.',
                  },
                  {
                    title: 'Internship or training request',
                    text: 'Add your current role, learning interest, and what outcome you are expecting.',
                  },
                  {
                    title: 'Technical help',
                    text: 'Include the exact problem, device or stack details, and any urgent blockers.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5">
                    <div className="text-base font-bold text-slate-900">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-bold text-slate-900">Useful links</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="mailto:support@amitsolutionhub.com" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Email Support
                  </a>
                  <a href="tel:+917874248481" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Call Now
                  </a>
                </div>
              </div>
            </PublicGlassCard>

            <PublicGlassCard className="p-6 sm:p-7">
              <div className="space-y-6">
                <PublicSectionHeading
                  badge="Contact Form"
                  title="Send your message"
                  description="The form now uses bigger touch targets, cleaner spacing, and a more premium white-glow layout."
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className={inputClasses}
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className={inputClasses}
                  />

                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Mobile Number (+91...)"
                    required
                    className={inputClasses}
                  />

                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="GitHub or portfolio URL"
                    required
                    className={inputClasses}
                  />

                  <textarea
                    rows="6"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you need"
                    required
                    className={`${inputClasses} resize-none`}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-[24px] bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-[0_22px_45px_-24px_rgba(37,99,235,0.9)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        <span>Sending securely...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  {status === 'success' && (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                      Message sent successfully. The team will get back to you soon.
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                      Failed to send message. Please try again after a moment.
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
