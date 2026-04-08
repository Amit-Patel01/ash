import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../config/api'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "👋 Hi! I'm the **SolutionHub AI Assistant** — powered by **Gemini 2.5 Flash**.\n\nI can help you with:\n• 🛒 Finding the right source code project\n• 📈 Trading mentorship details & pricing\n• 🔧 Technical support guidance\n• 📋 Account & order questions\n\nHow can I help you today?"
}

const QUICK_PROMPTS = [
  'What projects do you have?',
  'Trading mentorship pricing?',
  'How to get my source code?',
]

const DEFAULT_STATUS = {
  checked: false,
  available: true,
  message: '',
}

function MarkdownText({ text }) {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
    .replace(/•/g, '•')

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('')
  const [assistantStatus, setAssistantStatus] = useState(DEFAULT_STATUS)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Animate loading dots
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'))
    }, 400)
    return () => clearInterval(interval)
  }, [loading])

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

    if (assistantStatus.checked && !assistantStatus.available) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantStatus.message || 'AI assistant is unavailable right now. Please try again later.',
      }])
      return
    }

    const userMessage = { role: 'user', content: messageText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
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

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, I could not process that. Please try again.'
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
      {/* Floating Button */}
      <motion.button
        id="ai-chatbot-toggle"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4), 0 0 0 0 rgba(124, 58, 237, 0.4)',
          zIndex: 9999,
          color: 'white',
          fontSize: '24px',
          animation: open ? 'none' : 'chatPulse 2s infinite',
        }}
        aria-label="Open AI Chat"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? '✕' : '✦'}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '24px',
              width: '380px',
              maxWidth: 'calc(100vw - 48px)',
              height: '540px',
              maxHeight: 'calc(100vh - 140px)',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9998,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
                boxShadow: '0 0 12px rgba(255,255,255,0.2)',
              }}>✦</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  SolutionHub AI
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: assistantStatus.checked && !assistantStatus.available ? '#f97316' : '#4ade80',
                    display: 'inline-block',
                    boxShadow: assistantStatus.checked && !assistantStatus.available ? '0 0 6px #f97316' : '0 0 6px #4ade80'
                  }} />
                  Powered by Gemini 2.5 Flash
                </div>
                {assistantStatus.checked && assistantStatus.message && (
                  <div style={{
                    marginTop: '4px',
                    color: assistantStatus.available ? 'rgba(255,255,255,0.72)' : '#fed7aa',
                    fontSize: '10px',
                    lineHeight: 1.4,
                  }}>
                    {assistantStatus.message}
                  </div>
                )}
              </div>
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer', borderRadius: '8px', padding: '6px 8px', fontSize: '12px',
                }}
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent',
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
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                      : 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.92)',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                  }}>
                    <MarkdownText text={msg.content} />
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <div style={{
                    padding: '10px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    Thinking{dots}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div style={{
                padding: '0 16px 8px',
                display: 'flex', flexWrap: 'wrap', gap: '6px',
              }}>
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid rgba(124, 58, 237, 0.35)',
                      color: 'rgba(255,255,255,0.8)',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onMouseOver={e => { e.target.style.background = 'rgba(124, 58, 237, 0.3)' }}
                    onMouseOut={e => { e.target.style.background = 'rgba(124, 58, 237, 0.15)' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '8px',
              background: 'rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                id="ai-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={assistantStatus.checked && !assistantStatus.available ? 'AI assistant is offline right now' : 'Ask anything...'}
                rows={1}
                disabled={loading || (assistantStatus.checked && !assistantStatus.available)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '13.5px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: 1.5,
                  maxHeight: '80px',
                  overflowY: 'auto',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124, 58, 237, 0.6)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
              <motion.button
                id="ai-chat-send"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim() || (assistantStatus.checked && !assistantStatus.available)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: input.trim() ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.07)',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                  color: 'white', fontSize: '18px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.2s',
                  boxShadow: input.trim() ? '0 4px 12px rgba(37,99,235,0.4)' : 'none',
                }}
              >
                ➤
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes chatPulse {
          0% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4), 0 0 0 0 rgba(124, 58, 237, 0.4); }
          70% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4), 0 0 0 12px rgba(124, 58, 237, 0); }
          100% { box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4), 0 0 0 0 rgba(124, 58, 237, 0); }
        }
      `}</style>
    </>
  )
}
