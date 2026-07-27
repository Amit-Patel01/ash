import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../config/api'
import { useStore } from '../store/StoreContext'

const FuturisticBotIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="botGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <filter id="botGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Antenna */}
    <line x1="16" y1="3" x2="16" y2="7" stroke="url(#botGrad)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="3" r="2" fill="#38bdf8" filter="url(#botGlow)" />
    {/* Head Outline */}
    <rect x="5" y="7" width="22" height="18" rx="7" fill="#090d16" stroke="url(#botGrad)" strokeWidth="2" />
    {/* Side Ears */}
    <rect x="2" y="13" width="3" height="6" rx="1.5" fill="url(#botGrad)" />
    <rect x="27" y="13" width="3" height="6" rx="1.5" fill="url(#botGrad)" />
    {/* Visor Screen */}
    <rect x="8" y="11" width="16" height="7" rx="3.5" fill="#1e1b4b" stroke="rgba(129, 140, 248, 0.5)" strokeWidth="1" />
    {/* Glowing Eyes */}
    <circle cx="12" cy="14.5" r="2" fill="#38bdf8" filter="url(#botGlow)" />
    <circle cx="20" cy="14.5" r="2" fill="#38bdf8" filter="url(#botGlow)" />
    {/* Smile */}
    <path d="M11 20.5C12.5 22 19.5 22 21 20.5" stroke="url(#botGrad)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const SparklesIcon = ({ size = 16, color = "#38bdf8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0-13l2.1 2.1m8.8 8.8l2.1 2.1" />
  </svg>
)

const SendIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "👋 Hello! Welcome to **SolutionHub AI**.\n\nHow can I help you today?\n\nHere are a few popular things I can assist you with:\n• 🚀 **Source Code & Projects** — Browse readymade apps & scripts\n• 🛠️ **Custom Tech Services** — Request custom software development\n• 🎓 **Courses & Certification** — Explore technical training & QR certificates\n• 💬 **Account & Support** — Instant help with orders, setup & questions\n\nFeel free to ask any question or select an option below!"
}

const QUICK_PROMPTS = [
  '🚀 What readymade projects do you have?',
  '🛠️ How can I request custom project development?',
  '🎓 Tell me about courses & verified certificates',
  '💬 How to contact the support team?'
]

const DEFAULT_STATUS = {
  checked: false,
  available: true,
  message: '',
}

function MarkdownText({ text }) {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f8fafc;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
    .replace(/•/g, '•')

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />
}

