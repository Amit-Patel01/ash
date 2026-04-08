export const DEFAULT_CERTIFICATE_TEMPLATE = {
  certificatePrefix: 'AP',
  title: 'Certificate of Achievement',
  subtitle: 'Awarded for successful completion and verified performance.',
  organizationName: 'Amit Solution Hub',
  issuerName: 'Amit Patel',
  issuerRole: 'Founder & Program Director',
  signatureName: 'Amit Patel',
  signatureRole: 'Authorized Signatory',
  supportEmail: 'support@amitsolutionhub.com',
  sealLabel: 'Verified Certificate',
  footerNote: 'This credential can be verified online using the certificate ID.',
  accentColor: '#f59e0b',
}

export const mergeCertificateTemplate = (template = {}) => ({
  ...DEFAULT_CERTIFICATE_TEMPLATE,
  ...(template || {}),
})

export const hexToRgba = (hex, alpha = 1) => {
  const clean = String(hex || '').replace('#', '')
  if (clean.length !== 6) return `rgba(245, 158, 11, ${alpha})`

  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
