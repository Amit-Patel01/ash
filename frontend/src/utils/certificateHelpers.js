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

/**
 * Resolve a stored certificate asset URL (which may be a relative path like /uploads/...) to
 * a full URL suitable for use as an <img src>. In production the path is served by the backend;
 * on localhost it is proxied via Vite, so we prepend the API_BASE only when it is set.
 */
export const resolveCertificateAssetSrc = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/')) {
    // Avoid circular import: derive the API base directly from env vars rather than importing api.js.
    const envBase = (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
      ''
    ).trim().replace(/\/+$/, '')
    if (envBase) return `${envBase}${raw}`
    // In dev mode on localhost the Vite proxy handles /uploads/* → backend, so a relative path works.
    return raw
  }
  return raw
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
