export { default } from './VerifyCertificateRefined'
/*
import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ShieldCheck, ShieldAlert, Award, Calendar, User, BookOpen, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useStore } from '../store/StoreContext'
import { hexToRgba, mergeCertificateTemplate } from '../utils/certificateTemplate'
import { downloadCertificatePdf, downloadCertificatePng } from '../utils/certificateExport'
import { formatCertificateDate } from '../utils/certificateHelpers'
import CertificateDocument from '../components/certificates/CertificateDocument'

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams()
  const { certificateTemplate } = useStore()
  const [certId, setCertId] = useState(searchParams.get('id') || '')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [certData, setCertData] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState('')
  const certificateRef = useRef(null)
  const activeTemplate = useMemo(
    () => mergeCertificateTemplate(certData?.templateSnapshot || certificateTemplate),
    [certData?.templateSnapshot, certificateTemplate]
  )

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    if (!certId.trim()) return

    setStatus('loading')
    setCertData(null)
    setError('')

    try {
      const q = query(
        collection(db, 'certificates'), 
        where('certificate_id', '==', certId.trim()), 
        where('status', '==', 'approved')
      )
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const certDoc = snapshot.docs[0]
        const certData = certDoc.data()
        setCertData({
          id: certDoc.id,
          ...certData,
        })
        setStatus('success')
      } else {
        setError('Certificate not found or not yet approved.')
        setStatus('error')
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError('An error occurred while verifying the certificate. Please try again.')
      setStatus('error')
    }
  }

  // Auto-verify if ID is in URL
  useEffect(() => {
    if (searchParams.get('id')) {
      handleVerify()
    }
  }, [])

  const handleCopyId = async () => {
    if (!certData?.certificate_id) return

    try {
      await navigator.clipboard.writeText(certData.certificate_id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (copyError) {
      console.error('Copy failed:', copyError)
    }
  }

  const handleDownload = async (format) => {
    if (!certificateRef.current || !certData) return

    try {
      setDownloading(format)
      if (format === 'png') {
        await downloadCertificatePng(certificateRef.current, certData)
      } else {
        await downloadCertificatePdf(certificateRef.current, certData)
      }
    } catch (downloadError) {
      console.error(`Certificate ${format} export failed:`, downloadError)
      window.alert(`Unable to generate ${format.toUpperCase()} right now.`)
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="max-w-xl mx-auto text-center space-y-8">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                <ShieldCheck size={14} />
                Verification Portal
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Verify Authenticity</h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Enter the unique Certificate ID (e.g., {activeTemplate.certificatePrefix}-XXXXXXXX) to verify the credentials and course completion details.
            </p>
        </motion.div>

        {/* Search Box */}
        <motion.form 
            onSubmit={handleVerify}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
        >
          <input
            type="text"
            placeholder={`Enter Certificate ID (${activeTemplate.certificatePrefix}-XXXXXXXX)`}
            value={certId}
            onChange={(e) => setCertId(e.target.value.toUpperCase())}
            className="w-full bg-[#111418] border-2 border-white/5 rounded-3xl px-6 py-5 text-lg font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    <Search size={18} />
                    <span className="hidden sm:inline">Verify</span>
                </>
            )}
          </button>
        </motion.form>

        {/* Results */}
        <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div 
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-12 flex flex-col items-center text-gray-600"
                    >
                        <Award size={64} strokeWidth={1} />
                        <p className="mt-4 font-medium uppercase tracking-widest text-[10px]">Secure Verification System</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div 
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4">
                            <ShieldAlert size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white">Verification Failed</h3>
                        <p className="text-red-400/80 text-sm mt-2">{error}</p>
                    </motion.div>
                )}

                {status === 'success' && certData && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="backdrop-blur-xl rounded-[3rem] p-10 text-left shadow-2xl relative overflow-hidden group"
                        style={{
                          background: `linear-gradient(135deg, ${hexToRgba(activeTemplate.accentColor, 0.22)}, rgba(30, 41, 59, 0.82))`,
                          border: `1px solid ${hexToRgba(activeTemplate.accentColor, 0.28)}`
                        }}
                    >
                        {/* Decorative Gold Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-yellow-500/20 transition-all duration-700" />
                        
                        <div className="flex items-center justify-between mb-8">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle size={12} />
                                {activeTemplate.sealLabel}
                            </div>
                            <Award className="text-yellow-500/50" size={40} strokeWidth={1.5} />
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: activeTemplate.accentColor }}>{activeTemplate.title}</p>
                                <p className="text-sm text-gray-300 mt-2">{activeTemplate.subtitle}</p>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <User size={12} /> Certificate Holder
                                </h3>
                                <p className="text-2xl font-black text-white tracking-tight">{certData.userName || certData.name}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <BookOpen size={12} /> Course Name
                                    </h3>
                                    <p className="text-base font-bold text-gray-200">{certData.courseName || certData.course}</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Calendar size={12} /> Achievement Date
                                    </h3>
                                    <p className="text-base font-bold text-gray-200">{formatCertificateDate(certData.approval_date || certData.createdAt || certData.date)}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between gap-6 flex-wrap">
                                    <div>
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated ID</h3>
                                        <p className="text-sm font-mono text-blue-400/80 font-bold">{certData.certificate_id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Issuer</p>
                                        <p className="text-sm font-black text-white">{certData.issuedByName || activeTemplate.issuerName}</p>
                                        <p className="text-[11px] text-gray-400 mt-1">{certData.issuedByRole || activeTemplate.issuerRole}</p>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Organization</p>
                                    <p className="text-sm font-semibold text-white mt-1">{activeTemplate.organizationName}</p>
                                  </div>
                                  <div className="sm:text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Support</p>
                                    <p className="text-sm font-semibold text-white mt-1">{activeTemplate.supportEmail}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-5">{activeTemplate.footerNote}</p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                  <button
                                    onClick={handleCopyId}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                                  >
                                    {copied ? 'Copied ID' : 'Copy ID'}
                                  </button>
                                  <button
                                    onClick={() => handleDownload('png')}
                                    disabled={downloading === 'png'}
                                    className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {downloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
                                  </button>
                                  <button
                                    onClick={() => handleDownload('pdf')}
                                    disabled={downloading === 'pdf'}
                                    className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
                                  </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {status === 'success' && certData && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-10 max-w-[1120px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] p-3 shadow-2xl backdrop-blur-xl md:p-4"
          >
            <div ref={certificateRef}>
              <CertificateDocument certificate={certData} template={activeTemplate} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
*/
