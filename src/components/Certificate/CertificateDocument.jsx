import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import mentorSign from '../../assets/mentor-sign.png'
import stempImage from './Stemp.png'
import { hexToRgba, mergeCertificateTemplate } from '../../utils/certificateTemplate'
import {
  normalizeCertificateAssetUrl,
  getCertificateHolderName,
  getCertificateCourseName,
  getCertificateDocumentLabel,
  getCertificateVerifyUrl
} from '../../utils/certificateHelpers'
import { getDocumentNarrative, resolveAicteStatus } from './CertificateNarrative'

/* ─── Gold divider ─── */
function GoldDivider({ accentColor, navyColor, style }) {
  return (
    <div className="flex items-center shrink-0 w-full" style={{ gap: 'clamp(4px, 0.5cqw, 8px)', ...style }}>
      <div className="flex-1 h-px" style={{ backgroundColor: navyColor, opacity: 0.18 }} />
      <svg width="clamp(12px,1.6cqw,22px)" height="clamp(8px,1cqw,14px)" viewBox="0 0 22 14" fill="none">
        <polygon points="11,0 22,7 11,14 0,7" fill={accentColor} />
        <polygon points="11,3 19,7 11,11 3,7" fill="white" />
      </svg>
      <div className="flex-1 h-px" style={{ backgroundColor: navyColor, opacity: 0.18 }} />
    </div>
  )
}

