import { useState } from 'react'
import { useStore } from '../store/StoreContext'

export default function AdminSellRequests() {
  const { sellRequests: requests, approveSellRequest, rejectSellRequest, deleteSellRequest } = useStore()
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sell request permanently?")) return
    try {
      await deleteSellRequest(id)
    } catch (err) {
      console.error('Failed to delete:', err)
      alert("Failed to delete request")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sell Requests</h1>
        <p className="text-sm text-slate-500 mt-1">{requests.filter(r => r.status === 'pending').length} pending project listings</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-400' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'text-emerald-400' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}>
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white/30 rounded-2xl border border-slate-200">
            <p className="text-slate-400 text-sm">No {filter !== 'all' ? filter : ''} sell requests</p>
          </div>
        )}
        {filteredRequests.map(request => (
          <div key={request.id} className={`bg-white backdrop-blur-sm border rounded-2xl p-5 hover:border-slate-300 transition-all ${request.status === 'pending' ? 'border-amber-500/20' : request.status === 'approved' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-slate-900">{request.projectTitle}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${request.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{request.status}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${request.category === 'Basic' ? 'bg-green-500/10 text-green-400' : request.category === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>{request.category}</span>
                </div>
                <p className="text-sm text-slate-500 mb-3">{request.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-500">By: <span className="text-slate-900">{request.userName}</span></span>
                  <span className="text-slate-500">Email: <span className="text-slate-900">{request.userEmail}</span></span>
                  <span className="text-slate-500">Price: <span className="text-emerald-400 font-medium">₹{Number(request.price || 0).toLocaleString('en-IN')}</span></span>
                  <span className="text-slate-500">Source: <span className="text-slate-900">{request.includeSource ? 'Included' : 'No'}</span></span>
                </div>
                {request.features && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {request.features.split(',').map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{f.trim()}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => setExpanded(expanded === request.id ? null : request.id)} className="text-xs text-blue-400 hover:text-blue-300 mt-2">
                  {expanded === request.id ? 'Hide details' : 'Show details'}
                </button>
                {expanded === request.id && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-xl space-y-2">
                    <div><span className="text-xs text-slate-400">Tech Stack:</span><p className="text-sm text-slate-600">{request.techStack || 'N/A'}</p></div>
                    <div><span className="text-xs text-slate-400">Description:</span><p className="text-sm text-slate-600">{request.longDescription || 'N/A'}</p></div>
                    <div><span className="text-xs text-slate-400">Demo URL:</span><p className="text-sm text-slate-600">{request.demoUrl || 'N/A'}</p></div>
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
              {request.status !== 'pending' && (
                 <div className="flex sm:flex-col items-center gap-2">
                   <button 
                    onClick={() => handleDelete(request.id)}
                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/10"
                    title="Delete Permanently"
                   >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
