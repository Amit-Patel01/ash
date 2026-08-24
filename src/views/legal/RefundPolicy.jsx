'use client'
import { useEffect } from 'react'
import SEO from '../../components/SEO'

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO title="Refund Policy | AmitSolutionHub" description="Cancellation and refund policies for our premium mentorship and certification courses." />
      <div className="min-h-screen pt-10 lg:pt-14 pb-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">Refund Policy</h1>
          <p className="text-sm text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-slate-600 leading-relaxed max-w-none">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. General Overview</h2>
              <p>At AmitSolutionHub, we strive to deliver extreme value in all our mentorship programs and certification course cohorts. Because digital access to proprietary knowledge, curriculum blueprints, and live sessions cannot be easily "returned", we maintain a strict policy regarding refunds and cancellations.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Trading Mentorship Program</h2>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li><strong>No Refunds After Commencement:</strong> Once a Trading Mentorship cohort begins and access to live meetings/materials is granted, all sales are final. No refunds will be provided.</li>
                <li><strong>Cancellation Before Start:</strong> If you cancel your enrollment at least 48 hours before the first scheduled session, you are eligible for a 100% refund (minus standard gateway processing fees).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Technology Certification Courses</h2>
              <p>For standard coding and technology certification courses:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Any administrative or registration fee paid is generally non-refundable once the batch induction is complete.</li>
                <li>If an applicant is rejected by our selection committee, a full refund of any deposited fee will be initiated within 5-7 business days.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Duplicate Payments</h2>
              <p>In the event of a technical error resulting in a duplicate deduction from your account, please immediately contact our Grievance Officer with the transaction ID. Verified duplicate payments will be refunded in full within 7 business days.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Reaching Out</h2>
              <p>To request a valid cancellation or to report a duplicate payment, please navigate to our Grievance Cell or Contact page and email us through formal channels.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default RefundPolicy
