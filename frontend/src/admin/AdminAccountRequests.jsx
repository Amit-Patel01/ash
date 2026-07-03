import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/StoreContext'

export default function AdminAccountRequests() {
  const { approveAccountRequest } = useAuth()
  const { accountRequests: requests, rejectAccountRequest, deleteAccountRequest } = useStore()
  const [filter, setFilter] = useState('pending')
  const [processingId, setProcessingId] = useState(null)
  
  // Custom Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve', 'reject', or 'delete'

  // Data is now handled globally in StoreContext

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)

  const openConfirmModal = (request, type) => {
    setSelectedRequest(request)
    setActionType(type)
    setShowConfirmModal(true)
  }

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return
    
    const requestId = selectedRequest.id
    setProcessingId(requestId)
    setShowConfirmModal(false)

    try {
      if (actionType === 'approve') {
        const result = await approveAccountRequest(requestId)
        if (result.success) {
          if (result.alreadyExists) {
            alert(`An account for ${selectedRequest.name} already exists. A password reset email has been sent.`)
          } else {
            alert(`Account for ${selectedRequest.name} has been created successfully.`)
          }
        }
      } else if (actionType === 'reject') {
        await rejectAccountRequest(requestId)
      } else if (actionType === 'delete') {
        await deleteAccountRequest(requestId)
      }
    } catch (err) {
      console.error(err)
      alert('Failed: ' + (err.message || 'Error occurred during processing'))
    } finally {
      setProcessingId(null)
      setSelectedRequest(null)
      setActionType(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage join requests for SolutionHub.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((s, i) => (
          <div key={i} className={`bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-lg transition-transform hover:scale-[1.02]`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              filter === f 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/10' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 border-transparent'
            }`}
          >
            {f} {requests.length > 0 && `(${f === 'all' ? requests.length : requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white/30 rounded-3xl border border-slate-200 shadow-inner">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.25 12V3m0 0l-3.75 3.75M13.5 3l3.75 3.75" /></svg>
            </div>
            <p className="text-slate-400 text-sm font-medium">No {filter !== 'all' ? filter : ''} requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request.id} className={`bg-white/60 backdrop-blur-md border rounded-2xl p-6 transition-all hover:bg-white/[0.03] group ${
              request.status === 'pending' ? 'border-amber-500/20 shadow-amber-500/5' : 
              request.status === 'approved' ? 'border-emerald-500/10 shadow-emerald-500/5' : 
              'border-red-500/10 shadow-red-500/5'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                    request.status === 'approved' ? 'from-emerald-500 to-teal-600 shadow-emerald-500/20' : 
                    request.status === 'rejected' ? 'from-red-500 to-rose-600 shadow-red-500/20' : 
                    'from-blue-500 to-indigo-600 shadow-blue-500/20'
                  } flex items-center justify-center text-lg font-bold text-slate-900 shadow-lg flex-shrink-0`}>
                    {request.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-slate-900 truncate">{request.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        request.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 
                        request.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{request.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-500 font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75v-4.25m16.5 0a3 3 0 00-3-3H7.012a3 3 0 00-3 3m16.5 0V8.25m0 0a3 3 0 00-3-3H7.012a3 3 0 00-3 3v5.9M12 18.75V10.5m-4.5 4.5H12m0 0l-3.75-3.75m3.75 3.75l3.75-3.75" /></svg>
                        {request.department || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-500 font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        {request.role || 'Employee'}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-500 font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        {request.phone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {(request.status === 'pending' || request.status === 'rejected') && (
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => openConfirmModal(request, 'reject')}
                        disabled={processingId === request.id}
                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    <button 
                      onClick={() => openConfirmModal(request, 'approve')}
                      disabled={processingId === request.id}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-slate-900 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === request.id ? (
                        <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing</>
                      ) : (request.status === 'rejected' ? 'Approve Rejected' : 'Approve Request')}
                    </button>
                    {request.status !== 'pending' && (
                      <button 
                        onClick={() => openConfirmModal(request, 'delete')}
                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                        title="Delete Permanently"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                )}
                {request.status !== 'pending' && (
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Processed</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : 
                       request.rejectedAt ? new Date(request.rejectedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
              {request.reason && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 italic flex gap-2">
                    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    {request.reason}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white border border-slate-300 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-in-center">
            <div className={`h-2 w-full ${actionType === 'approve' ? 'bg-blue-500' : 'bg-red-500'}`} />
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${actionType === 'approve' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                {actionType === 'approve' ? (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {actionType === 'approve' ? 'Approve Account?' : actionType === 'delete' ? 'Delete Permanently?' : 'Reject Request?'}
              </h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {actionType === 'approve' 
                  ? `This will create a new user account for ${selectedRequest?.name} and grant them login access.`
                  : actionType === 'delete'
                  ? `This will permanently remove the request from ${selectedRequest?.name}. This action cannot be undone.`
                  : `Are you sure you want to reject the application from ${selectedRequest?.name}?`}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAction}
                  className={`w-full py-3.5 rounded-2xl font-bold text-slate-900 transition-all shadow-lg ${
                    actionType === 'approve' 
                      ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' 
                      : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                  }`}
                >
                  {actionType === 'approve' 
                      ? 'Confirm Approval' 
                      : actionType === 'delete' 
                      ? 'Yes, Delete Permanently' 
                      : 'Yes, Reject Request'}
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-3.5 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
