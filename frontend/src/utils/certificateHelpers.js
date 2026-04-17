import { getDocumentTypeMeta } from './certificateTemplate'

const KNOWN_UPLOAD_HOSTS = new Set([
  'backend-5u1w.onrender.com',
  'solutionhub-1.onrender.com',
])

export const formatCertificateDate = (value) => {
  if (!value) return new Date().toLocaleDateString('en-GB')

  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleDateString('en-GB')
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toLocaleDateString('en-GB') : parsed.toLocaleDateString('en-GB')
}

export const getCertificateDocumentType = (certificate) =>
  certificate?.documentType || certificate?.templateSnapshot?.documentType || 'certificate'

export const getCertificateDocumentLabel = (certificate, template) =>
  certificate?.documentLabel || template?.documentLabel || getDocumentTypeMeta(getCertificateDocumentType(certificate)).label

export const getCertificateHolderName = (certificate) =>
  certificate?.userName || certificate?.name || 'Student'

export const getCertificateCourseName = (certificate, template) =>
  certificate?.courseName || certificate?.course || template?.title || 'Course'

export const getCertificateVerifyUrl = (certificateId) => {
  if (!certificateId) return ''
  const isBrowser = typeof window !== 'undefined'
  const hostname = isBrowser ? window.location.hostname : ''
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const origin = isLocalhost && isBrowser ? window.location.origin : 'https://www.amitsolutionhub.com'
  return `${origin}/verify/${encodeURIComponent(certificateId)}`
}

export const normalizeCertificateAssetUrl = (value) => {
  const rawValue = String(value || '').trim()
  if (!rawValue) return ''

  if (rawValue.startsWith('/uploads/')) {
    return rawValue
  }

  try {
    const parsed = new URL(rawValue)
    if (parsed.pathname.startsWith('/uploads/') && KNOWN_UPLOAD_HOSTS.has(parsed.hostname)) {
      return parsed.pathname
    }
  } catch {
    return rawValue
  }

  return rawValue
}

export const getCertificateFilename = (certificate, extension) => {
  const certId = certificate?.certificate_id || 'document'
  const documentType = getCertificateDocumentType(certificate)
  const documentName = getDocumentTypeMeta(documentType).shortLabel
  const course = String(certificate?.courseName || certificate?.course || documentName || 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const safeExt = String(extension || 'png').replace(/^\./, '')
  return `${course || 'course'}-${certId}.${safeExt}`
}
