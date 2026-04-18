import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { useStore } from '../store/StoreContext'
import { api, readApiJson } from '../config/api'
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
  const navigate = useNavigate()
  const { certificateId: routeCertificateId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { certificateTemplate } = useStore()
  const linkedId = String(routeCertificateId || searchParams.get('id') || '').trim()
  const [certId, setCertId] = useState(linkedId || '')
  const [status, setStatus] = useState('idle')
  const [certData, setCertData] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState('')
  const certificateRef = useRef(null)
  const downloadRef = useRef(null)
  const isQrCertificate = certData?.source === 'qr' || String(certData?.certificate_id || '').startsWith('QR-')
  const documentType = isQrCertificate ? 'certificate' : getCertificateDocumentType(certData)
  const documentMeta = isQrCertificate
    ? { shortLabel: 'Certificate' }
    : getDocumentTypeMeta(documentType)

  const activeTemplate = useMemo(
    () => mergeCertificateTemplate(certData?.templateSnapshot || certificateTemplate, documentType),
    [certData?.templateSnapshot, certificateTemplate, documentType]
  )
  const previewCertificate = useMemo(() => {
    if (!certData) return null
    if (!isQrCertificate) return certData

    const qrLabel = certData?.certificateTypeLabel || certData?.certificateType || 'Certificate'
    return {
      ...certData,
      documentType: 'certificate',
      documentLabel: qrLabel,
      course: qrLabel,
      courseName: qrLabel,
      approval_date: certData?.rawDate || certData?.date || certData?.approval_date || certData?.createdAt,
    }
  }, [certData, isQrCertificate])

  const holderName = certData?.userName || certData?.name || 'Student'
  const courseName = certData?.certificateTypeLabel || certData?.certificateType || certData?.courseName || certData?.course || 'Verified Certificate'
  const documentLabel = isQrCertificate
    ? (certData?.certificateTypeLabel || certData?.certificateType || 'QR Certificate')
    : getCertificateDocumentLabel(certData, activeTemplate)
  const achievementDate = certData
    ? formatCertificateDate(certData.rawDate || certData.approval_date || certData.createdAt || certData.date)
    : 'Pending verification'
  const issuerName = certData?.issuedByName || activeTemplate.issuerName
  const issuerRole = certData?.issuedByRole || activeTemplate.issuerRole
  const statusLabel = certData?.statusDisplay || certData?.status || 'Unknown'
  const verificationTone = certData?.isValid === false ? 'warning' : 'success'
  const inputPrefix = certId.startsWith('QR-') || isQrCertificate ? 'QR' : activeTemplate.certificatePrefix

  const portalFeatures = [
    { label: 'QR / Shared Link Ready', value: linkedId ? 'Active' : 'Available' },
    { label: isQrCertificate ? 'Certificate Preview' : `${documentMeta.shortLabel} Preview`, value: 'Live' },
    { label: 'Download Formats', value: 'PNG + PDF' },
  ]

  const verifyCertificate = async (incomingId = certId, options = {}) => {
    const { syncUrl = true } = options
    const normalizedId = String(incomingId || '').trim().toUpperCase()
    if (!normalizedId) return

    if (syncUrl && normalizedId !== linkedId) {
      navigate(`/verify/${encodeURIComponent(normalizedId)}`, { replace: true })
    }

    setCertId(normalizedId)
    setStatus('loading')
    setCertData(null)
    setError('')

    try {
      const response = await fetch(api.certificateVerify(normalizedId))
      const payload = await readApiJson(response)

      if (!response.ok) {
        const errorMessage = payload.debug || payload.message || 'Verification failed'
        throw new Error(errorMessage)
      }

      if (!payload.success || !payload.data) {
        setError(payload.message || 'Document not found or not yet approved.')
        setStatus('error')
        return
      }

      setCertData(payload.data)
      setStatus('success')
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'An error occurred while verifying the document. Please try again.')
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
    if (!downloadRef.current || !previewCertificate) return

    try {
      setDownloading(format)
      if (format === 'png') {
        await downloadCertificatePng(downloadRef.current, previewCertificate)
      } else {
        await downloadCertificatePdf(downloadRef.current, previewCertificate)
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
                  Scan, verify, and download the document from this page.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Opening via QR code or a shared verification link loads the document directly. Authenticity checks, preview, and PNG or PDF downloads are available here.
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
                    <p className="mt-1 text-sm text-slate-300">When opened from a QR code, the document ID can be filled in automatically to start verification.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Step 1</p>
                    <p className="mt-2 text-sm text-white">Scan the document QR code or paste the document ID.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Step 2</p>
                        <p className="mt-2 text-sm text-white">The system matches the document ID to the approved record.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Step 3</p>
                    <p className="mt-2 text-sm text-white">The verified preview and download actions appear immediately.</p>
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
                    placeholder={`Enter ${documentMeta.shortLabel} ID (${inputPrefix}-XXXXXXXX)`}
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
                Pages opened from a QR scan also use this verification field automatically.
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
                            After you enter a valid document ID, the authentic record loads, the preview opens, and PNG or PDF downloads are available on the same page.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Example Format</p>
                        <p className="mt-2 font-mono text-sm font-bold text-cyan-200">{inputPrefix}-EBGF3DZT</p>
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
                        <p className="mt-1 text-sm text-slate-400">Loading the approved record, issuer details, and downloadable preview.</p>
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
                            <p className="mt-2 text-sm text-white">The ID spelling and prefix must match exactly.</p>
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
                        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] ${
                          verificationTone === 'warning'
                            ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
                            : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                        }`}>
                          {verificationTone === 'warning' ? <ShieldAlert size={14} /> : <CheckCircle size={14} />}
                          {verificationTone === 'warning' ? `${documentMeta.shortLabel} Record Found` : `Verified ${documentMeta.shortLabel} Found`}
                        </div>
                        {isQrCertificate ? (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
                            <QrCode size={14} />
                            QR Verified Certificate
                          </div>
                        ) : null}
                        <h2 className="mt-4 text-3xl font-black text-white">{holderName}</h2>
                        <p className="mt-2 text-base text-slate-300">
                          {isQrCertificate
                            ? `${documentLabel} record opened through the QR verification flow.`
                            : `${documentLabel} issued for `}
                          {!isQrCertificate ? <span className="font-semibold text-white">{courseName}</span> : null}
                        </p>
                        {isQrCertificate ? (
                          <p className="mt-2 text-sm text-slate-400">
                            Public status: <span className="font-semibold text-white">{statusLabel}</span>
                          </p>
                        ) : null}
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
                      <DetailRow
                        icon={BookOpen}
                        label={isQrCertificate ? 'Certificate Type' : 'Program / Document'}
                        value={isQrCertificate ? documentLabel : `${documentLabel} • ${courseName}`}
                      />
                      <DetailRow icon={Calendar} label="Issue Date" value={achievementDate} />
                      <DetailRow
                        icon={isQrCertificate ? ShieldCheck : User}
                        label={isQrCertificate ? 'Status' : 'Issued By'}
                        value={isQrCertificate ? statusLabel : `${issuerName} • ${issuerRole}`}
                      />
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
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">
                    {isQrCertificate ? 'Verification Actions' : 'Quick Actions'}
                  </p>
                  <h3 className="mt-3 text-xl font-black text-white">
                    {isQrCertificate ? 'Copy, download, or review instantly' : 'Download or share instantly'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {isQrCertificate
                      ? 'QR certificates now include the same preview and download flow. Copy the ID or export the document from this panel.'
                      : 'Once verified, you can copy the ID, export PNG, or download PDF from this panel.'}
                  </p>

                  <div className="mt-5 grid gap-3">
                    <ActionButton icon={Copy} onClick={handleCopyId}>
                      {copied ? 'Copied ID' : `Copy ${documentMeta.shortLabel} ID`}
                    </ActionButton>
                    {previewCertificate ? (
                      <ActionButton
                        icon={FileImage}
                        onClick={() => handleDownload('png')}
                        disabled={downloading === 'png'}
                        tone="cyan"
                      >
                        {downloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
                      </ActionButton>
                    ) : null}
                    {previewCertificate ? (
                      <ActionButton
                        icon={FileText}
                        onClick={() => handleDownload('pdf')}
                        disabled={downloading === 'pdf'}
                        tone="amber"
                      >
                        {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
                      </ActionButton>
                    ) : null}
                  </div>
                </Surface>

                <Surface className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">Authenticity Snapshot</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Status</p>
                      <p className="mt-2 text-sm font-semibold text-white">{isQrCertificate ? statusLabel : activeTemplate.sealLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">
                        {isQrCertificate ? 'Certificate Type' : 'Organization'}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">{isQrCertificate ? documentLabel : activeTemplate.organizationName}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">
                        {isQrCertificate ? 'Verification Mode' : 'Support'}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">{isQrCertificate ? 'QR Scan / Direct Link' : activeTemplate.supportEmail}</p>
                    </div>
                  </div>
                </Surface>

                {isQrCertificate && certData?.certificateText ? (
                  <Surface className="p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">Certificate Text</p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{certData.certificateText}</p>
                  </Surface>
                ) : null}
              </>
            ) : (
              <>
                <Surface className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">What You Get</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">Live document preview</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">After verification, the same approved design is rendered on the page.</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">PNG + PDF exports</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Save the verified document as an image or a printable PDF.</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-sm font-semibold text-white">Scan-friendly access</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Visitors who arrive via QR code use the same verification flow on this page.</p>
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
                      <p className="mt-1 text-sm text-slate-300">After successful verification, the branded document preview loads automatically.</p>
                    </div>
                  </div>
                </Surface>
              </>
            )}
          </motion.aside>
        </div>

        {status === 'success' && previewCertificate && (
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_320px]"
          >
            {/* Hidden high-res export container — must be fixed+invisible so container queries resolve */}
            <div aria-hidden="true" style={{ position: 'fixed', top: '-9999px', left: 0, pointerEvents: 'none', zIndex: -9999 }}>
              <div ref={downloadRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px` }}>
                <CertificateDocument certificate={previewCertificate} template={activeTemplate} />
              </div>
            </div>

            <Surface className="p-3 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4 md:px-1">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">Verified Preview</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{documentLabel}</h2>
                  <p className="mt-1 text-sm text-slate-400">The same official preview is used for QR scans, direct links, and manual verification.</p>
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
                      <CertificateDocument certificate={previewCertificate} template={activeTemplate} />
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
                  <DetailRow icon={BookOpen} label={isQrCertificate ? 'Certificate Type' : 'Program / Role'} value={isQrCertificate ? documentLabel : courseName} />
                  <DetailRow icon={Calendar} label="Verified On" value={achievementDate} />
                </div>
              </Surface>

              <Surface className="p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-300">Download Notes</p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <p>PNG works well for social sharing or quick proof.</p>
                  <p>PDF is better for printing and formal submissions.</p>
                  <p>While the verification link remains active, anyone can confirm document authenticity.</p>
                </div>
              </Surface>
            </div>
          </motion.section>
        )}

        {status === 'success' && certData && isQrCertificate && (
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_320px]"
          >
            <Surface className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">QR Verification Details</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{documentLabel}</h2>
                  <p className="mt-1 text-sm text-slate-400">This record uses the shared verification page, but it belongs to the separate QR certificate module.</p>
                </div>
                <div className={`rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] ${
                  certData?.isValid === false
                    ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                }`}>
                  {certData?.isValid === false ? 'Revoked Record' : 'Active Record'}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <DetailRow icon={User} label="Name" value={holderName} />
                <DetailRow icon={BookOpen} label="Certificate Type" value={documentLabel} />
                <DetailRow icon={Calendar} label="Date" value={achievementDate} />
                <DetailRow icon={ShieldCheck} label="Status" value={statusLabel} />
              </div>

              {certData?.certificateText ? (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">What Is Written Inside</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{certData.certificateText}</p>
                </div>
              ) : null}
            </Surface>

            <Surface className="p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-300">Public Status</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p>Certificate ID: <span className="font-mono font-bold text-cyan-200">{certData.certificate_id}</span></p>
                <p>Source: QR verification module</p>
                <p>
                  Status meaning: {certData?.isValid === false
                    ? 'this certificate record exists, but it has been revoked by the admin.'
                    : 'this certificate is active and currently valid.'}
                </p>
              </div>

              {(certData?.signatureImageUrl || certData?.stampImageUrl) ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {certData?.signatureImageUrl ? (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Signature</p>
                      <img
                        src={certData.signatureImageUrl}
                        alt="Uploaded signature"
                        className="mt-3 h-28 w-full rounded-2xl bg-white object-contain p-2"
                      />
                    </div>
                  ) : null}
                  {certData?.stampImageUrl ? (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Stamp</p>
                      <img
                        src={certData.stampImageUrl}
                        alt="Uploaded stamp"
                        className="mt-3 h-28 w-full rounded-2xl bg-white object-contain p-2"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Surface>
          </motion.section>
        )}
      </div>
    </div>
  )
}