function CertificateVerificationCard({ cert }) {
  const dateStr = cert.approval_date
    ? new Date(cert.approval_date.seconds * 1000).toLocaleDateString('en-IN', {
        dateStyle: 'medium'
      })
    : new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '8px',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '20px',
          color: '#34d399',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '3px 8px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          ✓ Verified
        </span>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
          {cert.certificate_id}
        </span>
      </div>

      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>
          {cert.documentLabel || 'Certificate of Completion'}
        </h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
          {cert.courseName}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
        <div>
          <span style={{ color: '#64748b' }}>Recipient: </span>
          <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{cert.userName}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Issued On: </span>
          <span style={{ color: '#cbd5e1' }}>{dateStr}</span>
        </div>
      </div>

      <a
        href={`/verify?id=${cert.certificate_id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          color: '#fff',
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          transition: 'transform 0.2s',
          cursor: 'pointer',
          boxSizing: 'border-box'
        }}
      >
        Open Verification Link
      </a>
    </div>
  )
}

function RecommendationCarousel({ recommendations }) {
  const { courses = [], projects = [] } = recommendations;

  if (courses.length === 0 && projects.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      padding: '8px 2px',
      marginTop: '10px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      width: '100%',
    }}>
      {courses.map(course => (
        <div key={course.id} style={{
          flexShrink: 0,
          width: '210px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div>
            <span style={{
              background: 'rgba(124, 58, 237, 0.25)',
              border: '1px solid rgba(124, 58, 237, 0.5)',
              borderRadius: '20px',
              color: '#c084fc',
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '2px 6px',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '6px'
            }}>
              Course
            </span>
            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.4' }}>
              {course.title}
            </h5>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'extrabold', color: '#34d399', margin: '4px 0' }}>
              {course.plans?.length > 0
                ? `Starts at ₹${Math.min(...course.plans.map(p => Number(p.price) || 0))}`
                : course.price
                  ? `₹${course.price}`
                  : 'Free'}
            </div>
            <a
              href={`/courses/${course.slug || course.id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(37, 99, 235, 0.3))',
                color: '#fff',
                textDecoration: 'none',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 'bold',
                marginTop: '8px',
                border: '1px solid rgba(168, 85, 247, 0.4)'
              }}
            >
              View Details
            </a>
          </div>
        </div>
      ))}

      {projects.map(project => (
        <div key={project.id} style={{
          flexShrink: 0,
          width: '210px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div>
            <span style={{
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '20px',
              color: '#38bdf8',
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '2px 6px',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '6px'
            }}>
              Source Code
            </span>
            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.4' }}>
              {project.title}
            </h5>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'extrabold', color: '#34d399', margin: '4px 0' }}>
              ₹{Number(project.price_project_only || 0).toLocaleString('en-IN')}
            </div>
            <a
              href={`/projects/${project.slug}`}
              style={{
                display: 'block',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(37, 99, 235, 0.3))',
                color: '#fff',
                textDecoration: 'none',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 'bold',
                marginTop: '8px',
                border: '1px solid rgba(56, 189, 248, 0.4)'
              }}
            >
              View Details
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AIChatbot() {
  const { certificates, courses, projects } = useStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [assistantStatus, setAssistantStatus] = useState(DEFAULT_STATUS)
  const [showTooltip, setShowTooltip] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const loadStatus = async () => {
      try {
        const response = await fetch(api.aiStatus)
        const data = await response.json().catch(() => ({}))

        if (!cancelled) {
          setAssistantStatus({
            checked: true,
            available: typeof data.available === 'boolean' ? data.available : response.ok,
            message: data.message || data.reply || '',
          })
        }
      } catch (error) {
        if (!cancelled) {
          setAssistantStatus({
            checked: true,
            available: false,
            message: 'AI server is unreachable right now. Please try again later.',
          })
        }
      }
    }

    loadStatus()

    return () => {
      cancelled = true
    }
  }, [open])

  const sendMessage = async (text) => {
    const messageText = (text || input).trim()
    if (!messageText || loading) return

    const userMessage = { role: 'user', content: messageText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    // 1. Intercept Certificate Verification ID
    const certPattern = /\b([a-zA-Z0-9]{2,8})-([a-zA-Z0-9]{8})\b/i;
    const match = messageText.match(certPattern);
    if (match) {
      setLoading(true);
      setTimeout(() => {
        const certId = match[0].toUpperCase();
        const foundCert = certificates.find(
          c => c.certificate_id?.toUpperCase() === certId && c.status === 'approved'
        );

        if (foundCert) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `Verifying Certificate ID **${certId}**...`,
              customType: 'certificate',
              customData: foundCert
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `❌ **Verification Failed**: Certificate ID **${certId}** was not found, is inactive, or has been revoked. Please check the ID and try again.`
            }
          ]);
        }
        setLoading(false);
      }, 850);
      return;
    }

    // Heuristics for course/project recommendations
    const hasCourseKeyword = /\b(course|courses|learn|study|mentorship|class|classes|webinar|syllabus|trading)\b/i.test(messageText);
    const hasProjectKeyword = /\b(project|projects|code|source code|marketplace|script|app|clone|website|ecommerce)\b/i.test(messageText);

    setLoading(true)

    try {
      const response = await fetch(api.aiChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.reply || data.message || 'Sorry, I could not process that. Please try again.')
      }

      // Check if we should append recommendations
      let recommendations = null;
      if (hasCourseKeyword || hasProjectKeyword) {
        recommendations = {
          courses: hasCourseKeyword ? courses.slice(0, 3) : [],
          projects: hasProjectKeyword ? projects.slice(0, 3) : []
        };
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, I could not process that. Please try again.',
        customType: recommendations && (recommendations.courses.length > 0 || recommendations.projects.length > 0) ? 'recommendations' : null,
        customData: recommendations
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message || '❌ Connection error. Please check your network or contact support@amitsolutionhub.com.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => setMessages([WELCOME_MESSAGE])

  return (
    <>
      {/* Floating Button Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Floating Tooltip Pill */}
        <AnimatePresence>
          {!open && showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#e2e8f0',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'none'
              }}
            >
              <SparklesIcon size={14} color="#38bdf8" />
              <span>Ask SolutionHub AI</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <motion.button
          id="ai-chatbot-toggle"
          onClick={() => setOpen(o => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #c084fc 100%)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)',
            color: 'white',
            position: 'relative',
            animation: open ? 'none' : 'chatPulse 2.5s infinite',
          }}
          aria-label="Toggle AI Chat"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '22px', fontWeight: 'bold' }}
              >
                ✕
              </motion.span>
            ) : (
              <motion.div
                key="bot"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FuturisticBotIcon size={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed z-[9998] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-violet-500/30"
            style={{
              bottom: '98px',
              right: window.innerWidth < 640 ? '12px' : '24px',
              width: window.innerWidth < 640 ? 'calc(100vw - 24px)' : '390px',
              height: window.innerWidth < 640 ? 'calc(100vh - 120px)' : '560px',
              maxHeight: 'calc(100vh - 110px)',
              background: 'linear-gradient(180deg, #0b0f19 0%, #111827 50%, #1e1b4b 100%)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.2)',
            }}
          >

            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(109, 40, 217, 0.9) 100%)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
                }}>
                  <FuturisticBotIcon size={24} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    SolutionHub AI
                    <SparklesIcon size={14} color="#38bdf8" />
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: assistantStatus.checked && !assistantStatus.available ? '#f97316' : '#4ade80',
                      display: 'inline-block',
                      boxShadow: assistantStatus.checked && !assistantStatus.available ? '0 0 8px #f97316' : '0 0 8px #4ade80'
                    }} />
                    {assistantStatus.checked && !assistantStatus.available ? 'Offline' : 'Online & Ready'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={clearChat}
                  title="Clear chat history"
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)',
                    cursor: 'pointer', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close chat"
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
                    cursor: 'pointer', borderRadius: '50%', width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '14px',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent',
            }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '8px'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(124, 58, 237, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '2px'
                    }}>
                      <FuturisticBotIcon size={16} />
                    </div>
                  )}

                  <div style={{
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                      : 'rgba(255, 255, 255, 0.06)',
                    color: 'rgba(248, 250, 252, 0.95)',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    border: msg.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.09)' : 'none',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: msg.role === 'user' ? '0 4px 14px rgba(37, 99, 235, 0.35)' : '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {msg.customType === 'certificate' ? (
                      <CertificateVerificationCard cert={msg.customData} />
                    ) : (
                      <>
                        <MarkdownText text={msg.content} />
                        {msg.customType === 'recommendations' && (
                          <RecommendationCarousel recommendations={msg.customData} />
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FuturisticBotIcon size={16} />
                  </div>

                  <div style={{
                    padding: '12px 18px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif' }}>SolutionHub AI is thinking</span>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                      <span className="animate-bounce" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#38bdf8', animationDelay: '0ms' }} />
                      <span className="animate-bounce" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#818cf8', animationDelay: '150ms' }} />
                      <span className="animate-bounce" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#c084fc', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div style={{
                padding: '0 16px 10px',
                display: 'flex', flexWrap: 'wrap', gap: '6px',
              }}>
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    style={{
                      background: 'rgba(124, 58, 237, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: 'rgba(241, 245, 249, 0.88)',
                      borderRadius: '20px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)'
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(124, 58, 237, 0.12)'
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: '10px',
              alignItems: 'center',
              background: 'rgba(9, 13, 22, 0.7)',
              backdropFilter: 'blur(8px)',
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                id="ai-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask SolutionHub AI anything..."
                rows={1}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '13.5px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: 1.5,
                  maxHeight: '80px',
                  overflowY: 'auto',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.7)'
                  e.target.style.boxShadow = '0 0 12px rgba(124, 58, 237, 0.25)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <motion.button
                id="ai-chat-send"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: input.trim()
                    ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                    : 'rgba(255,255,255,0.06)',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                  color: input.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.2s',
                  boxShadow: input.trim() ? '0 4px 14px rgba(37,99,235,0.4)' : 'none',
                }}
              >
                <SendIcon size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes chatPulse {
          0% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.5), 0 0 0 0 rgba(124, 58, 237, 0.4); }
          70% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.5), 0 0 0 16px rgba(124, 58, 237, 0); }
          100% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.5), 0 0 0 0 rgba(124, 58, 237, 0); }
        }
      `}</style>
    </>
  )
}

