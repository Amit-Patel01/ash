'use client'
import React, { useState, useEffect } from 'react'
import { 
  Cpu, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Laptop, 
  Monitor, 
  Server, 
  Gamepad2, 
  Users, 
  Mail, 
  Calendar,
  Sparkles
} from 'lucide-react'

export default function AdminAshxWaitlist() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchWaitlist = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ashx-os/waitlist')
      const data = await res.json()
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers)
      }
    } catch (err) {
      console.error('Error fetching waitlist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the waitlist?`)) return
    try {
      setDeletingId(id)
      const res = await fetch(`/api/ashx-os/waitlist?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSubscribers(prev => prev.filter(item => item._id !== id))
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopyEmails = () => {
    const emails = filteredSubscribers.map(s => s.email).join(', ')
    navigator.clipboard.writeText(emails)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleExportCSV = () => {
    if (subscribers.length === 0) return
    const headers = ['Email,Device Type,Source,Registered Date']
    const rows = subscribers.map(s => `"${s.email}","${s.systemType || 'Desktop'}","${s.source || 'website'}","${new Date(s.createdAt).toLocaleString()}"`)
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ashx_os_beta_waitlist_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'ALL' || (s.systemType && s.systemType.toLowerCase() === filterType.toLowerCase())
    return matchesSearch && matchesType
  })

  // Stats calculation
  const totalCount = subscribers.length
  const desktopCount = subscribers.filter(s => (s.systemType || '').toLowerCase().includes('desktop')).length
  const laptopCount = subscribers.filter(s => (s.systemType || '').toLowerCase().includes('laptop')).length
  const serverCount = subscribers.filter(s => (s.systemType || '').toLowerCase().includes('server')).length
  const handheldCount = subscribers.filter(s => (s.systemType || '').toLowerCase().includes('handheld') || (s.systemType || '').toLowerCase().includes('deck')).length

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
              ASHX OS Beta Waitlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-400/30">
              Dec 2026 Launch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage users who registered for early access to the ASHX OS Linux ISO.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchWaitlist}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCopyEmails}
            disabled={filteredSubscribers.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Emails'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total VIPs</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Desktop</span>
            <Monitor className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{desktopCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Laptop</span>
            <Laptop className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{laptopCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Server</span>
            <Server className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{serverCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Handheld</span>
            <Gamepad2 className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{handheldCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
        >
          <option value="ALL">All Hardware Types</option>
          <option value="Desktop">Desktop / Workstation</option>
          <option value="Laptop">Developer Laptop</option>
          <option value="Server">HomeLab / Cloud Server</option>
          <option value="Handheld">Steam Deck / Handheld</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading waitlist subscribers...</span>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No waitlist entries found</p>
            <p className="text-xs text-slate-400 mt-1">Signups from homepage or /ashx-os will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Subscriber Email</th>
                  <th className="p-4">Device / Hardware</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSubscribers.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-slate-400 text-xs">{idx + 1}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      {item.email}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.systemType || 'Desktop'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 capitalize">
                      {item.source || 'Website'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id, item.email)}
                        disabled={deletingId === item._id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove Subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
