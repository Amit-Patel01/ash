import { useMemo, useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { Search, FileText, Eye, X, ShieldCheck, Check } from 'lucide-react'

import { api } from '../config/api'
import { useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import msmeLogo from '../assets/msme.png'
import msmeQR from '../assets/msme-qr.png'
import founderSign from '../assets/founder-sign.png'

const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelowThousand = (n) => {
    let word = '';
    if (n >= 100) {
      word += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (word !== '') word += 'and ';
      if (n < 20) {
        word += a[n] + ' ';
      } else {
        word += b[Math.floor(n / 10)] + ' ';
        if (n % 10 > 0) {
          word += a[n % 10] + ' ';
        }
      }
    }
    return word.trim();
  };

  let str = '';
  const parts = [];
  parts.push(Math.floor(num / 10000000));
  num %= 10000000;
  parts.push(Math.floor(num / 100000));
  num %= 100000;
  parts.push(Math.floor(num / 1000));
  num %= 1000;
  parts.push(num);

  const labels = ['Crore', 'Lakh', 'Thousand', ''];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p > 0) {
      str += convertBelowThousand(p) + ' ' + labels[i] + ' ';
    }
  }
  return str.trim() + ' Rupees Only';
};

const getAbsoluteUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  return window.location.origin + (path.startsWith('/') ? path : '/' + path)
};

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

