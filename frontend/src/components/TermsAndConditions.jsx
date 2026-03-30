import { useState } from 'react'

export default function TermsAndConditions({ onAgree, onCancel }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/5 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Terms & Conditions
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm text-gray-300 leading-relaxed">
          <div>
            <h3 className="text-white font-semibold text-base mb-2">1. Account Eligibility</h3>
            <p>By requesting an account on SolutionHub, you confirm that you are at least 18 years of age and have the legal capacity to enter into this agreement. Account creation requires admin approval and is restricted to authorized personnel only.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">2. Account Security</h3>
            <p>You are responsible for maintaining the confidentiality of your login credentials. You must not share your password with anyone. If you suspect unauthorized access to your account, you must notify the administrator immediately. SolutionHub is not liable for any loss or damage arising from your failure to protect your credentials.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">3. Project Selling Policy</h3>
            <p>Employees may list projects for sale on the platform after receiving admin approval. All projects must be original work or properly licensed. You agree that:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>All listed projects must comply with intellectual property laws</li>
              <li>Project descriptions and pricing must be accurate and truthful</li>
              <li>SolutionHub reserves the right to remove any project listing at any time</li>
              <li>Commission structure will be communicated separately by management</li>
              <li>Payment processing and disputes are handled by the platform</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">4. Revenue Sharing</h3>
            <p>Revenue from project sales will be distributed according to the company's commission structure. Payment to employees will be processed within 30 days of successful transaction completion. Tax deductions and statutory requirements will be applied as per applicable laws.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">5. Content Guidelines</h3>
            <p>All content uploaded to the platform must not contain:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Malicious code, viruses, or harmful software</li>
              <li>Copyrighted material without proper authorization</li>
              <li>Misleading or fraudulent information</li>
              <li>Content that violates any applicable laws</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">6. Data Privacy</h3>
            <p>Your personal data will be collected, stored, and processed in accordance with our privacy policy. We use Firebase for authentication and data storage. Your data will not be shared with third parties without your consent, except as required by law.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">7. Termination</h3>
            <p>SolutionHub reserves the right to suspend or terminate your account at any time for violation of these terms, misconduct, or at management discretion. Upon termination, your access to the platform will be revoked immediately.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">8. Limitation of Liability</h3>
            <p>SolutionHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount of commissions paid to you in the preceding 12 months.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">9. Changes to Terms</h3>
            <p>These terms may be updated at any time. Continued use of the platform after changes constitutes acceptance of the modified terms. You will be notified of significant changes via email.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-2">10. Governing Law</h3>
            <p>These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of courts in India.</p>
          </div>

          <p className="text-xs text-gray-500 pt-4 border-t border-white/5">Last updated: March 29, 2026 | SolutionHub Technologies Pvt. Ltd.</p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-white/5 px-6 py-4 rounded-b-2xl">
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30"
            />
            <span className="text-sm text-gray-300">
              I have read and agree to the <span className="text-blue-400 font-medium">Terms & Conditions</span> and <span className="text-blue-400 font-medium">Privacy Policy</span>
            </span>
          </label>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button
              onClick={() => agreed && onAgree()}
              disabled={!agreed}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-white hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
