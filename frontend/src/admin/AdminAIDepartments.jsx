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



  const handleSendEmailBroadcast = async () => {
    if (!dispatchResult?.reply) return
    setSendingBroadcast(true)
    setBroadcastStatus(null)

    const replyText = dispatchResult.reply
    let subject = "Announcement from Amit Solution Hub"
    const subjectMatch = replyText.match(/Subject:\s*(.+)/i)
    if (subjectMatch && subjectMatch[1]) {
      subject = subjectMatch[1].trim()
    }

    try {
      const res = await fetch(api.aiDepartmentBroadcastEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body: replyText
        })
      }).then(readApiJson)

      setBroadcastStatus(res)
      fetchData()
    } catch (err) {
      setBroadcastStatus({ success: false, message: err.message })
    } finally {
      setSendingBroadcast(false)
    }
  }


  const fetchData = async () => {
    try {
      setLoading(true)
      const [configRes, logsRes, propRes] = await Promise.all([
        fetch(api.aiDepartmentConfig).then(readApiJson),
        fetch(api.aiDepartmentLogs).then(readApiJson),
        fetch(api.aiDepartmentProposals).then(readApiJson)
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
        const [propRes, logsRes] = await Promise.all([
          fetch(api.aiDepartmentProposals).then(readApiJson),
          fetch(api.aiDepartmentLogs).then(readApiJson)
        ])
        if (propRes.success && propRes.proposals) {
          setProposals(prev => {
            const newOnes = propRes.proposals.filter(p => !prev.some(e => e.id === p.id))
            // If a new proposal arrived, show it in popup
            if (newOnes.length > 0 && !activePopupProposal) {
              setActivePopupProposal(newOnes[0])
            }
            return propRes.proposals
          })
        }
        if (logsRes.success && logsRes.logs) {
          setLogs(logsRes.logs)
        }
      } catch { /* silent poll failure */ }
    }, 15000)

    return () => clearInterval(interval)
  }, [])



  const handleToggleDept = async (deptId, currentEnabled) => {
    try {
      const res = await fetch(api.aiDepartmentConfig, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(api.aiDepartmentClearProposals, { method: 'POST' }).catch(() => {})
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, approved })
      }).then(readApiJson)

      // Handle non-JSON / HTML fallback (backend restart in progress)
      if (res.isHtml || (res.success === false && !res.proposal)) {
        setExecutionSuccessMsg('⚠️ Backend is restarting. Please wait 5 seconds and try again.')
        setTimeout(() => setExecutionSuccessMsg(null), 5000)
        return
      }

      if (res.success) {
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans bg-slate-50 min-h-screen text-slate-900">
      {/* Header Banner - White & Blue Theme */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white">
                <BotIcon className="w-8 h-8" />
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Autonomous AI Workforce Control Center
              </h1>
            </div>
            <p className="mt-2 text-blue-100 text-sm max-w-2xl font-medium">
              Real-Time Codebase & Database Scanner. AI Agents analyze repository state & user activities to generate actionable proposals for your <span className="font-bold underline">One-Click Approval Queue</span>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white">
            <div className="text-center px-4 border-r border-white/20">
              <div className="text-2xl font-black text-white">{deptList.filter(d => d.enabled).length} / {deptList.length}</div>
              <div className="text-xs text-blue-100 font-semibold">Active Depts</div>
            </div>
            <div className="text-center px-4 border-r border-white/20">
              <div className="text-2xl font-black text-amber-300">{proposals.length}</div>
              <div className="text-xs text-blue-100 font-semibold">Pending Approvals</div>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-black text-emerald-300">{totalTasks}</div>
              <div className="text-xs text-blue-100 font-semibold">Tasks Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending AI Proposals for Admin Approval Queue */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 font-bold">
              <ClipboardIcon className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Real-Time AI Proposals (Requires Your Approval)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                AI Agents scan real codebase & database metrics automatically. Click Approve to execute.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {proposals.length > 0 && (
              <button
                onClick={handleClearAllProposals}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" /> Clear List
              </button>
            )}
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
              {proposals.length} Pending Actions
            </span>
          </div>
        </div>

        {proposals.length === 0 ? (
          <div className="text-center py-8 bg-blue-50/50 rounded-xl border border-dashed border-blue-200 text-slate-600 text-sm font-medium flex items-center justify-center gap-2">
            <CheckIcon className="w-5 h-5 text-emerald-600" /> All AI Proposals are up to date! Real-time scanner is running in background.
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map(prop => {
              const deptMeta = departments[prop.department] || {}
              return (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl bg-blue-50/40 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-blue-100 text-blue-700">
                        {getDepartmentIcon(prop.department, "w-4 h-4")}
                      </span>
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {deptMeta.name || prop.department}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(prop.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{prop.title}</h3>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{prop.details}</p>

                    {prop.proposedData && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 text-xs text-slate-800 space-y-2">
                        {prop.proposedData.projects && (
                          <div>
                            <span className="font-bold text-blue-700">📦 Proposed Projects Suite ({prop.proposedData.projects.length}):</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                              {prop.proposedData.projects.map((p, i) => (
                                <div key={i} className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 font-sans flex justify-between items-center">
                                  <span className="font-semibold text-slate-900">{p.name}</span>
                                  <span className="font-extrabold text-emerald-600 ml-2">₹{p.price}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-right font-extrabold text-blue-700">
                              Estimated Monthly Catalog Revenue: {prop.proposedData.totalCatalogValue}
                            </div>
                          </div>
                        )}

                        {prop.proposedData.batches && (
                          <div>
                            <span className="font-bold text-blue-700">👥 Proposed Student Batches ({prop.proposedData.batches.length}):</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                              {prop.proposedData.batches.map((b, i) => (
                                <div key={i} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 font-sans">
                                  <div className="font-extrabold text-blue-700">{b.code}</div>
                                  <div className="text-[11px] text-slate-600">{b.course}</div>
                                  <div className="font-bold text-slate-900 mt-1">{b.students} Enrolled Students</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prop.proposedData.couponCode && (
                          <div className="flex flex-wrap items-center gap-4 font-sans text-xs">
                            <div><span className="font-bold text-slate-500">Coupon:</span> <span className="font-extrabold text-blue-700 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">{prop.proposedData.couponCode}</span></div>
                            <div><span className="font-bold text-slate-500">Discount:</span> <span className="font-extrabold text-emerald-600">{prop.proposedData.discountPercentage}% Off</span></div>
                            <div><span className="font-bold text-slate-500">Target Visitors:</span> <span className="font-bold text-slate-900">{prop.proposedData.targetVisitors}</span></div>
                            <div><span className="font-bold text-slate-500">Projected Gain:</span> <span className="font-extrabold text-emerald-600">{prop.proposedData.projectedRevenueGain}</span></div>
                          </div>
                        )}

                        {prop.proposedData.emailSubject && (
                          <div className="font-sans text-xs space-y-1">
                            <div><span className="font-bold text-slate-500">Subject:</span> <span className="font-semibold text-slate-900">&quot;{prop.proposedData.emailSubject}&quot;</span></div>
                            <div><span className="font-bold text-slate-500">Target Recipients:</span> <span className="font-extrabold text-blue-700">{prop.proposedData.recipientCount?.toLocaleString()} Students</span></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleResolveProposal(prop.id, false)}
                      disabled={resolvingId === prop.id}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleResolveProposal(prop.id, true)}
                      disabled={resolvingId === prop.id}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                    >
                      {resolvingId === prop.id ? 'Executing...' : '✓ Approve & Execute'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* 7 AI Department Cards Grid - White & Blue Theme */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <BotIcon className="w-6 h-6 text-blue-600" /> Multi-Department Autonomous AI Workforce
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading AI Departments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deptList.map(dept => (
              <motion.div
                key={dept.id}
                whileHover={{ y: -4 }}
                className={`rounded-2xl p-6 border flex flex-col justify-between transition-all shadow-sm ${
                  dept.enabled
                    ? 'bg-white border-blue-200 text-slate-900'
                    : 'bg-slate-100 border-slate-300 opacity-60 text-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        {getDepartmentIcon(dept.id, "w-6 h-6")}
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                        <span className="text-xs text-blue-600 font-mono font-bold">{dept.role}</span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleDept(dept.id, dept.enabled)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        dept.enabled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
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
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Tasks</div>
                      <div className="font-extrabold text-slate-900">{dept.metrics?.tasksExecuted || 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Success</div>
                      <div className="font-extrabold text-emerald-600">{dept.metrics?.successRate || 100}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] font-semibold">Speed</div>
                      <div className="font-extrabold text-blue-600">{dept.metrics?.avgResponseMs || 300}ms</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDept(dept)
                        setPromptEdit(dept.systemPrompt)
                      }}
                      className="flex items-center justify-center gap-1 flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 transition-colors"
                    >
                      <GearIcon className="w-3.5 h-3.5" /> Edit Rules
                    </button>
                    <button
                      onClick={() => {
                        setTestTaskDept(dept.id)
                        setTestTaskPrompt('')
                        setDispatchResult(null)
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 border border-blue-200 transition-colors"
                    >
                      <LightningIcon className="w-3.5 h-3.5" /> Test Task
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Task Dispatcher Test Panel */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <LightningIcon className="w-5 h-5 text-blue-600" /> Dispatch Instruction to AI Department
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={testTaskDept}
            onChange={e => setTestTaskDept(e.target.value)}
            className="bg-slate-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none focus:border-blue-600"
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
            className="flex-1 bg-slate-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 placeholder-slate-400 font-medium"
          />
          <button
            onClick={handleDispatchTestTask}
            disabled={dispatching || !testTaskPrompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
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
              {testTaskDept === 'email' && dispatchResult.reply && (
                <button
                  onClick={handleSendEmailBroadcast}
                  disabled={sendingBroadcast}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-sans font-bold text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <EmailIcon className="w-4 h-4" />
                  {sendingBroadcast ? 'Dispatching Mail...' : '🚀 Send Email Broadcast to All Users'}
                </button>
              )}
            </div>

            <div>{dispatchResult.reply || dispatchResult.message}</div>

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

      {/* Real-Time AI Execution Audit Logs Stream */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <ClipboardIcon className="w-5 h-5 text-blue-600" /> Live AI Agent Audit Logs Stream
          </h2>
          <button
            onClick={fetchData}
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            🔄 Refresh Stream
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm font-medium">No recent AI department logs</div>
          ) : (
            logs.map(log => {
              const deptMeta = departments[log.department] || {}
              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="p-1 rounded bg-blue-100 text-blue-700 mt-0.5">
                      {getDepartmentIcon(log.department, "w-4 h-4")}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">
                        {deptMeta.name || log.department} ({deptMeta.role || 'Agent'})
                      </div>
                      <div className="text-slate-700 font-medium mt-0.5">{log.action}</div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {log.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* System Prompt Config Modal - White & Blue Theme */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-blue-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    {getDepartmentIcon(selectedDept.id, "w-6 h-6")}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{selectedDept.name} Rules</h3>
                    <p className="text-xs text-slate-500 font-medium">Configure AI Agent instructions for {selectedDept.role}</p>
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
                  System Prompt & Operational Rules:
                </label>
                <textarea
                  value={promptEdit}
                  onChange={e => setPromptEdit(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-mono text-slate-900 outline-none focus:border-blue-600 leading-relaxed font-medium"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-md shadow-blue-500/20"
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
            className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white border-2 border-blue-600 rounded-2xl p-5 shadow-2xl space-y-3 font-sans text-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <BotIcon className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                  AI Agent Approval Required
                </span>
              </div>
              <button
                onClick={() => setActivePopupProposal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900">{activePopupProposal.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activePopupProposal.details}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleResolveProposal(activePopupProposal.id, false)
                  setActivePopupProposal(null)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleResolveProposal(activePopupProposal.id, true)
                  setActivePopupProposal(null)
                }}
                disabled={resolvingId === activePopupProposal.id}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1"
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
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400"
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
