import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { ChevronDown, Download, FileImage, FileText, Link2, Mail, PencilLine, Plus, QrCode, RefreshCcw, ShieldCheck, ShieldOff, Trash2, Upload, UserRound } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { auth } from '../config/firebase'
import { api, readApiJson, API_BASE } from '../config/api'
import CertificateDocument from '../components/certificates/CertificateDocument'
import { CERTIFICATE_EXPORT_WIDTH, downloadCertificatePdf, downloadCertificatePng } from '../utils/certificateExport'
import { normalizeCertificateAssetUrl } from '../utils/certificateHelpers'

// Convert a stored asset URL (may be relative like /uploads/...) to a full URL for <img src>
const resolveAssetSrc = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/')) {
    const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}${raw}`
  }
  return raw
}

const AICTE_INTERNSHIP_CERTIFICATE_TYPE = 'AICTE Internship Completion'

const CERTIFICATE_TYPES = [
  {
    value: AICTE_INTERNSHIP_CERTIFICATE_TYPE,
    label: 'Completion Certificate',
    defaultText: 'This is to certify that the above-named candidate has successfully completed the AICTE-approved internship program conducted by Amit Solution Hub. The internship included guided learning, assigned project work, practical training, and performance evaluation with verified participation.',
  },
  {
    value: 'LOR',
    label: 'Letter of Recommendation',
    defaultText: 'This letter confirms that the holder demonstrated consistent performance, strong character, and reliable contribution. Based on observed work quality and professional conduct, this recommendation is issued in support of future academic or career opportunities.',
  },
  {
    value: 'LOA',
    label: 'Letter of Achievement',
    defaultText: 'This letter recognizes the holder for notable achievement, dedication, and measurable contribution. The holder successfully met expectations and demonstrated commitment, discipline, and excellence throughout the engagement period.',
  },
  {
    value: 'Appreciation',
    label: 'Appreciation Certificate',
    defaultText: 'This certificate is presented in appreciation of the holder for valuable contribution, sincerity, and professional attitude. The effort and commitment shown during the engagement are gratefully acknowledged by Amit Solution Hub.',
  },
  {
    value: 'Offer Letter',
    label: 'Offer Letter',
    defaultText: 'We are delighted to welcome you for the internship in Web Development at our organization. This internship is observed by Amit Solution Hub as being a learning opportunity for you, spanning a duration of 1 month.\n\nIn essence, your internship will embrace orientation and give emphasis on learning new skills with a deeper understanding of concepts through hands-on application of the knowledge you gain as an intern. Our team is confident that you will acknowledge your obligation to perform all work allocated to you to the best of your ability within lawful and reasonable direction given to you.\n\nWe look forward to a worthwhile and fruitful association which will make you equipped for future projects. Wishing you the most enjoyable and truly meaningful internship program experience.',
  },
  {
    value: 'Other',
    label: 'Other Certificate',
    defaultText: 'This certificate is proudly presented to acknowledge the holder\'s effort, performance, or participation. The organization recognizes and appreciates their valuable contribution.',
  },
]

const getTypeMeta = (value) => CERTIFICATE_TYPES.find((type) => type.value === value) || CERTIFICATE_TYPES[0]

const createInitialForm = () => ({
  certificate_id: '',
  name: '',
  certificateType: AICTE_INTERNSHIP_CERTIFICATE_TYPE,
  customTitle: '',
  date: new Date().toISOString().slice(0, 10),
  certificateText: getTypeMeta(AICTE_INTERNSHIP_CERTIFICATE_TYPE).defaultText,
  assignedEmployeeUid: '',
  assignedEmployeeId: '',
  assignedEmployeeName: '',
  assignedEmployeeEmail: '',
  signatureImageUrl: '',
  signatoryName: '',
  signatoryRole: '',
  stampImageUrl: '',
})

const mapCertificateToForm = (certificate = {}) => ({
  certificate_id: certificate.certificate_id || '',
  name: certificate.name || certificate.userName || '',
  certificateType: certificate.certificateType || 'LOR',
  customTitle: certificate.certificateType === 'Other' ? (certificate.documentLabel || '') : '',
  date: certificate.rawDate || certificate.date || new Date().toISOString().slice(0, 10),
  certificateText: certificate.certificateText || getTypeMeta(certificate.certificateType || 'LOR').defaultText,
  assignedEmployeeUid: certificate.assignedEmployeeUid || '',
  assignedEmployeeId: certificate.assignedEmployeeId || '',
  assignedEmployeeName: certificate.assignedEmployeeName || '',
  assignedEmployeeEmail: certificate.assignedEmployeeEmail || '',
  signatureImageUrl: certificate.signatureImageUrl || '',
  signatoryName: certificate.signatoryName || '',
  signatoryRole: certificate.signatoryRole || '',
  stampImageUrl: certificate.stampImageUrl || '',
})

const formatDisplayDate = (value) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN')
}

const buildVerifyUrl = (certificateId, fallback = '') => {
  if (fallback) return fallback
  if (!certificateId || typeof window === 'undefined') return ''

  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const frontendOrigin = isLocalhost ? window.location.origin : 'https://www.amitsolutionhub.com'

  return `${frontendOrigin}/verify/${encodeURIComponent(certificateId)}`
}

function StatCard({ label, value, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <div className={`mt-4 inline-flex rounded-2xl border px-4 py-2 text-2xl font-black ${tones[tone] || tones.cyan}`}>
        {value}
      </div>
    </div>
  )
}

export default function AdminQrCertificates() {
  const {
    qrCertificates,
    certificateTemplate,
    users,
    createQrCertificate,
    updateQrCertificate,
    toggleQrCertificateStatus,
    deleteQrCertificate,
  } = useStore()

  const [form, setForm] = useState(createInitialForm)
  const [editingId, setEditingId] = useState('')
  const [previewCertificateId, setPreviewCertificateId] = useState('')
  const [busyId, setBusyId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [downloading, setDownloading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const downloadRef = useRef(null)
  const employeeOptions = useMemo(() => {
    const prioritized = users.filter((user) => ['employee', 'mentor'].includes(String(user.role || '').trim().toLowerCase()))
    const fallback = users.filter((user) => !['admin', 'customer'].includes(String(user.role || '').trim().toLowerCase()))
    const pool = prioritized.length > 0 ? prioritized : fallback

    return [...pool].sort((left, right) => {
      const leftLabel = left.displayName || left.name || left.email || left.employeeId || ''
      const rightLabel = right.displayName || right.name || right.email || right.employeeId || ''
      return leftLabel.localeCompare(rightLabel)
    })
  }, [users])

  const activeCount = qrCertificates.filter(certificate => certificate.status === 'active').length
  const revokedCount = qrCertificates.filter(certificate => certificate.status === 'revoked').length
  const groupedCertificates = useMemo(() => {
    const groups = {}
    qrCertificates.forEach(cert => {
      const name = cert.name || cert.userName || 'Unknown'
      if (!groups[name]) groups[name] = []
      groups[name].push(cert)
    })
    
    const sortedNames = Object.keys(groups).sort()
    
    sortedNames.forEach(name => {
      groups[name].sort((a, b) => {
        const dateA = new Date(a.rawDate || a.date).getTime()
        const dateB = new Date(b.rawDate || b.date).getTime()
        return dateB - dateA
      })
    })
    
    return { groups, sortedNames }
  }, [qrCertificates])

  const editingCertificate = useMemo(
    () => qrCertificates.find((certificate) => certificate.id === editingId) || null,
    [editingId, qrCertificates]
  )
  const selectedEmployeeValue = useMemo(() => {
    const currentKeys = [form.assignedEmployeeUid, form.assignedEmployeeId, form.assignedEmployeeEmail]
      .filter(Boolean)
      .map((value) => String(value))
    if (currentKeys.length === 0) return ''

    const match = employeeOptions.find((employee) =>
      [employee.uid, employee.id, employee.employeeId, employee.email]
        .filter(Boolean)
        .map((value) => String(value))
        .some((value) => currentKeys.includes(value))
    )

    return match ? (match.uid || match.id || match.employeeId || match.email || '') : ''
  }, [employeeOptions, form.assignedEmployeeEmail, form.assignedEmployeeId, form.assignedEmployeeUid])
  const previewType = getTypeMeta(form.certificateType)
  const isAictePreview = form.certificateType === AICTE_INTERNSHIP_CERTIFICATE_TYPE
  const previewDisplayId = previewCertificateId || editingCertificate?.certificate_id || (isAictePreview ? 'ASH-AICTE-2026-001' : 'QR-PREVIEW')
  const previewCertificate = useMemo(() => ({
    id: editingCertificate?.id || '',
    source: 'qr',
    documentType: isAictePreview ? 'internship_certificate' : 'qr_certificate',
    status: editingCertificate?.status || 'active',
    statusDisplay: editingCertificate?.status === 'revoked' ? 'Revoked' : (isAictePreview ? 'Verified' : 'Active'),
    isValid: editingCertificate?.status !== 'revoked',
    certificate_id: previewDisplayId,
    name: form.name || 'Certificate Holder',
    userName: form.name || 'Certificate Holder',
    certificateType: form.certificateType,
    certificateTypeLabel: form.certificateType === 'Other' && form.customTitle ? form.customTitle : previewType.label,
    documentLabel: form.certificateType === 'Other' && form.customTitle ? form.customTitle : previewType.label,
    course: form.certificateType === 'Other' && form.customTitle ? form.customTitle : previewType.label,
    courseName: form.certificateType === 'Other' && form.customTitle ? form.customTitle : previewType.label,
    rawDate: form.date || new Date().toISOString().slice(0, 10),
    date: form.date || new Date().toISOString().slice(0, 10),
    certificateText: form.certificateText || previewType.defaultText,
    assignedEmployeeUid: form.assignedEmployeeUid || '',
    assignedEmployeeId: form.assignedEmployeeId || '',
    assignedEmployeeName: form.assignedEmployeeName || '',
    assignedEmployeeEmail: form.assignedEmployeeEmail || '',
    signatureImageUrl: form.signatureImageUrl || '',
    signatoryName: form.signatoryName || '',
    signatoryRole: form.signatoryRole || '',
    stampImageUrl: form.stampImageUrl || '',
    verifyUrl: buildVerifyUrl(previewDisplayId),
  }), [editingCertificate, form, isAictePreview, previewDisplayId, previewType])
  const canDownloadPreview = Boolean(form.name.trim() && form.certificateText.trim())

  const [exportTarget, setExportTarget] = useState(null)
  const [exportFormat, setExportFormat] = useState('')
  const exportRef = useRef(null)

  useEffect(() => {
    if (exportTarget && exportFormat && exportRef.current) {
      const processExport = async () => {
        try {
          if (exportFormat === 'png') {
            await downloadCertificatePng(exportRef.current, exportTarget)
          } else {
            await downloadCertificatePdf(exportRef.current, exportTarget)
          }
        } catch (err) {
          setError(err.message || 'Export failed')
        } finally {
          setExportTarget(null)
          setExportFormat('')
        }
      }
      setTimeout(processExport, 100)
    }
  }, [exportTarget, exportFormat])

  const triggerExport = (certificate, format) => {
    const typeMeta = getTypeMeta(certificate.certificateType)
    setExportTarget({
      ...certificate,
      source: 'qr',
      documentType: certificate.documentType || (certificate.certificateType === AICTE_INTERNSHIP_CERTIFICATE_TYPE ? 'internship_certificate' : 'qr_certificate'),
      statusDisplay: certificate.status === 'revoked' ? 'Revoked' : 'Active',
      isValid: certificate.status !== 'revoked',
      certificateTypeLabel: certificate.certificateType === 'Other' && certificate.documentLabel ? certificate.documentLabel : typeMeta.label,
      documentLabel: certificate.certificateType === 'Other' && certificate.documentLabel ? certificate.documentLabel : typeMeta.label,
      course: certificate.certificateType === 'Other' && certificate.documentLabel ? certificate.documentLabel : typeMeta.label,
      courseName: certificate.certificateType === 'Other' && certificate.documentLabel ? certificate.documentLabel : typeMeta.label,
      verifyUrl: buildVerifyUrl(certificate.certificate_id, certificate.verifyUrl)
    })
    setExportFormat(format)
  }

  const resetForm = () => {
    setForm(createInitialForm())
    setEditingId('')
    setPreviewCertificateId('')
  }

  const handleChange = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  const handleAssignedEmployeeChange = (selectedValue) => {
    const selectedEmployee = employeeOptions.find((employee) =>
      [employee.uid, employee.id, employee.employeeId, employee.email]
        .filter(Boolean)
        .map((value) => String(value))
        .includes(String(selectedValue || ''))
    ) || null

    setForm((current) => {
      const nextAssignedEmployeeName = selectedEmployee
        ? (selectedEmployee.displayName || selectedEmployee.name || selectedEmployee.email || selectedEmployee.employeeId || '')
        : ''
      const nextName = !current.name.trim() || current.name.trim() === String(current.assignedEmployeeName || '').trim()
        ? nextAssignedEmployeeName
        : current.name

      return {
        ...current,
        name: nextName,
        assignedEmployeeUid: selectedEmployee?.uid || selectedEmployee?.id || '',
        assignedEmployeeId: selectedEmployee?.employeeId || '',
        assignedEmployeeName: nextAssignedEmployeeName,
        assignedEmployeeEmail: selectedEmployee?.email || '',
      }
    })
  }

  const handleCertificateTypeChange = (nextType) => {
    setForm((current) => {
      const currentMeta = getTypeMeta(current.certificateType)
      const nextMeta = getTypeMeta(nextType)
      const nextText =
        !current.certificateText || current.certificateText === currentMeta.defaultText
          ? nextMeta.defaultText
          : current.certificateText

      return {
        ...current,
        certificateType: nextType,
        certificateText: nextText,
        customTitle: nextType !== 'Other' ? '' : current.customTitle,
      }
    })
  }

  const uploadAsset = async (field, file) => {
    if (!file) return
    setUploadingField(field)
    setMessage('')
    setError('')

    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('Please sign in again to upload assets.')

      const formData = new FormData()
      formData.append('asset', file)

      const response = await fetch(api.uploadCertificateAsset, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await readApiJson(response)
      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.message || 'Failed to upload image.')
      }

      // Store the full URL in form state so <img src> previews work.
      // The backend API (createQrCertificate / updateQrCertificate) receives the raw URL
      // and handles normalization server-side before persisting to Firestore.
      setForm((current) => ({ ...current, [field]: data.url }))
      setMessage(`${field === 'signatureImageUrl' ? 'Signature' : 'Stamp'} uploaded.`)
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload image.')
    } finally {
      setUploadingField('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    // Normalize image URLs to relative /uploads/... paths before sending to backend.
    // The backend validator requires relative paths; the form stores full URLs for preview.
    const normalizedForm = {
      ...form,
      signatureImageUrl: normalizeCertificateAssetUrl(form.signatureImageUrl),
      stampImageUrl: normalizeCertificateAssetUrl(form.stampImageUrl),
    }

    try {
      if (editingId) {
        const savedCertificate = await updateQrCertificate(editingId, normalizedForm)
        // After save, map the returned record back to form state.
        // The record will have /uploads/... URLs; resolveAssetSrc() handles rendering them.
        setForm(mapCertificateToForm(savedCertificate))
        setPreviewCertificateId(savedCertificate.certificate_id || '')
        setMessage(
          savedCertificate.assignmentEmailSent
            ? 'QR certificate updated and employee notified by email.'
            : 'QR certificate updated.'
        )
      } else {
        const savedCertificate = await createQrCertificate(normalizedForm)
        setEditingId(savedCertificate.id || '')
        setForm(mapCertificateToForm(savedCertificate))
        setPreviewCertificateId(savedCertificate.certificate_id || '')
        setMessage(
          savedCertificate.assignmentEmailSent
            ? 'QR certificate created and employee notified by email.'
            : 'QR certificate created.'
        )
      }
    } catch (submitError) {
      setError(submitError.message || 'Unable to save QR certificate.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (certificate) => {
    setEditingId(certificate.id)
    setPreviewCertificateId(certificate.certificate_id || '')
    setForm(mapCertificateToForm(certificate))
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviewDownload = async (format) => {
    if (!downloadRef.current || !canDownloadPreview) return

    setDownloading(format)
    setMessage('')
    setError('')

    try {
      if (format === 'png') {
        await downloadCertificatePng(downloadRef.current, previewCertificate)
      } else {
        await downloadCertificatePdf(downloadRef.current, previewCertificate)
      }
    } catch (downloadError) {
      setError(downloadError.message || `Unable to download ${format.toUpperCase()}.`)
    } finally {
      setDownloading('')
    }
  }

  const handleToggleStatus = async (certificate) => {
    const nextStatus = certificate.status === 'active' ? 'revoked' : 'active'
    setBusyId(certificate.id)
    setMessage('')
    setError('')

    try {
      await toggleQrCertificateStatus(certificate.id, nextStatus)
      setMessage(`Certificate ${nextStatus === 'active' ? 'reactivated' : 'revoked'}.`)
    } catch (toggleError) {
      setError(toggleError.message || 'Unable to update certificate status.')
    } finally {
      setBusyId('')
    }
  }

  const handleDelete = async (certificate) => {
    const confirmed = window.confirm(`Delete QR certificate ${certificate.certificate_id}?`)
    if (!confirmed) return

    setBusyId(certificate.id)
    setMessage('')
    setError('')

    try {
      await deleteQrCertificate(certificate.id)
      if (editingId === certificate.id) {
        resetForm()
      }
      setMessage('QR certificate deleted.')
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete QR certificate.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_28px_80px_rgba(2,6,23,0.34)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
              <QrCode size={14} />
              QR Certificates
            </div>
            <h1 className="mt-4 text-3xl font-black text-white">Create QR-based certificates without touching the old system.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              These records stay isolated with <span className="font-semibold text-white">source = qr</span>, use the same public verification page, and can be revoked without affecting the manual certificate flow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[420px]">
            <StatCard label="Total QR Records" value={qrCertificates.length} />
            <StatCard label="Active" value={activeCount} tone="emerald" />
            <StatCard label="Revoked" value={revokedCount} tone="amber" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_64px_rgba(2,6,23,0.28)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Admin Form</p>
              <h2 className="mt-2 text-2xl font-black text-white">{editingId ? 'Edit QR Certificate' : 'Create QR Certificate'}</h2>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <RefreshCcw size={16} />
                Reset
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Scanner Number / Certificate ID (Optional)</span>
                <input
                  type="text"
                  value={form.certificate_id}
                  onChange={(event) => handleChange('certificate_id', event.target.value)}
                  placeholder="Leave empty for auto-generated ID"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!!editingId}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Enter holder name"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Certificate Type</span>
                <select
                  value={form.certificateType}
                  onChange={(event) => handleCertificateTypeChange(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-cyan-400/30 focus:outline-none"
                >
                  {CERTIFICATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.value} - {type.label}</option>
                  ))}
                </select>
              </label>

              {form.certificateType === 'Other' && (
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-300">Custom Purpose / Title</span>
                  <input
                    type="text"
                    value={form.customTitle}
                    onChange={(event) => handleChange('customTitle', event.target.value)}
                    placeholder="e.g. Winner Certificate, Codefest Participation"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none"
                    required
                  />
                </label>
              )}
            </div>

            <label className="block max-w-sm">
              <span className="text-sm font-semibold text-slate-300">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => handleChange('date', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-cyan-400/30 focus:outline-none"
                required
              />
            </label>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Assign Employee</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Assigned QR certificates appear on that employee&apos;s dashboard, and an email goes out automatically after save.
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                  Optional
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="block">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-300">Employee / Team Member</span>
                    <select
                      value={selectedEmployeeValue}
                      onChange={(event) => handleAssignedEmployeeChange(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-cyan-400/30 focus:outline-none"
                    >
                      <option value="">No employee assigned (External User)</option>
                      {employeeOptions.map((employee) => {
                        const optionValue = employee.uid || employee.id || employee.employeeId || employee.email || ''
                        const optionLabel = employee.displayName || employee.name || employee.email || employee.employeeId || 'Employee'
                        return (
                          <option key={optionValue} value={optionValue}>
                            {optionLabel}{employee.employeeId ? ` (${employee.employeeId})` : ''}{employee.role ? ` - ${employee.role}` : ''}
                          </option>
                        )
                      })}
                    </select>
                  </label>

                  {!selectedEmployeeValue && (
                    <label className="block mt-4">
                      <span className="text-xs font-semibold text-slate-400">External User Email (to send certificate)</span>
                      <input
                        type="email"
                        value={form.assignedEmployeeEmail}
                        onChange={(event) => handleChange('assignedEmployeeEmail', event.target.value)}
                        placeholder="email@example.com (Optional)"
                        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/30 focus:outline-none"
                      />
                    </label>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Assigned Details</p>
                  {form.assignedEmployeeName || form.assignedEmployeeEmail || form.assignedEmployeeId ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      {form.assignedEmployeeName ? (
                        <div className="flex items-center gap-2">
                          <UserRound size={15} className="text-cyan-200" />
                          <span>{form.assignedEmployeeName}</span>
                        </div>
                      ) : null}
                      {form.assignedEmployeeId ? (
                        <p className="font-mono text-xs text-slate-400">{form.assignedEmployeeId}</p>
                      ) : null}
                      {form.assignedEmployeeEmail ? (
                        <div className="flex items-center gap-2 break-all text-xs text-slate-400">
                          <Mail size={14} className="shrink-0 text-cyan-200" />
                          <span>{form.assignedEmployeeEmail}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">Certificate will stay unassigned until you select an employee.</p>
                  )}
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Certificate Text</span>
              <textarea
                rows={6}
                value={form.certificateText}
                onChange={(event) => handleChange('certificateText', event.target.value)}
                placeholder="Write what should appear inside the certificate"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Signature Customization</p>
                    <p className="mt-1 text-xs text-slate-400">Add custom name/role and upload sign image.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    <Upload size={16} />
                    {uploadingField === 'signatureImageUrl' ? 'Uploading...' : 'Upload Sign'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => uploadAsset('signatureImageUrl', event.target.files?.[0])}
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Signatory Name</span>
                    <input
                      type="text"
                      value={form.signatoryName}
                      onChange={(e) => handleChange('signatoryName', e.target.value)}
                      placeholder="e.g. Amit Patel"
                      className="mt-1.5 w-full rounded-xl border border-white/5 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/30 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Signatory Role</span>
                    <input
                      type="text"
                      value={form.signatoryRole}
                      onChange={(e) => handleChange('signatoryRole', e.target.value)}
                      placeholder="e.g. Founder & Director"
                      className="mt-1.5 w-full rounded-xl border border-white/5 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/30 focus:outline-none"
                    />
                  </label>
                </div>

                {form.signatureImageUrl ? (
                  <div className="mt-4 space-y-3">
                    <img
                      src={resolveAssetSrc(form.signatureImageUrl)}
                      alt="Signature preview"
                      className="h-28 w-full rounded-2xl border border-white/10 bg-white object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('signatureImageUrl', '')}
                      className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Remove Signature Image
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
                    No custom signature image (using default)
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Stamp Upload</p>
                    <p className="mt-1 text-xs text-slate-400">Optional company stamp or seal image.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    <Upload size={16} />
                    {uploadingField === 'stampImageUrl' ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => uploadAsset('stampImageUrl', event.target.files?.[0])}
                    />
                  </label>
                </div>
                {form.stampImageUrl ? (
                  <div className="mt-4 space-y-3">
                    <img
                      src={resolveAssetSrc(form.stampImageUrl)}
                      alt="Stamp preview"
                      className="h-28 w-full rounded-2xl border border-white/10 bg-white object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('stampImageUrl', '')}
                      className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Remove Stamp
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                    No stamp uploaded
                  </div>
                )}
              </div>
            </div>

            {message ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? <PencilLine size={16} /> : <Plus size={16} />}
              {submitting ? 'Saving...' : editingId ? 'Update Certificate' : 'Create Certificate'}
            </button>
          </form>
        </section>

        <aside className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_64px_rgba(2,6,23,0.28)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Live Preview</p>
              <h3 className="mt-2 text-2xl font-black text-white">Certificate image preview</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Form me jo details bharoge, wahi yahan certificate image ke roop me dikhega. Save ke baad real `QR-` ID ke saath same preview download bhi ho jayega.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
              {previewCertificate.certificate_id}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handlePreviewDownload('png')}
              disabled={!canDownloadPreview || downloading === 'png'}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileImage size={16} />
              {downloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
            </button>
            <button
              type="button"
              onClick={() => handlePreviewDownload('pdf')}
              disabled={!canDownloadPreview || downloading === 'pdf'}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText size={16} />
              {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/40 p-3">
            <div className="overflow-x-auto">
              <div className="mx-auto w-fit min-w-full">
                <CertificateDocument certificate={previewCertificate} template={certificateTemplate} />
              </div>
            </div>
          </div>

          {/* Hidden high-res export container — must be fixed+invisible so container queries resolve */}
          <div aria-hidden="true" style={{ position: 'fixed', top: '-9999px', left: 0, pointerEvents: 'none', zIndex: -9999 }}>
            <div ref={downloadRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px` }}>
              <CertificateDocument certificate={previewCertificate} template={certificateTemplate} />
            </div>
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_64px_rgba(2,6,23,0.28)]">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Module Notes</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Auto-generated IDs</p>
              <p className="mt-1 text-slate-400">Every new record gets a unique `QR-` certificate ID from the backend.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Verification link</p>
              <p className="mt-1 text-slate-400">Each QR points to `/verify/{'{certificate_id}'}` and reuses the shared verifier.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Employee delivery</p>
              <p className="mt-1 text-slate-400">When assigned, the certificate appears on the employee dashboard and the employee receives an email on save.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Revocation support</p>
              <p className="mt-1 text-slate-400">Revoked certificates stay searchable but show a revoked status on the public verify page.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_64px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">QR Registry</p>
            <h2 className="mt-2 text-2xl font-black text-white">Manage issued QR certificates</h2>
          </div>
          <p className="text-sm text-slate-400">Create, edit, revoke, or delete without affecting manual certificates.</p>
        </div>

        {groupedCertificates.sortedNames.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-semibold text-white">No QR certificates yet.</p>
            <p className="mt-2 text-sm text-slate-400">Create the first record from the form above and it will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {groupedCertificates.sortedNames.map((name) => (
              <details key={name} className="group rounded-[28px] border border-white/10 bg-slate-950/40" open={groupedCertificates.sortedNames.length < 5}>
                <summary className="flex cursor-pointer select-none items-center justify-between p-5 list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                      <UserRound size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{groupedCertificates.groups[name].length} Certificate(s)</p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-transform group-open:rotate-180">
                    <ChevronDown size={20} />
                  </div>
                </summary>
                
                <div className="border-t border-white/5 p-5 pt-0">
                  <div className="mt-5 flex flex-col gap-5">
                    {groupedCertificates.groups[name].map((certificate) => {
                      const verifyUrl = buildVerifyUrl(certificate.certificate_id, certificate.verifyUrl)
                      const isBusy = busyId === certificate.id
                      const isActive = certificate.status === 'active'

                      return (
                        <article key={certificate.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                          QR Verified Certificate
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] ${
                          isActive
                            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                            : 'border-amber-400/20 bg-amber-400/10 text-amber-200'
                        }`}>
                          {isActive ? 'Active' : 'Revoked'}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black text-white">{certificate.name || certificate.userName}</h3>
                      <p className="mt-2 text-sm text-slate-300">{certificate.certificateTypeLabel || getTypeMeta(certificate.certificateType).label}</p>
                      <p className="mt-4 break-all font-mono text-sm font-bold text-cyan-200">{certificate.certificate_id}</p>
                      {(certificate.assignedEmployeeName || certificate.assignedEmployeeEmail) ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
                            Assigned To
                          </span>
                          {certificate.assignedEmployeeName ? <span>{certificate.assignedEmployeeName}</span> : null}
                          {certificate.assignedEmployeeId ? <span className="font-mono text-xs text-slate-500">{certificate.assignedEmployeeId}</span> : null}
                          {certificate.assignedEmployeeEmail ? (
                            <span className="inline-flex items-center gap-1 text-xs text-cyan-300">
                              <Mail size={12} />{certificate.assignedEmployeeEmail}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {certificate.certificateText ? (
                        <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-400">{certificate.certificateText}</p>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Certificate Date</p>
                          <p className="mt-2 text-sm font-semibold text-white">{formatDisplayDate(certificate.rawDate || certificate.date)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Verify Link</p>
                          <a
                            href={verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                          >
                            <Link2 size={14} />
                            Open verify page
                          </a>
                        </div>
                      </div>

                      {(certificate.signatureImageUrl || certificate.stampImageUrl) ? (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {certificate.signatureImageUrl ? (
                            <img
                              src={resolveAssetSrc(certificate.signatureImageUrl)}
                              alt="Signature"
                              className="h-20 rounded-2xl border border-white/10 bg-white p-2 object-contain"
                            />
                          ) : null}
                          {certificate.stampImageUrl ? (
                            <img
                              src={resolveAssetSrc(certificate.stampImageUrl)}
                              alt="Stamp"
                              className="h-20 rounded-2xl border border-white/10 bg-white p-2 object-contain"
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white px-4 py-4">
                      <QRCodeCanvas value={verifyUrl || certificate.certificate_id} size={132} level="M" includeMargin />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(certificate)}
                      disabled={isBusy || exportTarget?.id === certificate.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PencilLine size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerExport(certificate, 'png')}
                      disabled={isBusy || exportTarget?.id === certificate.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={16} />
                      {exportTarget?.id === certificate.id && exportFormat === 'png' ? 'Exporting...' : 'PNG'}
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerExport(certificate, 'pdf')}
                      disabled={isBusy || exportTarget?.id === certificate.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={16} />
                      {exportTarget?.id === certificate.id && exportFormat === 'pdf' ? 'Exporting...' : 'PDF'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(certificate)}
                      disabled={isBusy || exportTarget?.id === certificate.id}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isActive
                          ? 'border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15'
                          : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15'
                      }`}
                    >
                      {isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      {isBusy ? 'Working...' : isActive ? 'Revoke' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(certificate)}
                      disabled={isBusy || exportTarget?.id === certificate.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </details>
    ))}
          </div>
        )}
      </section>

      {/* Hidden container for dynamic exports — must be fixed+invisible so container queries resolve */}
      <div aria-hidden="true" style={{ position: 'fixed', top: '-9999px', left: 0, pointerEvents: 'none', zIndex: -9999 }}>
        {exportTarget && (
          <div ref={exportRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px`, background: 'white' }}>
            <CertificateDocument certificate={exportTarget} template={certificateTemplate} />
          </div>
        )}
      </div>

    </div>
  )
}