/* ─── Local date formatter ─── */
function formatDate(value) {
  const parsed = value?.toDate?.() || new Date(value || '2026-01-01')
  const date = Number.isNaN(parsed.getTime()) ? new Date('2026-01-01') : parsed
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CertificateDocument({ certificate, template, className = '' }) {
  const documentType = certificate?.certificateType === 'Offer Letter' ? 'offer_letter' : 'certificate'
  const activeTemplate = mergeCertificateTemplate(
    certificate?.templateSnapshot || template,
    documentType,
  )

  /* ── Data ── */
  const accentColor = activeTemplate.accentColor || '#b8912a'
  const navyColor = '#1a3564'
  const holderName = getCertificateHolderName(certificate)
  const courseName = getCertificateCourseName(certificate, activeTemplate)
  const documentLabel = getCertificateDocumentLabel(certificate, activeTemplate)
  const certId = certificate?.certificate_id || 'PENDING-ID'
  const verifyUrl = getCertificateVerifyUrl(certId)
  const issueDate = formatDate(certificate?.approval_date || certificate?.createdAt || certificate?.date)
  const sigName = certificate?.signatoryName || activeTemplate.signatureName || 'Amit Patel'
  const sigRole = certificate?.signatoryRole || activeTemplate.signatureRole || 'Authorized Signatory'
  const sigImg = normalizeCertificateAssetUrl(certificate?.signatureImageUrl) || founderSign
  const stampImg = normalizeCertificateAssetUrl(certificate?.stampImageUrl) || stempImage
  const mentorSignImg = normalizeCertificateAssetUrl(certificate?.mentorSignatureImageUrl) || mentorSign
  const mentorNameResolved = certificate?.mentorName || 'Program Mentor'
  const narrative = getDocumentNarrative(documentType, holderName, courseName, activeTemplate, certificate)
  const statusLabel = resolveAicteStatus(certificate)

  const nameFontSize =
    holderName.length > 28
      ? 'clamp(13px, 2.5cqw, 30px)'
      : holderName.length > 18
        ? 'clamp(15px, 3.2cqw, 36px)'
        : 'clamp(17px, 3.8cqw, 42px)'

  const orgName = activeTemplate.organizationName || 'Amit Solution Hub'

  return (
    <div
      className={`relative isolate aspect-[1.414/1] w-full overflow-hidden ${className}`}
      style={{ containerType: 'inline-size', background: '#FFFEF8', fontFamily: '"Inter", "Poppins", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
      `}</style>

      {/* ── Borders ── */}
      <div className="absolute inset-0 pointer-events-none z-50" style={{ border: `clamp(3px,0.4cqw,6px) solid ${navyColor}` }} />
      <div className="absolute pointer-events-none z-50" style={{ inset: 'clamp(5px,0.7cqw,10px)', border: `clamp(1px,0.1cqw,2px) solid ${hexToRgba(accentColor, 0.7)}` }} />

      {/* ── Corner accents (Small orange squares from image) ── */}
      <div className="absolute top-[clamp(5px,0.7cqw,10px)] left-[clamp(5px,0.7cqw,10px)] w-[clamp(4px,0.6cqw,8px)] h-[clamp(4px,0.6cqw,8px)] bg-orange-400 z-50"></div>
      <div className="absolute top-[clamp(5px,0.7cqw,10px)] right-[clamp(5px,0.7cqw,10px)] w-[clamp(4px,0.6cqw,8px)] h-[clamp(4px,0.6cqw,8px)] bg-orange-400 z-50"></div>
      <div className="absolute bottom-[clamp(5px,0.7cqw,10px)] left-[clamp(5px,0.7cqw,10px)] w-[clamp(4px,0.6cqw,8px)] h-[clamp(4px,0.6cqw,8px)] bg-orange-400 z-50"></div>
      <div className="absolute bottom-[clamp(5px,0.7cqw,10px)] right-[clamp(5px,0.7cqw,10px)] w-[clamp(4px,0.6cqw,8px)] h-[clamp(4px,0.6cqw,8px)] bg-orange-400 z-50"></div>

      {/* ── Faint Background Watermark Logo ── */}
      <img
        src={brandLogo}
        alt=""
        crossOrigin="anonymous"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '45%', opacity: 0.03, filter: 'grayscale(1)' }}
      />

      {/* ── Main Content Container ── */}
      <div
        className="relative flex h-full flex-col justify-between z-10"
        style={{ padding: 'clamp(10px,2cqw,28px) clamp(14px,3cqw,40px) clamp(10px,2cqw,24px)' }}
      >
        {/* ══ HEADER ══ */}
        <header className="grid grid-cols-3 items-center shrink-0 w-full" style={{ gap: '1cqw' }}>
          {/* Left: MSME */}
          <div className="flex items-center">
            <img src={msmeBadge} alt="MSME" crossOrigin="anonymous" style={{ height: 'clamp(26px,4.2cqw,60px)', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Center: ASH */}
          <div className="flex flex-col items-center text-center">
            <img src={brandLogo} alt={orgName} crossOrigin="anonymous" style={{ height: 'clamp(24px,3.8cqw,54px)', width: 'auto', objectFit: 'contain' }} />
            <p className="mt-[0.3cqw] font-black uppercase text-[#173F8A]" style={{ fontSize: 'clamp(8px,1.1cqw,14px)', letterSpacing: '0.12em', fontFamily: 'Georgia, serif' }}>
              {orgName}
            </p>
            <p className="text-slate-400 uppercase font-semibold" style={{ fontSize: 'clamp(4.5px,0.55cqw,8px)', letterSpacing: '0.18em', marginTop: '0.1cqw' }}>
              Technology · Innovation · Excellence
            </p>
          </div>

          {/* Right: ID Chip */}
          <div className="flex justify-end">
            <div
              className="text-center"
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${hexToRgba(accentColor, 0.4)}`,
                borderRadius: 'clamp(6px,1cqw,12px)',
                padding: 'clamp(4px,0.5cqw,8px) clamp(8px,1.2cqw,16px)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <p className="font-bold uppercase text-slate-500" style={{ fontSize: 'clamp(4.5px,0.6cqw,8px)', letterSpacing: '0.1em' }}>
                {activeTemplate.referenceLabel || 'CERTIFICATE ID'}
              </p>
              <p className="mt-[0.1cqw] font-bold text-[#173F8A]" style={{ fontSize: 'clamp(5.5px,0.75cqw,10px)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {certId}
              </p>
            </div>
          </div>
        </header>

        {/* ── Gold divider ── */}
        <GoldDivider accentColor={accentColor} navyColor={navyColor} style={{ marginTop: 'clamp(6px, 1cqw, 14px)' }} />

        {/* ══ TITLE & SUBTITLE ══ */}
        <div className="mt-[0.6cqw] text-center shrink-0 flex flex-col items-center">
          <p className="font-bold uppercase tracking-[0.5em] text-slate-400 mb-[0.2cqw]" style={{ fontSize: 'clamp(6.5px,0.9cqw,11px)' }}>
            OFFICIAL
          </p>
          <h1
            className="font-black uppercase leading-tight w-full"
            style={{
              color: '#173F8A',
              fontFamily: '"Playfair Display", "Cinzel", serif',
              fontSize: 'clamp(14px, 3.2cqw, 40px)',
              letterSpacing: '0.05em'
            }}
          >
            {documentLabel}
          </h1>
          <p className="italic font-medium mt-[0.4cqw]" style={{ color: '#64748B', fontSize: 'clamp(8px, 1.15cqw, 15px)' }}>
            {narrative.intro || 'This verified certificate is proudly presented to'}
          </p>
        </div>

        {/* ══ HOLDER NAME & BODY ══ */}
        <div className="flex flex-col items-center text-center shrink-0 justify-center my-[0.4cqw]">
          <h2
            className="font-bold leading-tight my-[0.3cqw]"
            style={{
              color: '#173F8A',
              fontFamily: '"Playfair Display", "Cinzel", serif',
              fontSize: nameFontSize
            }}
          >
            {narrative.highlight || holderName}
          </h2>

          <p
            className="text-[#64748B] mt-[0.3cqw]"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(7.5px, 1.1cqw, 14px)',
              lineHeight: '1.45',
              maxWidth: '88%',
              textAlign: 'center'
            }}
          >
            {narrative.paragraph}
          </p>
        </div>

        {/* ── Middle Gold divider (optional, seen in image) ── */}
        <div className="flex justify-center mt-[1cqw]">
          <svg width="clamp(16px,2cqw,24px)" height="clamp(10px,1.2cqw,16px)" viewBox="0 0 22 14" fill="none">
            <polygon points="11,0 22,7 11,14 0,7" fill="none" stroke={accentColor} strokeWidth="1.5" />
          </svg>
        </div>

        {/* ══ BOTTOM SECTION: Floating Chips & 5-Column Footer ══ */}
        <div className="w-full mt-auto flex flex-col justify-end">

          {/* Floating Row (Left info box & Right QR box) */}
          <div className="flex justify-between items-end mb-[2cqw] w-full px-[1cqw]">

            {/* Left Info Box */}
            <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-[0.8cqw] overflow-hidden shadow-sm" style={{ padding: '0.8cqw 0' }}>
              <div className="px-[1.5cqw] border-r border-[#E2E8F0]">
                <p className="font-bold text-slate-400 uppercase" style={{ fontSize: 'clamp(5px,0.7cqw,9px)', letterSpacing: '0.05em' }}>CERTIFICATE TYPE</p>
                <p className="font-bold text-[#1F2937] mt-[0.3cqw]" style={{ fontSize: 'clamp(7px,0.9cqw,12px)' }}>{documentLabel}</p>
              </div>
              <div className="px-[1.5cqw] border-r border-[#E2E8F0]">
                <p className="font-bold text-slate-400 uppercase" style={{ fontSize: 'clamp(5px,0.7cqw,9px)', letterSpacing: '0.05em' }}>ISSUE DATE</p>
                <p className="font-bold text-[#1F2937] mt-[0.3cqw]" style={{ fontSize: 'clamp(7px,0.9cqw,12px)' }}>{issueDate}</p>
              </div>
              <div className="px-[1.5cqw]">
                <p className="font-bold text-slate-400 uppercase" style={{ fontSize: 'clamp(5px,0.7cqw,9px)', letterSpacing: '0.05em' }}>STATUS</p>
                <p className="font-bold text-[#1F2937] mt-[0.3cqw]" style={{ fontSize: 'clamp(7px,0.9cqw,12px)' }}>{statusLabel}</p>
              </div>
            </div>

            {/* Right QR Box */}
            <div className="flex flex-col items-center border border-[#E2E8F0] rounded-[0.8cqw] p-[1cqw] shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <p className="font-bold text-[#173F8A] uppercase mb-[0.4cqw]" style={{ fontSize: 'clamp(5px,0.7cqw,9px)', letterSpacing: '0.1em' }}>VERIFICATION</p>
              <div className="p-[0.4cqw] border border-slate-200 rounded-md" style={{ backgroundColor: '#ffffff' }}>
                <QRCodeCanvas value={verifyUrl || certId} size={256} fgColor={navyColor} style={{ width: 'clamp(38px, 5.5cqw, 75px)', height: 'auto', display: 'block' }} level="M" includeMargin={false} />
              </div>
              <p className="font-bold text-[#64748B] uppercase mt-[0.4cqw]" style={{ fontSize: 'clamp(4.5px,0.6cqw,8px)', letterSpacing: '0.05em' }}>SCAN TO VERIFY</p>
              <p className="font-semibold text-[#173F8A] mt-[0.1cqw]" style={{ fontSize: 'clamp(4px,0.5cqw,7px)' }}>ID: {certId}</p>
            </div>
          </div>

          {/* 5-Column Footer */}
          <footer
            className="grid items-end w-full border-t border-[#E2E8F0]"
            style={{
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1cqw',
              paddingTop: 'clamp(8px, 1.5cqw, 20px)'
            }}
          >
            {/* Col 1: Issue Date */}
            <div className="flex flex-col items-start justify-end w-full">
              <p className="font-bold text-[#1F2937]" style={{ fontSize: 'clamp(8px,1.1cqw,15px)' }}>{issueDate}</p>
              <p className="font-bold text-slate-400 uppercase mt-[0.3cqw]" style={{ fontSize: 'clamp(5.5px,0.75cqw,10px)', letterSpacing: '0.1em' }}>DATE OF ISSUE</p>
            </div>

            {/* Col 2: Mentor */}
            <div className="flex flex-col items-center justify-end text-center w-full z-20">
              <div className="flex items-end justify-center" style={{ height: 'clamp(25px, 3.8cqw, 50px)' }}>
                <img src={mentorSignImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: '100%', width: 'auto', maxWidth: 'clamp(40px,6.5cqw,90px)', objectFit: 'contain' }} />
              </div>
              <p className="font-bold text-[#1F2937] mt-[0.5cqw]" style={{ fontSize: 'clamp(8px,1.1cqw,15px)' }}>{mentorNameResolved}</p>
              <p className="font-bold text-slate-400 uppercase mt-[0.3cqw]" style={{ fontSize: 'clamp(5.5px,0.75cqw,10px)', letterSpacing: '0.1em' }}>{certificate?.mentorName ? 'PROGRAM MENTOR' : 'TECHNICAL LEAD'}</p>
            </div>

            {/* Col 3: Stamp */}
            <div className="flex items-end justify-center w-full h-full relative z-10">
              <img src={stampImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: 'clamp(35px, 5.5cqw, 75px)', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
            </div>

            {/* Col 4: Org Authority */}
            <div className="flex flex-col items-center justify-end text-center w-full">
              <p className="font-bold text-[#1F2937] uppercase" style={{ fontSize: 'clamp(7.5px,1cqw,14px)', letterSpacing: '0.05em' }}>{orgName}</p>
              <p className="font-bold text-slate-400 uppercase mt-[0.3cqw]" style={{ fontSize: 'clamp(5.5px,0.75cqw,10px)', letterSpacing: '0.1em' }}>ISSUING AUTHORITY</p>
            </div>

            {/* Col 5: Authorized Signatory */}
            <div className="flex flex-col items-end justify-end text-right w-full z-20">
              <div className="flex items-end justify-end" style={{ height: 'clamp(25px, 3.8cqw, 50px)' }}>
                <img src={sigImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: '100%', width: 'auto', maxWidth: 'clamp(45px,7cqw,100px)', objectFit: 'contain' }} />
              </div>
              <p className="font-bold text-[#1F2937] mt-[0.5cqw]" style={{ fontSize: 'clamp(8px,1.1cqw,15px)' }}>{sigName}</p>
              <p className="font-bold text-slate-400 uppercase mt-[0.3cqw]" style={{ fontSize: 'clamp(5.5px,0.75cqw,10px)', letterSpacing: '0.1em' }}>{sigRole}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
