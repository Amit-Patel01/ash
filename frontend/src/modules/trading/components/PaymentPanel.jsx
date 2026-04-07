import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../config/firebase'

const PaymentPanel = ({ selectedPlan, onPaymentSuccess }) => {
  const { addTradingPayment, addTradingEnrollment, tradingEnrollments } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)
  const isSubmittingRef = useRef(false) // ✅ Race condition guard

  const isTestModeEnabled = import.meta.env.VITE_TEST_MODE === 'true' || import.meta.env.VITE_TEST_MODE === true
  const isFreeCourse = selectedPlan.price === 0 || selectedPlan.price === '0' || selectedPlan.isFree === true

  // ✅ Check if already enrolled
  useEffect(() => {
    if (!currentUser || !selectedPlan || !tradingEnrollments) return
    const enrolled = tradingEnrollments.some(
      e => e.userId === currentUser.uid && e.courseId === selectedPlan.id && e.status === 'active'
    )
    setAlreadyEnrolled(enrolled)
  }, [currentUser, selectedPlan, tradingEnrollments])

  const validateMobile = () => {
    const cleaned = mobile.replace(/\s/g, '')
    if (!cleaned) {
      setMobileError('Mobile number is required')
      return false
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setMobileError('Enter a valid 10-digit Indian mobile number')
      return false
    }
    setMobileError('')
    return true
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    if (!currentUser) { setError('Please login to continue'); return }
    if (!validateMobile()) return
    if (isSubmittingRef.current) return  // ✅ Block duplicate clicks

    isSubmittingRef.current = true
    setSubmitting(true)
    setError('')

    try {
      const res = await loadRazorpay()
      if (!res) { setError('Razorpay SDK failed to load. Check your internet.'); return }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const orderRes = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedPlan.price, currency: 'INR' })
      })
      const orderData = await orderRes.json()
      if (!orderData.success) { setError(orderData.message || 'Failed to initiate order.'); return }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Amit Solution Hub',
        description: `Enrollment for ${selectedPlan.name}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/trading/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                userEmail: currentUser.email,
                userMobile: mobile,
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                courseId: selectedPlan.id,
                courseName: selectedPlan.name,
                amount: selectedPlan.price
              })
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setSuccess(true)
              if (onPaymentSuccess) onPaymentSuccess()
            } else {
              setError('Payment verification failed. Please contact support.')
            }
          } catch (err) {
            setError('Verification error. Please contact support.')
          }
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: mobile,
        },
        theme: { color: '#2563eb' }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  const handleTestEnrollment = async () => {
    if (!currentUser) { setError('Please login to continue'); return }
    if (!validateMobile()) return
    if (isSubmittingRef.current) return  // ✅ Block duplicate clicks

    // ✅ Firestore duplicate check (second layer of protection)
    try {
      const q = query(
        collection(db, 'tradingEnrollments'),
        where('userId', '==', currentUser.uid),
        where('courseId', '==', selectedPlan.id),
        where('status', '==', 'active')
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        setAlreadyEnrolled(true)
        return
      }
    } catch (e) {
      console.warn('Enrollment check failed:', e)
    }

    isSubmittingRef.current = true
    setSubmitting(true)
    setError('')

    try {
      await Promise.all([
        addTradingEnrollment({
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          userEmail: currentUser.email,
          userMobile: mobile,
          courseId: selectedPlan.id,
          courseName: selectedPlan.name,
          amount: selectedPlan.price,
          status: 'active',
        }),
        addTradingPayment({
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          userEmail: currentUser.email,
          userMobile: mobile,
          courseId: selectedPlan.id,
          courseName: selectedPlan.name,
          amount: selectedPlan.price,
          paymentId: 'TEST_' + Date.now(),
          method: 'test_bypass',
          status: 'completed'
        })
      ])

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      fetch(`${API_URL}/api/trading/enrollment-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser.displayName || currentUser.email,
          userEmail: currentUser.email,
          planName: selectedPlan.name,
          amount: selectedPlan.price
        })
      }).catch(() => {})

      setSuccess(true)
      if (onPaymentSuccess) onPaymentSuccess()
    } catch (err) {
      setError('Enrollment failed. Please try again.')
    } finally {
      setSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  // ✅ Already Enrolled State
  if (alreadyEnrolled) {
    return (
      <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-10 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 mx-auto mb-5 bg-amber-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Already Enrolled! 🎓</h3>
        <p className="text-slate-500 text-sm mb-2">You are already enrolled in</p>
        <p className="text-blue-600 font-bold text-lg mb-5">{selectedPlan.name}</p>
        <p className="text-slate-400 text-sm mb-6">Access your course material and live sessions from your dashboard.</p>
        <button
          onClick={() => navigate('/customer')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
        >
          Go to Dashboard
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    )
  }

  // ✅ Success Popup State
  if (success) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-12 text-center animate-in zoom-in duration-300">
        {/* Animated checkmark */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-50" />
          <div className="relative w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Enrollment Successful! 🎉</h3>
        <p className="text-slate-500 mb-1">Welcome to <span className="font-semibold text-slate-700">{selectedPlan.name}</span></p>
        <p className="text-slate-400 text-sm mb-6">A confirmation email has been sent to your inbox.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/customer')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-lg">💳</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Secured Payment</h3>
            <p className="text-sm text-slate-500">Complete your enrollment via Razorpay</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">Selected Plan</p>
            <p className="text-lg font-bold text-slate-900">{selectedPlan?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-blue-600">₹{Number(selectedPlan?.price || 0).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">INC. ALL TAXES</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Benefits */}
        <div className="space-y-3">
          {['Instant access to curriculum', 'Live Session Invitations', 'Community Support Access'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">✓</div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* ✅ Mobile Number Field — Required */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
            <input
              id="enrollment-mobile"
              type="tel"
              value={mobile}
              onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setMobileError('') }}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
                mobileError
                  ? 'border-red-300 bg-red-50 focus:ring-red-200 text-red-700 placeholder-red-300'
                  : 'border-slate-200 bg-slate-50 focus:ring-blue-100 focus:border-blue-400 text-slate-900'
              }`}
            />
          </div>
          {mobileError && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {mobileError}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Buttons */}
        {isFreeCourse ? (
          <button onClick={handleTestEnrollment} disabled={submitting} className="w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl">
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enrolling...</>
              ) : (
                <>Enroll for Free<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
              )}
            </div>
          </button>
        ) : (
          <>
            <button onClick={handleRazorpayPayment} disabled={submitting} className="w-full relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl">
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>Pay Now with Razorpay<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
                )}
              </div>
            </button>

            {isTestModeEnabled && (
              <button onClick={handleTestEnrollment} disabled={submitting} className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm">
                {submitting ? <><div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" /> Processing...</> : <>Skip Payment (Test Mode)</>}
              </button>
            )}

            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              🛡️ Secured by industry standard encryption
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentPanel
