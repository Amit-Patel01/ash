'use client'
import { useEffect } from 'react'
import SEO from '../../components/SEO'

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO title="Terms of Service | AmitSolutionHub" description="Terms and conditions for utilizing AmitSolutionHub's internship and trading mentorship programs." />
      <div className="min-h-screen pt-10 lg:pt-14 pb-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-slate-600 leading-relaxed max-w-none">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h2>
              <p>By registering for an internship, purchasing a mentorship program, or utilizing the AmitSolutionHub platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please refrain from using our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Program Rules & Conduct</h2>
              <p>Students and trainees must maintain professional decorum during all live sessions, meetings, and project collaborations. We reserve the right to terminate enrollment without refund if a participant engages in abusive behavior, piracy of learning materials, or disruption of classes.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Trading Mentorship Disclosure</h2>
              <p>For individuals participating in the "Trading Mentorship" program:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>All educational material, live sessions, and chart analyses provided are strictly for <strong>educational purposes only</strong>.</li>
                <li>AmitSolutionHub and its mentors are <strong>not SEBI-registered financial advisors</strong>.</li>
                <li>We do not provide direct buy/sell tips or manage capital. Any trades executed in the financial markets are at your own personal risk.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Certification & Intellectual Property</h2>
              <p>Certificates are awarded strictly on the basis of attendance, task completion, and performance. We hold the absolute right to withhold certification if criteria are not met. Furthermore, all study materials, source codes, and curriculum blueprints provided are the intellectual property of AmitSolutionHub and cannot be resold.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Modifications to Service</h2>
              <p>We reserve the right to modify, suspend, or discontinue any part of our service or curriculum at any time without prior notice, provided that ongoing paid commitments are fulfilled.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default TermsOfService
