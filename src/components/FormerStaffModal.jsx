'use client'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'
import { X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

export default function FormerStaffModal({ isOpen, onClose }) {
  const { currentUser, userProfile } = useAuth()
  const { submitReinstatementRequest } = useStore()

  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const isAlreadyRequested = Boolean(userProfile?.reinstatementRequested || currentUser?.reinstatementRequested || successMsg)
  const previousRole = userProfile?.previousRole || currentUser?.previousRole || 'Staff Member'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const res = await submitReinstatementRequest(message.trim())
      setSuccessMsg(res?.message || "Your reinstatement request has been submitted to the Founder, CEO & Admin team successfully!")
      setMessage('')
    } catch (err) {
      setErrorMsg(err?.message || "Failed to submit reinstatement request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 font-['Outfit',sans-serif]">
      {/* Background Overlay Click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Gradient Shimmer Bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Former Staff Member Account Notice
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff Account Reinstatement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            You were previously designated as <strong className="text-slate-700 dark:text-slate-200">{previousRole}</strong> at Ashnexa Systems Pvt Ltd.
          </p>
        </div>

        {/* Highlighted Banner Matching User Screenshot */}
        <div className="w-full rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-4 flex items-center justify-center gap-3 text-center my-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs flex-shrink-0 text-xl">
            📩
          </div>
          <span className="text-sm sm:text-base font-black text-rose-700 dark:text-rose-300">
            Request Staff Reinstatement / Re-employment
          </span>
        </div>

        {/* Success / Status View if already requested */}
        {isAlreadyRequested ? (
          <div className="space-y-4 my-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 text-xs leading-relaxed">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Reinstatement Request Submitted</p>
                <p className="mt-0.5">
                  Your request for staff re-employment has been received and is currently under review by the Founder, CEO & Admin team. You will be notified via email once approved.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Continue to Student Dashboard
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Message to Founder, CEO & Admin <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please explain why you wish to request staff reinstatement or re-employment..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors hover:bg-slate-100"
              >
                Skip / Later
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
