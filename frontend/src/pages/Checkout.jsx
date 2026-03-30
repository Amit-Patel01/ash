import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

const UPI_ID = 'amitpatel07029@upi'

const Checkout = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const purchaseType = searchParams.get('type') || 'project_only'
  const { projects, addOrder } = useStore()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    screenshot_file: null,
  })

  useEffect(() => {
    const found = projects.find(p => p.slug === slug && p.status === 'active')
    setProject(found || null)
    setLoading(false)
    setTimeout(() => setLoaded(true), 100)
  }, [slug, projects])

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
      let screenshotUrl = null

      // Upload payment screenshot to backend if file selected
      if (form.screenshot_file) {
        const formData = new FormData()
        formData.append('screenshot', form.screenshot_file)
        const uploadRes = await fetch('https://backend-5u1w.onrender.com/api/upload/payment', {
          method: 'POST',
          body: formData
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          screenshotUrl = uploadData.url
        }
      }

      await addOrder({
        project_id: project.id,
        project_title: project.title,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        purchase_type: purchaseType,
        amount: amount,
        payment_screenshot_url: screenshotUrl,
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong while submitting your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Order Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for your purchase. We'll verify your payment and send the project files to your email within 24 hours.
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

          {/* UPI QR Payment */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pay via UPI</h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100 mb-4">
              {/* UPI QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto bg-white rounded-2xl shadow-inner flex items-center justify-center mb-4 border-2 border-dashed border-blue-200">
                <div className="text-center p-4">
                  <svg className="w-12 h-12 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-xs text-slate-500 font-medium">Scan QR Code</p>
                  <p className="text-xs text-slate-400">or use UPI ID below</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-3 border border-blue-200 shadow-sm">
                <span className="text-sm font-bold text-slate-700">{UPI_ID}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(UPI_ID)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  title="Copy UPI ID"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-3">
                Pay <strong className="text-blue-600">₹{amount.toLocaleString('en-IN')}</strong> to the UPI ID above
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-sm text-amber-800 font-medium">
                After payment, upload the payment screenshot below and submit the form. We'll verify and deliver your project within 24 hours.
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

              {/* Payment Screenshot */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Screenshot</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setForm({ ...form, screenshot_file: e.target.files[0] })}
                    className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Upload screenshot of your UPI payment (JPG, PNG, WebP - Max 5MB)</p>
              </div>
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
