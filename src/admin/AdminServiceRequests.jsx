'use client'
import { useState } from 'react'
import { useStore } from '../store/StoreContext'

export default function AdminServiceRequests() {
  const { serviceRequests: requests, loading, updateServiceRequestStatus, deleteServiceRequest } = useStore()
  const [filter, setFilter] = useState('pending')
  const [expanded, setExpanded] = useState(null)

  // Real-time data from StoreContext

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)

  const handleStatusUpdate = async (id, newStatus) => {
    const action = newStatus === 'approved' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return
    
    try {
      await updateServiceRequestStatus(id, newStatus)
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request permanently?")) return
    try {
      await deleteServiceRequest(id)
    } catch (err) {
      console.error(err)
      alert("Failed to delete request")
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Review custom project requirements from clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'In Progress', value: requests.filter(r => r.status === 'approved').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed/Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'text-slate-500', bg: 'bg-gray-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              filter === f 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 border-transparent'
            }`}
          >
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white/30 rounded-3xl border border-slate-200">
            <p className="text-slate-400 text-sm font-medium">No {filter !== 'all' ? filter : ''} service requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request.id} className={`bg-white/60 backdrop-blur-md border rounded-2xl p-6 transition-all hover:bg-white/[0.03] ${
              request.status === 'pending' ? 'border-amber-500/20' : 
              request.status === 'approved' ? 'border-blue-500/20' : 
              'border-slate-200'
            }`}>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">{request.fullName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      request.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 
                      request.status === 'approved' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Project Type</p>
                      <p className="text-sm text-slate-600">{request.projectType || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Budget</p>
                      <p className="text-sm text-emerald-400 font-medium">{request.budget || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Timeline</p>
                      <p className="text-sm text-slate-600">{request.timeline || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Submitted</p>
                      <p className="text-xs text-slate-500">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={() => setExpanded(expanded === request.id ? null : request.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      {expanded === request.id ? 'Hide Details' : 'View Requirements'}
                      <svg className={`w-3 h-3 transition-transform ${expanded === request.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    
                    {expanded === request.id && (
                      <div className="mt-4 p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Description</p>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{request.description}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Client Contact</p>
                            <p className="text-xs text-slate-500">Email: <span className="text-slate-900">{request.email}</span></p>
                            <p className="text-xs text-slate-500">Mobile: <span className="text-slate-900">{request.mobile}</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Company</p>
                            <p className="text-xs text-slate-900">{request.company || 'Private/Individual'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-center gap-3">
                  {request.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        className="w-full md:w-32 py-2.5 bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        className="w-full md:w-32 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status !== 'pending' && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Processed</p>
                        <p className="text-xs text-slate-500">{formatDate(request.processedAt)}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(request.id)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/10"
                        title="Delete Permanently"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
