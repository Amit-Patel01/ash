'use client'
import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../context/AuthContext'
import { getDocumentTypeMeta, hexToRgba, mergeCertificateTemplate } from '../utils/certificateTemplate'
import { CERTIFICATE_EXPORT_WIDTH, downloadCertificatePdf, downloadCertificatePng } from '../utils/certificateExport'
import { formatCertificateDate, getCertificateDocumentLabel, getCertificateDocumentType } from '../utils/certificateHelpers'
import CertificateDocument from '../components/Certificate'
import { FileText, X, ExternalLink, Award, Folder } from 'lucide-react'


function CertificateCard({ certificate, templateState, currentUser, copiedId, onCopy, isGrid }) {
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

  // Google Drive Style PDF Document Viewer Modal
  const renderModal = () => (
    modalOpen && (
      <div 
        className="fixed inset-0 z-50 flex flex-col bg-slate-950/98 backdrop-blur-md text-white select-none animate-in fade-in duration-200" 
        onClick={() => setModalOpen(false)}
      >
        {/* PDF Header / Controls */}
        <div className="h-14 bg-slate-900/90 border-b border-white/5 px-4 md:px-6 flex items-center justify-between z-10 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-semibold text-sm truncate max-w-[200px] md:max-w-md">{documentLabel}.pdf</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading === 'pdf'}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition flex items-center justify-center"
              title="Download PDF"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={() => handleDownload('png')}
              disabled={downloading === 'png'}
              className="px-2.5 py-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition text-xs font-bold uppercase tracking-wider"
              title="Download PNG image"
            >
              PNG
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="ml-2 w-9 h-9 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-all font-black flex items-center justify-center text-sm"
              title="Close Document Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* PDF Page Canvas Wrapper */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center bg-slate-800/50">
          <div 
            className="w-full max-w-[1000px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden bg-white transform scale-[0.98] transition-transform duration-300 origin-top mt-2 md:mt-4" 
            onClick={e => e.stopPropagation()}
          >
            <CertificateDocument certificate={certificate} template={template} />
          </div>
        </div>
      </div>
    )
  )

  const renderCaptureContainer = () => (
    <div style={{ position: 'fixed', top: '-9999px', left: 0, pointerEvents: 'none', zIndex: -9999 }}>
      <div ref={previewRef} style={{ width: `${CERTIFICATE_EXPORT_WIDTH}px` }}>
        <CertificateDocument certificate={certificate} template={template} />
      </div>
    </div>
  )

  if (isGrid) {
    return (
      <div
        className="rounded-[28px] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between min-h-[260px] h-full bg-white shadow-[0_10px_30px_rgba(148,163,184,0.25)]"

        style={{
          background: `linear-gradient(135deg, ${hexToRgba(template.accentColor, 0.10)}, rgba(255, 255, 255, 0.98))`,
          border: `1px solid ${hexToRgba(template.accentColor, 0.25)}` }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: template.accentColor }}>
                {template.sealLabel}
              </p>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Verified
              </span>
            </div>
            
            <h2 className="mt-4 text-lg font-black text-slate-900 line-clamp-2 leading-snug">{documentLabel}</h2>
            {certificate.courseName && (
              <p className="mt-2 text-xs font-semibold truncate" style={{ color: template.accentColor }}>
                Course: {certificate.courseName}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Issued to: {certificate.userName || currentUser?.displayName || 'Student'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{issueDate}</p>
          </div>

          <div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white transition-colors text-center shadow-sm"
                style={{ backgroundColor: template.accentColor }}
              >
                View
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading === 'pdf'}
                className="flex-1 rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100 transition disabled:opacity-50"
              >
                {downloading === 'pdf' ? 'PDF...' : 'PDF'}
              </button>
              <Link
                href={`/verify?id=${certificate.certificate_id}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                title="Verify Credential Link"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </Link>

            </div>
          </div>
        </div>

        {renderCaptureContainer()}
        {renderModal()}
      </div>
    )
  }

  return (
    <div
      className="rounded-[32px] p-5 md:p-6 transition-all bg-white shadow-[0_10px_30px_rgba(148,163,184,0.25)]"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(template.accentColor, 0.12)}, rgba(255, 255, 255, 0.98))`,
        border: `1px solid ${hexToRgba(template.accentColor, 0.22)}` }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.34em]" style={{ color: template.accentColor }}>
            {template.sealLabel}
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">{documentLabel}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Issued to {certificate.userName || currentUser?.displayName || 'Student'} on {issueDate}
          </p>
          <p className="mt-1 text-sm text-slate-500">{certificate.courseName || template.organizationName}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
          Verified
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Document ID</p>
          <p className="mt-3 break-all font-mono text-sm font-bold text-slate-900">{certificate.certificate_id}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Issued By</p>
          <p className="mt-3 text-sm font-semibold text-slate-900">{certificate.templateSnapshot?.issuerName || template.issuerName}</p>
          <p className="mt-1 text-xs text-slate-500">{certificate.templateSnapshot?.issuerRole || template.issuerRole}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Support</p>
          <p className="mt-3 text-sm font-semibold text-slate-900">{certificate.templateSnapshot?.organizationName || template.organizationName}</p>
          <p className="mt-1 text-xs text-slate-500">{certificate.templateSnapshot?.supportEmail || template.supportEmail}</p>
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
              className="rounded-2xl px-6 py-3 text-sm font-bold text-white transition-colors shadow-lg"
              style={{ backgroundColor: template.accentColor }}
            >
              View {documentMeta.shortLabel}
            </button>
            <Link
              href={`/verify?id=${certificate.certificate_id}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Verify Link
            </Link>
            <button
              onClick={() => onCopy(certificate.certificate_id)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {copiedId === certificate.certificate_id ? 'Copied ID' : 'Copy ID'}
            </button>
            <button
              onClick={() => handleDownload('png')}
              disabled={downloading === 'png'}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading === 'png' ? 'Generating PNG...' : 'Download PNG'}
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading === 'pdf'}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </button>
            
            {/* Social Sharing integrations */}
            <a
              href={linkedInAddUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              Add to LinkedIn
            </a>
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              Share Feed
            </a>
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </a>
          </div>
        );
      })()}

      {renderCaptureContainer()}
      {renderModal()}
    </div>
  )
}

export default function UserCertificates() {
  const { certificates, certificateTemplate } = useStore()
  const { currentUser } = useAuth()
  const [copiedId, setCopiedId] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFolder, setSelectedFolder] = useState(null)

  const myCertificates = useMemo(
    () => certificates.filter(cert => {
      if (cert.status !== 'approved' && cert.status !== 'active') return false
      const uid = currentUser?.uid
      const email = currentUser?.email
      if (uid && cert.userId === uid) return true
      if (uid && cert.assignedEmployeeUid === uid) return true
      if (email && cert.assignedEmployeeEmail === email) return true
      return false
    }),
    [certificates, currentUser]
  )

  const groupedCertificates = useMemo(() => {
    const groups = {}
    myCertificates.forEach(cert => {
      const courseKey = cert.courseName || 'General / Other Credentials'
      if (!groups[courseKey]) {
        groups[courseKey] = []
      }
      groups[courseKey].push(cert)
    })
    return groups
  }, [myCertificates])

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
          <h1 className="text-2xl font-bold text-slate-900">Certificates & Letters</h1>
          <p className="text-sm text-slate-500 mt-1">Your issued certificates, internship credentials, and offer letters will appear here.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-[0_10px_30px_rgba(148,163,184,0.25)]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
            <Award className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No documents yet</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Issued course certificates, internship certificates, and offer letters appear here with their verification links.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Link
              href="/user/my-courses"
              className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Go to My Courses
            </Link>
            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold hover:opacity-90 transition-colors shadow-md"
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
          <div className="flex items-center gap-2">
            <h1 
              className={`text-2xl font-bold text-slate-900 transition-all ${selectedFolder ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={() => setSelectedFolder(null)}
            >
              Certificates & Letters
            </h1>
            {selectedFolder && (
              <>
                <span className="text-slate-400">/</span>
                <span className="text-sm font-semibold text-blue-600 max-w-[200px] truncate md:max-w-none">{selectedFolder}</span>
              </>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {selectedFolder 
              ? `${groupedCertificates[selectedFolder]?.length || 0} document(s) in this folder` 
              : `${myCertificates.length} verified documents ready to share, download, and verify`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedFolder && (
            <button
              onClick={() => setSelectedFolder(null)}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              ← Back to Folders
            </button>
          )}

          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              List
            </button>
          </div>
          
          <Link
            href="/user/my-courses"
            className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Back to My Courses
          </Link>
        </div>
      </div>

      {!selectedFolder ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedCertificates).map(([courseName, certList]) => (
            <div
              key={courseName}
              onClick={() => setSelectedFolder(courseName)}
              className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 hover:bg-slate-50 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(148,163,184,0.2)] flex items-center gap-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/60 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:rotate-6">
                <Folder className="w-8 h-8 text-amber-500" />
              </div>

              
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {courseName}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {certList.length} Verified Document{certList.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
            {(groupedCertificates[selectedFolder] || []).map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                templateState={certificateTemplate}
                currentUser={currentUser}
                copiedId={copiedId}
                onCopy={handleCopy}
                isGrid={viewMode === 'grid'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 