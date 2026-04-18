import { QRCodeCanvas } from 'qrcode.react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import stempImage from './Stemp.png'
import { hexToRgba, mergeCertificateTemplate } from '../../utils/certificateTemplate'
import {
  formatCertificateDate,
  getCertificateCourseName,
  getCertificateDocumentLabel,
  getCertificateDocumentType,
  getCertificateHolderName,
  getCertificateVerifyUrl,
  normalizeCertificateAssetUrl,
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
      className="border shadow-sm"
      style={{
        borderColor: hexToRgba(accentColor, 0.2),
        background: `linear-gradient(180deg, rgba(255,255,255,0.96), ${hexToRgba(accentColor, 0.05)})`,
        borderRadius: 'clamp(8px, 1.2cqw, 18px)',
        padding: 'clamp(4px, 0.5cqw, 8px) clamp(8px, 0.9cqw, 16px)',
        textAlign: 'left',
      }}
    >
      <p
        className="font-black uppercase tracking-[0.22em] text-slate-400"
        style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)' }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 font-semibold leading-tight text-slate-700"
        style={{ fontSize: 'clamp(9px, 0.9cqw, 13px)' }}
      >
        {value}
      </p>
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
  const signatureName = certificate?.signatoryName || activeTemplate.signatureName || certificate?.issuedByName || 'Amit Patel'
  const signatureRole = certificate?.signatoryRole || activeTemplate.signatureRole || certificate?.issuedByRole || 'Authorized Signatory'
  const signatureImage = normalizeCertificateAssetUrl(certificate?.signatureImageUrl) || founderSign
  const stampImage = normalizeCertificateAssetUrl(certificate?.stampImageUrl) || stempImage
  const narrative = getDocumentNarrative(documentType, holderName, courseName, activeTemplate, certificate)

  const holderFontSize =
    holderName.length > 28
      ? 'clamp(26px, 3.6cqw, 42px)'
      : holderName.length > 18
        ? 'clamp(30px, 4.2cqw, 52px)'
        : 'clamp(34px, 5cqw, 64px)'

  const borderRadiusBase = 'clamp(14px, 2cqw, 22px)'
  const standardGap = '1.8cqw'
  const titleGap = '0.6cqw'

  return (
    <div
      className={`relative isolate aspect-[1.414/1] w-full overflow-hidden bg-white text-slate-700 shadow-[0_20px_48px_rgba(15,23,42,0.14)] ${className}`}
      style={{ containerType: 'inline-size', borderRadius: borderRadiusBase }}
    >
      <div
        className="absolute inset-[0.8cqw] border border-slate-200"
        style={{ borderRadius: 'calc(0.85 * ' + borderRadiusBase + ')' }}
      />
      <div
        className="absolute inset-[1.6cqw] border border-slate-100"
        style={{ borderRadius: 'calc(0.7 * ' + borderRadiusBase + ')' }}
      />
      <CornerAccent position="top-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="top-right" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-right" accentColor={accentColor} navyColor={navyColor} />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${hexToRgba(accentColor, 0.1)}, transparent 35%), radial-gradient(circle at 50% 100%, ${hexToRgba(navyColor, 0.04)}, transparent 35%)`,
        }}
      />

      <img
        src={brandLogo}
        alt="Amit Solution Hub watermark"
        crossOrigin="anonymous"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"
      />

      <div className="relative flex h-full flex-col p-[3.8cqw]">
        <header className="grid grid-cols-3 items-start shrink-0">
          <div className="flex justify-start">
            <img src={msmeBadge} alt="MSME" crossOrigin="anonymous" className="h-[clamp(44px,5.4cqw,72px)] w-auto object-contain" />
          </div>

          <div className="flex justify-center">
            <img src={brandLogo} alt="Amit Solution Hub" crossOrigin="anonymous" className="h-[clamp(42px,5.2cqw,76px)] w-auto object-contain" />
          </div>

          <div className="flex justify-end">
            <div
              className="border text-right shadow-sm"
              style={{
                borderColor: hexToRgba(accentColor, 0.15),
                background: `linear-gradient(180deg, rgba(255,255,255,0.95), ${hexToRgba(accentColor, 0.04)})`,
                borderRadius: 'clamp(12px, 1.5cqw, 32px)',
                padding: 'clamp(6px, 0.8cqw, 12px) clamp(10px, 1.2cqw, 20px)',
              }}
            >
              <p
                className="font-black uppercase tracking-[0.22em] text-slate-400"
                style={{ fontSize: 'clamp(6.5px, 0.7cqw, 10px)' }}
              >
                {activeTemplate.referenceLabel || 'Certificate ID'}
              </p>
              <p
                className="mt-0.5 font-black"
                style={{ color: navyColor, fontSize: 'clamp(9px, 0.95cqw, 14px)' }}
              >
                {certificateId}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-[2cqw] text-center shrink-0">
          <p
            className="font-bold uppercase tracking-[0.3cqw]"
            style={{
              color: accentColor,
              fontSize: 'clamp(9px, 1.1cqw, 14px)',
              fontFamily: 'Georgia, serif',
            }}
          >
            OFFICIAL CERTIFICATION
          </p>
          <div style={{ marginTop: titleGap }}>
            <h1
              className="font-bold uppercase leading-none"
              style={{
                color: navyColor,
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(44px, 7.2cqw, 92px)',
              }}
            >
              CERTIFICATE
            </h1>
            <p
              className="font-bold uppercase tracking-[0.18cqw] text-slate-400"
              style={{
                marginTop: titleGap,
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(12px, 1.7cqw, 24px)',
              }}
            >
              OF ACHIEVEMENT
            </p>
          </div>
          <p
            className="mx-auto max-w-[85%] italic leading-snug text-slate-500"
            style={{ fontSize: 'clamp(14px, 1.6cqw, 21px)', marginTop: standardGap }}
          >
            {narrative.intro}
          </p>
          <p
            className="font-bold leading-tight"
            style={{
              color: navyColor,
              fontFamily: 'Georgia, serif',
              fontSize: holderFontSize,
              marginTop: titleGap,
            }}
          >
            {narrative.highlight}
          </p>
        </div>

        <div className="mt-[2.5cqw] grid min-h-0 flex-1 grid-cols-[0.65fr_0.35fr] gap-[2cqw]">
          <div
            className="flex min-h-0 flex-col justify-between border border-slate-100 shadow-[0_10px_32px_rgba(15,23,42,0.06)]"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${hexToRgba(accentColor, 0.03)})`,
              borderRadius: 'clamp(14px, 1.8cqw, 24px)',
              padding: 'clamp(14px, 1.8cqw, 26px) clamp(16px, 2.2cqw, 32px)',
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-[0.8cqw]">
                <span className="h-px w-8" style={{ backgroundColor: hexToRgba(accentColor, 0.5) }} />
                <p
                  className="font-black uppercase tracking-[0.2cqw]"
                  style={{ color: accentColor, fontSize: 'clamp(8px, 0.9cqw, 13px)' }}
                >
                  {documentLabel}
                </p>
              </div>
              <p
                className="mt-[1.2cqw] text-left leading-[1.72] text-slate-600"
                style={{ fontSize: 'clamp(12px, 1.45cqw, 19px)', textAlign: 'justify' }}
              >
                {narrative.paragraph}
              </p>
            </div>

            <div className="mt-[1.5cqw] grid grid-cols-3 gap-[1cqw]">
              {narrative.chips.map((item) => (
                <DetailChip
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </div>

          <div
            className="flex min-h-0 flex-col justify-start border border-slate-100"
            style={{
              background: 'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.98))',
              borderRadius: 'clamp(14px, 1.8cqw, 24px)',
              padding: 'clamp(14px, 1.8cqw, 26px)',
            }}
          >
            <div className="flex flex-col items-center justify-start">
              <p
                className="mb-[1.2cqw] font-black uppercase tracking-[0.2cqw] text-slate-400"
                style={{ fontSize: 'clamp(8px, 0.9cqw, 13px)' }}
              >
                Verification
              </p>
              <div
                className="flex justify-center border border-slate-200 bg-white p-[0.8cqw] shadow-sm"
                style={{ borderRadius: 'clamp(10px, 1.3cqw, 20px)' }}
              >
                <div style={{ width: 'clamp(64px, 9.5cqw, 128px)' }}>
                  <QRCodeCanvas
                    value={verifyUrl || certificateId}
                    size={256}
                    style={{ width: '100%', height: 'auto' }}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
              <p
                className="mt-[1.2cqw] text-center font-black uppercase tracking-[0.18cqw]"
                style={{ color: accentColor, fontSize: 'clamp(8px, 0.9cqw, 13px)' }}
              >
                Scan To Verify Online
              </p>
            </div>

            <div
              className="mt-auto border border-slate-200 bg-white shadow-sm"
              style={{
                padding: 'clamp(10px, 1.2cqw, 20px)',
                borderRadius: 'clamp(10px, 1.3cqw, 18px)',
              }}
            >
              <p
                className="font-black text-slate-400 uppercase tracking-widest"
                style={{ fontSize: 'clamp(6px, 0.65cqw, 9px)' }}
              >
                Issued Through
              </p>
              <p
                className="mt-1.5 font-semibold text-slate-800"
                style={{ fontSize: 'clamp(10px, 1.1cqw, 14px)' }}
              >
                {activeTemplate.organizationName}
              </p>
              <p
                className="mt-0.5 text-slate-400"
                style={{ fontSize: 'clamp(8px, 0.85cqw, 11px)' }}
              >
                {activeTemplate.supportEmail}
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-[3.5cqw] grid grid-cols-3 items-end shrink-0">
          <div className="flex flex-col items-start text-left">
            <div className="flex h-[6cqw] items-end">
              <p
                className="font-bold text-slate-800"
                style={{ fontSize: 'clamp(14px, 2cqw, 24px)' }}
              >
                {issueDate}
              </p>
            </div>
            <div className="mt-[0.6cqw] h-px w-full bg-slate-200" />
            <p
              className="mt-[0.8cqw] font-black uppercase tracking-[0.2cqw] text-slate-400"
              style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)' }}
            >
              Date of Issue
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-[6cqw] items-end justify-center">
              <img
                src={stampImage}
                alt="Official stamp"
                crossOrigin="anonymous"
                className="max-h-full w-auto object-contain brightness-[0.98] contrast-[1.05]"
              />
            </div>
            <div className="mt-[0.6cqw] h-px w-full opacity-0" />
            <p
              className="mt-[0.8cqw] font-semibold text-slate-800"
              style={{ fontSize: 'clamp(10px, 1cqw, 14px)' }}
            >
              {activeTemplate.issuerName || signatureName}
            </p>
            <p
              className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
              style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)' }}
            >
              {activeTemplate.issuerRole || 'Founder & Director'}
            </p>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="flex h-[6cqw] items-end justify-end">
              <img
                src={signatureImage}
                alt={signatureName}
                crossOrigin="anonymous"
                className="max-h-full w-auto object-contain"
              />
            </div>
            <div className="mt-[0.6cqw] h-px w-full bg-slate-200" />
            <p
              className="mt-[0.8cqw] font-semibold text-slate-800"
              style={{ fontSize: 'clamp(10px, 1cqw, 14px)' }}
            >
              {signatureName}
            </p>
            <p
              className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
              style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)' }}
            >
              {signatureRole}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
