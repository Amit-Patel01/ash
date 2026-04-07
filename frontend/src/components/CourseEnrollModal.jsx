import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

export default function CourseEnrollModal({ course, onClose, onSuccess }) {
  const { addEnrollment, isUserEnrolled } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const enrolled = currentUser ? isUserEnrolled(currentUser.uid, course.id) : false

  const validateMobile = () => {
    const c = mobile.replace(/\s/g, '')
    if (!c) { setMobileError('Mobile number is required'); return false }
    if (!/^[6-9]\d{9}$/.test(c)) { setMobileError('Enter a valid 10-digit Indian number'); return false }
    setMobileError(''); return true
  }

  const handleEnroll = async () => {
    if (!currentUser) { navigate('/login'); return }
    if (!validateMobile()) return
    setSubmitting(true)
    setError('')
    try {
      // Firestore duplicate check
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', currentUser.uid),
        where('courseId', '==', course.id),
        where('status', '==', 'active')
      )
      const snap = await getDocs(q)
      if (!snap.empty) { setSuccess(true); return }

      await addEnrollment({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        userMobile: mobile,
        courseId: course.id,
        courseTitle: course.title,
        category: course.category,
        amount: course.isFree ? 0 : Number(course.price || 0),
        instructor: course.instructor || '',
        assignedEmployeeId: course.assignedEmployeeId || '',
      })
      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError('Enrollment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Already enrolled */}
        {enrolled && !success ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Already Enrolled! 🎓</h3>
            <p className="text-slate-500 text-sm mb-1">You're already enrolled in</p>
            <p className="font-bold text-blue-600 mb-5">{course.title}</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">Close</button>
              <button onClick={() => navigate('/customer/my-courses')} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">My Courses →</button>
            </div>
          </div>
        ) : success ? (
          <div className="p-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-40" />
              <div className="relative w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Enrolled Successfully! 🎉</h3>
            <p className="text-slate-500 mb-1">You are now enrolled in</p>
            <p className="font-bold text-blue-600 mb-5">{course.title}</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">Close</button>
              <button onClick={() => navigate('/customer/my-courses')} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">View My Courses →</button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Enrolling in</p>
                  <h3 className="text-xl font-bold leading-tight">{course.title}</h3>
                  {course.category && <p className="text-blue-200 text-sm mt-1">{course.category}</p>}
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 ml-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Price */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-black">
                  {course.isFree ? 'FREE' : `₹${Number(course.price || 0).toLocaleString('en-IN')}`}
                </span>
                <span className="text-blue-200 text-xs">one-time</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Features preview */}
              {Array.isArray(course.features) && course.features.length > 0 && (
                <div className="space-y-2">
                  {course.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                      {f}
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setMobileError('') }}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
                      mobileError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {mobileError && <p className="mt-1 text-xs text-red-500">{mobileError}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}

              {/* CTA */}
              <button
                onClick={handleEnroll}
                disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enrolling...</>
                ) : course.isFree ? (
                  'Enroll for Free →'
                ) : (
                  'Enroll Now →'
                )}
              </button>

              {!course.isFree && (
                <p className="text-center text-xs text-slate-400">🛡️ Secure enrollment · Razorpay coming soon</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
