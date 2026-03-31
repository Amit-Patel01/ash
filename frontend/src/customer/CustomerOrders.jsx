import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

export default function CustomerOrders() {
  const { currentUser } = useAuth()
  const { orders } = useStore()
  const [filter, setFilter] = useState('all')

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customer_email === currentUser?.email || o.customer_uid === currentUser?.uid)
  }, [orders, currentUser])

  const filteredOrders = filter === 'all' ? myOrders : myOrders.filter(o => o.status === filter)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No {filter !== 'all' ? filter : ''} orders found</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{order.project_title || 'Project'}</p>
                      <p className="text-xs text-gray-500">Order #{order.id?.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-400 font-medium">₹{Number(order.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{order.purchase_type === 'project_with_source' ? 'With Source' : 'Project Only'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{order.status || 'pending'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{order.date || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
