import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { label: 'Request Submitted', desc: 'We received your project idea' },
  { label: 'Requirements Review', desc: 'Team is analyzing details' },
  { label: 'In Development', desc: 'Developer assigned & coding' },
  { label: 'Ready & Delivered', desc: 'Project files are ready' }
]

const getStatusStep = (status) => {
  const s = String(status || 'pending').toLowerCase();
  if (s === 'pending') return 0;
  if (s === 'reviewing') return 1;
  if (s === 'approved' || s === 'in-progress' || s === 'in_progress') return 2;
  if (s === 'completed' || s === 'delivered') return 3;
  return 0;
}

const getStatusColor = (stepIndex) => {
  if (stepIndex === 0) return 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/20';
  if (stepIndex === 1) return 'from-sky-500 to-blue-500 text-sky-400 border-sky-500/20';
  if (stepIndex === 2) return 'from-violet-500 to-indigo-500 text-violet-400 border-violet-500/20';
  return 'from-emerald-500 to-green-500 text-emerald-400 border-emerald-500/20';
}

const formatDate = (ts) => {
  if (!ts) return 'N/A';
  const dateObj = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  if (Number.isNaN(dateObj.getTime())) return 'Recent';
  return dateObj.toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export default function StudentOrders() {
  const { currentUser } = useAuth()
  const { orders, serviceRequests } = useStore()
  const [activeTab, setActiveTab] = useState('orders')
  const [filter, setFilter] = useState('all')

  const myOrders = useMemo(() => {
    return orders.filter(o => o.customer_email === currentUser?.email || o.customer_uid === currentUser?.uid)
  }, [orders, currentUser])

  const myCustomRequests = useMemo(() => {
    if (!serviceRequests) return [];
    return serviceRequests.filter(req => 
      req.email?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase()
    )
  }, [serviceRequests, currentUser])

  const filteredOrders = filter === 'all' ? myOrders : myOrders.filter(o => o.status === filter)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Order & Request Hub</h1>
          <p className="text-sm text-gray-400 mt-1">Track prebuilt marketplace orders and custom build progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === 'orders' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          Prebuilt Orders ({myOrders.length})
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-md shadow-blue-500/50" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === 'custom' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          Custom Projects ({myCustomRequests.length})
          {activeTab === 'custom' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-md shadow-blue-500/50" />
          )}
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-6">
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
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 bg-white/[0.01]">
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">Project</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-200">{order.project_title || 'Project'}</p>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5">Order #{order.id?.slice(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-400 font-bold">₹{Number(order.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 font-medium">
                          {order.purchase_type === 'project_with_source' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              With Source
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              Project Only
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{order.status || 'pending'}</span>
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
      ) : (
        <div className="space-y-6">
          {myCustomRequests.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No custom build requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myCustomRequests.map(req => {
                const currentStep = getStatusStep(req.status);
                const colorClass = getStatusColor(currentStep);

                return (
                  <div key={req.id} className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 hover:border-white/10 transition-all shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white">{req.projectType || 'Custom Project'}</h3>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-gradient-to-r ${colorClass} border`}>
                            {req.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-1">Request ID: #{req.id?.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Submitted on</span>
                        <span className="text-sm font-semibold text-gray-300">{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Stepper Pipeline */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative mt-8 pb-6 border-b border-white/5">
                      {/* Connection Line (Desktop only) */}
                      <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-gray-800 z-0">
                        <div 
                          className={`h-full bg-gradient-to-r ${
                            currentStep === 0 ? 'from-amber-500 to-amber-500 w-[0%]' :
                            currentStep === 1 ? 'from-amber-500 to-sky-500 w-[33%]' :
                            currentStep === 2 ? 'from-amber-500 via-sky-500 to-violet-500 w-[66%]' :
                            'from-amber-500 via-sky-500 via-violet-500 to-emerald-500 w-[100%]'
                          } transition-all duration-500`}
                        />
                      </div>

                      {STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;

                        return (
                          <div key={idx} className="flex md:flex-col items-center gap-4 md:text-center z-10 flex-1">
                            {/* Circle */}
                            <div 
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                                isActive ? 'bg-gradient-to-br text-slate-950 shadow-lg ' + (
                                  currentStep === 0 ? 'from-amber-400 to-orange-500 shadow-amber-500/20 ring-4 ring-amber-500/20' :
                                  currentStep === 1 ? 'from-sky-400 to-blue-500 shadow-sky-500/20 ring-4 ring-sky-500/20' :
                                  currentStep === 2 ? 'from-violet-400 to-indigo-500 shadow-violet-500/20 ring-4 ring-violet-500/20' :
                                  'from-emerald-400 to-green-500 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
                                ) : isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                'bg-gray-950 text-gray-600 border border-gray-800'
                              }`}
                            >
                              {isCompleted ? '✓' : idx + 1}
                            </div>

                            {/* Labels */}
                            <div className="flex-1 md:flex-initial">
                              <p className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Budget Target</span>
                        <span className="text-sm font-bold text-gray-200 mt-1 block">{req.budget || 'N/A'}</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Expected Timeline</span>
                        <span className="text-sm font-bold text-gray-200 mt-1 block">{req.timeline || 'N/A'}</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Email Address</span>
                        <span className="text-sm font-bold text-gray-200 mt-1 block truncate">{req.email || 'N/A'}</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Mobile Number</span>
                        <span className="text-sm font-bold text-gray-200 mt-1 block">{req.mobile || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Requirements Description</span>
                      <p className="text-sm text-gray-300 mt-1 leading-relaxed whitespace-pre-line">{req.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