export default function UserOrders() {
  const { currentUser } = useAuth()
  const { orders, serviceRequests } = useStore()
  const location = useLocation()
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.pathname.includes('receipts') ? 'receipts' : 'orders'
  })

  useEffect(() => {
    setActiveTab(location.pathname.includes('receipts') ? 'receipts' : 'orders')
  }, [location.pathname])

  const [filter, setFilter] = useState('all')
  const [receipts, setReceipts] = useState([])
  const [loadingReceipts, setLoadingReceipts] = useState(true)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('')

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    setLoadingReceipts(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`${api.base}/api/db/receipts`, { headers })
      if (res.ok) {
        const data = await res.json()
        setReceipts(data.documents || [])
      }
    } catch (err) {
      console.error("Error fetching receipts:", err)
    } finally {
      setLoadingReceipts(false)
    }
  }

  const calculateTotals = (receipt) => {
    if (!receipt) return { amount: 0, discount: 0, net: 0, tax: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
    
    const amount = Number(receipt.amount || 0)
    const discount = Number(receipt.discount || 0)
    const net = Math.max(0, amount - discount)
    const taxPercent = Number(receipt.taxPercent || 0)
    const tax = net * (taxPercent / 100)
    
    let cgst = 0, sgst = 0, igst = 0
    if (receipt.taxType === 'cgst_sgst') {
      cgst = tax / 2
      sgst = tax / 2
    } else if (receipt.taxType === 'igst') {
      igst = tax
    }
    
    const total = net + tax
    return { amount, discount, net, tax, cgst, sgst, igst, total }
  }

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch =
        (receipt.receiptId || '').toLowerCase().includes(receiptSearchQuery.toLowerCase()) ||
        (receipt.itemName || '').toLowerCase().includes(receiptSearchQuery.toLowerCase()) ||
        (receipt.paymentMethod || '').toLowerCase().includes(receiptSearchQuery.toLowerCase())
      return matchesSearch
    })
  }, [receipts, receiptSearchQuery])

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Order & Request Hub</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Track prebuilt marketplace orders, custom build progress, and payment receipts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-extrabold relative transition-colors shrink-0 ${activeTab === 'orders' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Prebuilt Orders ({myOrders.length})
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 shadow-md" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-4 text-sm font-extrabold relative transition-colors shrink-0 ${activeTab === 'custom' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Custom Projects ({myCustomRequests.length})
          {activeTab === 'custom' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 shadow-md" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`pb-4 text-sm font-extrabold relative transition-colors shrink-0 ${activeTab === 'receipts' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Payment Receipts ({receipts.length})
          {activeTab === 'receipts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 shadow-md" />
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
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${filter === f ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>


          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/70 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No {filter !== 'all' ? filter : ''} orders found</p>
            </div>

          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Project</th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{order.project_title || 'Project'}</p>
                          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">Order #{order.id?.slice(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-extrabold">₹{Number(order.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {order.purchase_type === 'project_with_source' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                              With Source
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                              Project Only
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>{order.status || 'pending'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{order.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          )}
        </div>
      ) : activeTab === 'custom' ? (
        <div className="space-y-6">
          {myCustomRequests.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/70 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No custom build requests found</p>
            </div>

          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myCustomRequests.map(req => {
                const currentStep = getStatusStep(req.status);
                const colorClass = getStatusColor(currentStep);

                return (
                  <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 md:p-8 hover:border-slate-300 transition-all shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{req.projectType || 'Custom Project'}</h3>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-gradient-to-r ${colorClass} border`}>
                            {req.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1">Request ID: #{req.id?.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 dark:text-slate-500 block">Submitted on</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(req.createdAt)}</span>
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
                              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}

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
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search receipts by ID, project name, or payment method..."
              value={receiptSearchQuery}
              onChange={e => setReceiptSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all duration-300"
            />
          </div>

          {loadingReceipts ? (
            <div className="text-center py-16 bg-slate-50/70 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Loading payment receipts...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/70 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No payment receipts found</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                      <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider">Receipt ID</th>
                      <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider">Particulars</th>
                      <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider">Status</th>
                      <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReceipts.map(receipt => {
                      const receiptTotals = calculateTotals(receipt)
                      return (
                        <tr key={receipt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-black text-slate-900 dark:text-white">
                            {receipt.receiptId}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{receipt.itemName}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase border border-blue-200/60 dark:border-blue-500/20">
                              {receipt.itemCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-black">
                            ₹{receiptTotals.total.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {receipt.paymentDate}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              receipt.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            }`}>
                              {receipt.status === 'completed' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setActiveReceipt(receipt)
                                setShowPreviewModal(true)
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View-Only Preview Modal */}
      {showPreviewModal && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
          <div className="relative bg-white rounded-3xl w-full max-w-4xl p-6 md:p-8 my-8 shadow-2xl flex flex-col md:flex-row gap-6 text-slate-800">
            
            {/* Left Column: Actions */}
            <div className="md:w-64 flex flex-col gap-4 shrink-0">
              <h3 className="text-lg font-black text-slate-900">Receipt Viewer</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are viewing your official payment receipt. Download and print actions are restricted for this document. For assistance, contact support@amitsolutionhub.com.
              </p>
              
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            {/* Right Column: Receipt Layout */}
            <div className="flex-1 bg-slate-50 md:p-6 rounded-2xl overflow-x-auto">
              <div
                className="bg-white border border-slate-200 p-8 shadow-lg max-w-[210mm] min-h-[297mm] mx-auto text-slate-800 flex flex-col justify-between"
                style={{ fontSize: '12px', fontFamily: '"Outfit", "Inter", sans-serif' }}
              >
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start gap-4 border-b-2 border-slate-100 pb-6 mb-6">
                    <div>
                      <div className="flex items-center gap-3.5 mb-2">
                        <img src={getAbsoluteUrl(logo)} alt="Amit Solution Hub Logo" className="h-10 object-contain" />
                        <div>
                          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Amit Solution Hub</h1>
                          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1">MSME Govt. of India Registered</p>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-slate-500 font-medium text-[11px] mt-3">
                        <p><strong>Udyam Reg:</strong> UDYAM-GJ-17-0037282</p>
                        <p><strong>Email:</strong> support@amitsolutionhub.com</p>
                        <p><strong>Mobile:</strong> +91 7874248481</p>
                        <p><strong>Address:</strong> Godhra, Gujarat, India</p>
                        <p><strong>Website:</strong> www.amitsolutionhub.com</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">PAYMENT RECEIPT</h2>
                      <div className="inline-block mt-2 px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider">
                        {activeReceipt.status === 'completed' ? 'SUCCESSFUL / PAID' : 'PENDING'}
                      </div>
                      <div className="space-y-0.5 text-[11px] text-slate-500 font-medium mt-4">
                        <p><strong>Receipt No:</strong> <span className="font-bold text-slate-900">{activeReceipt.receiptId}</span></p>
                        <p><strong>Date:</strong> {activeReceipt.paymentDate}</p>
                        <p><strong>Payment Mode:</strong> {activeReceipt.paymentMethod}</p>
                        {activeReceipt.transactionId && <p><strong>Txn ID:</strong> {activeReceipt.transactionId}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 mb-6">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">BILLED TO (CUSTOMER DETAILS)</h3>
                    <div className="grid grid-cols-2 gap-4 text-[11.5px] font-medium text-slate-700">
                      <div>
                        <p className="text-slate-500 text-[10.5px]">Name:</p>
                        <p className="font-bold text-slate-900">{activeReceipt.customerName}</p>
                        
                        <p className="text-slate-500 text-[10.5px] mt-2">Email:</p>
                        <p>{activeReceipt.customerEmail}</p>
                      </div>
                      <div>
                        {activeReceipt.customerPhone && (
                          <>
                            <p className="text-slate-500 text-[10.5px]">Phone:</p>
                            <p>{activeReceipt.customerPhone}</p>
                          </>
                        )}
                        {activeReceipt.customerCompany && (
                          <>
                            <p className="text-slate-500 text-[10.5px] mt-2">Institution/Company:</p>
                            <p className="font-bold text-slate-800">{activeReceipt.customerCompany}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Particulars Table */}
                  <table className="w-full border-collapse mb-6" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-black uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3 text-left">Description / Particulars</th>
                        <th className="py-2.5 px-3 text-left">Category</th>
                        <th className="py-2.5 px-3 text-right">Base Amount (₹)</th>
                        <th className="py-2.5 px-3 text-right">Discount (₹)</th>
                        <th className="py-2.5 px-3 text-right">Tax (%)</th>
                        <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="font-medium text-slate-700">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{activeReceipt.itemName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Professional training & software development services.</p>
                        </td>
                        <td className="py-3 px-3 uppercase text-slate-500 font-bold">{activeReceipt.itemCategory}</td>
                        <td className="py-3 px-3 text-right">₹{calculateTotals(activeReceipt).amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-red-500">₹{calculateTotals(activeReceipt).discount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          {activeReceipt.taxType === 'exempt' ? 'Exempt' : `${activeReceipt.taxPercent}%`}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{calculateTotals(activeReceipt).total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Summary Columns */}
                  <div className="flex justify-between items-start gap-8 mb-6">
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Amount in Words</p>
                        <p className="text-slate-800 font-bold text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 inline-block">
                          {numberToWords(Math.round(calculateTotals(activeReceipt).total))}
                        </p>
                      </div>
                      {activeReceipt.notes && (
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Terms & Notes</p>
                          <p className="text-slate-500 text-[10px] italic leading-normal">{activeReceipt.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="w-64 shrink-0 font-medium text-slate-600 space-y-1.5 text-right text-[11.5px]">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{calculateTotals(activeReceipt).amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Discount:</span>
                        <span>-₹{calculateTotals(activeReceipt).discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Taxable Value:</span>
                        <span>₹{calculateTotals(activeReceipt).net.toFixed(2)}</span>
                      </div>

                      {activeReceipt.taxType === 'cgst_sgst' && (
                        <>
                          <div className="flex justify-between text-slate-500 text-[10.5px]">
                            <span>CGST ({Number(activeReceipt.taxPercent)/2}%):</span>
                            <span>₹{calculateTotals(activeReceipt).cgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[10.5px]">
                            <span>SGST ({Number(activeReceipt.taxPercent)/2}%):</span>
                            <span>₹{calculateTotals(activeReceipt).sgst.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      
                      {activeReceipt.taxType === 'igst' && (
                        <div className="flex justify-between text-slate-500 text-[10.5px]">
                          <span>IGST ({activeReceipt.taxPercent}%):</span>
                          <span>₹{calculateTotals(activeReceipt).igst.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-900 font-black text-sm">
                        <span>GRAND TOTAL:</span>
                        <span>₹{calculateTotals(activeReceipt).total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footnotes / Signatures / Verification Details */}
                <div className="border-t-2 border-slate-100 pt-6 mt-6 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    {activeReceipt.showMsmeQR !== false && (
                      <div className="w-16 h-16 bg-white p-1 border border-slate-200 rounded-xl shadow-inner shrink-0">
                        <img src={getAbsoluteUrl(msmeQR)} alt="MSME Registration Verification QR" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <ShieldCheck size={11} className="text-indigo-600" />
                        Verification Details
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                        Scan QR to verify our MSME Udyam Registration (UDYAM-GJ-17-0037282) online with the Ministry of MSME, Govt. of India.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-end">
                    {activeReceipt.showStamp !== false && (
                      <div className="text-center shrink-0">
                        <div className="h-16 flex items-center justify-center mb-1">
                          <img src={getAbsoluteUrl(msmeLogo)} alt="MSME Stamp" className="h-12 object-contain opacity-75 grayscale contrast-150 brightness-95" />
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Official Stamp</p>
                      </div>
                    )}

                    {activeReceipt.showSignature !== false && (
                      <div className="text-center shrink-0">
                        <div className="h-16 flex items-end justify-center mb-1">
                          <img src={getAbsoluteUrl(founderSign)} alt="Founder Signature" className="h-12 object-contain" />
                        </div>
                        <div className="text-[9px] font-black uppercase text-slate-800 tracking-wider border-t border-slate-200 pt-1">
                          Authorized Signatory
                          <p className="text-[8px] text-slate-400 lowercase font-medium">Amit Patel (Founder)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
