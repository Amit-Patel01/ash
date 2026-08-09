'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { ChevronDown, Download, FileImage, FileText, Link2, Mail, PencilLine, Plus, QrCode, RefreshCcw, ShieldCheck, ShieldOff, Trash2, Upload, UserRound, Search, LayoutGrid, List } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { api, readApiJson, API_BASE } from '../config/api'
import CertificateDocument from '../components/Certificate'
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
    defaultText: 'This is to certify that the above-named candidate has successfully completed the AICTE-approved internship program conducted by Amit Solution Hub. The internship included guided learning, assigned project work, practical training, and performance evaluation with verified participation.'
  },
  {
    value: 'LOR',
    label: 'Letter of Recommendation',
    defaultText: 'This letter confirms that the holder demonstrated consistent performance, strong character, and reliable contribution. Based on observed work quality and professional conduct, this recommendation is issued in support of future academic or career opportunities.'
  },
  {
    value: 'LOA',
    label: 'Letter of Achievement',
    defaultText: 'This letter recognizes the holder for notable achievement, dedication, and measurable contribution. The holder successfully met expectations and demonstrated commitment, discipline, and excellence throughout the engagement period.'
  },
  {
    value: 'Appreciation',
    label: 'Appreciation Certificate',
    defaultText: 'This certificate is presented in appreciation of the holder for valuable contribution, sincerity, and professional attitude. The effort and commitment shown during the engagement are gratefully acknowledged by Amit Solution Hub.'
  },
  {
    value: 'Offer Letter',
    label: 'Offer Letter',
    defaultText: 'We are delighted to welcome you for the internship in Web Development at our organization. This internship is observed by Amit Solution Hub as being a learning opportunity for you, spanning a duration of 1 month.\n\nIn essence, your internship will embrace orientation and give emphasis on learning new skills with a deeper understanding of concepts through hands-on application of the knowledge you gain as an intern. Our team is confident that you will acknowledge your obligation to perform all work allocated to you to the best of your ability within lawful and reasonable direction given to you.\n\nWe look forward to a worthwhile and fruitful association which will make you equipped for future projects. Wishing you the most enjoyable and truly meaningful internship program experience.'
  },
  {
    value: 'Other',
    label: 'Other Certificate',
    defaultText: 'This certificate is proudly presented to acknowledge the holder\'s effort, performance, or participation. The organization recognizes and appreciates their valuable contribution.'
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
  assignedEmployeeRole: '',
  signatureImageUrl: '',
  signatoryName: '',
  signatoryRole: '',
  stampImageUrl: '',
  mentorSignatureImageUrl: '',
  mentorName: '',
  domain: '',
  duration: '',
  startDate: '',
  endDate: '',
  mode: ''
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
  assignedEmployeeRole: certificate.assignedEmployeeRole || '',
  signatureImageUrl: certificate.signatureImageUrl || '',
  signatoryName: certificate.signatoryName || '',
  signatoryRole: certificate.signatoryRole || '',
  stampImageUrl: certificate.stampImageUrl || '',
  mentorSignatureImageUrl: certificate.mentorSignatureImageUrl || '',
  mentorName: certificate.mentorName || '',
  domain: certificate.domain || '',
  duration: certificate.duration || '',
  startDate: certificate.startDate || '',
  endDate: certificate.endDate || '',
  mode: certificate.mode || ''
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
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">{label}</p>
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
    deleteQrCertificate } = useStore()

  const [form, setForm] = useState(createInitialForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [editingId, setEditingId] = useState('')
  const [previewCertificateId, setPreviewCertificateId] = useState('')
  const [busyId, setBusyId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [downloading, setDownloading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const downloadRef = useRef(null)
  const assigneeOptions = useMemo(() => {
    const selectableRoles = new Set(['employee', 'mentor', 'student', 'customer', 'client', 'user'])
    const prioritized = users.filter((user) => selectableRoles.has(String(user.role || '').trim().toLowerCase()))
    const fallback = users.filter((user) => String(user.role || '').trim().toLowerCase() !== 'admin')
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
    const query = searchQuery.toLowerCase().trim()

    qrCertificates.forEach(cert => {
      const name = cert.name || cert.userName || 'Unknown'
      const email = cert.assignedEmployeeEmail || cert.email || ''
      const cid = cert.certificate_id || ''

      if (query && !name.toLowerCase().includes(query) && !email.toLowerCase().includes(query) && !cid.toLowerCase().includes(query)) {
        return
      }

      if (!groups[name]) groups[name] = { items: [], email: '' }
      groups[name].items.push(cert)
      if (email && !groups[name].email) groups[name].email = email
    })

    const sortedNames = Object.keys(groups).sort()

    sortedNames.forEach(name => {
      groups[name].items.sort((a, b) => {
        const dateA = new Date(a.rawDate || a.date).getTime()
        const dateB = new Date(b.rawDate || b.date).getTime()
        return dateB - dateA
      })
    })

    return { groups, sortedNames }
  }, [qrCertificates, searchQuery])

  const editingCertificate = useMemo(
    () => qrCertificates.find((certificate) => certificate.id === editingId) || null,
    [editingId, qrCertificates]
  )
  const selectedEmployeeValue = useMemo(() => {
    const currentKeys = [form.assignedEmployeeUid, form.assignedEmployeeId, form.assignedEmployeeEmail]
      .filter(Boolean)
      .map((value) => String(value))
    if (currentKeys.length === 0) return ''

    const match = assigneeOptions.find((employee) =>
      [employee.uid, employee.id, employee.employeeId, employee.email]
        .filter(Boolean)
        .map((value) => String(value))
        .some((value) => currentKeys.includes(value))
    )

    return match ? (match.uid || match.id || match.employeeId || match.email || '') : ''
  }, [assigneeOptions, form.assignedEmployeeEmail, form.assignedEmployeeId, form.assignedEmployeeUid])
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
    mentorSignatureImageUrl: form.mentorSignatureImageUrl || '',
    mentorName: form.mentorName || '',
    verifyUrl: buildVerifyUrl(previewDisplayId),
    domain: form.domain || 'Web Development',
    duration: form.duration || '8 Weeks',
    startDate: form.startDate || '01 May 2026',
    endDate: form.endDate || '27 June 2026',
    mode: form.mode || 'Online'
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
    const selectedEmployee = assigneeOptions.find((employee) =>
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
        assignedEmployeeRole: selectedEmployee?.role || ''
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
        customTitle: nextType !== 'Other' ? '' : current.customTitle
      }
    })
  }

  const uploadAsset = async (field, file) => {
    if (!file) return
    setUploadingField(field)
    setMessage('')
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please sign in again to upload assets.')

      const formData = new FormData()
      formData.append('asset', file)

      const response = await fetch(api.uploadCertificateAsset, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await readApiJson(response)
      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.message || 'Failed to upload image.')
      }

      // Store the full URL in form state so <img src> previews work.
      // The backend API (createQrCertificate / updateQrCertificate) receives the raw URL
      // and handles normalization server-side before persisting to Firestore.
      setForm((current) => ({ ...current, [field]: data.url }))
      setMessage(`${field === 'signatureImageUrl' ? 'Signature' : field === 'mentorSignatureImageUrl' ? 'Mentor Signature' : 'Stamp'} uploaded.`)
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
      mentorSignatureImageUrl: normalizeCertificateAssetUrl(form.mentorSignatureImageUrl)
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
            ? 'QR certificate updated and assignee notified by email.'
            : 'QR certificate updated.'
        )
      } else {
        const savedCertificate = await createQrCertificate(normalizedForm)
        setEditingId(savedCertificate.id || '')
        setForm(mapCertificateToForm(savedCertificate))
        setPreviewCertificateId(savedCertificate.certificate_id || '')
        setMessage(
          savedCertificate.assignmentEmailSent
            ? 'QR certificate created and assignee notified by email.'
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
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-white shadow-[0_6px_16px_rgba(99,102,241,0.28)]">
              <QrCode size={14} />
              QR Certificates
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-900">Create QR-based certificates without touching the old system.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              These records stay isolated with <span className="font-semibold text-slate-900">source = qr</span>, use the same public verification page, and can be revoked without affecting the manual certificate flow.
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
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">Admin Form</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{editingId ? 'Edit QR Certificate' : 'Create QR Certificate'}</h2>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                <RefreshCcw size={16} />
                Reset
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Scanner Number / Certificate ID (Optional)</span>
                <input
                  type="text"
                  value={form.certificate_id}
                  onChange={(event) => handleChange('certificate_id', event.target.value)}
                  placeholder="Leave empty for auto-generated ID"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={!!editingId}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Enter holder name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Certificate Type</span>
                <select
                  value={form.certificateType}
                  onChange={(event) => handleCertificateTypeChange(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                >
                  {CERTIFICATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.value} - {type.label}</option>
                  ))}
                </select>
              </label>

              {form.certificateType === 'Other' && (
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Custom Purpose / Title</span>
                  <input
                    type="text"
                    value={form.customTitle}
                    onChange={(event) => handleChange('customTitle', event.target.value)}
                    placeholder="e.g. Winner Certificate, Codefest Participation"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    required
                  />
                </label>
              )}
              {form.certificateType === AICTE_INTERNSHIP_CERTIFICATE_TYPE && (
                <div className="md:col-span-2 grid gap-4 md:grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Internship Domain</span>
                    <input
                      type="text"
                      value={form.domain}
                      onChange={(event) => handleChange('domain', event.target.value)}
                      placeholder="e.g. Web Development"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Duration</span>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(event) => handleChange('duration', event.target.value)}
                      placeholder="e.g. 8 Weeks"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Mode</span>
                    <input
                      type="text"
                      value={form.mode}
                      onChange={(event) => handleChange('mode', event.target.value)}
                      placeholder="e.g. Online"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Start Date</span>
                    <input
                      type="text"
                      value={form.startDate}
                      onChange={(event) => handleChange('startDate', event.target.value)}
                      placeholder="e.g. 01 May 2026"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">End Date</span>
                    <input
                      type="text"
                      value={form.endDate}
                      onChange={(event) => handleChange('endDate', event.target.value)}
                      placeholder="e.g. 27 June 2026"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                </div>
              )}
            </div>

            <label className="block max-w-sm">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => handleChange('date', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                required
              />
            </label>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Assign Employee / Student</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Assigned QR certificates appear on that user&apos;s dashboard, and an email goes out automatically after save.
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-700">
                  Optional
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="block">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Employee / Student</span>
                    <select
                      value={selectedEmployeeValue}
                      onChange={(event) => handleAssignedEmployeeChange(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    >
                      <option value="">No user assigned (External User)</option>
                      {assigneeOptions.map((employee) => {
                        const optionValue = employee.uid || employee.id || employee.employeeId || employee.email || ''
                        const optionLabel = employee.displayName || employee.name || employee.email || employee.employeeId || 'User'
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
                      <span className="text-xs font-semibold text-slate-500">External User Email (to send certificate)</span>
                      <input
                        type="email"
                        value={form.assignedEmployeeEmail}
                        onChange={(event) => handleChange('assignedEmployeeEmail', event.target.value)}
                        placeholder="email@example.com (Optional)"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                      />
                    </label>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">Assigned Details</p>
                  {form.assignedEmployeeName || form.assignedEmployeeEmail || form.assignedEmployeeId ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {form.assignedEmployeeName ? (
                        <div className="flex items-center gap-2">
                          <UserRound size={15} className="text-cyan-700" />
                          <span>{form.assignedEmployeeName}</span>
                        </div>
                      ) : null}
                      {form.assignedEmployeeId ? (
                        <p className="font-mono text-xs text-slate-500">{form.assignedEmployeeId}</p>
                      ) : null}
                      {form.assignedEmployeeEmail ? (
                        <div className="flex items-center gap-2 break-all text-xs text-slate-500">
                          <Mail size={14} className="shrink-0 text-cyan-700" />
                          <span>{form.assignedEmployeeEmail}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">Certificate will stay unassigned until you select an employee or student.</p>
                  )}
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Certificate Text</span>
              <textarea
                rows={6}
                value={form.certificateText}
                onChange={(event) => handleChange('certificateText', event.target.value)}
                placeholder="Write what should appear inside the certificate"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Signature Customization</p>
                    <p className="mt-1 text-xs text-slate-500">Add custom name/role and upload sign image.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
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
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Signatory Name</span>
                    <input
                      type="text"
                      value={form.signatoryName}
                      onChange={(e) => handleChange('signatoryName', e.target.value)}
                      placeholder="e.g. Amit Patel"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Signatory Role</span>
                    <input
                      type="text"
                      value={form.signatoryRole}
                      onChange={(e) => handleChange('signatoryRole', e.target.value)}
                      placeholder="e.g. Founder & Director"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                    />
                  </label>
                </div>

                {form.signatureImageUrl ? (
                  <div className="mt-4 space-y-3">
                    <img
                      src={resolveAssetSrc(form.signatureImageUrl)}
                      alt="Signature preview"
                      className="h-28 w-full rounded-2xl border border-slate-200 bg-white object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('signatureImageUrl', '')}
                      className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                    >
                      Remove Signature Image
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-600">
                    No custom signature image (using default)
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Stamp Upload</p>
                    <p className="mt-1 text-xs text-slate-500">Optional company stamp or seal image.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
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
                      className="h-28 w-full rounded-2xl border border-slate-200 bg-white object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('stampImageUrl', '')}
                      className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                    >
                      Remove Stamp
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-600">
                    No stamp uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Mentor Signature</p>
                  <p className="mt-1 text-xs text-slate-500">Add mentor name and upload their signature image.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                  <Upload size={16} />
                  {uploadingField === 'mentorSignatureImageUrl' ? 'Uploading...' : 'Upload Mentor Sign'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => uploadAsset('mentorSignatureImageUrl', event.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="mt-4">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Mentor Name</span>
                  <input
                    type="text"
                    value={form.mentorName}
                    onChange={(e) => handleChange('mentorName', e.target.value)}
                    placeholder="e.g. Jay Patel"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
                  />
                </label>
              </div>

              {form.mentorSignatureImageUrl ? (
                <div className="mt-4 space-y-3">
                  <img
                    src={resolveAssetSrc(form.mentorSignatureImageUrl)}
                    alt="Mentor signature preview"
                    className="h-28 w-full rounded-2xl border border-slate-200 bg-white object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('mentorSignatureImageUrl', '')}
                    className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Remove Mentor Signature
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-600">
                  No mentor signature image (certificate will show founder signature only)
                </div>
              )}
            </div>

            {message ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_10px_24px_rgba(99,102,241,0.28)] transition hover:from-violet-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? <PencilLine size={16} /> : <Plus size={16} />}
              {submitting ? 'Saving...' : editingId ? 'Update Certificate' : 'Create Certificate'}
            </button>
          </form>
        </section>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">Live Preview</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Certificate image preview</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Whatever details you fill in the form will appear here as the certificate image. After saving, the same preview can also be downloaded with the real <code>QR-</code> ID.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-700">
              {previewCertificate.certificate_id}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handlePreviewDownload('png')}
              disabled={!canDownloadPreview || downloading === 'png'}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileImage size={16} />
              {downloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
            </button>
            <button
              type="button"
              onClick={() => handlePreviewDownload('pdf')}
              disabled={!canDownloadPreview || downloading === 'pdf'}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText size={16} />
              {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 p-3">
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

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">Module Notes</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm leading-6 text-slate-700">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">Auto-generated IDs</p>
              <p className="mt-1 text-slate-500">Every new record gets a unique `QR-` certificate ID from the backend.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">Verification link</p>
              <p className="mt-1 text-slate-500">Each QR points to `/verify/{'{certificate_id}'}` and reuses the shared verifier.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">Assigned delivery</p>
              <p className="mt-1 text-slate-500">When assigned, the certificate appears on the user dashboard and the assignee receives an email on save.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">Revocation support</p>
              <p className="mt-1 text-slate-500">Revoked certificates stay searchable but show a revoked status on the public verify page.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-600">QR Registry</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Manage issued QR certificates</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input
                type="text"
                placeholder="Search name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400/30 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <List size={15} />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <LayoutGrid size={15} />
                <span>Grid View</span>
              </button>
            </div>
          </div>
        </div>

        {groupedCertificates.sortedNames.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-900">No QR certificates yet.</p>
            <p className="mt-2 text-sm text-slate-500">Create the first record from the form above and it will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {groupedCertificates.sortedNames.map((name) => (
              <details key={name} className="group rounded-[28px] border border-slate-200 bg-slate-50" open={groupedCertificates.sortedNames.length < 5}>
                <summary className="flex cursor-pointer select-none items-center justify-between p-5 list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                      <UserRound size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {groupedCertificates.groups[name].items.length} Certificate{groupedCertificates.groups[name].items.length > 1 ? 's' : ''}
                        {groupedCertificates.groups[name].email ? <><span className="mx-2 text-slate-600">·</span><span className="text-cyan-600">{groupedCertificates.groups[name].email}</span></> : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-180">
                    <ChevronDown size={20} />
                  </div>
                </summary>

                <div className="border-t border-slate-200 p-5 pt-0">
                  <div className={`mt-5 ${viewMode === 'grid' ? 'grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-5'}`}>
                    {groupedCertificates.groups[name].items.map((certificate) => {
                      const verifyUrl = buildVerifyUrl(certificate.certificate_id, certificate.verifyUrl)
                      const isBusy = busyId === certificate.id
                      const isActive = certificate.status === 'active'

                      return (
                        <article key={certificate.id} className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all ${viewMode === 'grid' ? 'flex flex-col justify-between h-full' : ''}`}>
                          <div className={`flex flex-col gap-4 ${viewMode === 'grid' ? '' : 'md:flex-row md:items-center md:justify-between'}`}>
                            <div className="min-w-0 flex-1 flex flex-col gap-2">
                              {/* Badges: Type & Status */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                                  {certificate.certificateTypeLabel || getTypeMeta(certificate.certificateType).label || certificate.certificateType}
                                </span>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${isActive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                                  }`}>
                                  {isActive ? 'Active' : 'Revoked'}
                                </span>
                              </div>

                              {/* Certificate ID & Date */}
                              <div className="mt-1 flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-sm font-black text-cyan-700 bg-cyan-50 px-3 py-1 rounded-xl border border-cyan-200/80">
                                  {certificate.certificate_id}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold">
                                  Date: {formatDisplayDate(certificate.rawDate || certificate.date)}
                                </span>
                              </div>

                              {/* Verify Link */}
                              <div className="mt-1 flex items-center gap-3 text-xs">
                                <a
                                  href={verifyUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  <Link2 size={13} />
                                  Open verify page
                                </a>
                              </div>
                            </div>

                            {/* QR Code Canvas */}
                            <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-2 w-fit">
                              <QRCodeCanvas value={verifyUrl || certificate.certificate_id} size={96} level="M" includeMargin />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(certificate)}
                              disabled={isBusy || exportTarget?.id === certificate.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50 cursor-pointer"
                            >
                              <PencilLine size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerExport(certificate, 'png')}
                              disabled={isBusy || exportTarget?.id === certificate.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 transition disabled:opacity-50 cursor-pointer"
                            >
                              <Download size={14} />
                              {exportTarget?.id === certificate.id && exportFormat === 'png' ? 'Exporting...' : 'PNG'}
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerExport(certificate, 'pdf')}
                              disabled={isBusy || exportTarget?.id === certificate.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition disabled:opacity-50 cursor-pointer"
                            >
                              <Download size={14} />
                              {exportTarget?.id === certificate.id && exportFormat === 'pdf' ? 'Exporting...' : 'PDF'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(certificate)}
                              disabled={isBusy || exportTarget?.id === certificate.id}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer ${isActive
                                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                              {isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                              {isBusy ? 'Working...' : isActive ? 'Revoke' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(certificate)}
                              disabled={isBusy || exportTarget?.id === certificate.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2 size={14} />
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