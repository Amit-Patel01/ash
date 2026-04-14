import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { auth } from '../config/firebase'
import { api } from '../config/api'
import { Search } from 'lucide-react'

const avatarColors = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-amber-500',
  'from-red-500 to-rose-500',
]

export default function AdminCustomers() {
  const { users, updateUser, deleteUser } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [isProcessing, setIsProcessing] = useState(null)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastTarget, setBroadcastTarget] = useState('enrolled') // 'enrolled' or 'manual'
  const [broadcastManualEmails, setBroadcastManualEmails] = useState('')
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  // Filter for only customers
  const customers = users.filter(u => (u.role || '').toLowerCase() === 'customer')

  const filteredCustomers = customers.filter(c => {
    const name = (c.displayName || '').toLowerCase()
    const email = (c.email || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  const handleToggleBan = async (customer) => {
    const newStatus = customer.status === 'banned' ? 'active' : 'banned'
    setIsProcessing(customer.uid)
    try {
      await updateUser(customer.uid, { status: newStatus })
    } catch (err) {
      console.error("Failed to update customer status:", err)
      alert("Error updating status")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return
    setIsProcessing(customerToDelete.uid)
    try {
      await deleteUser(customerToDelete.uid)
      setShowDeleteModal(false)
    } catch (err) {
      console.error("Failed to delete customer:", err)
      alert("Error deleting customer")
    } finally {
      setIsProcessing(null)
      setCustomerToDelete(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your community members, handle bans, and profile cleanup.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="flex -space-x-2">
              {customers.slice(0, 3).map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[10px] font-bold`}>
                  {(c.displayName || 'C').charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-300">{customers.length} Total Customers</span>
          </div>
        </div>
      </div>

      {/* Stats & Search Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg 
                className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-all duration-300 ease-in-out transform group-focus-within:scale-110" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-in-out"
            />
          </div>
          <button 
            onClick={() => setShowBroadcastModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            Bulk Email
          </button>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Accounts</p>
            <p className="text-2xl font-black text-white">{customers.filter(c => c.status !== 'banned').length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto text-slate-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Customer Info</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Account Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => (
                <tr key={customer.uid} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-lg font-black text-white shadow-lg`}>
                        {(customer.displayName || customer.email || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{customer.displayName || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-400">ID: <span className="text-[10px] font-mono text-blue-400/80">{customer.uid.slice(0, 8)}...</span></p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Registered: {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      customer.status === 'banned' 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'banned' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {customer.status === 'banned' ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleToggleBan(customer)}
                        disabled={isProcessing === customer.uid}
                        className={`p-2.5 rounded-xl transition-all ${
                          customer.status === 'banned'
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        }`}
                        title={customer.status === 'banned' ? 'Unban Account' : 'Ban Account'}
                      >
                        {isProcessing === customer.uid ? (
                           <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : customer.status === 'banned' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364L5.636 5.636" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Delete Permanently"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <p className="text-gray-500 font-medium">No customers found matching your search.</p>
                      <button onClick={() => setSearchQuery('')} className="mt-2 text-blue-400 text-xs font-bold hover:underline uppercase tracking-widest">Clear Search</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Delete Customer?</h3>
            <p className="text-sm text-gray-400 mt-3 mb-8 leading-relaxed">
              Are you sure you want to permanently delete <span className="text-white font-bold text-base underline decoration-red-500/30">"{customerToDelete?.displayName || 'this account'}"</span>? This action cannot be reversed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-6 py-3.5 bg-white/5 text-gray-400 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isProcessing}
                className="px-6 py-3.5 bg-red-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest"
              >
                {isProcessing ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !sendingBroadcast && setShowBroadcastModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
                Bulk Broadcast
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setBroadcastTarget('enrolled')}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${broadcastTarget === 'enrolled' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    Mentorship Students
                  </button>
                  <button 
                    onClick={() => setBroadcastTarget('manual')}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${broadcastTarget === 'manual' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {broadcastTarget === 'manual' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Manual Emails (Comma/Space separated)</label>
                  <textarea 
                    value={broadcastManualEmails}
                    onChange={e => setBroadcastManualEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500/50 min-h-[80px] resize-none font-mono"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                  <input 
                    type="text"
                    value={broadcastSubject}
                    onChange={e => setBroadcastSubject(e.target.value)}
                    placeholder="Important Update Regarding..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[160px] resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 border-t border-white/5">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  disabled={sendingBroadcast}
                  className="px-6 py-3.5 bg-white/5 text-gray-400 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                   if (!broadcastSubject || !broadcastMessage) return alert("Please fill subject and message");
                   if (broadcastTarget === 'manual' && !broadcastManualEmails) return alert("Please enter target emails");
                   
                    setSendingBroadcast(true);
                    try {
                      const token = await auth.currentUser?.getIdToken();
                      if (!token) throw new Error("Please log in again to continue");

                      const response = await fetch(api.adminBroadcastEmail, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          targetType: broadcastTarget,
                          manualEmails: broadcastManualEmails,
                         subject: broadcastSubject,
                         message: broadcastMessage
                       })
                     });
                     const data = await response.json();
                     if (data.success) {
                       alert(`Success: ${data.message}`);
                       setShowBroadcastModal(false);
                       setBroadcastSubject('');
                       setBroadcastMessage('');
                       setBroadcastManualEmails('');
                     } else {
                       alert(data.message);
                     }
                   } catch (err) {
                     alert("Failed to send broadcast: " + err.message);
                   } finally {
                     setSendingBroadcast(false);
                   }
                  }}
                  disabled={sendingBroadcast}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-50 transition-all uppercase tracking-widest"
                >
                  {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
