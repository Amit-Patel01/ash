import { getDocumentTypeMeta } from './certificateTemplate'

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
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/verify?id=${encodeURIComponent(certificateId)}`
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
