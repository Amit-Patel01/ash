import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

export default function AdminSellRequests() {
  const { approveSellRequest, rejectSellRequest } = useAuth()
  const { sellRequests: requests } = useStore()
  const [filter, setFilter] = useState('pending')
  const [expanded, setExpanded] = useState(null)

  // Real-time data from StoreContext

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)

  const handleApprove = async (request) => {
    if (!window.confirm(`Approve "${request.projectTitle}" for sale?`)) return
    try {
      await approveSellRequest(request.id)
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  const handleReject = async (request) => {
    if (!window.confirm(`Reject "${request.projectTitle}"?`)) return
    try {
      await rejectSellRequest(request.id)
    } catch (err) {
      console.error('Failed to reject:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sell Requests</h1>
        <p className="text-sm text-gray-400 mt-1">{requests.filter(r => r.status === 'pending').length} pending project listings</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-400' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'text-emerald-400' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900/50 border border-white/5 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-white/5">
            <p className="text-gray-500 text-sm">No {filter !== 'all' ? filter : ''} sell requests</p>
          </div>
        )}
        {filteredRequests.map(request => (
          <div key={request.id} className={`bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-5 hover:border-white/10 transition-all ${request.status === 'pending' ? 'border-amber-500/20' : request.status === 'approved' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-white">{request.projectTitle}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${request.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{request.status}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${request.category === 'Basic' ? 'bg-green-500/10 text-green-400' : request.category === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>{request.category}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{request.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-gray-400">By: <span className="text-white">{request.userName}</span></span>
                  <span className="text-gray-400">Email: <span className="text-white">{request.userEmail}</span></span>
                  <span className="text-gray-400">Price: <span className="text-emerald-400 font-medium">₹{Number(request.price || 0).toLocaleString('en-IN')}</span></span>
                  <span className="text-gray-400">Source: <span className="text-white">{request.includeSource ? 'Included' : 'No'}</span></span>
                </div>
                {request.features && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {request.features.split(',').map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">{f.trim()}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => setExpanded(expanded === request.id ? null : request.id)} className="text-xs text-blue-400 hover:text-blue-300 mt-2">
                  {expanded === request.id ? 'Hide details' : 'Show details'}
                </button>
                {expanded === request.id && (
                  <div className="mt-3 p-3 bg-white/5 rounded-xl space-y-2">
                    <div><span className="text-xs text-gray-500">Tech Stack:</span><p className="text-sm text-gray-300">{request.techStack || 'N/A'}</p></div>
                    <div><span className="text-xs text-gray-500">Description:</span><p className="text-sm text-gray-300">{request.longDescription || 'N/A'}</p></div>
                    <div><span className="text-xs text-gray-500">Demo URL:</span><p className="text-sm text-gray-300">{request.demoUrl || 'N/A'}</p></div>
                  </div>
                )}
              </div>
              {request.status === 'pending' && (
                <div className="flex sm:flex-col items-center gap-2">
                  <button onClick={() => handleApprove(request)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Approve
                  </button>
                  <button onClick={() => handleReject(request)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
