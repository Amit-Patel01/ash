import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { CheckCircle, XCircle, Search, Award, Calendar, User, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminCertificates() {
  const { tradingEnrollments, certificates, issueCertificate, revokeCertificate } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, issued, unissued
  const [isProcessing, setIsProcessing] = useState(null)

  // Map enrollments to their certificate status
  const mappedEnrollments = useMemo(() => {
    return tradingEnrollments.map(enrollment => {
      const cert = certificates.find(c => c.courseName === enrollment.courseName && c.userId === enrollment.userId)
      return {
        ...enrollment,
        certificate: cert || null
      }
    })
  }, [tradingEnrollments, certificates])

  const filteredEnrollments = mappedEnrollments.filter(enr => {
    const matchesSearch = 
      (enr.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enr.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enr.courseName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enr.certificate?.certificate_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    if (statusFilter === 'issued') return matchesSearch && enr.certificate
    if (statusFilter === 'unissued') return matchesSearch && !enr.certificate
    return matchesSearch
  })

  const handleIssueCertificate = async (enrollment) => {
    setIsProcessing(enrollment.id)
    try {
      await issueCertificate(enrollment)
    } catch (err) {
      console.error("Failed to issue certificate:", err)
      alert("Error issuing certificate")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleRevokeCertificate = async (certId) => {
    if (!window.confirm("Are you sure you want to revoke this certificate?")) return;
    setIsProcessing(certId)
    try {
      await revokeCertificate(certId)
    } catch (err) {
      console.error("Failed to revoke certificate:", err)
      alert("Error revoking certificate")
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Certificate Issuance</h1>
          <p className="text-sm text-gray-400 mt-1">Review student enrollments and issue course completion certificates directly.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
                <Award className="text-blue-400" size={18} />
                <span className="text-xs font-bold text-gray-300">{certificates.length} Issued</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
                <User className="text-emerald-400" size={18} />
                <span className="text-xs font-bold text-gray-300">{tradingEnrollments.length} Total</span>
            </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by student, course, or Cert ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
        <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Enrollments' }, 
              { id: 'issued', label: 'Issued' }, 
              { id: 'unissued', label: 'Not Issued' }
            ].map((status) => (
                <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        statusFilter === status.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    {status.label}
                </button>
            ))}
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto text-slate-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Student & Course</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Certificate Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode='popLayout'>
                {filteredEnrollments.length > 0 ? filteredEnrollments.map((enr) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={enr.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{enr.userName || 'Student'}</p>
                          <p className="text-xs text-gray-500 mt-1">{enr.userEmail}</p>
                          <div className="flex items-center gap-1.5 mt-2 bg-blue-500/10 w-fit px-2 py-0.5 rounded-lg border border-blue-500/20">
                            <Award size={10} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400">{enr.courseName || 'Course'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {enr.certificate ? (
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle size={12}/> Issued
                          </span>
                          <p className="text-xs font-mono text-blue-400 mt-2">
                            ID: {enr.certificate.certificate_id}
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                             <Calendar size={10} />
                             {enr.certificate.approval_date?.toDate ? enr.certificate.approval_date.toDate().toLocaleDateString() : 'Active'}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Not Issued
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!enr.certificate ? (
                          <button
                            onClick={() => handleIssueCertificate(enr)}
                            disabled={isProcessing === enr.id}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                          >
                            {isProcessing === enr.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={14} />}
                            Issue Certificate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeCertificate(enr.certificate.id)}
                            disabled={isProcessing === enr.certificate.id}
                            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest transition-all shadow-none disabled:opacity-50 flex items-center gap-2"
                          >
                             {isProcessing === enr.certificate.id ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <XCircle size={14} />}
                             Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                          <Award size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">No enrollments found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
