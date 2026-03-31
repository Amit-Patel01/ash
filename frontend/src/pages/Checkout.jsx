import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../config/api'

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

const Checkout = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const purchaseType = searchParams.get('type') || 'project_only'
  const { projects, addOrder } = useStore()
  const { currentUser, loading: authLoading } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    screenshot_file: null,
  })

  useEffect(() => {
    const found = projects.find(p => p.slug === slug && p.status === 'active')
    setProject(found || null)
    setLoading(false)
    setTimeout(() => setLoaded(true), 100)
  }, [slug, projects])

  useEffect(() => {
    if (currentUser) {
      setForm(prev => ({
        ...prev,
        customer_name: currentUser.displayName || prev.customer_name,
        customer_email: currentUser.email || prev.customer_email,
        customer_phone: currentUser.phone || prev.customer_phone,
      }))
    }
  }, [currentUser])

  const amount = project
    ? purchaseType === 'project_with_source'
      ? Number(project.price_with_source)
      : Number(project.price_project_only)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // 0. Ensure Razorpay is loaded
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.")
      }

      // 1. Create Razorpay Order
      const orderRes = await fetch(api.razorpayCreateOrder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      const { order } = await orderRes.json()

      if (!order) throw new Error("Could not create Razorpay order")

      // 2. Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_TEST_KEY", // Should be in env
        amount: order.amount,
        currency: order.currency,
        name: "Amit Solution Hub",
        description: `Purchase for ${project.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(api.razorpayVerifyPayment, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                customer_email: form.customer_email,
                customer_name: form.customer_name,
                project_title: project.title,
                amount: amount,
                purchase_type: purchaseType
              })
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              // 4. Save Order to Database
              await addOrder({
                project_id: project.id,
                project_title: project.title,
                customer_name: form.customer_name,
                customer_email: form.customer_email,
                customer_phone: form.customer_phone,
                purchase_type: purchaseType,
                amount: amount,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              })
              setSubmitted(true)
            } else {
              setError("Payment verification failed. Please contact support.")
            }
          } catch (err) {
            console.error(err)
            setError("Something went wrong during verification.")
          }
        },
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
          contact: form.customer_phone
        },
        theme: { color: "#2563eb" }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error(err)
      setError('Failed to initiate payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <section className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-2xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-48 bg-slate-200/50 rounded-3xl"></div>
          <div className="h-12 bg-slate-200/50 rounded-xl"></div>
          <div className="h-12 bg-slate-200/50 rounded-xl"></div>
        </div>
      </section>
    )
  }

  if (!currentUser) {
    return (
      <section className="min-h-screen pt-[140px] md:pt-[180px] pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-10 border border-white/60 shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Login Required</h2>
            <p className="text-slate-500 mb-6">Please sign in or create an account to proceed with checkout.</p>
            <div className="space-y-3">
              <Link to="/login" className="block w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all text-center">
                Sign In
              </Link>
              <Link to="/signup" className="block w-full px-6 py-3.5 bg-white/60 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-white transition-all text-center">
                Create Account
              </Link>
            </div>
            <Link to={`/projects/${slug}`} className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mt-4">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Back to Project
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Project Not Found</h2>
          <Link to="/projects" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold">
            Browse Projects
          </Link>
        </div>
      </section>
    )
  }

  if (submitted) {
    return (
      <section className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-10 border border-white/60 shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Payment Successful!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for your purchase. We have received your payment and will send the source code for <strong>{project.title}</strong> to your email within <strong>24 hours</strong>.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-slate-600"><strong>Order Details:</strong></p>
              <p className="text-sm text-slate-700">{project.title}</p>
              <p className="text-sm text-slate-700">Amount: ₹{amount.toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-700">Type: {purchaseType === 'project_with_source' ? 'Project + Source Code' : 'Project Only'}</p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Browse More Projects
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Background */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-20 -right-20 w-[30rem] h-[30rem] bg-blue-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 -left-20 w-[30rem] h-[30rem] bg-purple-500/15 rounded-full blur-[100px]"></div>
      </div>
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div className={`w-full max-w-2xl mx-auto px-4 sm:px-6 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/projects" className="hover:text-blue-600 transition-colors">Projects</Link>
          <span>/</span>
          <Link to={`/projects/${slug}`} className="hover:text-blue-600 transition-colors">{project.title}</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Checkout</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-8 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Checkout</span>
        </h1>

        <div className="space-y-8">
          {/* Order Summary */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Project</span>
              <span className="font-bold text-slate-800">{project.title}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Type</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                purchaseType === 'project_with_source'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {purchaseType === 'project_with_source' ? 'Project + Source Code' : 'Project Only'}
              </span>
            </div>
            <div className="h-px bg-slate-200 my-4"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">Total</span>
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pay Securely</h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100 flex flex-col items-center justify-center space-y-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-8 opacity-80" />
              <p className="text-sm text-slate-600 font-medium">
                We use Razorpay for secure and instant payments using UPI, Card, Net Banking, and Wallets.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 mt-4">
              <p className="text-sm text-emerald-800 font-medium">
                After successful payment, you will receive a confirmation email instantly and the project files within 24 hours.
              </p>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Complete Your Order</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  placeholder="Enter your mobile number"
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-8 px-6 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Submit Order'
              )}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By placing this order, you agree to our terms. We'll verify your payment before delivering the project.
            </p>
          </form>
        </div>

        {/* Back */}
        <div className="text-center mt-8">
          <Link to={`/projects/${slug}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Project Details
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Checkout
