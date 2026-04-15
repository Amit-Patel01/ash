import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Link2, PencilLine, Plus, QrCode, RefreshCcw, ShieldCheck, ShieldOff, Trash2, Upload } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { auth } from '../config/firebase'
import { api, readApiJson } from '../config/api'

const CERTIFICATE_TYPES = [
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
]

const getTypeMeta = (value) => CERTIFICATE_TYPES.find((type) => type.value === value) || CERTIFICATE_TYPES[0]

const createInitialForm = () => ({
  name: '',
  certificateType: 'LOR',
  date: new Date().toISOString().slice(0, 10),
  certificateText: getTypeMeta('LOR').defaultText,
  signatureImageUrl: '',
  stampImageUrl: '',
})

const formatDisplayDate = (value) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN')
}

const buildVerifyUrl = (certificateId, fallback = '') => {
  if (fallback) return fallback
  if (!certificateId || typeof window === 'undefined') return ''
  return `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`
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
    createQrCertificate,
    updateQrCertificate,
    toggleQrCertificateStatus,
    deleteQrCertificate,
  } = useStore()

  const [form, setForm] = useState(createInitialForm)
  const [editingId, setEditingId] = useState('')
  const [busyId, setBusyId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const activeCount = qrCertificates.filter(certificate => certificate.status === 'active').length
  const revokedCount = qrCertificates.filter(certificate => certificate.status === 'revoked').length

  const resetForm = () => {
    setForm(createInitialForm())
    setEditingId('')
  }

  const handleChange = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
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

    try {
      if (editingId) {
        await updateQrCertificate(editingId, form)
        setMessage('QR certificate updated.')
      } else {
        await createQrCertificate(form)
        setMessage('QR certificate created.')
      }
      resetForm()
    } catch (submitError) {
      setError(submitError.message || 'Unable to save QR certificate.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (certificate) => {
    setEditingId(certificate.id)
    setForm({
      name: certificate.name || certificate.userName || '',
      certificateType: certificate.certificateType || 'LOR',
      date: certificate.rawDate || certificate.date || new Date().toISOString().slice(0, 10),
      certificateText: certificate.certificateText || getTypeMeta(certificate.certificateType || 'LOR').defaultText,
      signatureImageUrl: certificate.signatureImageUrl || '',
      stampImageUrl: certificate.stampImageUrl || '',
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
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
                    <p className="text-sm font-semibold text-white">Signature Upload</p>
                    <p className="mt-1 text-xs text-slate-400">Optional signer image for the verify page.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    <Upload size={16} />
                    {uploadingField === 'signatureImageUrl' ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => uploadAsset('signatureImageUrl', event.target.files?.[0])}
                    />
                  </label>
                </div>
                {form.signatureImageUrl ? (
                  <img
                    src={form.signatureImageUrl}
                    alt="Signature preview"
                    className="mt-4 h-24 w-full rounded-2xl border border-white/10 bg-white object-contain p-2"
                  />
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                    No signature uploaded
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
                  <img
                    src={form.stampImageUrl}
                    alt="Stamp preview"
                    className="mt-4 h-24 w-full rounded-2xl border border-white/10 bg-white object-contain p-2"
                  />
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
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Module Notes</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Auto-generated IDs</p>
              <p className="mt-1 text-slate-400">Every new record gets a unique `QR-` certificate ID from the backend.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Verification link</p>
              <p className="mt-1 text-slate-400">Each QR points to `/verify/{'{certificate_id}'}` and reuses the shared verifier.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-semibold text-white">Revocation support</p>
              <p className="mt-1 text-slate-400">Revoked certificates stay searchable but show a revoked status on the public verify page.</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_64px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">QR Registry</p>
            <h2 className="mt-2 text-2xl font-black text-white">Manage issued QR certificates</h2>
          </div>
          <p className="text-sm text-slate-400">Create, edit, revoke, or delete without affecting manual certificates.</p>
        </div>

        {qrCertificates.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-semibold text-white">No QR certificates yet.</p>
            <p className="mt-2 text-sm text-slate-400">Create the first record from the form above and it will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {qrCertificates.map((certificate) => {
              const verifyUrl = buildVerifyUrl(certificate.certificate_id, certificate.verifyUrl)
              const isBusy = busyId === certificate.id
              const isActive = certificate.status === 'active'

              return (
                <article key={certificate.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
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
                              src={certificate.signatureImageUrl}
                              alt="Signature"
                              className="h-16 rounded-2xl border border-white/10 bg-white p-2 object-contain"
                            />
                          ) : null}
                          {certificate.stampImageUrl ? (
                            <img
                              src={certificate.stampImageUrl}
                              alt="Stamp"
                              className="h-16 rounded-2xl border border-white/10 bg-white p-2 object-contain"
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white px-4 py-4">
                      <QRCodeCanvas value={verifyUrl || certificate.certificate_id} size={132} level="M" includeMargin />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(certificate)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PencilLine size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(certificate)}
                      disabled={isBusy}
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
                      disabled={isBusy}
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
        )}
      </section>
    </div>
  )
}
