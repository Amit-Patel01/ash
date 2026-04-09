import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Award,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Copy,
  FileImage,
  FileText,
  QrCode,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useStore } from '../store/StoreContext'
import { getDocumentTypeMeta, hexToRgba, mergeCertificateTemplate } from '../utils/certificateTemplate'
import { CERTIFICATE_EXPORT_WIDTH, downloadCertificatePdf, downloadCertificatePng } from '../utils/certificateExport'
import { formatCertificateDate, getCertificateDocumentLabel, getCertificateDocumentType } from '../utils/certificateHelpers'
import CertificateDocument from '../components/certificates/CertificateDocument'

function Surface({ children, className = '' }) {
  return (
    <div className={`rounded-[32px] border border-white/10 bg-white/[0.05] shadow-[0_28px_80px_rgba(3,7,18,0.42)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

function ActionButton({ icon: Icon, children, onClick, disabled = false, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone] || tones.default}`}
    >
      <Icon size={16} />
      <span>{children}</span>
    </button>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2 text-cyan-200">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function VerifyCertificateRefined() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { certificateTemplate } = useStore()
  const linkedId = searchParams.get('id') || ''
  const [certId, setCertId] = useState(linkedId || '')
  const [status, setStatus] = useState('idle')
  const [certData, setCertData] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState('')
  const certificateRef = useRef(null)
  const downloadRef = useRef(null)

  const documentType = getCertificateDocumentType(certData)
  const documentMeta = getDocumentTypeMeta(documentType)
  const activeTemplate = useMemo(
    () => mergeCertificateTemplate(certData?.templateSnapshot || certificateTemplate, documentType),
    [certData?.templateSnapshot, certificateTemplate, documentType]
  )

  const holderName = certData?.userName || certData?.name || 'Student'
  const courseName = certData?.courseName || certData?.course || 'Verified Course'
  const documentLabel = getCertificateDocumentLabel(certData, activeTemplate)
  const achievementDate = certData
    ? formatCertificateDate(certData.approval_date || certData.createdAt || certData.date)
    : 'Pending verification'
  const issuerName = certData?.issuedByName || activeTemplate.issuerName
  const issuerRole = certData?.issuedByRole || activeTemplate.issuerRole

  const portalFeatures = [
    { label: 'QR / Shared Link Ready', value: linkedId ? 'Active' : 'Available' },
    { label: `${documentMeta.shortLabel} Preview`, value: 'Live' },
    { label: 'Download Formats', value: 'PNG + PDF' },
  ]

  const verifyCertificate = async (incomingId = certId, options = {}) => {
    const { syncUrl = true } = options
    const normalizedId = String(incomingId || '').trim().toUpperCase()
    if (!normalizedId) return

    if (syncUrl && normalizedId !== linkedId) {
      setSearchParams({ id: normalizedId }, { replace: true })
    }

    setCertId(normalizedId)
    setStatus('loading')
    setCertData(null)
    setError('')

    try {
      const q = query(
        collection(db, 'certificates'),
        where('certificate_id', '==', normalizedId),
        where('status', '==', 'approved')
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setError('Document not found or not yet approved.')
        setStatus('error')
        return
      }

      const certDoc = snapshot.docs[0]
      setCertData({
        id: certDoc.id,
        ...certDoc.data(),
      })
      setStatus('success')
    } catch (err) {
      console.error('Verification error:', err)
      setError('An error occurred while verifying the document. Please try again.')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (!linkedId) return
    setCertId(linkedId.toUpperCase())
    verifyCertificate(linkedId, { syncUrl: false })
  }, [linkedId])

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
    if (!downloadRef.current || !certData) return

    try {
      setDownloading(format)
      if (format === 'png') {
        await downloadCertificatePng(downloadRef.current, certData)
      } else {
        await downloadCertificatePdf(downloadRef.current, certData)
      }
    } catch (downloadError) {
      console.error(`Document ${format} export failed:`, downloadError)
      window.alert(`Unable to generate ${format.toUpperCase()} right now.`)
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.11),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_26%)]" />
      <div className="absolute left-[-8rem] top-28 h-80 w-80 rounded-full bg-cyan-400/10 blur-[140px]" />
      <div className="absolute bottom-[-6rem] right-[-5rem] h-96 w-96 rounded-full bg-amber-400/10 blur-[150px]" />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[38px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
                <ShieldCheck size={14} />
                Document Verification Portal
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">
                <ScanLine size={14} />
                {linkedId ? 'Direct Verification Link Active' : 'Scan QR Or Enter ID'}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_290px]">
              <div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
                  Scan karo, verify karo, aur document wahi se download bhi karo.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  QR scan ya shared verification link se aane par document direct open ho jayega. Yahin se authenticity check, preview, aur PNG/PDF download available rahega.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {portalFeatures.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Surface className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">Scan Flow</p>
                    <p className="mt-1 text-sm text-slate-300">QR code se open hone par ID auto-fill hokar verification start ho sakta hai.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Step 1</p>
                    <p className="mt-2 text-sm text-white">Document ka QR scan ya ID paste karein.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Step 2</p>
                        <p className="mt-2 text-sm text-white">System document ID ko approved record se match karega.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Step 3</p>
                    <p className="mt-2 text-sm text-white">Verified document preview aur download buttons turant mil jayenge.</p>
                  </div>
                </div>
              </Surface>
            </div>

            <motion.form
              onSubmit={(event) => {
                event.preventDefault()
                verifyCertificate(certId)
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-4 shadow-inner shadow-slate-950/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder={`Enter ${documentMeta.shortLabel} ID (${activeTemplate.certificatePrefix}-XXXXXXXX)`}
                    value={certId}
                    onChange={(event) => setCertId(event.target.value.toUpperCase())}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-12 py-4 text-base font-semibold text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading' || !certId.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950" />
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify Now
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                QR scan se open hua page bhi isi verification field ko auto-use karta hai.
              </p>
            </motion.form>

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6"
                >
                  <Surface className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-4 text-cyan-200">
                          <Award size={28} />
                        </div>
                        <div>
                    <h2 className="text-xl font-black text-white">Ready for secure verification</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                            Document ID enter karte hi authentic record milega, preview open hoga, aur user usi page se PNG ya PDF download kar sakega.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Example Format</p>
                        <p className="mt-2 font-mono text-sm font-bold text-cyan-200">{activeTemplate.certificatePrefix}-EBGF3DZT</p>
                      </div>
                    </div>
                  </Surface>
                </motion.div>
              )}

              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6"
                >
                  <Surface className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-300" />
                      <div>
                        <p className="text-lg font-black text-white">Checking document authenticity...</p>
                        <p className="mt-1 text-sm text-slate-400">Approved record, issuer details, and downloadable preview load kiye ja rahe hain.</p>
                      </div>
                    </div>
                  </Surface>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6"
                >
                  <Surface className="border-red-400/20 bg-red-500/10 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="rounded-3xl border border-red-400/20 bg-red-500/15 p-4 text-red-300">
                        <ShieldAlert size={28} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-black text-white">Verification failed</h2>
                        <p className="mt-2 text-sm leading-6 text-red-100/80">{error}</p>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-red-400/15 bg-black/10 px-4 py-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-200/60">Check This</p>
                            <p className="mt-2 text-sm text-white">ID spelling aur prefix exact hona chahiye.</p>
                          </div>
                          <div className="rounded-2xl border border-red-400/15 bg-black/10 px-4 py-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-200/60">Still stuck?</p>
                            <p className="mt-2 text-sm text-white">Support: {activeTemplate.supportEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Surface>
                </motion.div>
              )}

              {status === 'success' && certData && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6"
                >
                  <Surface className="p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
                          <CheckCircle size={14} />
                          Verified {documentMeta.shortLabel} Found
                        </div>
                        <h2 className="mt-4 text-3xl font-black text-white">{holderName}</h2>
                        <p className="mt-2 text-base text-slate-300">
                          {documentLabel} issued for <span className="font-semibold text-white">{courseName}</span>
                        </p>
                      </div>

                      <div
                        className="rounded-[28px] border px-5 py-4"
                        style={{
                          background: `linear-gradient(135deg, ${hexToRgba(activeTemplate.accentColor, 0.18)}, rgba(15, 23, 42, 0.82))`,
                          borderColor: hexToRgba(activeTemplate.accentColor, 0.24),
                        }}
                      >
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{activeTemplate.referenceLabel || 'Document ID'}</p>
                        <p className="mt-2 font-mono text-base font-bold text-cyan-200">{certData.certificate_id}</p>
                        <p className="mt-3 text-xs text-slate-400">This page is safe to share for verification and downloads.</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <DetailRow icon={BookOpen} label="Program / Document" value={`${documentLabel} • ${courseName}`} />
                      <DetailRow icon={Calendar} label="Issue Date" value={achievementDate} />
                      <DetailRow icon={User} label="Issued By" value={`${issuerName} • ${issuerRole}`} />
                    </div>
                  </Surface>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {status === 'success' && certData ? (
              <>
                <Surface className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">Quick Actions</p>
                  <h3 className="mt-3 text-xl font-black text-white">Download or share instantly</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Verified document milte hi yahin se ID copy, PNG export, ya PDF download kiya ja sakta hai.
                  </p>

                  <div className="mt-5 grid gap-3">
                    <ActionButton icon={Copy} onClick={handleCopyId}>
                      {copied ? 'Copied ID' : `Copy ${documentMeta.shortLabel} ID`}
                    </ActionButton>
                    <ActionButton
                      icon={FileImage}
                      onClick={() => handleDownload('png')}
                      disabled={downloading === 'png'}
                      tone="cyan"
                    >
                      {downloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
                    </ActionButton>
                    <ActionButton
                      icon={FileText}
                      onClick={() => handleDownload('pdf')}
                      disabled={downloading === 'pdf'}
                      tone="amber"
                    >
                      {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
                    </ActionButton>
                  </div>
                </Surface>

                <Surface className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">Authenticity Snapshot</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Status</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeTemplate.sealLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Organization</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeTemplate.organizationName}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Support</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeTemplate.supportEmail}</p>
                    </div>
                  </div>
                </Surface>
              </>
            ) : (
              <>
                <Surface className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">What You Get</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">Live document preview</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Verification ke baad same approved design page par render hota hai.</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">PNG + PDF exports</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Verified document ko direct image ya printable PDF me save kar sakte ho.</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">Scan-friendly access</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">QR code se aaya user bhi isi page par same verification flow use karega.</p>
                    </div>
                  </div>
                </Surface>

                <Surface className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-200">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-300">Trusted Design</p>
                      <p className="mt-1 text-sm text-slate-300">Verification successful hote hi branded document preview load ho jayega.</p>
                    </div>
                  </div>
                </Surface>
              </>
            )}
          </motion.aside>
        </div>

        {status === 'success' && certData && (
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_320px]"
          >
            <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
              <div ref={downloadRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px` }}>
                <CertificateDocument certificate={certData} template={activeTemplate} />
              </div>
            </div>

            <Surface className="p-3 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4 md:px-1">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">Verified Preview</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{documentLabel}</h2>
                  <p className="mt-1 text-sm text-slate-400">QR scan, direct link, aur manual verification sab ke liye same official preview.</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
                  Download Enabled
                </div>
              </div>

              <div className="overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/45 p-3 md:p-4">
                <div className="overflow-x-auto">
                  <div
                    className="mx-auto w-full"
                    style={{ maxWidth: 'min(100%, calc((100vh - 18rem) * 1.414))' }}
                  >
                    <div ref={certificateRef}>
                      <CertificateDocument certificate={certData} template={activeTemplate} />
                    </div>
                  </div>
                </div>
              </div>
            </Surface>

            <div className="space-y-4">
              <Surface className="p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">Document Details</p>
                <div className="mt-4 space-y-3">
                  <DetailRow icon={User} label="Holder Name" value={holderName} />
                  <DetailRow icon={BookOpen} label="Program / Role" value={courseName} />
                  <DetailRow icon={Calendar} label="Verified On" value={achievementDate} />
                </div>
              </Surface>

              <Surface className="p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-300">Download Notes</p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <p>PNG social sharing ya quick proof ke liye best rahega.</p>
                  <p>PDF print aur official submission ke liye better rahega.</p>
                  <p>Verification link active rehne se anyone document authenticity check kar sakta hai.</p>
                </div>
              </Surface>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
