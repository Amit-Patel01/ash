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
  resolveCertificateAssetSrc,
} from '../../utils/certificateHelpers'
import OfferLetterDocument from './OfferLetterDocument'

const AICTE_LOGO_SRC = '/AICTE%20Logo%20Vector.svg%20.png'
const AICTE_PREVIEW_CERTIFICATE_ID = 'ASH-AICTE-2026-001'
const AICTE_CERTIFICATE_PARAGRAPH = 'This is to certify that the above-named candidate has successfully completed the AICTE-approved internship program conducted by Amit Solution Hub. The internship included guided learning, assigned project work, practical training, and performance evaluation with verified participation.'

const isAicteInternshipCertificate = (certificate = {}) => {
  const haystack = [
    certificate?.certificateType,
    certificate?.certificateTypeLabel,
    certificate?.documentLabel,
    certificate?.course,
    certificate?.courseName,
  ].filter(Boolean).join(' ').toLowerCase()

  return haystack.includes('aicte') && haystack.includes('internship') && haystack.includes('completion')
}

const formatAicteCertificateDate = (value) => {
  const parsed = value?.toDate?.() || new Date(value || '2026-05-10T00:00:00')
  const date = Number.isNaN(parsed.getTime()) ? new Date('2026-05-10T00:00:00') : parsed

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const normalizeAicteParagraph = (value) => {
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
    .replace(/\binternshipprogram\b/g, 'internship program')
    .replace(/\bconductedby\b/g, 'conducted by')
    .replace(/\binternshipincludedguidedlearning\b/g, 'internship included guided learning')
    .replace(/\bincludedguidedlearning\b/g, 'included guided learning')
    .replace(/\bguidedlearning\b/g, 'guided learning')
    .replace(/\bassignedprojectwork\b/g, 'assigned project work')
    .replace(/\bpracticaltraining\b/g, 'practical training')
    .replace(/\bperformanceevaluationwith\b/g, 'performance evaluation with')
    .replace(/\bverifiedparticipation\b/g, 'verified participation')
    .replace('AICTE approved internship program', 'AICTE-approved internship program')
    .replace(/\s+/g, ' ')
}

const resolveAicteCertificateId = (value) => {
  const certificateId = String(value || '').trim()
  return !certificateId || certificateId === 'QR-PREVIEW' ? AICTE_PREVIEW_CERTIFICATE_ID : certificateId
}

const resolveAicteStatus = (certificate = {}) => {
  if (certificate?.isValid === false || String(certificate?.status || '').toLowerCase() === 'revoked') return 'Revoked'
  return 'Verified'
}

const renderSpacedWords = (text) => {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  return words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      style={{
        display: 'inline-block',
        paddingRight: index === words.length - 1 ? 0 : '0.24em',
        whiteSpace: 'nowrap',
      }}
    >
      {word}
    </span>
  ))
}

const normalizeDisplayText = (value) =>
  String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bAICTEApproved\b/g, 'AICTE Approved')
    .replace(/\bAICTEapproved\b/g, 'AICTE approved')
    .replace(/\bInternshipCompletion\b/g, 'Internship Completion')
    .replace(/\bQRVerified\b/g, 'QR Verified')
    .replace(/\bMSMERegistered\b/g, 'MSME Registered')
    .replace(/\s+/g, ' ')
    .trim()

const textSafeStyle = {
  letterSpacing: 0,
  wordSpacing: '0.08em',
  whiteSpace: 'normal',
}

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
        {renderSpacedWords(normalizeDisplayText(label))}
      </p>
      <p
        className="mt-0.5 font-semibold leading-tight text-slate-700"
        style={{ fontSize: 'clamp(9px, 0.9cqw, 13px)', overflowWrap: 'anywhere' }}
      >
        {renderSpacedWords(normalizeDisplayText(value))}
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

