import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { api } from "../config/api"
import { emailNotify } from "../utils/emailNotify"

export default function UserCustomProject() {
  const { currentUser, userProfile } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  })

  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  // Pre-populate student details
  useEffect(() => {
    if (currentUser || userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile?.displayName || currentUser?.displayName || "",
        email: currentUser?.email || userProfile?.email || "",
        mobile: userProfile?.phone || "",
      }))
    }
  }, [currentUser, userProfile])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus("")

    try {
      const response = await fetch(`${api.base}/api/db/custom_requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: currentUser?.uid || "student",
          status: "pending",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit custom project request")
      }

      setStatus("success")

      // Send Email notifications
      emailNotify('service_request_admin', {
        clientName: formData.fullName,
        clientEmail: formData.email,
        clientPhone: formData.mobile,
        serviceType: formData.projectType,
        message: formData.description
      })
      emailNotify('service_request_user', {
        clientName: formData.fullName,
        clientEmail: formData.email,
        serviceType: formData.projectType
      })

      setFormData(prev => ({
        ...prev,
        company: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: "",
      }))
    } catch (error) {
      console.error("Error submitting custom project:", error)
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const projectTypes = [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "API Integration",
    "E-Commerce Solution",
    "CMS Development",
    "Cloud & DevOps",
    "Other",
  ]

  const budgetRanges = [
    "Under ₹50,000",
    "₹50,000 - ₹1,00,000",
    "₹1,00,000 - ₹3,00,000",
    "₹3,00,000 - ₹5,00,000",
    "₹5,00,000+",
    "Let's Discuss",
  ]

  const timelineOptions = [
    "1 - 2 Weeks",
    "1 Month",
    "2 - 3 Months",
    "3 - 6 Months",
    "6+ Months",
    "Flexible",
  ]

  // ── Theme-aware style tokens ──────────────────────────────────
  const pageBg       = isDark ? "rgba(6,9,20,0)" : "transparent"
  const heroBg       = isDark
    ? "linear-gradient(135deg,rgba(59,130,246,0.18),rgba(15,23,42,0.94),rgba(139,92,246,0.18))"
    : "linear-gradient(135deg,rgba(59,130,246,0.10),rgba(241,245,249,0.97),rgba(139,92,246,0.10))"
  const heroBorder   = isDark ? "rgba(255,255,255,0.10)" : "rgba(99,102,241,0.18)"
  const heroTitle    = isDark ? "#ffffff" : "#0f172a"
  const heroSub      = isDark ? "#cbd5e1" : "#475569"
  const heroLabel    = isDark ? "rgba(191,219,254,0.8)" : "#6366f1"

  const cardBg       = isDark ? "rgba(17,24,39,0.55)" : "rgba(255,255,255,0.85)"
  const cardBorder   = isDark ? "rgba(255,255,255,0.10)" : "rgba(99,102,241,0.15)"
  const cardTitle    = isDark ? "#ffffff" : "#0f172a"
  const cardText     = isDark ? "#94a3b8" : "#475569"

  const labelColor   = isDark ? "#64748b" : "#6366f1"
  const inputBg      = isDark ? "rgba(255,255,255,0.05)" : "rgba(241,245,249,0.80)"
  const inputBorder  = isDark ? "rgba(255,255,255,0.10)" : "rgba(99,102,241,0.18)"
  const inputColor   = isDark ? "#ffffff" : "#0f172a"
  const inputPlaceholder = isDark ? "#4b5563" : "#94a3b8"
  const selectBg     = isDark ? "#111827" : "#f1f5f9"
  const selectBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(99,102,241,0.20)"
  const selectColor  = isDark ? "#ffffff" : "#0f172a"

  const btnBg        = isDark ? "rgba(96,165,250,0.10)" : "rgba(99,102,241,0.10)"
  const btnBorder    = isDark ? "rgba(96,165,250,0.20)" : "rgba(99,102,241,0.30)"
  const btnColor     = isDark ? "#93c5fd" : "#4f46e5"

  const featureTitle = isDark ? "#ffffff" : "#1e293b"
  const featureText  = isDark ? "#94a3b8" : "#64748b"

  const sharedInputStyle = {
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    color: inputColor,
    outline: "none",
    width: "100%",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "14px",
  }

  const sharedSelectStyle = {
    background: selectBg,
    border: `1px solid ${selectBorder}`,
    color: selectColor,
    outline: "none",
    width: "100%",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "14px",
    cursor: "pointer",
  }

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: labelColor,
    marginBottom: "8px",
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-[30px] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.15)]"
        style={{ background: heroBg, border: `1px solid ${heroBorder}` }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: heroLabel }}>
              Project Builder
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight" style={{ color: heroTitle }}>
              Custom Project Development
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: heroSub }}>
              Can't find the exact project template in our store? Tell us your custom specifications,
              budget, and timeline, and our development team will build it for you.
            </p>
          </div>
          <div
            className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl text-3xl"
            style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.20)" }}
          >
            🛠️
          </div>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        {/* Form Panel */}
        <section
          className="rounded-[30px] p-6 md:p-8 shadow-2xl backdrop-blur-xl"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: cardTitle }}>
            Build Request Form
          </h2>

          {/* Success */}
          {status === "success" && (
            <div
              className="mb-6 p-4 rounded-2xl flex items-center gap-3"
              style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)", color: "#34d399" }}
            >
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-bold">Request Submitted Successfully!</p>
                <p className="text-xs mt-0.5" style={{ color: cardText }}>
                  We will review your project requirements and contact you within 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div
              className="mb-6 p-4 rounded-2xl"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171" }}
            >
              <p className="font-bold">Failed to submit request</p>
              <p className="text-xs mt-0.5" style={{ color: cardText }}>
                Please check your network connection and try again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name + Email */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={sharedInputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={sharedInputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  style={sharedInputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
              <div>
                <label style={labelStyle}>Company / Institution (Optional)</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. SolutionHub, College Name"
                  style={sharedInputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label style={labelStyle}>Project Type</label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                required
                style={sharedSelectStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                onBlur={e => e.target.style.borderColor = selectBorder}
              >
                <option value="">Select project type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Budget + Timeline */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label style={labelStyle}>Budget Range</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  style={sharedSelectStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => e.target.style.borderColor = selectBorder}
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  required
                  style={sharedSelectStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => e.target.style.borderColor = selectBorder}
                >
                  <option value="">Select timeline</option>
                  {timelineOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Project Description</label>
              <textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Briefly describe your application flow, features needed, API specifications, and database choice..."
                style={{ ...sharedInputStyle, borderRadius: "20px", padding: "16px", resize: "none" }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                onBlur={e => e.target.style.borderColor = inputBorder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? (isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)") : btnBg,
                border: `1px solid ${btnBorder}`,
                color: btnColor,
                borderRadius: "16px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = isDark ? "rgba(96,165,250,0.16)" : "rgba(99,102,241,0.16)" }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = btnBg }}
            >
              {loading ? "Submitting Request..." : "Submit Project Request"}
            </button>
          </form>
        </section>

        {/* Info Panel */}
        <div className="space-y-6">
          <section
            className="rounded-[30px] p-6 shadow-2xl backdrop-blur-xl"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <h3 className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: "#60a5fa" }}>
              Our Services
            </h3>
            <h2 className="mt-2 text-2xl font-black" style={{ color: cardTitle }}>
              Why custom builds?
            </h2>

            <div className="mt-6 space-y-4">
              {[
                { icon: "🤝", title: "Full Collaboration", desc: "Our developers work hand-in-hand with you, showing updates step-by-step." },
                { icon: "🚀", title: "Optimized Architecture", desc: "Clean code, high performance, structured databases, and scalable logic." },
                { icon: "📜", title: "Comprehensive Documentation", desc: "We provide installation manuals, database schemas, and README docs for easy setup." },
              ].map(item => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: featureTitle }}>{item.title}</h4>
                    <p className="text-xs mt-1 leading-5" style={{ color: featureText }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-[30px] p-6 shadow-2xl backdrop-blur-xl"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <h3
              className="text-[11px] font-black uppercase tracking-[0.28em]"
              style={{ color: "#34d399" }}
            >
              Guaranteed Response
            </h3>
            <p className="mt-2 text-sm leading-6" style={{ color: cardText }}>
              Once you submit this form, our project coordinator will analyze your description and
              contact you via email or phone to set up a free design call.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
