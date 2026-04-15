import { QRCodeCanvas } from 'qrcode.react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import { hexToRgba, mergeCertificateTemplate } from '../../utils/certificateTemplate'
import {
  formatCertificateDate,
  getCertificateCourseName,
  getCertificateDocumentLabel,
  getCertificateDocumentType,
  getCertificateHolderName,
  getCertificateVerifyUrl,
} from '../../utils/certificateHelpers'

function CornerAccent({ position, accentColor, navyColor }) {
  const positions = {
    'top-left': { top: 'clamp(14px, 2cqw, 24px)', left: 'clamp(14px, 2cqw, 24px)' },
    'top-right': { top: 'clamp(14px, 2cqw, 24px)', right: 'clamp(14px, 2cqw, 24px)' },
    'bottom-left': { bottom: 'clamp(14px, 2cqw, 24px)', left: 'clamp(14px, 2cqw, 24px)' },
    'bottom-right': { bottom: 'clamp(14px, 2cqw, 24px)', right: 'clamp(14px, 2cqw, 24px)' },
  }

  const style = positions[position] || positions['top-left']
  const isTop = position.includes('top')
  const isLeft = position.includes('left')
  const borderSize = 'clamp(4px, 0.5cqw, 7px)'

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: 'clamp(52px, 7cqw, 104px)',
        height: 'clamp(52px, 7cqw, 104px)',
        borderTop: isTop ? `${borderSize} solid ${isLeft ? navyColor : accentColor}` : 'none',
        borderBottom: !isTop ? `${borderSize} solid ${isLeft ? accentColor : navyColor}` : 'none',
        borderLeft: isLeft ? `${borderSize} solid ${isTop ? navyColor : accentColor}` : 'none',
        borderRight: !isLeft ? `${borderSize} solid ${isTop ? accentColor : navyColor}` : 'none',
      }}
    />
  )
}

function DetailChip({ label, value, accentColor }) {
  if (!value) return null
  return (
    <div
      className="rounded-[18px] border px-4 py-2.5 text-left shadow-sm"
      style={{
        borderColor: hexToRgba(accentColor, 0.2),
        background: `linear-gradient(180deg, rgba(255,255,255,0.96), ${hexToRgba(accentColor, 0.05)})`,
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-[12px] font-semibold leading-snug text-slate-700">{value}</p>
    </div>
  )
}

function getDocumentNarrative(documentType, holderName, courseName, template, certificate) {
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
      ],
    }
  }

  if (documentType === 'offer_letter') {
    return {
      intro: template.summaryLine,
      highlight: holderName,
      paragraph: `We are pleased to confirm the selection for ${internshipRole} under ${courseName} at ${template.organizationName}. This offer confirms eligibility for the upcoming internship or training cycle, subject to onboarding completion and reporting compliance.`,
      chips: [
        { label: 'Role / Track', value: internshipRole },
        { label: 'Joining Date', value: joiningDate },
        { label: 'Program', value: courseName },
      ],
    }
  }

  if (documentType === 'internship_certificate') {
    return {
      intro: template.summaryLine,
      highlight: holderName,
      paragraph: `${template.bodyPrefix} ${courseName}. The internship tenure covered ${internshipDuration}, guided milestones, practical assignments, and verified participation with ${template.organizationName}.`,
      chips: [
        { label: 'Internship Domain', value: internshipRole },
        { label: 'Duration', value: internshipDuration },
        { label: 'Issued By', value: template.organizationName },
      ],
    }
  }

  return {
    intro: template.summaryLine,
    highlight: holderName,
    paragraph: `${template.bodyPrefix} ${courseName} ${template.bodySuffix}`,
    chips: [
      { label: 'Program', value: courseName },
      { label: 'Issued By', value: template.organizationName },
      { label: 'Verified Status', value: template.sealLabel },
    ],
  }
}