function AicteInternshipCertificateDocument({ certificate, template, className = '' }) {
  const activeTemplate = mergeCertificateTemplate(certificate?.templateSnapshot || template, 'internship_certificate')
  const accentColor = activeTemplate.accentColor || '#c3912f'
  const navyColor = '#102f64'
  const greenColor = '#167044'
  const creamColor = '#fff7e8'
  const holderName = getCertificateHolderName(certificate)
  const certificateId = resolveAicteCertificateId(certificate?.certificate_id)
  const verifyUrl = getCertificateVerifyUrl(certificateId)
  const issueDate = formatAicteCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.rawDate || certificate?.date)
  const programLabel = 'Completion Certificate'
  const signatureName = certificate?.signatoryName || activeTemplate.signatureName || 'Amit Patel'
  const signatureRole = certificate?.signatoryRole || activeTemplate.signatureRole || 'Authorized Signatory'
  const signatureImage = resolveCertificateAssetSrc(normalizeCertificateAssetUrl(certificate?.signatureImageUrl)) || founderSign
  const stampImage = resolveCertificateAssetSrc(normalizeCertificateAssetUrl(certificate?.stampImageUrl)) || stempImage
  const statusLabel = resolveAicteStatus(certificate)
  const narrative = normalizeAicteParagraph(certificate?.certificateText || AICTE_CERTIFICATE_PARAGRAPH)

  const holderFontSize =
    holderName.length > 28
      ? 'clamp(30px, 3.9cqw, 48px)'
      : holderName.length > 18
        ? 'clamp(36px, 4.6cqw, 58px)'
        : 'clamp(42px, 5.6cqw, 74px)'

  return (
    <div
      className={`keep-light relative isolate aspect-[1.414/1] w-full overflow-hidden bg-white text-slate-700 shadow-[0_18px_42px_rgba(15,23,42,0.12)] ${className}`}
      style={{ containerType: 'inline-size', borderRadius: 'clamp(12px, 1.6cqw, 20px)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${creamColor}, rgba(255,255,255,0.98) 47%, ${hexToRgba(accentColor, 0.08)})`,
        }}
      />
      <div className="absolute inset-[0.9cqw] border-[0.24cqw]" style={{ borderColor: hexToRgba(accentColor, 0.36) }} />
      <div
        className="absolute inset-[1.8cqw] border"
        style={{ borderColor: hexToRgba(navyColor, 0.18), boxShadow: `inset 0 0 0 0.25cqw ${hexToRgba(accentColor, 0.1)}` }}
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-[1.1cqw]"
        style={{ background: `linear-gradient(180deg, ${accentColor}, ${greenColor})` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-[1.1cqw]"
        style={{ background: `linear-gradient(180deg, ${greenColor}, ${accentColor})` }}
      />

      <img
        src={AICTE_LOGO_SRC}
        alt="AICTE watermark"
        crossOrigin="anonymous"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
      />

      <div className="relative flex h-full flex-col p-[3.8cqw]">
        <header className="grid shrink-0 grid-cols-3 items-center gap-[2.1cqw]">
          <div
            className="flex h-[clamp(58px,6.8cqw,88px)] items-center gap-[1cqw] border bg-white/[0.88] shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
            style={{
              borderColor: hexToRgba(navyColor, 0.16),
              borderRadius: 'clamp(8px, 1cqw, 14px)',
              padding: 'clamp(7px, 0.85cqw, 12px) clamp(9px, 1.1cqw, 16px)',
            }}
          >
            <img
              src={AICTE_LOGO_SRC}
              alt="AICTE logo"
              crossOrigin="anonymous"
              className="h-[clamp(40px,5.1cqw,68px)] shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p
                className="font-black uppercase leading-tight"
                style={{ color: navyColor, fontSize: 'clamp(8px, 1cqw, 13px)' }}
              >
                {renderSpacedWords('AICTE Approved')}
              </p>
              <p
                className="mt-0.5 font-bold uppercase text-slate-500"
                style={{ fontSize: 'clamp(6.5px, 0.72cqw, 10px)', letterSpacing: 0 }}
              >
                Internship Program
              </p>
            </div>
          </div>

          <div className="flex h-[clamp(58px,6.8cqw,88px)] flex-col items-center justify-center text-center">
            <img
              src={brandLogo}
              alt="Amit Solution Hub"
              crossOrigin="anonymous"
              className="h-[clamp(38px,4.9cqw,68px)] w-auto object-contain"
            />
            <p
              className="mt-[0.4cqw] font-black uppercase"
              style={{ color: navyColor, fontSize: 'clamp(10px, 1.25cqw, 17px)', letterSpacing: 0 }}
            >
              {renderSpacedWords('Amit Solution Hub')}
            </p>
          </div>

          <div
            className="flex h-[clamp(58px,6.8cqw,88px)] items-center justify-end gap-[1cqw] border bg-white/[0.88] text-right shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
            style={{
              borderColor: hexToRgba(greenColor, 0.18),
              borderRadius: 'clamp(8px, 1cqw, 14px)',
              padding: 'clamp(7px, 0.85cqw, 12px) clamp(9px, 1.1cqw, 16px)',
            }}
          >
            <div>
              <p
                className="font-black uppercase leading-tight"
                style={{ color: greenColor, fontSize: 'clamp(8px, 1cqw, 13px)' }}
              >
                MSME
              </p>
              <p
                className="mt-0.5 font-bold uppercase text-slate-500"
                style={{ fontSize: 'clamp(6.5px, 0.72cqw, 10px)', letterSpacing: 0 }}
              >
                Registered
              </p>
            </div>
            <img
              src={msmeBadge}
              alt="MSME logo"
              crossOrigin="anonymous"
              className="h-[clamp(40px,5.1cqw,68px)] shrink-0 object-contain"
            />
          </div>
        </header>

        <section className="mt-[1.7cqw] shrink-0 text-center">
          <p
            className="font-black uppercase"
            style={{ color: accentColor, fontSize: 'clamp(8px, 1cqw, 13px)', letterSpacing: 0 }}
          >
            {renderSpacedWords('Official Training Credential')}
          </p>
          <h1
            className="mx-auto mt-[0.65cqw] max-w-[86%] font-bold uppercase leading-tight"
            style={{ color: navyColor, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(34px, 5.3cqw, 72px)', letterSpacing: 0 }}
          >
            Internship Completion Certificate
          </h1>
        
        </section>

        <main className="mt-[1.55cqw] grid min-h-0 flex-1 grid-cols-[minmax(0,0.68fr)_minmax(0,0.32fr)] items-stretch gap-[2cqw]">
          <section
            className="flex min-h-0 flex-col border bg-white/[0.94] shadow-[0_12px_28px_rgba(15,23,42,0.07)]"
            style={{
              borderColor: hexToRgba(navyColor, 0.14),
              borderRadius: 'clamp(10px, 1.4cqw, 18px)',
              padding: 'clamp(15px, 1.9cqw, 28px)',
            }}
          >
            <p
              className="text-center italic text-slate-500"
              style={{ fontSize: 'clamp(12px, 1.35cqw, 18px)', ...textSafeStyle }}
            >
              {renderSpacedWords('This certificate is proudly awarded to')}
            </p>
            <p
              className="mx-auto mt-[0.75cqw] max-w-[92%] text-center font-bold leading-none"
              style={{
                color: navyColor,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: holderFontSize,
                ...textSafeStyle,
                textTransform: 'capitalize',
                textShadow: `0 1px 0 ${hexToRgba(accentColor, 0.12)}`,
              }}
            >
              {renderSpacedWords(normalizeDisplayText(holderName))}
            </p>
            <p
              className="mt-[1.25cqw] flex-1 leading-[1.68] text-slate-600"
              style={{
                fontSize: 'clamp(11px, 1.34cqw, 18px)',
                textAlign: 'center',
                ...textSafeStyle,
                overflowWrap: 'break-word',
              }}
            >
              {renderSpacedWords(normalizeDisplayText(narrative))}
            </p>

            <div className="mt-[1.35cqw] grid grid-cols-3 items-stretch gap-[1cqw]">
              <DetailChip label="Program" value={programLabel} accentColor={accentColor} />
              <DetailChip label="Issued By" value={activeTemplate.organizationName} accentColor={accentColor} />
              <DetailChip label="Issue Date" value={issueDate} accentColor={accentColor} />
            </div>
          </section>

          <aside
            className="flex min-h-0 flex-col border bg-white/[0.92] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
            style={{
              borderColor: hexToRgba(greenColor, 0.14),
              borderRadius: 'clamp(10px, 1.4cqw, 18px)',
              padding: 'clamp(14px, 1.7cqw, 24px)',
            }}
          >
            <div className="text-center">
              <p
                className="font-black uppercase text-slate-400"
                style={{ fontSize: 'clamp(8px, 0.9cqw, 12px)', letterSpacing: 0 }}
              >
                QR Verified
              </p>
              <div
                className="mx-auto mt-[1.05cqw] flex w-fit justify-center border bg-white p-[0.85cqw] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                style={{ borderColor: hexToRgba(navyColor, 0.16), borderRadius: 'clamp(8px, 1cqw, 14px)' }}
              >
                <div style={{ width: 'clamp(70px, 9.2cqw, 122px)' }}>
                  <QRCodeCanvas
                    value={verifyUrl || certificateId}
                    size={256}
                    style={{ width: '100%', height: 'auto' }}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>

            <div className="mt-[1.4cqw] space-y-[0.8cqw]">
              <DetailChip label="Certificate ID" value={certificateId} accentColor={accentColor} />
              <DetailChip label="Status" value={statusLabel} accentColor={accentColor} />
            </div>

            <p
              className="mt-auto text-center text-slate-500"
              style={{ fontSize: 'clamp(7px, 0.78cqw, 10px)', lineHeight: 1.35 }}
            >
              {renderSpacedWords('Scan to validate online')}
            </p>
          </aside>
        </main>

        <footer className="mt-[2cqw] grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-start gap-[2.2cqw]">
          <div className="flex flex-col text-left">
            <div className="flex h-[5.8cqw] items-end">
              <p
                className="font-bold text-slate-800"
                style={{ fontSize: 'clamp(12px, 1.5cqw, 20px)', ...textSafeStyle }}
              >
                {issueDate}
              </p>
            </div>
            <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: hexToRgba(navyColor, 0.18) }} />
            <p
              className="mt-[0.65cqw] font-black uppercase text-slate-400"
              style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)', ...textSafeStyle }}
            >
              {renderSpacedWords('Date of Issue')}
            </p>
          </div>

          <div className="flex flex-col text-center">
            <div className="flex h-[5.8cqw] flex-col items-center justify-end">
              <p
                className="font-semibold"
                style={{ color: navyColor, fontSize: 'clamp(10px, 1.2cqw, 16px)', ...textSafeStyle }}
              >
                {renderSpacedWords(activeTemplate.organizationName)}
              </p>
              <p
                className="mt-[0.35cqw] font-bold uppercase text-slate-400"
                style={{ fontSize: 'clamp(7px, 0.7cqw, 10px)', ...textSafeStyle }}
              >
                {renderSpacedWords('Authorized Training Partner')}
              </p>
            </div>
            <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: hexToRgba(navyColor, 0.12) }} />
            <div className="mt-[0.65cqw] space-y-[0.2cqw] text-slate-500">
              <p className="font-semibold" style={{ fontSize: 'clamp(7.5px, 0.82cqw, 11px)', letterSpacing: 0, overflowWrap: 'anywhere' }}>
                www.amitsolutionhub.com
              </p>
              <p className="font-semibold" style={{ fontSize: 'clamp(7.5px, 0.82cqw, 11px)', letterSpacing: 0, overflowWrap: 'anywhere' }}>
                {activeTemplate.supportEmail || 'support@amitsolutionhub.com'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="relative flex h-[5.8cqw] w-full items-end justify-end overflow-visible">
              <img
                src={stampImage}
                alt="Official stamp"
                crossOrigin="anonymous"
                className="absolute bottom-[-0.1cqw] right-[43%] h-[clamp(46px,5.8cqw,82px)] w-auto object-contain opacity-85 mix-blend-multiply"
                style={{ transform: 'rotate(-12deg)', transformOrigin: 'center' }}
              />
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt={signatureName}
                  crossOrigin="anonymous"
                  className="relative z-10 max-h-[66%] w-auto object-contain mix-blend-multiply drop-shadow-[0_4px_8px_rgba(15,23,42,0.08)]"
                />
              ) : null}
            </div>
            <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: hexToRgba(navyColor, 0.18) }} />
            <p
              className="mt-[0.65cqw] font-semibold text-slate-800"
              style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
            >
              {renderSpacedWords(signatureName)}
            </p>
            <p
              className="mt-0.5 font-bold uppercase text-slate-400"
              style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
            >
              {renderSpacedWords(signatureRole)}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function CertificateDocument({ certificate, template, className = '' }) {
  const documentType = getCertificateDocumentType(certificate)
  
  if (documentType === 'offer_letter' || certificate?.certificateType === 'Offer Letter') {
    return <OfferLetterDocument certificate={certificate} template={template} className={className} />
  }

  if (isAicteInternshipCertificate(certificate)) {
    return <AicteInternshipCertificateDocument certificate={certificate} template={template} className={className} />
  }

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
  const signatureImage = resolveCertificateAssetSrc(normalizeCertificateAssetUrl(certificate?.signatureImageUrl)) || founderSign
  const stampImage = resolveCertificateAssetSrc(normalizeCertificateAssetUrl(certificate?.stampImageUrl)) || stempImage
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
      className={`keep-light relative isolate aspect-[1.414/1] w-full overflow-hidden bg-white text-slate-700 shadow-[0_20px_48px_rgba(15,23,42,0.14)] ${className}`}
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
                className="mt-[1.1cqw] text-center font-black uppercase tracking-[0.25cqw]"
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
