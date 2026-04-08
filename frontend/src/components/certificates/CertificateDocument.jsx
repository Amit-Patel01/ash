import { QRCodeCanvas } from 'qrcode.react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import { hexToRgba, mergeCertificateTemplate } from '../../utils/certificateTemplate'
import {
  formatCertificateDate,
  getCertificateCourseName,
  getCertificateHolderName,
  getCertificateVerifyUrl,
} from '../../utils/certificateHelpers'

function CornerAccent({ position, accentColor, navyColor }) {
  const positions = {
    'top-left': { top: 'clamp(12px, 2vw, 24px)', left: 'clamp(12px, 2vw, 24px)' },
    'top-right': { top: 'clamp(12px, 2vw, 24px)', right: 'clamp(12px, 2vw, 24px)' },
    'bottom-left': { bottom: 'clamp(12px, 2vw, 24px)', left: 'clamp(12px, 2vw, 24px)' },
    'bottom-right': { bottom: 'clamp(12px, 2vw, 24px)', right: 'clamp(12px, 2vw, 24px)' },
  }

  const style = positions[position] || positions['top-left']
  const isTop = position.includes('top')
  const isLeft = position.includes('left')
  
  const borderSize = 'clamp(4px, 0.6vw, 8px)'

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: 'clamp(40px, 8vw, 100px)',
        height: 'clamp(40px, 8vw, 100px)',
        borderTop: isTop ? `${borderSize} solid ${isLeft ? navyColor : accentColor}` : 'none',
        borderBottom: !isTop ? `${borderSize} solid ${isLeft ? accentColor : navyColor}` : 'none',
        borderLeft: isLeft ? `${borderSize} solid ${isTop ? navyColor : accentColor}` : 'none',
        borderRight: !isLeft ? `${borderSize} solid ${isTop ? accentColor : navyColor}` : 'none',
      }}
    />
  )
}

