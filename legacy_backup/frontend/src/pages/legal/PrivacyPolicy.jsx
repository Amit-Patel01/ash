import { useEffect } from 'react'
import SEO from '../../components/SEO'

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO title="Privacy Policy | AmitSolutionHub" description="Privacy policy and data protection guidelines for AmitSolutionHub internship and mentorship programs." />
      <div className="min-h-screen pt-10 lg:pt-14 pb-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-slate-600 leading-relaxed max-w-none">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Information We Collect</h2>
              <p>At AmitSolutionHub, we prioritize the privacy of our students, trainees, and visitors. When you register for an internship, mentorship program (such as Trading Mentorship), or create an account on our platform, we collect certain personal information including your name, email address, phone number, and educational background.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>To provide, operate, and maintain our educational programs and mentorship sessions.</li>
                <li>To issue certificates and map internship credits as per AICTE and university guidelines.</li>
                <li>To communicate with you regarding updates, meetings (for trading mentorships), and student support.</li>
                <li>To process payments securely for premium programs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Data Security & Storage</h2>
              <p>We implement strict security measures to protect your personal data. We utilize industry-standard cloud database security (e.g., Firebase) to store user authentication and training progress. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Sharing with Authorities</h2>
              <p>As a recognized agency aiming for compliance with MSME and AICTE, we may be required to share basic internship registration data (such as enrollment IDs and names) with educational institutions or statutory bodies purely for certification validation and academic credit processing.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Contact Us</h2>
              <p>If you have any questions or concerns about this Privacy Policy, please contact our Grievance Officer via the details provided on our official Contact/Grievance page.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicy
