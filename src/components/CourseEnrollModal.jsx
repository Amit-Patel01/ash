'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { api, readApiJson } from '../config/api'
import { isEnrollmentClosed } from '../utils/enrollmentDeadline'
import { getLearningTypeLabel, normalizeLearningType } from '../utils/learningType'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const normalizePlanKey = (value) => String(value || '').trim().toLowerCase()
const compactPlanKey = (value) => normalizePlanKey(value).replace(/[^a-z0-9]/g, '')

const getPlanIdentity = (source = {}) => {
  const normalized = [
    source.planId,
    source.planLabel,
    source.planName,
    source.id,
    source.label,
  ]
    .map(normalizePlanKey)
    .filter(Boolean)

  const compact = [
    source.planId,
    source.planLabel,
    source.planName,
    source.id,
    source.label,
  ]
    .map(compactPlanKey)
    .filter(Boolean)

  const rawAmount =
    source.amount ??
    source.price ??
    (source.isFree ? 0 : undefined)
  const amount = Number(rawAmount)

  return {
    normalized,
    compact,
    amount: Number.isNaN(amount) ? null : amount }
}

const matchesPlanEnrollment = (enrollment, planRef = null) => {
  if (!planRef) return true

  const enrollmentPlan = getPlanIdentity(enrollment)
  const targetPlan = getPlanIdentity(planRef)
  const hasPlanKeys = targetPlan.normalized.length > 0 || targetPlan.compact.length > 0

  if (hasPlanKeys) {
    const directMatch =
      targetPlan.normalized.some(key => enrollmentPlan.normalized.includes(key)) ||
      targetPlan.compact.some(key => enrollmentPlan.compact.includes(key))

    if (directMatch) return true
  }

  if (targetPlan.amount !== null) {
    return enrollmentPlan.amount === targetPlan.amount
  }

  return !hasPlanKeys
}

export default function CourseEnrollModal({ course, onClose, onSuccess }) {
  const { addEnrollment, isUserEnrolled } = useStore()

  useEffect(() => {
    document.body.classList.add('payment-modal-open')
    return () => {
      document.body.classList.remove('payment-modal-open')
    }
  }, [])
  const { currentUser } = useAuth()
    const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)
  const [mobile, setMobile] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponPreview, setCouponPreview] = useState(null)
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' })
  const [couponLoading, setCouponLoading] = useState(false)
  const [mobileError, setMobileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const actualCourseId = course.courseId || course.id
  const actualCourseTitle = course.courseTitle || course.title
  const actualPlanId = course.planId || ''
  const actualPlanLabel = course.planLabel || course.label || ''
  const actualPrice = Number(course.price || 0)
  const isFreeCourse = course.isFree || course.price === 0 || course.price === '0' || actualPrice === 0
  const learningType = normalizeLearningType(course)
  const itemLabel = getLearningTypeLabel(course)
  const actionLabel = learningType === 'webinar' ? 'Registration' : 'Enrollment'
  const availableSoon = course.availableSoon === true
  const enrollmentClosed = isEnrollmentClosed(course)
  const targetPlanRef = {
    planId: course.planId || course.id || '',
    planLabel: course.planLabel || course.label || '',
    planName: course.planLabel || course.label || actualCourseTitle,
    amount: actualPrice,
    isFree: isFreeCourse }
  const appliedPricing = couponPreview?.pricing || null
  const discountAmount = Number(appliedPricing?.discountAmount || 0)
  const payableAmount = isFreeCourse ? 0 : Number(appliedPricing?.finalAmount ?? actualPrice)
  const isEffectivelyFree = payableAmount === 0
  const showCouponField = !isFreeCourse
  const appliedCouponCode = appliedPricing?.couponCode || ''

  const enrolled = currentUser ? isUserEnrolled(currentUser.uid, actualCourseId, targetPlanRef) : false

  const getAuthHeaders = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Please sign in again to continue.')
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` }
  }

  const validateMobile = () => {
    const c = mobile.replace(/\s/g, '')
    if (!c) { setMobileError('Mobile number is required'); return false }
    if (!/^[6-9]\d{9}$/.test(c)) { setMobileError('Enter a valid 10-digit Indian number'); return false }
    setMobileError(''); return true
  }

  const applyCoupon = async () => {
    if (!currentUser) {
      navigate('/login')
      return null
    }

    const normalizedCode = couponCode.trim().toUpperCase()
    if (!normalizedCode) {
      setCouponPreview(null)
      setCouponStatus({ type: 'error', message: 'Enter a coupon code first.' })
      return null
    }

    setCouponLoading(true)
    setCouponStatus({ type: '', message: '' })
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(api.couponsValidate, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          couponCode: normalizedCode,
          courseId: actualCourseId,
          planId: actualPlanId,
          originalAmount: actualPrice }) })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Coupon could not be applied.')
      }

      setCouponPreview({
        coupon: data.coupon,
        pricing: data.pricing })
      setCouponCode(data.pricing?.couponCode || normalizedCode)
      setCouponStatus({
        type: 'success',
        message: `Coupon applied. You saved ₹${Number(data.pricing?.discountAmount || 0).toLocaleString('en-IN')}.` })
      return data
    } catch (err) {
      setCouponPreview(null)
      setCouponStatus({ type: 'error', message: err.message || 'Coupon could not be applied.' })
      return null
    } finally {
      setCouponLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!currentUser) { navigate('/login'); return }
    if (availableSoon) {
      setError(`${itemLabel} will be available soon. ${actionLabel} has not opened yet.`)
      return
    }
    if (enrollmentClosed) {
      setError(`${actionLabel} for this program has closed.`)
      return
    }
    if (!validateMobile()) return
    if (couponCode.trim() && !couponPreview) {
      setError('Apply the coupon code first before continuing.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const headers = await getAuthHeaders()
      const alreadyEnrolled = isUserEnrolled(currentUser.uid, actualCourseId, targetPlanRef)
      if (alreadyEnrolled) { setSuccess(true); return }

      if (isEffectivelyFree) {
        if (appliedCouponCode) {
          const verifyRes = await fetch(api.razorpayVerifyCourse, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: `free_course_order_${Date.now()}`,
              razorpay_payment_id: '',
              razorpay_signature: '',
              userId: currentUser.uid,
              userName: currentUser.displayName || currentUser.email,
              userEmail: currentUser.email,
              courseId: actualCourseId,
              planId: actualPlanId || course.id,
              planName: actualPlanLabel || actualCourseTitle,
              amount: payableAmount,
              originalAmount: actualPrice,
              discountAmount,
              finalAmount: payableAmount,
              couponCode: appliedCouponCode,
              couponId: appliedPricing?.couponId || '' }) })
          const verifyData = await readApiJson(verifyRes)
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.message || 'Unable to confirm the coupon enrollment.')
          }
        }

        await addEnrollment({
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          userEmail: currentUser.email,
          userMobile: mobile,
          courseId: actualCourseId,
          courseTitle: actualCourseTitle,
          category: course.category,
          amount: payableAmount,
          originalAmount: actualPrice,
          discountAmount,
          finalAmount: payableAmount,
          couponCode: appliedCouponCode,
          couponId: appliedPricing?.couponId || '',
          instructor: course.instructor || '',
          assignedEmployeeId: course.assignedEmployeeId || '',
          planId: actualPlanId || course.id || '',
          planLabel: actualPlanLabel })
        setSuccess(true)
        if (onSuccess) onSuccess()
      } else {
        // Paid enrollment via Razorpay
        const isLoaded = await loadRazorpayScript()
        if (!isLoaded) throw new Error("Failed to load Razorpay SDK")

        const orderRes = await fetch(api.razorpayCreateCourseOrder, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            courseId: actualCourseId,
            planId: actualPlanId,
            couponCode: appliedCouponCode })
        })
        const orderData = await readApiJson(orderRes)
        if (!orderRes.ok || !orderData.success) {
          throw new Error(orderData.message || 'Could not create Razorpay order')
        }
        const { order, pricing } = orderData
        if (!order) throw new Error("Could not create Razorpay order")

        const options = {
          key: (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID : null) || 'rzp_live_SXgcywjUbXwb34',
          amount: order.amount,
          currency: order.currency,
          name: "Amit Solution Hub",
          description: `Enrollment for ${course.title}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyRes = await fetch(api.razorpayVerifyCourse, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  ...response,
                  userId: currentUser.uid,
                  userName: currentUser.displayName || currentUser.email,
                  userEmail: currentUser.email,
                  courseId: actualCourseId,
                  planId: actualPlanId || course.id,
                  planName: actualPlanLabel || actualCourseTitle,
                  amount: pricing.finalAmount,
                  originalAmount: pricing.originalAmount,
                  discountAmount: pricing.discountAmount,
                  finalAmount: pricing.finalAmount,
                  couponCode: pricing.couponCode || '',
                  couponId: pricing.couponId || '' })
              })
              const verifyData = await readApiJson(verifyRes)

              if (verifyRes.ok && verifyData.success) {
                await addEnrollment({
                  userId: currentUser.uid,
                  userName: currentUser.displayName || currentUser.email,
                  userEmail: currentUser.email,
                  userMobile: mobile,
                  courseId: actualCourseId,
                  courseTitle: actualCourseTitle,
                  category: course.category,
                  amount: pricing.finalAmount,
                  originalAmount: pricing.originalAmount,
                  discountAmount: pricing.discountAmount,
                  finalAmount: pricing.finalAmount,
                  couponCode: pricing.couponCode || '',
                  couponId: pricing.couponId || '',
                  instructor: course.instructor || '',
                  assignedEmployeeId: course.assignedEmployeeId || '',
                  paymentId: response.razorpay_payment_id,
                  planId: actualPlanId || course.id || '',
                  planLabel: actualPlanLabel })
                setSuccess(true)
                if (onSuccess) onSuccess()
              } else {
                setError(verifyData.message || "Payment verification failed. Please contact support.")
              }
            } catch (err) {
              console.error(err)
              setError("Something went wrong during verification.")
            }
          },
          prefill: {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            contact: mobile
          },
          theme: { color: "#2563eb" }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (err) {
      console.error(err)
      setError(err?.message || `${actionLabel} failed. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
      
        {/* Already enrolled */}
        {enrolled && !success ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Already Enrolled</h3>
            <p className="text-slate-500 text-sm mb-1">You are already enrolled in</p>
            <p className="font-bold text-blue-600 mb-5">{actualCourseTitle}</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">Close</button>
              <button onClick={() => navigate('/user/my-courses')} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">My Courses</button>
            </div>    
          </div>
        ) : availableSoon ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-50">
              <svg className="h-10 w-10 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Available Soon</h3>
            <p className="mb-5 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{actualCourseTitle}</span> is visible publicly, but {actionLabel.toLowerCase()} has not opened yet.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
              Close
            </button>
          </div>
        ) : enrollmentClosed ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3h.008v.008H12v-.008zm8.25-.758A9 9 0 1112 3a9 9 0 018.25 9.992z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{actionLabel} Closed</h3>
            <p className="mb-5 text-sm text-slate-500">
              {actionLabel} for <span className="font-semibold text-slate-700">{actualCourseTitle}</span> is no longer available.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
              Close
            </button>
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
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{learningType === 'webinar' ? 'Registration Confirmed' : 'Enrollment Confirmed'}</h3>
            <p className="text-slate-500 mb-1">You now have access to</p>
            <p className="font-bold text-blue-600 mb-5">{actualCourseTitle}</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">Close</button>
              <button onClick={() => navigate('/user/my-courses')} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">View My Courses</button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">{actionLabel} For</p>
                  <h3 className="text-xl font-bold leading-tight">{actualCourseTitle}</h3>
                  {course.category && <p className="text-blue-200 text-sm mt-1">{course.category}</p>}
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 ml-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Price */}
              <div className="mt-4 flex items-center gap-3">
                <div>
                  <span className="text-3xl font-black">
                    {isEffectivelyFree ? 'FREE' : `₹${payableAmount.toLocaleString('en-IN')}`}
                  </span>
                  {discountAmount > 0 && (
                    <p className="mt-1 text-xs font-semibold text-blue-100">
                      <span className="line-through opacity-75">₹{actualPrice.toLocaleString('en-IN')}</span>
                      <span className="ml-2">Coupon applied</span>
                    </p>
                  )}
                </div>
                <span className="text-blue-200 text-xs">{itemLabel}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
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

              {showCouponField && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Coupon Code</p>
                      <p className="mt-1 text-xs text-slate-500">Apply a valid coupon to reduce your checkout amount.</p>
                    </div>
                    {appliedCouponCode && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                        {appliedCouponCode}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => {
                        const nextCode = event.target.value.toUpperCase()
                        setCouponCode(nextCode)
                        if (nextCode.trim() !== appliedCouponCode) {
                          setCouponPreview(null)
                          setCouponStatus({ type: '', message: '' })
                        }
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>

                  {couponStatus.message && (
                    <div className={`rounded-xl px-3 py-2 text-xs font-medium ${
                      couponStatus.type === 'error'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {couponStatus.message}
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Original Price</span>
                      <span className="font-semibold text-slate-900">₹{actualPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>Discount</span>
                      <span className={`font-semibold ${discountAmount > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        -₹{discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                      <span className="font-semibold text-slate-700">Final Payable</span>
                      <span className="text-lg font-black text-slate-900">
                        {isEffectivelyFree ? 'FREE' : `₹${payableAmount.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}

              {/* CTA */}
              <button
                onClick={handleEnroll}
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : isEffectivelyFree ? (
                  learningType === 'webinar' ? 'Register for Free' : 'Enroll for Free'
                ) : (
                  learningType === 'webinar' ? 'Register Now' : 'Enroll Now'
                )}
              </button>

              {!isEffectivelyFree && (
                <p className="text-center text-xs text-slate-400">Secure checkout powered by Razorpay</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
