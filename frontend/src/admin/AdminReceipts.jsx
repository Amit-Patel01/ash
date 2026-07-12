import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { Search, Plus, Printer, Trash2, Edit, X, FileText, Calendar, User, Mail, Phone, ShieldCheck, Download } from 'lucide-react'
import { api } from '../config/api'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import logo from '../assets/logo.png'
import msmeLogo from '../assets/msme.png'
import msmeQR from '../assets/msme-qr.png'
import founderSign from '../assets/founder-sign.png'

// Indian Numbering System converter
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const g = ['', 'Thousand', 'Lakh', 'Crore'];

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
  
  // Crore (10,000,000)
  parts.push(Math.floor(num / 10000000));
  num %= 10000000;
  // Lakh (100,000)
  parts.push(Math.floor(num / 100000));
  num %= 100000;
  // Thousand (1,000)
  parts.push(Math.floor(num / 1000));
  num %= 1000;
  // Below thousand
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

export default function AdminReceipts() {
  const { courses, projects, services } = useStore()
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    receiptId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    itemName: '',
    itemCategory: 'Internship',
    amount: '',
    discount: '0',
    taxType: 'exempt',
    taxPercent: '0',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    transactionId: '',
    status: 'completed',
    showStamp: true,
    showSignature: true,
    showMsmeQR: true,
    notes: 'This is a computer-generated receipt. Thank you for choosing Amit Solution Hub!'
  })

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  // Handle pre-filling from existing store products
  const handleProductSelect = (e) => {
    const value = e.target.value
    if (!value) return

    const [type, id] = value.split(':')
    if (type === 'course') {
      const item = courses.find(c => c.id === id)
      if (item) {
        setFormData(prev => ({
          ...prev,
          itemName: item.title,
          itemCategory: 'Course',
          amount: String(item.price || item.discountedPrice || ''),
          discount: '0'
        }))
      }
    } else if (type === 'project') {
      const item = projects.find(p => p.id === id)
      if (item) {
        setFormData(prev => ({
          ...prev,
          itemName: item.title,
          itemCategory: 'Project',
          amount: String(item.price || ''),
          discount: '0'
        }))
      }
    } else if (type === 'service') {
      const item = services.find(s => s.id === id)
      if (item) {
        setFormData(prev => ({
          ...prev,
          itemName: item.title,
          itemCategory: 'Service',
          amount: String(item.price || ''),
          discount: '0'
        }))
      }
    }
  }

  const handleOpenCreate = () => {
    setIsEditing(false)
    // Auto-generate invoice/receipt ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const generatedId = `ASH/2026/${randomSuffix}`
    
    setFormData({
      receiptId: generatedId,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerCompany: '',
      itemName: '',
      itemCategory: 'Internship',
      amount: '',
      discount: '0',
      taxType: 'exempt',
      taxPercent: '0',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      transactionId: '',
      status: 'completed',
      showStamp: true,
      showSignature: true,
      showMsmeQR: true,
      notes: 'This is a computer-generated receipt. Thank you for choosing Amit Solution Hub!'
    })
    setShowFormModal(true)
  }

  const handleOpenEdit = (receipt) => {
    setIsEditing(true)
    setActiveReceipt(receipt)
    setFormData({
      receiptId: receipt.receiptId || '',
      customerName: receipt.customerName || '',
      customerEmail: receipt.customerEmail || '',
      customerPhone: receipt.customerPhone || '',
      customerCompany: receipt.customerCompany || '',
      itemName: receipt.itemName || '',
      itemCategory: receipt.itemCategory || 'Internship',
      amount: String(receipt.amount || ''),
      discount: String(receipt.discount || '0'),
      taxType: receipt.taxType || 'exempt',
      taxPercent: String(receipt.taxPercent || '0'),
      paymentDate: receipt.paymentDate || '',
      paymentMethod: receipt.paymentMethod || 'UPI',
      transactionId: receipt.transactionId || '',
      status: receipt.status || 'completed',
      showStamp: receipt.showStamp !== false,
      showSignature: receipt.showSignature !== false,
      showMsmeQR: receipt.showMsmeQR !== false,
      notes: receipt.notes || ''
    })
    setShowFormModal(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customerName || !formData.customerEmail || !formData.itemName || !formData.amount) {
      alert("Please fill all required fields.")
      return
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      discount: Number(formData.discount || 0),
      taxPercent: Number(formData.taxPercent || 0)
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      if (isEditing && activeReceipt) {
        const res = await fetch(`${api.base}/api/db/receipts/${activeReceipt.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const data = await res.json()
          setReceipts(prev => prev.map(r => r.id === activeReceipt.id ? data.document : r))
          setShowFormModal(false)
        } else {
          alert("Failed to update receipt.")
        }
      } else {
        const res = await fetch(`${api.base}/api/db/receipts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          const data = await res.json()
          setReceipts(prev => [data.document, ...prev])
          setShowFormModal(false)
        } else {
          alert("Failed to save receipt.")
        }
      }
    } catch (err) {
      console.error("Error saving receipt:", err)
      alert("An error occurred while saving the receipt.")
    }
  }

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this receipt? This action is permanent.")) return
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`${api.base}/api/db/receipts/${id}`, {
        method: 'DELETE',
        headers
      })
      if (res.ok) {
        setReceipts(prev => prev.filter(r => r.id !== id))
      } else {
        alert("Failed to delete receipt.")
      }
    } catch (err) {
      console.error("Error deleting receipt:", err)
    }
  }

  const handleOpenPreview = (receipt) => {
    setActiveReceipt(receipt)
    setShowPreviewModal(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSendEmail = async (receipt) => {
    if (!receipt) return
    setSendingEmail(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      
      const res = await fetch(`${api.base}/api/admin/receipts/${receipt.id}/send-email`, {
        method: 'POST',
        headers
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        alert("Receipt emailed successfully to " + receipt.customerEmail)
      } else {
        alert(data.message || "Failed to email receipt.")
      }
    } catch (err) {
      console.error("Error sending receipt email:", err)
      alert("An error occurred while emailing the receipt.")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDownloadPdf = async (receipt) => {
    if (!receipt) return
    setDownloadingPdf(true)
    try {
      const element = document.getElementById('printable-receipt-area')
      if (!element) {
        alert("Receipt preview element not found.")
        return
      }

      // Wait for fonts to load
      if (document.fonts?.ready) await document.fonts.ready

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('printable-receipt-area')
          const sourceElement = document.getElementById('printable-receipt-area')
          if (!clonedElement || !sourceElement) return

          // Create temporary 2D canvas context to resolve oklch values natively
          const canvasTest = clonedDoc.createElement('canvas')
          canvasTest.width = 1
          canvasTest.height = 1
          const ctx = canvasTest.getContext('2d')

          const convertOklchToRgba = (colorStr) => {
            if (!colorStr) return colorStr
            if (!colorStr.includes('oklch') && !colorStr.includes('oklab')) return colorStr
            try {
              ctx.clearRect(0, 0, 1, 1)
              ctx.fillStyle = '#000000'
              ctx.fillStyle = colorStr
              ctx.fillRect(0, 0, 1, 1)
              const data = ctx.getImageData(0, 0, 1, 1).data
              return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`
            } catch (e) {
              return colorStr
            }
          }

          const sourceNodes = [sourceElement, ...sourceElement.querySelectorAll('*')]
          const cloneNodes = [clonedElement, ...clonedElement.querySelectorAll('*')]
          const len = Math.min(sourceNodes.length, cloneNodes.length)

          for (let i = 0; i < len; i++) {
            const sNode = sourceNodes[i]
            const cNode = cloneNodes[i]
            const computed = window.getComputedStyle(sNode)

            const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor']
            colorProps.forEach(prop => {
              const val = computed[prop]
              if (val) {
                if (val.includes('oklch') || val.includes('oklab')) {
                  cNode.style[prop] = convertOklchToRgba(val)
                } else {
                  cNode.style[prop] = val
                }
              }
            })
          }
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const filename = `Receipt_${receipt.receiptId.replace(/\//g, '-')}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error("Error generating PDF:", err)
      alert("Failed to generate and download PDF receipt: " + err.message + ". Please use browser Print as a fallback.")
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Calculate pricing values
  const calculateTotals = (receipt) => {
    if (!receipt) return { subtotal: 0, discount: 0, net: 0, tax: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
    
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

  const filteredReceipts = receipts.filter(receipt => {
    const matchesFilter = filter === 'all' || receipt.status === filter
    const matchesSearch =
      (receipt.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.receiptId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.itemName || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totals = calculateTotals(activeReceipt)

  return (
    <div className="space-y-6">
      {/* Print Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything except the receipt preview */
          aside, nav, header, button, .no-print, .modal-backdrop, #root > *:not(#printable-receipt-wrapper) {
            display: none !important;
          }
          #printable-receipt-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            background: white !important;
            z-index: 99999 !important;
          }
          #printable-receipt-area {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
          }
        }
      `}} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Receipts</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and print official payment receipts with Amit Solution Hub branding.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Create Receipt
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {['all', 'completed', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize tracking-wider whitespace-nowrap transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {f} ({f === 'all' ? receipts.length : receipts.filter(r => r.status === f).length})
            </button>
          ))}
        </div>

        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search receipts by ID, name, email or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300"
          />
        </div>
      </div>

      {/* Receipts List */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-semibold">Loading receipts history...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderBottom: '1px solid #4f46e5' }}>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Receipt ID</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Customer</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Product/Service</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Amount</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Date</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Status</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/90">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map(receipt => {
                  const receiptTotals = calculateTotals(receipt)
                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-850">
                        {receipt.receiptId}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{receipt.customerName}</p>
                          <p className="text-xs text-slate-400 font-medium">{receipt.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{receipt.itemName}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase border border-slate-200">
                            {receipt.itemCategory}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">₹{receiptTotals.total.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {receipt.paymentDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${receipt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${receipt.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {receipt.status === 'completed' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all">
                          <button
                            onClick={() => handleOpenPreview(receipt)}
                            title="View/Print Receipt"
                            className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleSendEmail(receipt)}
                            disabled={sendingEmail}
                            title="Email Receipt to Client"
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors disabled:opacity-50"
                          >
                            <Mail size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(receipt)}
                            title="Edit"
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(receipt.id)}
                            title="Delete"
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredReceipts.length === 0 && (
            <div className="text-center py-16 bg-slate-50/50">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-bold">No receipts found</p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 rounded-xl shadow-sm hover:shadow transition-all"
              >
                Create your first receipt
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creation / Editing Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {isEditing ? 'Edit Payment Receipt' : 'Generate New Receipt'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* autofill option */}
              {!isEditing && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <label className="block text-xs font-black uppercase text-blue-600 tracking-wider mb-2">
                    Auto-Fill Product Details (Optional)
                  </label>
                  <select
                    onChange={handleProductSelect}
                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="">-- Choose Course, Project, or Service --</option>
                    <optgroup label="Courses">
                      {courses.map(c => <option key={c.id} value={`course:${c.id}`}>{c.title} (₹{c.price || c.discountedPrice})</option>)}
                    </optgroup>
                    <optgroup label="Source Code Projects">
                      {projects.map(p => <option key={p.id} value={`project:${p.id}`}>{p.title} (₹{p.price})</option>)}
                    </optgroup>
                    <optgroup label="Services">
                      {services.map(s => <option key={s.id} value={`service:${s.id}`}>{s.title} (₹{s.price})</option>)}
                    </optgroup>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Customer & Transaction */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Client Details</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Receipt / Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.receiptId}
                      onChange={e => setFormData(p => ({ ...p, receiptId: e.target.value }))}
                      placeholder="e.g. ASH/2026/1001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={e => setFormData(p => ({ ...p, customerName: e.target.value }))}
                      placeholder="Enter Full Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Customer Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={e => setFormData(p => ({ ...p, customerEmail: e.target.value }))}
                        placeholder="email@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Customer Phone</label>
                      <input
                        type="text"
                        value={formData.customerPhone}
                        onChange={e => setFormData(p => ({ ...p, customerPhone: e.target.value }))}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Company / Institution (Optional)</label>
                    <input
                      type="text"
                      value={formData.customerCompany}
                      onChange={e => setFormData(p => ({ ...p, customerCompany: e.target.value }))}
                      placeholder="e.g. ABC College or Corp LLC"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Right Column: Pricing & Payment */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Itemization & Payment</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Item Description *</label>
                    <input
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={e => setFormData(p => ({ ...p, itemName: e.target.value }))}
                      placeholder="e.g. MERN Stack Web Development Internship"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Category</label>
                      <select
                        value={formData.itemCategory}
                        onChange={e => setFormData(p => ({ ...p, itemCategory: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Course">Course</option>
                        <option value="Project">Project</option>
                        <option value="Service">Service</option>
                        <option value="Mentorship">Mentorship</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Base Price (INR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.amount}
                        onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                        placeholder="Base Amount"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Discount (INR)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discount}
                        onChange={e => setFormData(p => ({ ...p, discount: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax Type</label>
                      <select
                        value={formData.taxType}
                        onChange={e => setFormData(p => ({ ...p, taxType: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="exempt">GST Exempt</option>
                        <option value="cgst_sgst">CGST + SGST</option>
                        <option value="igst">IGST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax Percent (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={formData.taxType === 'exempt'}
                        value={formData.taxType === 'exempt' ? '0' : formData.taxPercent}
                        onChange={e => setFormData(p => ({ ...p, taxPercent: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Payment Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.paymentDate}
                        onChange={e => setFormData(p => ({ ...p, paymentDate: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={e => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="UPI">UPI / GPay / Paytm</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Bank Transfer">Direct Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Razorpay">Razorpay Gateway</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Transaction ID / Reference No</label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={e => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                        placeholder="e.g. pay_xxxxx or UPI Ref"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Receipt Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="completed">Completed / Paid</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggles and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Display Customizations</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.showStamp}
                        onChange={e => setFormData(p => ({ ...p, showStamp: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      Show Official Company Stamp
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.showSignature}
                        onChange={e => setFormData(p => ({ ...p, showSignature: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      Show Founder Signature (Amit Patel)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.showMsmeQR}
                        onChange={e => setFormData(p => ({ ...p, showMsmeQR: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      Show MSME Verification QR
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Notes / Terms & Conditions</label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  {isEditing ? 'Save Changes' : 'Generate & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Print Preview Modal */}
      {showPreviewModal && activeReceipt && (
        <div className="fixed inset-0 z-55 flex items-start justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md modal-backdrop">
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md modal-backdrop">
          <div className="relative bg-white rounded-3xl w-full max-w-4xl p-6 md:p-8 my-8 shadow-2xl flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Controls (no-print) */}
            <div className="md:w-64 flex flex-col gap-4 no-print shrink-0">
              <h3 className="text-lg font-black text-slate-900">Receipt Actions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click print to save the receipt as a PDF or send it to a physical printer. Adjust margins and options in the print dialog.
              </p>
              
              <button
                onClick={() => handleDownloadPdf(activeReceipt)}
                disabled={downloadingPdf}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Downloading...</>
                ) : (
                  <>
                    <Download size={16} />
                    Download PDF
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
              >
                <Printer size={16} />
                Print Receipt
              </button>

              <button
                onClick={() => handleSendEmail(activeReceipt)}
                disabled={sendingEmail}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {sendingEmail ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                ) : (
                  <>
                    <Mail size={16} />
                    Email Receipt
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  handleOpenEdit(activeReceipt)
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
              >
                <Edit size={16} />
                Edit Details
              </button>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
              >
                Close Preview
              </button>
            </div>

            {/* Right Column: The Receipt Document Layout */}
            <div id="printable-receipt-wrapper" className="flex-1 bg-slate-50 md:p-6 rounded-2xl overflow-x-auto">
              <div
                id="printable-receipt-area"
                className="bg-white border border-slate-200 p-8 shadow-lg max-w-[210mm] min-h-[297mm] mx-auto text-slate-800 flex flex-col justify-between"
                style={{ fontSize: '12px', fontFamily: '"Outfit", "Inter", sans-serif' }}
              >
                {/* Receipt Content Header */}
                <div>
                  <div className="flex justify-between items-start gap-4 border-b-2 border-slate-100 pb-6 mb-6">
                    {/* Left: Brand Details */}
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

                    {/* Right: Invoice details */}
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

                  {/* Customer Information Box */}
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

                  {/* Table of items */}
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
                        <td className="py-3 px-3 text-right">₹{totals.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-red-500">₹{totals.discount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          {activeReceipt.taxType === 'exempt' ? 'Exempt' : `${activeReceipt.taxPercent}%`}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{totals.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Summary Columns */}
                  <div className="flex justify-between items-start gap-8 mb-6">
                    {/* Notes & Words */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Amount in Words</p>
                        <p className="text-slate-800 font-bold text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 inline-block">
                          {numberToWords(Math.round(totals.total))}
                        </p>
                      </div>
                      {activeReceipt.notes && (
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Terms & Notes</p>
                          <p className="text-slate-500 text-[10px] italic leading-normal">{activeReceipt.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Totals Summary */}
                    <div className="w-64 shrink-0 font-medium text-slate-600 space-y-1.5 text-right text-[11.5px]">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{totals.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Discount:</span>
                        <span>-₹{totals.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Taxable Value:</span>
                        <span>₹{totals.net.toFixed(2)}</span>
                      </div>

                      {activeReceipt.taxType === 'cgst_sgst' && (
                        <>
                          <div className="flex justify-between text-slate-505 text-[10.5px]">
                            <span>CGST ({Number(activeReceipt.taxPercent)/2}%):</span>
                            <span>₹{totals.cgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-505 text-[10.5px]">
                            <span>SGST ({Number(activeReceipt.taxPercent)/2}%):</span>
                            <span>₹{totals.sgst.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      
                      {activeReceipt.taxType === 'igst' && (
                        <div className="flex justify-between text-slate-500 text-[10.5px]">
                          <span>IGST ({activeReceipt.taxPercent}%):</span>
                          <span>₹{totals.igst.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-900 font-black text-sm">
                        <span>GRAND TOTAL:</span>
                        <span>₹{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt Footnotes / Stamp / Signatures */}
                <div className="border-t-2 border-slate-100 pt-6 mt-6 flex justify-between items-end">
                  {/* Left: MSME details & QR */}
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

                  {/* Right: Signature & Stamp */}
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