export default function CertificateDocument({ certificate, template, className = '' }) {
  const documentType = getCertificateDocumentType(certificate)
  const activeTemplate = mergeCertificateTemplate(certificate?.templateSnapshot || template, documentType)
  const accentColor = activeTemplate.accentColor || '#f59e0b'
  const navyColor = '#1e3a8a'
  const holderName = getCertificateHolderName(certificate)
  const courseName = getCertificateCourseName(certificate, activeTemplate)
  const documentLabel = getCertificateDocumentLabel(certificate, activeTemplate)
  const certificateId = certificate?.certificate_id || 'PENDING-ID'
  const verifyUrl = getCertificateVerifyUrl(certificateId)
  const issueDate = formatCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.date)
  const signatureName = activeTemplate.signatureName || certificate?.issuedByName || 'Amit Patel'
  const signatureRole = activeTemplate.signatureRole || certificate?.issuedByRole || 'Authorized Signatory'
  const signatureImage = certificate?.signatureImageUrl || founderSign
  const stampImage = certificate?.stampImageUrl || ''
  const narrative = getDocumentNarrative(documentType, holderName, courseName, activeTemplate, certificate)

  const holderFontSize =
    holderName.length > 28
      ? 'clamp(28px, 4cqw, 48px)'
      : holderName.length > 18
        ? 'clamp(34px, 4.8cqw, 58px)'
        : 'clamp(42px, 6cqw, 72px)'

  return (
    <div
      className={`relative isolate aspect-[1.414/1] w-full overflow-hidden rounded-[22px] bg-white text-slate-700 shadow-[0_20px_48px_rgba(15,23,42,0.14)] ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      <div className="absolute inset-[8px] rounded-[18px] border border-slate-200" />
      <div className="absolute inset-[18px] rounded-[14px] border border-slate-100" />
      <CornerAccent position="top-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="top-right" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-right" accentColor={accentColor} navyColor={navyColor} />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at top, ${hexToRgba(accentColor, 0.15)}, transparent 30%), radial-gradient(circle at bottom, ${hexToRgba(navyColor, 0.08)}, transparent 35%)`,
        }}
      />

      <img
        src={brandLogo}
        alt="Amit Solution Hub watermark"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
      />

      <div className="relative flex h-full flex-col px-[clamp(28px,3cqw,42px)] py-[clamp(22px,2.6cqw,34px)]">
        <header className="grid grid-cols-[1.2fr_auto_1fr] items-start gap-4">
          <div className="min-w-0">
            <img src={msmeBadge} alt="MSME" className="h-[clamp(48px,6.2cqw,82px)] w-auto object-contain" />
          </div>

          <div className="flex justify-center">
            <img src={brandLogo} alt="Amit Solution Hub" className="h-[clamp(46px,6cqw,84px)] w-auto object-contain" />
          </div>

          <div className="flex justify-end">
            <div
              className="rounded-full border px-4 py-2 text-right shadow-sm"
              style={{
                borderColor: hexToRgba(accentColor, 0.3),
                background: `linear-gradient(180deg, rgba(255,255,255,0.96), ${hexToRgba(accentColor, 0.09)})`,
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{activeTemplate.referenceLabel || 'Document ID'}</p>
              <p className="mt-1 text-[12px] font-black" style={{ color: navyColor }}>{certificateId}</p>
            </div>
          </div>
        </header>

        <div className="mt-[clamp(10px,1.8cqw,18px)] text-center">
          <p className="text-[clamp(11px,1.1cqw,14px)] font-black uppercase tracking-[0.38em]" style={{ color: accentColor }}>
            {activeTemplate.overline}
          </p>
          <h1
            className="mt-[clamp(8px,1cqw,14px)] font-bold uppercase leading-none"
            style={{
              color: navyColor,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(40px, 6.8cqw, 82px)',
            }}
          >
            {activeTemplate.title}
          </h1>
          <p className="mt-[clamp(6px,0.8cqw,10px)] text-[clamp(15px,1.9cqw,26px)] uppercase tracking-[0.32em] text-slate-400">
            {activeTemplate.subtitle}
          </p>
          <p className="mx-auto mt-[clamp(10px,1.4cqw,16px)] max-w-[78%] text-[clamp(15px,1.7cqw,22px)] italic leading-relaxed text-slate-500">
            {narrative.intro}
          </p>
        </div>

        <div className="mt-[clamp(12px,1.6cqw,20px)] text-center">
          <p
            className="font-bold leading-none"
            style={{
              color: navyColor,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: holderFontSize,
            }}
          >
            {narrative.highlight}
          </p>
        </div>

        <div className="mt-[clamp(10px,1.4cqw,16px)] grid min-h-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(220px,0.9fr)] gap-4">
          <div
            className="flex min-h-0 flex-col justify-between rounded-[28px] border border-slate-100 px-[clamp(18px,2cqw,24px)] py-[clamp(16px,1.7cqw,20px)] shadow-[0_10px_28px_rgba(148,163,184,0.13)]"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${hexToRgba(accentColor, 0.035)})`,
            }}
          >
            <div>
              <div className="flex items-center justify-center gap-3 text-center">
                <span className="h-px w-[12%]" style={{ backgroundColor: hexToRgba(accentColor, 0.55) }} />
                <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: accentColor }}>
                  {documentLabel}
                </p>
                <span className="h-px w-[12%]" style={{ backgroundColor: hexToRgba(accentColor, 0.55) }} />
              </div>
              <p className="mx-auto mt-[clamp(10px,1.2cqw,14px)] max-w-[92%] text-center text-[clamp(14px,1.58cqw,19px)] leading-[1.72] text-slate-600">
                {narrative.paragraph}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {narrative.chips.map((item) => (
                <DetailChip key={item.label} label={item.label} value={item.value} accentColor={accentColor} />
              ))}
            </div>
          </div>

          <div
            className="flex min-h-0 flex-col justify-between rounded-[28px] border border-slate-100 px-[clamp(16px,1.7cqw,22px)] py-[clamp(16px,1.7cqw,20px)]"
            style={{
              background: 'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.98))',
            }}
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Verification</p>
              <div className="mt-3 flex justify-center rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
                <QRCodeCanvas value={verifyUrl || certificateId} size={112} level="M" includeMargin={false} />
              </div>
              <p className="mt-3 text-center text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                Scan To Verify Online
              </p>
              <p className="mt-1.5 text-center text-[10px] leading-4 text-slate-500">{activeTemplate.footerNote}</p>
            </div>

            <div className="mt-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Issued Through</p>
              <p className="mt-2 text-[14px] font-semibold text-slate-800">{activeTemplate.organizationName}</p>
              <p className="mt-1 text-[12px] text-slate-500">{activeTemplate.supportEmail}</p>
            </div>
          </div>
        </div>

        <footer className="mt-[clamp(8px,1cqw,12px)] grid grid-cols-3 items-end gap-4">
          <div className="text-center">
            <p className="text-[clamp(18px,1.95cqw,24px)] font-bold text-slate-800">{issueDate}</p>
            <div className="mx-auto mt-2 h-px w-[72%] bg-slate-300" />
            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Date of Issue</p>
          </div>

          <div className="text-center">
            {stampImage ? (
              <div className="flex h-[56px] items-end justify-center">
                <img src={stampImage} alt="Official stamp" className="max-h-[56px] w-auto object-contain" />
              </div>
            ) : (
              <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                {activeTemplate.sealLabel}
              </p>
            )}
            <p className="mt-2 text-[13px] font-semibold text-slate-700">{activeTemplate.issuerName}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-slate-400">{activeTemplate.issuerRole}</p>
          </div>

          <div className="text-center">
            <div className="flex h-[46px] items-end justify-center">
              <img src={signatureImage} alt={signatureName} className="max-h-[46px] w-auto object-contain" />
            </div>
            <div className="mx-auto mt-2 h-px w-[72%] bg-slate-300" />
            <p className="mt-2 text-[13px] font-semibold text-slate-800">{signatureName}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.17em] text-slate-500">{signatureRole}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
