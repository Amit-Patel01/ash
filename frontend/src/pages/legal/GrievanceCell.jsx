import { useEffect } from 'react'
import SEO from '../../components/SEO'

const GrievanceCell = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO title="Grievance Redressal | AmitSolutionHub" description="Submit your complaints or grievances. AmitSolutionHub is committed to a transparent and fair resolution process." />
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Grievance Cell</h1>
          <p className="text-sm text-slate-500 mb-10 font-medium">Committed to Student & Client Satisfaction</p>
          
          <div className="space-y-8 text-slate-600 leading-relaxed max-w-none">
            
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Our Objective</h2>
              <p className="text-blue-800/80">In alignment with educational guidelines and standard corporate practices, AmitSolutionHub has established a dedicated Grievance Redressal mechanism. We aim to address all complaints, payment discrepancies, and training issues within 7 business days.</p>
            </div>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">How to Report a Grievance</h2>
              <p>Step 1: Write an email explaining your issue comprehensively.</p>
              <p>Step 2: Attach any relevant screenshots (like payment IDs, Dashboard errors).</p>
              <p>Step 3: Send it directly to our Grievance Officer.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Grievance Officer Details</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-5 border border-slate-200 rounded-xl">
                  <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Email Support</div>
                  <a href="mailto:support@amitsolutionhub.com" className="text-blue-600 font-bold hover:underline">support@amitsolutionhub.com</a>
                </div>
                <div className="p-5 border border-slate-200 rounded-xl">
                  <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Corporate HQ</div>
                  <div className="text-slate-800 font-medium">AmitSolutionHub, Gujarat, India</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Escalation Matrix</h2>
              <p>If your grievance is not resolved within the initial SLA of 7 days, it will automatically be ascended to the senior management tier. Note that all resolutions provided by the senior tier post-escalation are final.</p>
            </section>

            <div className="mt-8 text-center pt-8 border-t border-slate-100">
              <a href="/contact" className="inline-flex px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg">
                Go to General Contact Page
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default GrievanceCell
