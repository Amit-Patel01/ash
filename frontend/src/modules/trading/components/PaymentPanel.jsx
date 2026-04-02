import { useState } from 'react'
import { useStore } from '../../../store/StoreContext'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const PaymentPanel = ({ selectedPlan, onPaymentSuccess }) => {
  const { addTradingPayment, addTradingEnrollment } = useStore()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Test mode toggle - controlled by env variable
  const isTestModeEnabled = import.meta.env.VITE_TEST_MODE === 'true' || import.meta.env.VITE_TEST_MODE === true

  // Check if course is free
  const isFreeCourse = selectedPlan.price === 0 || selectedPlan.price === '0' || selectedPlan.isFree === true

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
    if (!currentUser) {
      setError('Please login to continue')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await loadRazorpay()
      if (!res) {
        setError('Razorpay SDK failed to load. Check your internet.')
        return
      }

      // 1. Create order on backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPlan.price,
          currency: 'INR'
        })
      })
      const orderData = await orderRes.json()

      if (!orderData.success) {
        setError('Failed to initiate order. Please try again.')
        return
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Amit Solution Hub',
        description: `Enrollment for ${selectedPlan.name}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          // 3. Verify payment on success
          try {
            const verifyRes = await fetch('/api/trading/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                userEmail: currentUser.email,
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
              setTimeout(() => {
                navigate('/customer')
              }, 3000)
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
        },
        theme: { color: '#2563eb' }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err) {
      console.error('Payment Error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTestEnrollment = async () => {
    if (!currentUser) {
      setError('Please login to continue')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Create enrollment directly
      await addTradingEnrollment({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        courseId: selectedPlan.id,
        courseName: selectedPlan.name,
        amount: selectedPlan.price,
        status: 'active',
      })

      // Create payment record
      await addTradingPayment({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        courseId: selectedPlan.id,
        courseName: selectedPlan.name,
        amount: selectedPlan.price,
        paymentId: 'TEST_' + Date.now(),
        method: 'test_bypass',
        status: 'success',
      })

      setSuccess(true)
      if (onPaymentSuccess) onPaymentSuccess()
      setTimeout(() => {
        navigate('/customer')
      }, 3000)
    } catch (err) {
      console.error('Test Enrollment Error:', err)
      setError('Test enrollment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome to the Academy!</h3>
        <p className="text-slate-500">Your enrollment is confirmed. Redirecting to your dashboard...</p>
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
            <p className="text-2xl font-black text-blue-600">₹{selectedPlan?.price?.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">INC. ALL TAXES</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">✓</div>
            <span>Instant access to curriculum</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">✓</div>
            <span>Live Session Invitations</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">✓</div>
            <span>Community Support Access</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Free Course - Show Enroll Button */}
        {isFreeCourse ? (
          <button
            onClick={handleTestEnrollment}
            disabled={submitting}
            className="w-full relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl">
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enrolling...
                </>
              ) : (
                <>
                  Enroll for Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </div>
          </button>
        ) : (
          <>
            <button
          onClick={handleRazorpayPayment}
          disabled={submitting}
          className="w-full relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl">
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Pay Now with Razorpay
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </div>
        </button>

        {isTestModeEnabled && (
          <button
            onClick={handleTestEnrollment}
            disabled={submitting}
            className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Skip Payment (Test Mode)
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        )}

        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          🛡️ Secured by industry standard encryption
        </p>
      </div>
    </div>
  )
}

export default PaymentPanel
