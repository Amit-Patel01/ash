export const DOCUMENT_TYPES = [
  { id: 'certificate', label: 'Course Certificate', shortLabel: 'Certificate' },
  { id: 'internship_certificate', label: 'Internship Certificate', shortLabel: 'Internship Certificate' },
  { id: 'offer_letter', label: 'Offer Letter', shortLabel: 'Offer Letter' },
]

const SHARED_TEMPLATE_DEFAULTS = {
  organizationName: 'Amit Solution Hub',
  issuerName: 'Amit Patel',
  issuerRole: 'Founder & Program Director',
  signatureName: 'Amit Patel',
  signatureRole: 'Authorized Signatory',
  supportEmail: 'support@amitsolutionhub.com',
  footerNote: 'This credential can be verified online using the document ID.',
  accentColor: '#f59e0b',
}

const DOCUMENT_TEMPLATE_DEFAULTS = {
  certificate: {
    documentType: 'certificate',
    documentLabel: 'Course Certificate',
    certificatePrefix: 'AP',
    title: 'Certificate',
    subtitle: 'of Achievement',
    sealLabel: 'Verified Certificate',
    overline: 'Official Certification',
    summaryLine: 'This certificate is proudly presented to',
    bodyPrefix: 'For the dedicated completion of',
    bodySuffix: 'with verified performance, commitment, and successful participation.',
    referenceLabel: 'Certificate ID',
  },
  internship_certificate: {
    documentType: 'internship_certificate',
    documentLabel: 'Internship Certificate',
    certificatePrefix: 'INT',
    title: 'Internship',
    subtitle: 'Certificate',
    sealLabel: 'Verified Internship',
    overline: 'Industrial Training Credential',
    summaryLine: 'This internship certificate is awarded to',
    bodyPrefix: 'For successfully completing the internship program in',
    bodySuffix: 'with active learning, assigned project work, and verified participation.',
    referenceLabel: 'Internship ID',
  },
  offer_letter: {
    documentType: 'offer_letter',
    documentLabel: 'Offer Letter',
    certificatePrefix: 'OFL',
    title: 'Offer',
    subtitle: 'Letter',
    sealLabel: 'Official Offer',
    overline: 'Selection Confirmation',
    summaryLine: 'This letter is issued in favour of',
    bodyPrefix: 'Selected for the internship / training role in',
    bodySuffix: 'subject to platform rules, reporting timelines, and onboarding compliance.',
    referenceLabel: 'Offer Ref',
  },
}

const LEGACY_TEMPLATE_KEYS = [
  'certificatePrefix',
  'title',
  'subtitle',
  'organizationName',
  'issuerName',
  'issuerRole',
  'signatureName',
  'signatureRole',
  'supportEmail',
  'sealLabel',
  'footerNote',
  'accentColor',
  'documentLabel',
  'overline',
  'summaryLine',
  'bodyPrefix',
  'bodySuffix',
  'referenceLabel',
]

const pickLegacyTemplateOverrides = (template = {}) =>
  LEGACY_TEMPLATE_KEYS.reduce((acc, key) => {
    if (template?.[key] !== undefined) acc[key] = template[key]
    return acc
  }, {})

const mergeVariant = (documentType, incoming = {}) => ({
  ...SHARED_TEMPLATE_DEFAULTS,
  ...(DOCUMENT_TEMPLATE_DEFAULTS[documentType] || DOCUMENT_TEMPLATE_DEFAULTS.certificate),
  ...(incoming || {}),
  documentType,
})

export const normalizeCertificateTemplate = (template = {}) => {
  const base = template || {}
  const templates = { ...(base.templates || {}) }
  const legacyOverrides = base.templates ? {} : pickLegacyTemplateOverrides(base)

  return {
    activeType: base.activeType || 'certificate',
    templates: {
      certificate: mergeVariant('certificate', {
        ...legacyOverrides,
        ...(templates.certificate || {}),
      }),
      internship_certificate: mergeVariant('internship_certificate', templates.internship_certificate || {}),
      offer_letter: mergeVariant('offer_letter', templates.offer_letter || {}),
    },
  }
}

export const DEFAULT_CERTIFICATE_TEMPLATE = normalizeCertificateTemplate()

export const getDocumentTypeMeta = (documentType) =>
  DOCUMENT_TYPES.find(item => item.id === documentType) || DOCUMENT_TYPES[0]

export const mergeCertificateTemplate = (template = {}, documentType = 'certificate') => {
  const normalized = normalizeCertificateTemplate(template)
  const resolvedType = normalized.templates?.[documentType]
    ? documentType
    : normalized.activeType || 'certificate'

  return {
    ...normalized.templates[resolvedType],
    activeType: resolvedType,
    templates: normalized.templates,
  }
}

export const updateTemplateVariant = (templateState = {}, documentType = 'certificate', updates = {}) => {
  const normalized = normalizeCertificateTemplate(templateState)
  return {
    ...normalized,
    activeType: documentType,
    templates: {
      ...normalized.templates,
      [documentType]: mergeVariant(documentType, {
        ...normalized.templates[documentType],
        ...(updates || {}),
      }),
    },
  }
}

export const hexToRgba = (hex, alpha = 1) => {
  const clean = String(hex || '').replace('#', '')
  if (clean.length !== 6) return `rgba(245, 158, 11, ${alpha})`

  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
