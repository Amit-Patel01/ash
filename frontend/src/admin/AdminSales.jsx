import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Search } from 'lucide-react'

export default function AdminSales() {
  const { orders, updateOrderStatus, deleteOrder, getTotalRevenue } = useStore()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.project_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalRevenue = getTotalRevenue()
  const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const completedCount = orders.filter(o => o.status === 'completed').length
  const pendingCount = orders.filter(o => o.status === 'pending').length

  const handleDeleteClick = (order) => {
    setOrderToDelete(order)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return
    setDeletingId(orderToDelete.id)
    try {
      await deleteOrder(orderToDelete.id)
      setShowDeleteModal(false)
    } catch (err) {
      alert("Failed to delete order record.")
    } finally {
      setDeletingId(null)
      setOrderToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales & Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} total orders | ₹{totalRevenue.toLocaleString('en-IN')} revenue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'from-emerald-500 to-green-600', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
          { label: 'Completed', value: completedCount, color: 'from-blue-500 to-indigo-600', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Pending', value: pendingCount, color: 'from-amber-500 to-orange-600', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Pending Revenue', value: `₹${pendingRevenue.toLocaleString('en-IN')}`, color: 'from-purple-500 to-violet-600', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/50 border border-white/5 rounded-xl p-5 shadow-lg">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'completed', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              {f} ({f === 'all' ? orders.length : orders.filter(o => o.status === f).length})
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg 
              className="w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-all duration-300 ease-in-out transform group-focus-within:scale-110" 
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
            placeholder="Search orders..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full pl-14 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-in-out" 
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">{order.project_title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${order.purchase_type === 'project_with_source' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {order.purchase_type === 'project_with_source' ? 'With Source' : 'Project Only'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">₹{Number(order.amount || 0).toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => updateOrderStatus(order.id, order.status === 'pending' ? 'completed' : 'pending')} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                      {order.status === 'completed' ? 'Completed' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400">{order.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleDeleteClick(order)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
            <p className="text-gray-500 text-sm">No orders found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !deletingId && setShowDeleteModal(false)} />
          <div className="relative bg-gray-900 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-50"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">Delete Order Record?</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Are you sure you want to delete order <span className="text-white font-medium">#{orderToDelete?.id.slice(-6).toUpperCase()}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-2">
                <button
                  onClick={confirmDelete}
                  disabled={deletingId}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {deletingId ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Deleting...</>
                  ) : 'Yes, Delete Order'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingId}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-all"
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
