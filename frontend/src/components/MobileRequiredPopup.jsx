import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function MobileRequiredPopup() {
  const { currentUser, userProfile, updateUserProfile } = useAuth()
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Show only for students/students without phone
  const needsMobile = 
    !dismissed &&
    currentUser &&
    (userProfile?.role === 'student' || userProfile?.role === 'student') &&
    !userProfile?.phone

  if (!needsMobile) return null

  const handleSave = async () => {
    const c = mobile.replace(/\D/g, '')
    if (!c) { setError('Mobile number is required'); return }
    if (!/^[6-9]\d{9}$/.test(c)) { setError('Enter valid 10-digit Indian mobile number'); return }
    
    setSaving(true)
    try {
      await updateUserProfile(currentUser.uid, { phone: c })
      setDismissed(true)
    } catch (err) {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Dark overlay — can't click away (forced action) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative bg-gray-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-white text-center mb-2">📞 Mobile Number Required</h2>
          <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
            Your mobile number is required to complete your profile. Our team may need to call you about your enrolled courses and sessions.
          </p>

          {/* Why required callout */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-xl flex-shrink-0">ℹ️</span>
              <div className="space-y-1.5 text-sm text-blue-200/80">
                <p>📞 Instructors can call you for session reminders</p>
                <p>💬 You'll receive WhatsApp updates for your course</p>
                <p>🚀 Faster enrollment confirmation</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Your Mobile Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-400">🇮🇳 +91</span>
                <div className="w-px h-4 bg-white/10" />
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                placeholder="10-digit mobile number"
                className={`w-full pl-20 pr-4 py-4 bg-white/5 border rounded-2xl text-white text-sm font-medium outline-none transition-all ${
                  error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
            </div>
            {error && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={handleSave}
            disabled={saving || mobile.length < 10}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Save & Continue</>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-600 mt-3">
            🔒 Your number is kept private and only used for course-related communication
          </p>
        </div>
      </div>
    </div>
  )
}
