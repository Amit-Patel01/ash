import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { getDocumentTypeMeta, hexToRgba, mergeCertificateTemplate } from '../utils/certificateTemplate'
import { CERTIFICATE_EXPORT_WIDTH, downloadCertificatePdf, downloadCertificatePng } from '../utils/certificateExport'
import { formatCertificateDate, getCertificateDocumentLabel, getCertificateDocumentType } from '../utils/certificateHelpers'
import CertificateDocument from '../components/certificates/CertificateDocument'

function CertificateCard({ certificate, templateState, currentUser, copiedId, onCopy }) {
  const previewRef = useRef(null)
  const [downloading, setDownloading] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const issueDate = formatCertificateDate(certificate.approval_date || certificate.createdAt)
  const documentType = getCertificateDocumentType(certificate)
  const template = useMemo(() => mergeCertificateTemplate(templateState, documentType), [templateState, documentType])
  const documentMeta = getDocumentTypeMeta(documentType)
  const documentLabel = getCertificateDocumentLabel(certificate, template)

  const handleDownload = async (format) => {
    try {
      setDownloading(format)
      if (format === 'png') {
        await downloadCertificatePng(previewRef.current, certificate)
      } else {
        await downloadCertificatePdf(previewRef.current, certificate)
      }
    } catch (error) {
      console.error(`Failed to download document ${format}:`, error)
      window.alert(`Unable to download document ${format.toUpperCase()} right now.`)
    } finally {
      setDownloading('')
    }
  }

  return (
    <div
      className="rounded-[32px] p-5 md:p-6 transition-all"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(template.accentColor, 0.18)}, rgba(15, 23, 42, 0.96))`,
        border: `1px solid ${hexToRgba(template.accentColor, 0.18)}`,
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: template.accentColor }}>
            {template.sealLabel}
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">{documentLabel}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Issued to {certificate.userName || currentUser?.displayName || 'Student'} on {issueDate}
          </p>
          <p className="mt-1 text-sm text-slate-400">{certificate.courseName || template.organizationName}</p>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
          Verified
        </span>
      </div>

      {/* Hidden high-res container for downloading — must be fixed+invisible so container queries resolve */}
      <div style={{ position: 'fixed', top: '-9999px', left: 0, pointerEvents: 'none', zIndex: -9999 }}>
        <div ref={previewRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px` }}>
          <CertificateDocument certificate={certificate} template={template} />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="relative w-full max-w-[1100px]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full shadow-[0_0_100px_rgba(255,255,255,0.05)] rounded-[28px] overflow-hidden bg-black">
              <CertificateDocument certificate={certificate} template={template} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Document ID</p>
          <p className="mt-3 break-all font-mono text-sm font-bold text-white">{certificate.certificate_id}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Issued By</p>
          <p className="mt-3 text-sm font-semibold text-white">{certificate.templateSnapshot?.issuerName || template.issuerName}</p>
          <p className="mt-1 text-xs text-slate-400">{certificate.templateSnapshot?.issuerRole || template.issuerRole}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Support</p>
          <p className="mt-3 text-sm font-semibold text-white">{certificate.templateSnapshot?.organizationName || template.organizationName}</p>
          <p className="mt-1 text-xs text-slate-400">{certificate.templateSnapshot?.supportEmail || template.supportEmail}</p>
        </div>
      </div>

      {(() => {
        const getCertDate = (c) => {
          if (c.approval_date?.seconds) return new Date(c.approval_date.seconds * 1000);
          if (c.approval_date) return new Date(c.approval_date);
          if (c.createdAt?.seconds) return new Date(c.createdAt.seconds * 1000);
          if (c.createdAt) return new Date(c.createdAt);
          return new Date();
        };
        const dateObj = getCertDate(certificate);
        const issueYear = dateObj.getFullYear();
        const issueMonth = dateObj.getMonth() + 1;
        const publicVerifyUrl = `${window.location.origin}/verify?id=${certificate.certificate_id}`;
        const linkedInAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(documentLabel)}&organizationName=${encodeURIComponent(template.organizationName || 'Amit Solution Hub')}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(publicVerifyUrl)}&certId=${encodeURIComponent(certificate.certificate_id)}`;
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicVerifyUrl)}`;
        const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm excited to share that I have completed the course "${certificate.courseName}" with Amit Solution Hub! You can verify my credential here:`)}&url=${encodeURIComponent(publicVerifyUrl)}`;

        return (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-2xl px-6 py-3 text-sm font-bold text-slate-950 transition-colors shadow-lg shadow-amber-500/20 animate-pulse hover:animate-none"
              style={{ backgroundColor: template.accentColor }}
            >
              View {documentMeta.shortLabel}
            </button>
            <Link
              to={`/verify?id=${certificate.certificate_id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Verify Link
            </Link>
            <button
              onClick={() => onCopy(certificate.certificate_id)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              {copiedId === certificate.certificate_id ? 'Copied ID' : 'Copy ID'}
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
            
            {/* Social Sharing integrations */}
            <a
              href={linkedInAddUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/15 flex items-center gap-1.5 shadow-lg shadow-blue-500/5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              Add to LinkedIn
            </a>
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-400/20 bg-slate-400/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-400/15 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              Share Feed
            </a>
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </a>
          </div>
        );
      })()}
    </div>
  )
}

export default function StudentCertificates() {
  const { certificates, certificateTemplate } = useStore()
  const { currentUser } = useAuth()
  const [copiedId, setCopiedId] = useState('')

  const myCertificates = useMemo(
    () => certificates.filter(cert => {
      if (cert.status !== 'approved' && cert.status !== 'active') return false
      const uid = currentUser?.uid
      const email = currentUser?.email
      // Standard course certificates use userId
      if (uid && cert.userId === uid) return true
      // QR certificates assigned to this employee/student
      if (uid && cert.assignedEmployeeUid === uid) return true
      // Email-based assignment (for external users or unlinked accounts)
      if (email && cert.assignedEmployeeEmail === email) return true
      return false
    }),
    [certificates, currentUser]
  )

  const handleCopy = async (certificateId) => {
    try {
      await navigator.clipboard.writeText(certificateId)
      setCopiedId(certificateId)
      window.setTimeout(() => setCopiedId(''), 1800)
    } catch (error) {
      console.error('Failed to copy certificate ID:', error)
    }
  }

  if (myCertificates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates & Letters</h1>
          <p className="text-sm text-gray-400 mt-1">Your issued certificates, internship credentials, and offer letters will appear here.</p>
        </div>

        <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-5">
            🏆
          </div>
          <h2 className="text-xl font-bold text-white">No documents yet</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Issued course certificates, internship certificates, and offer letters appear here with their verification links.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Link
              to="/student/my-courses"
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Go to My Courses
            </Link>
            <Link
              to="/courses"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 text-sm font-bold hover:bg-amber-400 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates & Letters</h1>
          <p className="text-sm text-gray-400 mt-1">
            {myCertificates.length} verified document{myCertificates.length !== 1 ? 's' : ''} ready to share, download, and verify
          </p>
        </div>
        <Link
          to="/student/my-courses"
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
        >
          Back to My Courses
        </Link>
      </div>

      <div className="space-y-6">
        {myCertificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            templateState={certificateTemplate}
            currentUser={currentUser}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  )
}