export default function CertificateDocument({ certificate, template, className = '' }) {
  const activeTemplate = mergeCertificateTemplate(certificate?.templateSnapshot || template)
  const accentColor = activeTemplate.accentColor || '#eab308' 
  const navyColor = '#1e3a8a' 
  const holderName = getCertificateHolderName(certificate)
  const courseName = getCertificateCourseName(certificate, activeTemplate)
  const certificateId = certificate?.certificate_id || 'PENDING-ID'
  const verifyUrl = getCertificateVerifyUrl(certificateId)
  const issueDate = formatCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.date)
  const signatureName = activeTemplate.signatureName || certificate?.issuedByName || 'Amit Patel'
  const signatureRole = activeTemplate.signatureRole || certificate?.issuedByRole || 'FOUNDER'
  const overlineLabel = activeTemplate.sealLabel || 'Official Certification'

  const holderFontSize =
    holderName.length > 24
      ? 'clamp(36px,4.5vw,54px)'
      : holderName.length > 16
        ? 'clamp(42px,5.5vw,68px)'
        : 'clamp(62px,8vw,100px)'

  return (
    <div
      className={`relative isolate aspect-[1.414/1] w-full overflow-hidden bg-white text-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="absolute inset-[clamp(8px,1.5vw,18px)] border-[1.5px] border-slate-100" />
      <CornerAccent position="top-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="top-right" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-right" accentColor={accentColor} navyColor={navyColor} />

      <img
        src={brandLogo}
        alt="Amit Solution Hub watermark"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[45%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] grayscale"
      />

      <div className="relative flex h-full flex-col px-[clamp(24px,4vw,50px)] py-[clamp(24px,3vw,40px)]">
        
        {/* Header Row */}
        <div className="relative flex h-[clamp(50px,7vw,80px)] items-start">
          <img
            src={msmeBadge}
            alt="MSME"
            className="h-[clamp(45px,6.5vw,75px)] w-auto object-contain pl-[clamp(6px,1vw,12px)] pt-[clamp(6px,1vw,12px)]"
          />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 pt-[clamp(6px,1vw,12px)]">
            <img
              src={brandLogo}
              alt="Amit Solution Hub"
              className="h-[clamp(45px,6.5vw,75px)] w-auto object-contain"
            />
          </div>
        </div>

        {/* Title Area */}
        <div className="mt-[clamp(10px,2vw,28px)] text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-[1.5px] w-[12%] bg-amber-400" />
            <p
              className="text-[clamp(10px,1.2vw,14px)] font-bold uppercase tracking-[0.4em]"
              style={{ color: accentColor }}
            >
              {overlineLabel}
            </p>
            <span className="h-[1.5px] w-[12%] bg-amber-400" />
          </div>
          
          <h1
            className="mt-[clamp(4px,1vw,16px)] text-[clamp(42px,7.5vw,90px)] font-bold uppercase leading-[1.1] tracking-[0.08em]"
            style={{ color: navyColor, fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Certificate
          </h1>
          
          <p className="mt-[clamp(4px,0.8vw,12px)] text-[clamp(14px,2vw,26px)] uppercase tracking-[0.35em]" style={{ color: '#94a3b8' }}>
            of participation
          </p>
          
          <p
            className="mt-[clamp(12px,2.2vw,30px)] text-[clamp(16px,2.2vw,28px)] italic"
            style={{ color: '#475569' }}
          >
            This certificate is proudly presented to
          </p>
        </div>

        {/* Holder Name Area */}
        <div className="mt-[clamp(12px,1.5vw,20px)] text-center">
          <p
            className="font-bold leading-none"
            style={{
              color: navyColor,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: holderFontSize,
            }}
          >
            {holderName}
          </p>
        </div>

        {/* Statement Area */}
        <div className="mt-[clamp(16px,2vw,30px)] flex flex-1 items-start justify-center px-[8%] text-center">
          <p className="text-[clamp(13px,1.7vw,22px)] leading-[1.7]" style={{ color: '#475569' }}>
            In recognition of their hard work, dedication, and successful completion of the
            comprehensive curriculum in <span className="font-bold" style={{ color: navyColor }}>{courseName}</span> .
          </p>
        </div>

        {/* Footer Area */}
        <div className="grid grid-cols-3 items-end pb-[clamp(10px,1vw,20px)]">
          <div className="flex flex-col items-center">
            <p className="text-[clamp(16px,2vw,26px)] font-bold text-slate-800">{issueDate}</p>
            <div className="mt-[clamp(6px,0.8vw,12px)] h-px w-[65%] bg-slate-400" />
            <p className="mt-[clamp(6px,0.8vw,12px)] text-[clamp(10px,1.2vw,14px)] font-bold uppercase tracking-[0.2em] text-slate-500">
              Date of Issue
            </p>
          </div>

          <div className="flex flex-col items-center justify-end">
            <div className="rounded-[10px] border border-slate-100 bg-white p-[clamp(4px,0.5vw,8px)] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <QRCodeCanvas
                value={verifyUrl || certificateId}
                size={86}
                level="M"
                style={{
                  width: 'clamp(64px, 8vw, 92px)',
                  height: 'clamp(64px, 8vw, 92px)',
                }}
              />
            </div>
            <p className="mt-[clamp(8px,1vw,14px)] text-[clamp(9px,1.1vw,13px)] font-bold uppercase tracking-[0.15em] text-blue-400">
              Verify Online
            </p>
            <p className="mt-[clamp(2px,0.3vw,4px)] text-[clamp(7px,0.9vw,10px)] uppercase tracking-[0.1em] text-slate-400">
              ID: {certificateId}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex h-[clamp(36px,4.5vw,56px)] items-end justify-center">
              <img
                src={founderSign}
                alt={signatureName}
                className="max-h-[clamp(36px,4.5vw,56px)] w-auto object-contain"
              />
            </div>
            <div className="mt-[clamp(6px,0.8vw,12px)] h-px w-[65%] bg-slate-400" />
            <p className="mt-[clamp(6px,0.8vw,12px)] text-[clamp(10px,1.2vw,14px)] font-bold uppercase tracking-[0.2em] text-slate-500">
              {signatureRole}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
