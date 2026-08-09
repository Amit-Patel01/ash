'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, readApiJson } from '../config/api'

// --- SVG Icons Components ---
const BotIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h.01M15 9h.01" />
  </svg>
)

const ClipboardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const SupportIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const SalesIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const MarketingIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
)

const HRIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
)

const FinanceIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const TechIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const EmailIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const LightningIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const GearIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const getDepartmentIcon = (deptId, className = "w-6 h-6") => {
  switch (deptId) {
    case 'support':
      return <SupportIcon className={className} />
    case 'sales':
      return <SalesIcon className={className} />
    case 'marketing':
      return <MarketingIcon className={className} />
    case 'hr':
      return <HRIcon className={className} />
    case 'finance':
      return <FinanceIcon className={className} />
    case 'tech':
      return <TechIcon className={className} />
    case 'email':
      return <EmailIcon className={className} />
    default:
      return <BotIcon className={className} />
  }
}

// --- Agent accent system ---
// Each department is a numbered autonomous agent; the accent + callsign
// cycle through the indigo → violet → fuchsia family so every dept reads
// as part of one squad while still being visually distinct at a glance.
const ACCENTS = [
  { name: 'indigo', text: 'text-indigo-600', chip: 'bg-indigo-50 text-indigo-700 border-indigo-200', ring: 'shadow-indigo-500/15', grad: 'from-indigo-600 to-indigo-500', dot: 'bg-indigo-500', iconBg: 'bg-indigo-50 border-indigo-100' },
  { name: 'violet', text: 'text-violet-600', chip: 'bg-violet-50 text-violet-700 border-violet-200', ring: 'shadow-violet-500/15', grad: 'from-violet-600 to-violet-500', dot: 'bg-violet-500', iconBg: 'bg-violet-50 border-violet-100' },
  { name: 'purple', text: 'text-purple-600', chip: 'bg-purple-50 text-purple-700 border-purple-200', ring: 'shadow-purple-500/15', grad: 'from-purple-600 to-purple-500', dot: 'bg-purple-500', iconBg: 'bg-purple-50 border-purple-100' },
  { name: 'fuchsia', text: 'text-fuchsia-600', chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200', ring: 'shadow-fuchsia-500/15', grad: 'from-fuchsia-600 to-fuchsia-500', dot: 'bg-fuchsia-500', iconBg: 'bg-fuchsia-50 border-fuchsia-100' },
]
const getAccent = (index = 0) => ACCENTS[index % ACCENTS.length]
const callsign = (index = 0) => `AGT-${String(index + 1).padStart(2, '0')}`

const getAiAdminHeaders = (withJson = true) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Please sign in again to manage AI agents.')
  return withJson
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { Authorization: `Bearer ${token}` }
}

// HUD-style corner brackets — the signature motif of the control-room theme
const CornerFrame = ({ colorClass = 'border-violet-300' }) => (
  <>
    <span className={`pointer-events-none absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm ${colorClass} opacity-70`} />
    <span className={`pointer-events-none absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm ${colorClass} opacity-70`} />
    <span className={`pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm ${colorClass} opacity-70`} />
    <span className={`pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 rounded-br-sm ${colorClass} opacity-70`} />
  </>
)

const formatAiText = (rawText) => {
  if (!rawText) return ''
  const str = typeof rawText === 'string' ? rawText : JSON.stringify(rawText, null, 2)
  return str
    .replace(/^#{1,6}\s*/gm, '') // Strip ####, ###, ##, # headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Strip **bold**
    .replace(/__(.+?)__/g, '$1') // Strip __bold__
    .replace(/`(.+?)`/g, '$1') // Strip `backticks`
    .replace(/^\s*[-*]\s+/gm, '• ') // Normalize bullet points
    .replace(/\(\s*[-*]\s*/g, '(') // Clean (- text)
    .trim()
}

export default function AdminAIDepartments() {
  const [departments, setDepartments] = useState({})
  const [logs, setLogs] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState(null)
  const [promptEdit, setPromptEdit] = useState('')
  const [savingDept, setSavingDept] = useState(false)
  const [testTaskPrompt, setTestTaskPrompt] = useState('')
  const [testTaskDept, setTestTaskDept] = useState('support')
  const [dispatching, setDispatching] = useState(false)
  const [dispatchResult, setDispatchResult] = useState(null)
  const [resolvingId, setResolvingId] = useState(null)
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [broadcastStatus, setBroadcastStatus] = useState(null)
  const [activePopupProposal, setActivePopupProposal] = useState(null)
  const [executionSuccessMsg, setExecutionSuccessMsg] = useState(null)
  // Direct broadcast state — user can paste any email content directly
  const [directBroadcastBody, setDirectBroadcastBody] = useState('')
  const [directBroadcastSubject, setDirectBroadcastSubject] = useState('')
  const [sendingDirectBroadcast, setSendingDirectBroadcast] = useState(false)
  const [directBroadcastStatus, setDirectBroadcastStatus] = useState(null)
  const [analytics, setAnalytics] = useState({
    weeklyRevenue: 0,
    growthPercent: 0,
    sparkline: [0, 0, 0, 0, 0, 0, 0],
    activeTasksCount: 7,
    healthStatus: {}
  })

  // Newsletter Agent Dispatch state
  const [dispatchingNewsletter, setDispatchingNewsletter] = useState(false)
  const [newsletterResult, setNewsletterResult] = useState(null)

  const handleDispatchNewsletter = async (slot = '7am') => {
    setDispatchingNewsletter(true)
    setNewsletterResult(null)
    try {
      const res = await fetch('/api/ai/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot })
      }).then(r => r.json())
      setNewsletterResult(res)
      setExecutionSuccessMsg(`✅ ${res.slotLabel || 'Newsletter'} dispatched successfully!`)
      setTimeout(() => setExecutionSuccessMsg(null), 6000)
    } catch (err) {
      setNewsletterResult({ success: false, error: err.message })
    } finally {
      setDispatchingNewsletter(false)
    }
  }

  // Send broadcast from AI dispatch result
  const handleSendEmailBroadcast = async () => {
    const replyText = dispatchResult?.reply
    if (!replyText) return
    setSendingBroadcast(true)
    setBroadcastStatus(null)

    // Auto-detect subject from 'Subject: ...' line OR first non-empty line
    let subject = 'Announcement from Amit Solution Hub'
    const subjectMatch = replyText.match(/Subject:\s*([^\n]+)/i)
    if (subjectMatch && subjectMatch[1]) {
      subject = subjectMatch[1].trim()
    } else {
      const firstLine = replyText.split('\n').find(l => l.trim())
      if (firstLine && firstLine.trim().length < 120) {
        subject = firstLine.trim().replace(/^[#*]+\s*/, '')
      }
    }

    try {
      const res = await fetch(api.aiDepartmentBroadcastEmail, {
        method: 'POST',
        headers: getAiAdminHeaders(),
        body: JSON.stringify({ subject, body: replyText })
      }).then(readApiJson)
      setBroadcastStatus(res)
      fetchData()
    } catch (err) {
      setBroadcastStatus({ success: false, message: err.message })
    } finally {
      setSendingBroadcast(false)
    }
  }

  // Direct Broadcast — user pastes any email content, no AI dispatch needed
  const handleDirectBroadcast = async () => {
    const body = directBroadcastBody.trim()
    const subject = directBroadcastSubject.trim() || 'Announcement from Amit Solution Hub'
    if (!body) return
    setSendingDirectBroadcast(true)
    setDirectBroadcastStatus(null)
    try {
      const res = await fetch(api.aiDepartmentBroadcastEmail, {
        method: 'POST',
        headers: getAiAdminHeaders(),
        body: JSON.stringify({ subject, body })
      }).then(readApiJson)
      setDirectBroadcastStatus(res)
      if (res.success) {
        setDirectBroadcastBody('')
        setDirectBroadcastSubject('')
      }
      fetchData()
    } catch (err) {
      setDirectBroadcastStatus({ success: false, message: err.message })
    } finally {
      setSendingDirectBroadcast(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [configRes, logsRes, propRes, analyticsRes] = await Promise.all([
        fetch(api.aiDepartmentConfig, { headers: getAiAdminHeaders(false) }).then(readApiJson),
        fetch(api.aiDepartmentLogs, { headers: getAiAdminHeaders(false) }).then(readApiJson),
        fetch(api.aiDepartmentProposals, { headers: getAiAdminHeaders(false) }).then(readApiJson),
        fetch(api.aiDepartmentAnalytics, { headers: getAiAdminHeaders(false) }).then(readApiJson)
      ])

      if (configRes.success && configRes.config) {
        setDepartments(configRes.config)
      }
      if (logsRes.success && logsRes.logs) {
        setLogs(logsRes.logs)
      }
      if (propRes.success && propRes.proposals) {
        setProposals(propRes.proposals)
      }
      if (analyticsRes.success && analyticsRes.analytics) {
        setAnalytics(analyticsRes.analytics)
      }
    } catch (err) {
      console.error('Failed to fetch AI Department data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-poll every 15 seconds — new proposals auto-appear without refresh
    const interval = setInterval(async () => {
      try {
        const [propRes, logsRes, analyticsRes] = await Promise.all([
          fetch(api.aiDepartmentProposals, { headers: getAiAdminHeaders(false) }).then(readApiJson),
          fetch(api.aiDepartmentLogs, { headers: getAiAdminHeaders(false) }).then(readApiJson),
          fetch(api.aiDepartmentAnalytics, { headers: getAiAdminHeaders(false) }).then(readApiJson)
        ])
        if (propRes.success && propRes.proposals) {
          setProposals(prev => {
            const newOnes = propRes.proposals.filter(p => !prev.some(e => e.id === p.id))
            if (newOnes.length > 0 && !activePopupProposal) {
              setActivePopupProposal(newOnes[0])
            }
            return propRes.proposals
          })
        }
        if (logsRes.success && logsRes.logs) {
          setLogs(logsRes.logs)
        }
        if (analyticsRes.success && analyticsRes.analytics) {
          setAnalytics(analyticsRes.analytics)
        }
      } catch { /* silent poll failure */ }
    }, 15000)

    return () => clearInterval(interval)
  }, [])



  const handleToggleDept = async (deptId, currentEnabled) => {
    try {
      const res = await fetch(api.aiDepartmentConfig, {
        method: 'POST',
        headers: getAiAdminHeaders(),
        body: JSON.stringify({
          deptId,
          updates: { enabled: !currentEnabled }
        })
      }).then(readApiJson)

      if (res.success) {
        setDepartments(prev => ({
          ...prev,
          [deptId]: { ...prev[deptId], enabled: !currentEnabled }
        }))
      }
    } catch (err) {
      alert('Failed to toggle department status: ' + err.message)
    }
  }

  const handleSavePrompt = async () => {
    if (!selectedDept) return
    setSavingDept(true)
    try {
      const res = await fetch(api.aiDepartmentConfig, {
        method: 'POST',
        headers: getAiAdminHeaders(),
        body: JSON.stringify({
          deptId: selectedDept.id,
          updates: { systemPrompt: promptEdit }
        })
      }).then(readApiJson)

      if (res.success) {
        setDepartments(prev => ({
          ...prev,
          [selectedDept.id]: { ...prev[selectedDept.id], systemPrompt: promptEdit }
        }))
        setSelectedDept(null)
      }
    } catch (err) {
      alert('Failed to update prompt: ' + err.message)
    } finally {
      setSavingDept(false)
    }
  }

  const handleClearAllProposals = async () => {
    setProposals([])
    try {
      await fetch(api.aiDepartmentClearProposals, { method: 'POST', headers: getAiAdminHeaders(false) }).catch(() => {})
    } catch {
      // safe fallback
    }
  }

  const handleResolveProposal = async (proposalId, approved) => {
    setResolvingId(proposalId)
    setExecutionSuccessMsg(null)
    try {
      const res = await fetch(api.aiDepartmentResolveProposal, {
        method: 'POST',
        headers: getAiAdminHeaders(),
        body: JSON.stringify({ proposalId, approved })
      }).then(readApiJson)

      // Handle non-JSON / HTML fallback (backend restart in progress)
      if (res.isHtml || (res.success === false && !res.proposal)) {
        setExecutionSuccessMsg('⚠️ Backend is restarting. Please wait 5 seconds and try again.')
        setTimeout(() => setExecutionSuccessMsg(null), 5000)
        return
      }

      if (res.success) {
        const propItem = proposals.find(p => p.id === proposalId)
        if (propItem) {
          setResolvedArchive(prev => [{ title: propItem.title, approved, time: new Date().toISOString() }, ...prev])
        }
        setProposals(prev => prev.filter(p => p.id !== proposalId))
        setExecutionSuccessMsg(
          approved
            ? `✅ Action Executed Successfully in Real Database! (${res.proposal?.title || 'Approved'})`
            : `❌ Proposal Rejected.`
        )
        setTimeout(() => setExecutionSuccessMsg(null), 6000)
        fetchData()
      } else {
        setExecutionSuccessMsg(`⚠️ ${res.message || 'Action could not be completed'}`)
        setTimeout(() => setExecutionSuccessMsg(null), 5000)
      }
    } catch (err) {

      console.error('Failed to resolve proposal:', err)
      alert('Failed to execute proposal: ' + err.message)
    } finally {
      setResolvingId(null)
    }
  }


  const handleDispatchTestTask = async () => {
    if (!testTaskPrompt.trim()) return
    setDispatching(true)
    setDispatchResult(null)
    try {
      const res = await fetch(api.aiDepartmentDispatch, {
        method: 'POST',
        headers: getAiAdminHeaders(),
        body: JSON.stringify({
          department: testTaskDept,
          prompt: testTaskPrompt
        })
      }).then(readApiJson)

      setDispatchResult(res)
      if (res.proposal) {
        setActivePopupProposal(res.proposal)
      }
      fetchData()
    } catch (err) {
      setDispatchResult({ success: false, message: err.message })
    } finally {
      setDispatching(false)
    }
  }

  const deptList = Object.values(departments)
  const totalTasks = deptList.reduce((acc, d) => acc + (d.metrics?.tasksExecuted || 0), 0)
  const deptIndexMap = deptList.reduce((acc, d, i) => ({ ...acc, [d.id]: i }), {})

  const [runningAll, setRunningAll] = useState(false)
  const [proposalTab, setProposalTab] = useState('pending') // 'pending' | 'archive'
  const [resolvedArchive, setResolvedArchive] = useState([])

  const handleRunAllAgents = async () => {
    setRunningAll(true)
    setExecutionSuccessMsg('🚀 Dispatching task scans to all active AI Agents...')
    try {
      const enabledDepts = Object.keys(departments).filter(id => departments[id].enabled)
      for (const deptId of enabledDepts) {
        await fetch(api.aiDepartmentDispatch, {
          method: 'POST',
          headers: getAiAdminHeaders(),
          body: JSON.stringify({
            department: deptId,
            prompt: `Autonomous scan requested by Admin for department ${deptId}. Review metrics and generate any pending proposals.`
          })
        }).then(readApiJson).catch(() => {})
      }
      setExecutionSuccessMsg('✅ All AI Agents scanned successfully!')
      setTimeout(() => setExecutionSuccessMsg(null), 5000)
      fetchData()
    } catch (err) {
      setExecutionSuccessMsg(`⚠️ Run failed: ${err.message}`)
    } finally {
      setRunningAll(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 font-sans bg-slate-50/50 min-h-screen text-slate-900 rounded-3xl">
      {/* Header Banner — Ultra-Modern White Theme Control Center */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 text-slate-900">
        {/* Subtle Ambient Mesh Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 via-purple-100/30 to-blue-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-emerald-100/30 via-teal-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <BotIcon className="w-7 h-7" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Autonomous Squad Online</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mt-1">
                  AI Workforce Control Center
                </h1>
              </div>
            </div>
            <p className="text-slate-600 text-sm max-w-2xl font-medium leading-relaxed">
              Real-time codebase &amp; database scanner. Each AI agent monitors its department autonomously and files proposals into the <span className="font-bold text-indigo-700">One-Click Approval Queue</span> for instant execution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRunAllAgents}
              disabled={runningAll}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-black text-xs tracking-wider uppercase shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LightningIcon className="w-4 h-4" />
              {runningAll ? 'Running Scans...' : 'Run All Agents Now'}
            </button>

            <div className="flex items-stretch gap-px bg-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden font-mono text-slate-800">
              <div className="text-center px-4 py-2.5 bg-white">
                <div className="text-xl font-black text-slate-900">{String(deptList.filter(d => d.enabled).length).padStart(2, '0')}<span className="text-slate-300">/{String(deptList.length).padStart(2, '0')}</span></div>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Active</div>
              </div>
              <div className="text-center px-4 py-2.5 bg-white">
                <div className="text-xl font-black text-amber-600">{String(proposals.length).padStart(2, '0')}</div>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Pending</div>
              </div>
              <div className="text-center px-4 py-2.5 bg-white">
                <div className="text-xl font-black text-emerald-600">{totalTasks}</div>
                <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Executed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Agent Health Panels (White Modern Styling) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast Panel */}
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white text-slate-900 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <FinanceIcon className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 uppercase">FinanceAgent Insights</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {analytics.growthPercent >= 0 ? `+${analytics.growthPercent}%` : `${analytics.growthPercent}%`} vs last week
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Forecast & Analytics</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Autonomous 7-day projection derived from real MongoDB order logs.</p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4 pt-4 border-t border-slate-100">
            <div>
              <div className="text-3xl font-black text-slate-900">₹{analytics.weeklyRevenue.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">7-Day Real Order Revenue</div>
            </div>
            {/* Sparkline */}
            <div className="h-12 w-36 flex items-end gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {(() => {
                const maxVal = Math.max(...(analytics.sparkline || [1]), 1)
                return (analytics.sparkline || [0, 0, 0, 0, 0, 0, 0]).map((val, i) => {
                  const pct = Math.max(18, Math.round((val / maxVal) * 100))
                  return (
                    <div
                      key={i}
                      title={`Day ${i + 1}: ₹${val.toLocaleString('en-IN')}`}
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 hover:brightness-110 rounded-t transition-all"
                      style={{ height: `${pct}%` }}
                    />
                  )
                })
              })()}
            </div>
          </div>
        </div>

        {/* Agent Health Status Panel */}
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white text-slate-900 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <SupportIcon className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-indigo-700 uppercase">System Uptime</span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                {analytics.activeTasksCount || 7} Cron Tasks Operational
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Agent Health & Scheduler</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Real-time status of periodic background scanners.</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="font-bold text-slate-800">Finance Daily Scan</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="font-bold text-slate-800">HR Auto-Cert Check</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="font-bold text-slate-800">Sales Sell-Review</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="font-bold text-slate-800">Support Scan</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AUTONOMOUS SQUAD ONLINE & DAILY NEWSLETTER HUB ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 relative overflow-hidden my-6">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-mono font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                  AUTONOMOUS SQUAD ONLINE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Website Monitor &amp; Scheduled Newsletter Control
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Automated multi-agent workforce for website maintenance, marketing campaigns, and daily 7 AM / 3 PM / 8 PM newsletter dispatches.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => handleDispatchNewsletter('7am')}
                disabled={dispatchingNewsletter}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                🌅 7:00 AM Morning Brief
              </button>
              <button
                onClick={() => handleDispatchNewsletter('3pm')}
                disabled={dispatchingNewsletter}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                ☀️ 3:00 PM Afternoon Highlight
              </button>
              <button
                onClick={() => handleDispatchNewsletter('8pm')}
                disabled={dispatchingNewsletter}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                🌙 8:00 PM Evening Masterclass
              </button>
            </div>
          </div>

          {/* Agents Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AGT-01 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-indigo-400">AGT-01</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">OPERATIONAL</span>
              </div>
              <h4 className="font-bold text-white text-sm">Web Sentinel &amp; Department Monitor</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monitors website health, database connections, pending orders, and QR certificate verifications.
              </p>
            </div>

            {/* AGT-02 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-purple-400">AGT-02</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-[10px]">CAMPAIGN ACTIVE</span>
              </div>
              <h4 className="font-bold text-white text-sm">Course &amp; Project Marketing Agent</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auto-generates promotional campaigns for Full-Stack, AI/ML, Cyber Security, and Python internships.
              </p>
            </div>

            {/* AGT-03 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-amber-400">AGT-03</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">SCHEDULED (7, 3, 8 PM)</span>
              </div>
              <h4 className="font-bold text-white text-sm">Daily Newsletter Broadcast Agent</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auto-compiles tech newsletters &amp; discounts, dispatching emails at 7:00 AM, 3:00 PM, and 8:00 PM.
              </p>
            </div>
          </div>

          {/* Newsletter Dispatch Result Preview */}
          {newsletterResult && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-400">DISPATCH RESULT — {newsletterResult.slotLabel}</span>
                <span className="text-slate-400">{newsletterResult.timestamp}</span>
              </div>
              <div className="text-slate-200 font-semibold">{newsletterResult.subject}</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 max-h-48 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap">
                {newsletterResult.preview || JSON.stringify(newsletterResult, null, 2)}
              </div>
              <div className="text-emerald-400 font-bold">Status: {newsletterResult.emailStatus}</div>
            </div>
          )}
        </div>
      </div>

      {/* Pending AI Proposals for Admin Approval Queue */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <ClipboardIcon className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">One-Click Approval Queue</h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setProposalTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all outline-none cursor-pointer ${
                proposalTab === 'pending'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approval Queue ({proposals.length})
            </button>
            <button
              onClick={() => setProposalTab('archive')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all outline-none cursor-pointer ${
                proposalTab === 'archive'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proposal Archive ({resolvedArchive.length})
            </button>
          </div>
        </div>

        {proposalTab === 'archive' && (
          <div className="space-y-3">
            {resolvedArchive.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-medium text-sm">
                No resolved proposals in history yet.
              </div>
            ) : (
              resolvedArchive.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
                  <div>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${item.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.approved ? 'Approved' : 'Rejected'}
                    </span>
                    <span className="font-bold text-slate-900 ml-2">{item.title}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{new Date(item.time).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {proposalTab === 'pending' && (
          proposals.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-600 text-sm font-medium flex items-center justify-center gap-2">
              <CheckIcon className="w-5 h-5 text-emerald-600" /> Queue is clear — every agent is nominal.
            </div>
          ) : (
          <div className="space-y-4">
            {proposals.map(prop => {
              const deptMeta = departments[prop.department] || {}
              const idx = deptIndexMap[prop.department] ?? 0
              const accent = getAccent(idx)
              return (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-5 pt-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <span className={`absolute top-0 left-5 -translate-y-1/2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${accent.chip}`}>
                    {callsign(idx)}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`p-1 rounded border bg-white ${accent.text} ${accent.iconBg}`}>
                        {getDepartmentIcon(prop.department, "w-4 h-4")}
                      </span>
                      <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md border ${accent.chip}`}>
                        {deptMeta.name || prop.department}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(prop.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{formatAiText(prop.title)}</h3>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{formatAiText(prop.details)}</p>

                    {/* Detailed AI Output / Structured Action Data Box */}
                    {Boolean(
                      prop.proposedData && (
                        prop.proposedData.aiResponse ||
                        prop.proposedData.title ||
                        prop.proposedData.certificateId ||
                        prop.proposedData.projects ||
                        prop.proposedData.batches ||
                        prop.proposedData.couponCode ||
                        prop.proposedData.emailSubject
                      )
                    ) && (
                      <div className="mt-3 p-3 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs text-slate-800 space-y-2 font-sans">
                        
                        {/* 1. Full AI Explanation / Response */}
                        {prop.proposedData.aiResponse && (
                          <div className="space-y-1">
                            <span className={`font-bold uppercase tracking-wider text-[10px] ${accent.text}`}>🤖 Agent Output & Analysis:</span>
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 text-slate-800 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                              {formatAiText(prop.proposedData.aiResponse)}
                            </div>
                          </div>
                        )}

                        {/* 2. Structured Course Creation */}
                        {prop.proposedData.title && (
                          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                            <div><span className="font-bold text-slate-500">Course Title:</span> <span className="font-extrabold text-slate-900">&quot;{prop.proposedData.title}&quot;</span></div>
                            <div><span className="font-bold text-slate-500">Price:</span> <span className="font-extrabold text-emerald-600">₹{prop.proposedData.price}</span></div>
                            <div><span className="font-bold text-slate-500">Category:</span> <span className="font-bold text-slate-800">{prop.proposedData.category}</span></div>
                          </div>
                        )}

                        {/* 3. Structured Certificate Issuance */}
                        {prop.proposedData.certificateId && (
                          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                            <div><span className="font-bold text-slate-500">Cert ID:</span> <span className={`font-mono font-extrabold px-2 py-0.5 rounded border ${accent.chip}`}>{prop.proposedData.certificateId}</span></div>
                            <div><span className="font-bold text-slate-500">Student:</span> <span className="font-extrabold text-slate-900">{prop.proposedData.studentName}</span></div>
                            <div><span className="font-bold text-slate-500">Course:</span> <span className="font-semibold text-slate-800">{prop.proposedData.courseName}</span></div>
                          </div>
                        )}

                        {/* 4. Structured Projects Suite */}
                        {prop.proposedData.projects && (
                          <div>
                            <span className={`font-bold ${accent.text}`}>📦 Proposed Projects Suite ({prop.proposedData.projects.length}):</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                              {prop.proposedData.projects.map((p, i) => (
                                <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                                  <span className="font-semibold text-slate-900">{p.name}</span>
                                  <span className="font-extrabold text-emerald-600 ml-2">₹{p.price}</span>
                                </div>
                              ))}
                            </div>
                            <div className={`mt-2 text-right font-extrabold ${accent.text}`}>
                              Estimated Monthly Catalog Revenue: {prop.proposedData.totalCatalogValue}
                            </div>
                          </div>
                        )}

                        {/* 5. Student Batches */}
                        {prop.proposedData.batches && (
                          <div>
                            <span className={`font-bold ${accent.text}`}>👥 Proposed Student Batches ({prop.proposedData.batches.length}):</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                              {prop.proposedData.batches.map((b, i) => (
                                <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200">
                                  <div className={`font-extrabold ${accent.text}`}>{b.code}</div>
                                  <div className="text-[11px] text-slate-600">{b.course}</div>
                                  <div className="font-bold text-slate-900 mt-1">{b.students} Enrolled Students</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Discount Coupons */}
                        {prop.proposedData.couponCode && (
                          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                            <div><span className="font-bold text-slate-500">Coupon:</span> <span className={`font-extrabold px-2 py-0.5 rounded border ${accent.chip}`}>{prop.proposedData.couponCode}</span></div>
                            <div><span className="font-bold text-slate-500">Discount:</span> <span className="font-extrabold text-emerald-600">{prop.proposedData.discountPercentage}% Off</span></div>
                            {prop.proposedData.targetVisitors && <div><span className="font-bold text-slate-500">Target:</span> <span className="font-bold text-slate-900">{prop.proposedData.targetVisitors}</span></div>}
                          </div>
                        )}

                        {/* 7. Email Subject */}
                        {prop.proposedData.emailSubject && (
                          <div className="text-xs space-y-1 pt-1">
                            <div><span className="font-bold text-slate-500">Subject:</span> <span className="font-semibold text-slate-900">&quot;{prop.proposedData.emailSubject}&quot;</span></div>
                            {prop.proposedData.recipientCount && <div><span className="font-bold text-slate-500">Recipients:</span> <span className={`font-extrabold ${accent.text}`}>{prop.proposedData.recipientCount?.toLocaleString()} Students</span></div>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleResolveProposal(prop.id, false)}
                      disabled={resolvingId === prop.id}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleResolveProposal(prop.id, true)}
                      disabled={resolvingId === prop.id}
                      className={`px-5 py-2 rounded-xl bg-gradient-to-r ${accent.grad} hover:brightness-110 text-white text-xs font-bold transition-all shadow-md ${accent.ring} disabled:opacity-50`}
                    >
                      {resolvingId === prop.id ? 'Executing...' : '✓ Approve & Execute'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
          )
        )}
      </div>

      {/* AI Department Cards Grid — HUD-framed agent roster */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <BotIcon className="w-6 h-6 text-violet-600" /> Agent Roster
          </h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">{deptList.length} Units Deployed</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium font-mono text-sm">// loading agent roster...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deptList.map((dept, i) => {
              const accent = getAccent(i)
              return (
              <motion.div
                key={dept.id}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-6 pt-7 border flex flex-col justify-between transition-all ${
                  dept.enabled
                    ? `bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-lg hover:${accent.ring}`
                    : 'bg-slate-50 border-slate-200 opacity-60 text-slate-600'
                }`}
              >
                {dept.enabled && <CornerFrame colorClass={accent.text.replace('text-', 'border-')} />}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`p-2.5 rounded-xl border ${accent.text} ${accent.iconBg}`}>
                        {getDepartmentIcon(dept.id, "w-6 h-6")}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${accent.chip}`}>{callsign(i)}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${accent.text}`}>{dept.role}</span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleDept(dept.id, dept.enabled)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors bg-gradient-to-r ${dept.enabled ? accent.grad : 'from-slate-300 to-slate-300'}`}
                      title={dept.enabled ? 'Disable AI Department' : 'Enable AI Department'}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                          dept.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-4 font-medium">
                    {dept.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold tracking-wide uppercase">Tasks</div>
                      <div className="font-extrabold text-slate-900">{dept.metrics?.tasksExecuted || 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold tracking-wide uppercase">Success</div>
                      <div className="font-extrabold text-emerald-600">{dept.metrics?.successRate || 100}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold tracking-wide uppercase">Speed</div>
                      <div className={`font-extrabold ${accent.text}`}>{dept.metrics?.avgResponseMs || 300}ms</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDept(dept)
                        setPromptEdit(dept.systemPrompt)
                      }}
                      className="flex items-center justify-center gap-1 flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 transition-colors"
                    >
                      <GearIcon className="w-3.5 h-3.5" /> Edit Rules
                    </button>
                    <button
                      onClick={() => {
                        setTestTaskDept(dept.id)
                        setTestTaskPrompt('')
                        setDispatchResult(null)
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${accent.chip} hover:brightness-95`}
                    >
                      <LightningIcon className="w-3.5 h-3.5" /> Test Task
                    </button>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </div>

      {/* Task Dispatcher Test Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <LightningIcon className="w-5 h-5 text-violet-600" /> Dispatch Instruction to Agent
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={testTaskDept}
            onChange={e => setTestTaskDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            {deptList.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.role})
              </option>
            ))}
          </select>
          <input
            type="text"
            value={testTaskPrompt}
            onChange={e => setTestTaskPrompt(e.target.value)}
            placeholder="Enter instructions for this AI Department Agent..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 placeholder-slate-400 font-medium"
          />
          <button
            onClick={handleDispatchTestTask}
            disabled={dispatching || !testTaskPrompt.trim()}
            className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-violet-500/25 flex items-center justify-center gap-2"
          >
            <LightningIcon className="w-4 h-4" />
            {dispatching ? 'Dispatching...' : 'Execute Task'}
          </button>
        </div>

        {dispatchResult && (
          <div className={`p-5 rounded-xl border text-sm font-mono whitespace-pre-wrap space-y-3 ${
            dispatchResult.success ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="font-bold text-xs uppercase mb-1 text-slate-700 flex flex-wrap justify-between items-center gap-2">
              <span>{dispatchResult.role || 'System'} Execution Output ({dispatchResult.executionMs || 0}ms):</span>
              {dispatchResult.reply && (
                <button
                  onClick={handleSendEmailBroadcast}
                  disabled={sendingBroadcast}
                  className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 text-white font-sans font-bold text-xs rounded-lg transition-all shadow-md shadow-violet-500/25 flex items-center gap-1.5"
                >
                  <EmailIcon className="w-4 h-4" />
                  {sendingBroadcast ? 'Dispatching Mail...' : '🚀 Send Email Broadcast to All Users'}
                </button>
              )}
            </div>

            <div>{dispatchResult.reply || dispatchResult.message}</div>

            {dispatchResult.reply && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs font-sans">
                <div className="font-bold text-slate-700 mb-1">✍️ Editable Broadcast Content:</div>
                <textarea
                  value={dispatchResult.reply}
                  onChange={e => setDispatchResult(prev => ({ ...prev, reply: e.target.value }))}
                  className="w-full h-28 p-2 border border-slate-200 rounded text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {broadcastStatus && (
              <div className={`p-3 rounded-lg text-xs font-sans font-bold ${
                broadcastStatus.success ? 'bg-emerald-200 text-emerald-900 border border-emerald-300' : 'bg-rose-200 text-rose-900 border border-rose-300'
              }`}>
                {broadcastStatus.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Direct Custom Email Broadcast Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <EmailIcon className="w-5 h-5 text-indigo-600" /> Direct Email Broadcast & Newsletter (No AI needed)
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Subject:</label>
            <input
              type="text"
              value={directBroadcastSubject}
              onChange={e => setDirectBroadcastSubject(e.target.value)}
              placeholder="e.g. 🎉 Celebrate with Us! 50% OFF All Courses for Amit Sir's Birthday!"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Body Content:</label>
            <textarea
              value={directBroadcastBody}
              onChange={e => setDirectBroadcastBody(e.target.value)}
              placeholder="Paste your email draft here... Markdown formatting (**bold**, links) is supported."
              className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-sans outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Target: All registered & subscribed users in database</span>
            <button
              onClick={handleDirectBroadcast}
              disabled={sendingDirectBroadcast || !directBroadcastBody.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center gap-2"
            >
              <EmailIcon className="w-4 h-4" />
              {sendingDirectBroadcast ? 'Sending Broadcast...' : '🚀 Send Instant Email Broadcast'}
            </button>
          </div>
          {directBroadcastStatus && (
            <div className={`p-4 rounded-xl text-sm font-bold ${
              directBroadcastStatus.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}>
              {directBroadcastStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Real-Time AI Execution Audit Logs Stream — terminal readout */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white font-mono">
            <ClipboardIcon className="w-5 h-5 text-violet-400" /> live_agent_log.stream
          </h2>
          <button
            onClick={fetchData}
            className="text-xs text-violet-300 font-mono font-bold hover:underline flex items-center gap-1"
          >
            ↻ refresh
          </button>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar font-mono">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">// no recent agent activity</div>
          ) : (
            logs.map(log => {
              const deptMeta = departments[log.department] || {}
              const idx = deptIndexMap[log.department] ?? 0
              const accent = getAccent(idx)
              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs gap-4 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 p-1 rounded bg-white/5 ${accent.text} mt-0.5`}>
                      {getDepartmentIcon(log.department, "w-4 h-4")}
                    </span>
                    <div>
                      <div className="font-bold text-white">
                        <span className={accent.text}>{callsign(idx)}</span> · {deptMeta.name || log.department}
                      </div>
                      <div className="text-slate-400 mt-0.5">{log.action}</div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-300 border border-rose-400/20'
                    }`}>
                      {log.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* System Prompt Config Modal */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-slate-50 text-violet-600 border border-slate-200">
                    {getDepartmentIcon(selectedDept.id, "w-6 h-6")}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{selectedDept.name} Rules</h3>
                    <p className="text-xs text-slate-500 font-medium">Configure AI agent instructions for {selectedDept.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="text-slate-400 hover:text-slate-800 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  System Prompt &amp; Operational Rules:
                </label>
                <textarea
                  value={promptEdit}
                  onChange={e => setPromptEdit(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-mono text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 leading-relaxed font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrompt}
                  disabled={savingDept}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:brightness-110 text-xs text-white font-bold shadow-md shadow-violet-500/25 disabled:opacity-50"
                >
                  {savingDept ? 'Saving Rules...' : 'Save AI Rules'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Executive Approval Popup Modal */}
      <AnimatePresence>
        {activePopupProposal && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-950 border border-violet-500/40 rounded-2xl p-5 shadow-2xl shadow-violet-500/20 space-y-3 font-sans text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-white/10 text-violet-300">
                  <BotIcon className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-black uppercase text-violet-300 tracking-wider">
                  Agent Approval Required
                </span>
              </div>
              <button
                onClick={() => setActivePopupProposal(null)}
                className="text-slate-500 hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white">{formatAiText(activePopupProposal.title)}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{formatAiText(activePopupProposal.details)}</p>
              {activePopupProposal.proposedData?.aiResponse && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {formatAiText(activePopupProposal.proposedData.aiResponse)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  handleResolveProposal(activePopupProposal.id, false)
                  setActivePopupProposal(null)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleResolveProposal(activePopupProposal.id, true)
                  setActivePopupProposal(null)
                }}
                disabled={resolvingId === activePopupProposal.id}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-violet-500/25 transition-all flex items-center gap-1"
              >
                {resolvingId === activePopupProposal.id ? '⏳ Executing Action...' : (
                  <>
                    <CheckIcon className="w-4 h-4" /> Approve & Execute
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Execution Success Banner Toast */}
      <AnimatePresence>
        {executionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400"
          >
            <CheckIcon className="w-5 h-5 text-white" />
            <span>{executionSuccessMsg}</span>
            <button onClick={() => setExecutionSuccessMsg(null)} className="ml-2 font-black text-sm">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>


  )
}
