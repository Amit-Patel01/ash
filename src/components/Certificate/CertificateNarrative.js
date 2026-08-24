import {
  formatCertificateDate } from '../../utils/certificateHelpers'
import {
  AICTE_PREVIEW_CERTIFICATE_ID,
  AICTE_CERTIFICATE_PARAGRAPH } from './certificateConstants'

export const isAicteInternshipCertificate = (certificate = {}) => {
  const haystack = [
    certificate?.certificateType,
    certificate?.certificateTypeLabel,
    certificate?.documentLabel,
    certificate?.course,
    certificate?.courseName,
  ].filter(Boolean).join(' ').toLowerCase()

  return haystack.includes('aicte') && (haystack.includes('internship') || haystack.includes('certification') || haystack.includes('course')) && haystack.includes('completion')
}

export const formatAicteCertificateDate = (value) => {
  const parsed = value?.toDate?.() || new Date(value || '2026-05-10T00:00:00')
  const date = Number.isNaN(parsed.getTime()) ? new Date('2026-05-10T00:00:00') : parsed

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric' })
}

export const normalizeAicteParagraph = (value) => {
  const text = String(value || AICTE_CERTIFICATE_PARAGRAPH).trim()

  return text
    .replace(/\bThisis\b/g, 'This is')
    .replace(/\bcertifythat\b/g, 'certify that')
    .replace(/\bAICTEapproved\b/g, 'AICTE approved')
    .replace(/\bAICTEApproved\b/g, 'AICTE Approved')
    .replace(/\bcandidatehas\b/g, 'candidate has')
    .replace(/\bsuccessfullycompletedthe\b/g, 'successfully completed the')
    .replace(/\bsuccessfullycompleted\b/g, 'successfully completed')
    .replace(/\bcompletedthe\b/g, 'completed the')
    .replace(/\binternshipprogram\b/g, 'certification course program')
    .replace(/\bconductedby\b/g, 'conducted by')
    .replace(/\binternshipincludedguidedlearning\b/g, 'course included guided learning')
    .replace(/\bincludedguidedlearning\b/g, 'included guided learning')
    .replace(/\bguidedlearning\b/g, 'guided learning')
    .replace(/\bassignedprojectwork\b/g, 'assigned project work')
    .replace(/\bpracticaltraining\b/g, 'practical training')
    .replace(/\bperformanceevaluationwith\b/g, 'performance evaluation with')
    .replace(/\bverifiedparticipation\b/g, 'verified participation')
    .replace('AICTE approved internship program', 'AICTE-approved certification course program')
    .replace(/\s+/g, ' ')
}

export const resolveAicteCertificateId = (value) => {
  const certificateId = String(value || '').trim()
  return !certificateId || certificateId === 'QR-PREVIEW' ? AICTE_PREVIEW_CERTIFICATE_ID : certificateId
}

export const resolveAicteStatus = (certificate = {}) => {
  if (certificate?.isValid === false || String(certificate?.status || '').toLowerCase() === 'revoked') return 'Revoked'
  return 'Verified'
}

export const normalizeDisplayText = (value) =>
  String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bAICTEApproved\b/g, 'AICTE Approved')
    .replace(/\bAICTEapproved\b/g, 'AICTE approved')
    .replace(/\bInternshipCompletion\b/g, 'Certification Course Completion')
    .replace(/\bQRVerified\b/g, 'QR Verified')
    .replace(/\bMSMERegistered\b/g, 'MSME Registered')
    .replace(/\s+/g, ' ')
    .trim()

export function getDocumentNarrative(documentType, holderName, courseName, template, certificate) {
  const isQrCertificate = certificate?.source === 'qr' || String(certificate?.certificate_id || '').startsWith('QR-')
  const internshipRole = certificate?.internshipRole || courseName
  const internshipDuration = certificate?.internshipDuration || certificate?.planLabel || certificate?.duration || 'Structured program tenure'
  const joiningDate = formatCertificateDate(certificate?.joiningDate || certificate?.approval_date || certificate?.createdAt)
  const issueDate = formatCertificateDate(certificate?.rawDate || certificate?.approval_date || certificate?.createdAt || certificate?.date)

  if (isQrCertificate) {
    return {
      intro: 'This verified certificate is proudly presented to',
      highlight: holderName,
      paragraph:
        certificate?.certificateText ||
        `In recognition of ${holderName} for receiving the ${certificate?.certificateTypeLabel || courseName || 'verified certificate'} from ${template.organizationName}.`,
      chips: [
        { label: 'Certificate Type', value: certificate?.certificateTypeLabel || courseName },
        { label: 'Issue Date', value: issueDate },
        { label: 'Status', value: certificate?.statusDisplay || 'Active' },
      ] }
  }

  if (documentType === 'offer_letter') {
    return {
      intro: template.summaryLine,
      highlight: holderName,
      paragraph: `We are pleased to confirm the selection for ${internshipRole} under ${courseName} at ${template.organizationName}. This offer confirms eligibility for the upcoming certification course cycle, subject to onboarding completion and reporting compliance.`,
      chips: [
        { label: 'Role / Track', value: internshipRole },
        { label: 'Joining Date', value: joiningDate },
        { label: 'Program', value: courseName },
      ] }
  }

  if (documentType === 'internship_certificate') {
    return {
      intro: template.summaryLine,
      highlight: holderName,
      paragraph: `${template.bodyPrefix} ${courseName}. The course tenure covered ${internshipDuration}, guided milestones, practical assignments, and verified participation with ${template.organizationName}.`,
      chips: [
        { label: 'Course Domain', value: internshipRole },
        { label: 'Duration', value: internshipDuration },
        { label: 'Issued By', value: template.organizationName },
      ] }
  }

  return {
    intro: template.summaryLine,
    highlight: holderName,
    paragraph: `${template.bodyPrefix} ${courseName} ${template.bodySuffix}`,
    chips: [
      { label: 'Program', value: courseName },
      { label: 'Issued By', value: template.organizationName },
      { label: 'Verified Status', value: template.sealLabel },
    ] }
}
