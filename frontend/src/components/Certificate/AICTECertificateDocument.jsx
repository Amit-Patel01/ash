import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { FileText, Calendar, CalendarDays, CalendarCheck, User, Calendar as CalendarIcon } from 'lucide-react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import mentorSign from '../../assets/mentor-sign.png'
import stempImage from './Stemp.png'
import { hexToRgba, mergeCertificateTemplate } from '../../utils/certificateTemplate'
import {
  normalizeCertificateAssetUrl,
  getCertificateHolderName,
  getCertificateVerifyUrl,
} from '../../utils/certificateHelpers'
import { AICTE_LOGO_SRC } from './certificateConstants'
import { formatAicteCertificateDate, resolveAicteCertificateId, normalizeDisplayText } from './CertificateNarrative'
import CornerAccent from './CornerAccent'

export default function AICTECertificateDocument({ certificate, template, className = '' }) {
  const activeTemplate = mergeCertificateTemplate(
    certificate?.templateSnapshot || template,
    certificate?.documentType || 'internship_certificate',
  )

  /* ── Data (unchanged) ── */
  const accentColor  = '#cba450' // Muted gold matching the image
  const navyColor    = '#16315c' // Deep navy matching the image
  const pageBg        = '#FFFEF8'
  const holderName   = getCertificateHolderName(certificate)
  const certId       = resolveAicteCertificateId(certificate?.certificate_id)
  const verifyUrl    = getCertificateVerifyUrl(certId)
  const issueDate    = formatAicteCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.rawDate || certificate?.date)
  const sigName      = certificate?.signatoryName || activeTemplate.signatureName || 'Amit Patel'
  const sigImg       = normalizeCertificateAssetUrl(certificate?.signatureImageUrl) || founderSign
  const stampImg     = normalizeCertificateAssetUrl(certificate?.stampImageUrl)     || stempImage
  const orgName      = activeTemplate.organizationName || 'Amit Solution Hub'
  const mentorSignImg = normalizeCertificateAssetUrl(certificate?.mentorSignatureImageUrl) || mentorSign
  const mentorNameResolved = certificate?.mentorName || 'Program Mentor'

  const nameFontSize =
    holderName.length > 28
      ? 'clamp(24px,3.5cqw,48px)'
      : holderName.length > 18
      ? 'clamp(32px,4.5cqw,64px)'
      : 'clamp(40px,5.5cqw,75px)'

  /* ── Shared visual tokens (purely presentational) ── */
  const cardRadius = 'clamp(6px,0.8cqw,12px)'
  const cardBorder = `1px solid ${hexToRgba(navyColor, 0.13)}`
  const cardShadow = `0 1px 3px ${hexToRgba(navyColor, 0.06)}, 0 10px 22px ${hexToRgba(navyColor, 0.06)}`
  const labelStyle = {
    fontSize: 'clamp(5.5px,0.65cqw,9.5px)',
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: navyColor,
    opacity: 0.82,
  }
  const valueStyle = {
    fontSize: 'clamp(8px,1.15cqw,14.5px)',
    fontWeight: 700,
    color: '#1F2937',
    marginTop: '0.15cqw',
    lineHeight: 1.2,
  }
  const footerLabelStyle = {
    ...labelStyle,
    fontSize: 'clamp(5.5px,0.75cqw,11px)',
  }

  const detailItems = [
    { icon: FileText, label: 'INTERNSHIP DOMAIN', value: certificate?.domain || 'Web Development' },
    { icon: Calendar, label: 'DURATION', value: certificate?.duration || '8 Weeks' },
    { icon: CalendarDays, label: 'START DATE', value: certificate?.startDate || '01 May 2026' },
    { icon: CalendarCheck, label: 'END DATE', value: certificate?.endDate || '27 June 2026' },
    { icon: User, label: 'MODE', value: certificate?.mode || 'Online' },
  ]

  return (
    <div
      className={`relative isolate aspect-[1.414/1] w-full overflow-hidden ${className}`}
      style={{ containerType: 'inline-size', background: pageBg, fontFamily: '"Inter", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');
      `}</style>

      {/* ── Outer Borders ── */}
      <div className="absolute inset-0 pointer-events-none z-50" style={{ border: `clamp(4px,0.5cqw,8px) solid ${navyColor}` }} />
      <div className="absolute inset-0 pointer-events-none z-50" style={{ margin: 'clamp(6px,0.8cqw,12px)', border: `clamp(1px,0.15cqw,2.5px) solid ${accentColor}` }} />

      {/* ── Corners (Gold decorations) ── */}
      <CornerAccent position="top-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="top-right" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-right" accentColor={accentColor} navyColor={navyColor} />

      {/* ── Guilloché rings + watermark ── */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '62%', height: '62%', opacity: 0.05, zIndex: 0 }}
        viewBox="0 0 200 200"
      >
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx="100" cy="100" r={22 + i * 12} fill="none" stroke={navyColor} strokeWidth="0.35" />
        ))}
      </svg>
      <img src={AICTE_LOGO_SRC} alt="" crossOrigin="anonymous"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '42%', opacity: 0.045, filter: 'grayscale(1)', zIndex: 0 }} />

      {/* ── Left Ribbon with AICTE Medal ── */}
      <div className="absolute left-[7%] top-0 h-[43%] w-[clamp(34px,4.4cqw,64px)] z-20">
        {/* Ribbon body with a clean V notch at the base */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: '84%',
            background: `linear-gradient(180deg, ${navyColor} 0%, ${hexToRgba(navyColor, 0.88)} 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
            boxShadow: `2px 0 8px ${hexToRgba(navyColor, 0.22)}`,
          }}
        >
          <div className="absolute left-[15%] top-0 h-[78%] w-[1.5px]" style={{ background: accentColor, opacity: 0.75 }} />
          <div className="absolute right-[15%] top-0 h-[78%] w-[1.5px]" style={{ background: accentColor, opacity: 0.75 }} />
        </div>

        {/* Medal */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center rounded-full"
          style={{
            top: '52%',
            width: 'clamp(54px,7.4cqw,106px)',
            height: 'clamp(54px,7.4cqw,106px)',
            background: `radial-gradient(circle at 35% 28%, ${hexToRgba('#ffffff', 0.10)}, transparent 60%), ${navyColor}`,
            border: `clamp(2px,0.3cqw,4px) solid ${accentColor}`,
            boxShadow: `0 6px 16px ${hexToRgba(navyColor, 0.38)}, inset 0 0 0 clamp(3px,0.4cqw,6px) ${hexToRgba('#ffffff', 0.05)}`,
          }}
        >
          <p className="text-white font-bold uppercase leading-tight" style={{ fontSize: 'clamp(5px,0.68cqw,10px)', letterSpacing: '0.04em' }}>
            AICTE<br />Approved
          </p>
          <div className="my-[0.3cqw] h-[1px] w-[52%]" style={{ background: hexToRgba(accentColor, 0.65) }} />
          <p className="text-white/85 font-medium leading-tight" style={{ fontSize: 'clamp(3.5px,0.42cqw,6.5px)', letterSpacing: '0.08em' }}>
            INTERNSHIP<br />PROGRAM
          </p>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div
        className="relative flex h-full flex-col z-10"
        style={{ padding: 'clamp(20px,3cqw,40px) clamp(25px,4cqw,60px) 0' }}
      >
        {/* ══ HEADER ══ */}
        <header className="flex justify-between items-start w-full relative z-30" style={{ paddingLeft: '9cqw' }}>

          {/* Left AICTE Box */}
          <div className="flex items-center" style={{
            backgroundColor: '#ffffff',
            border: cardBorder,
            borderRadius: cardRadius,
            padding: 'clamp(4px,0.6cqw,8px) clamp(8px,1cqw,14px)',
            gap: 'clamp(5px,0.8cqw,12px)',
            boxShadow: cardShadow,
          }}>
            <img src={AICTE_LOGO_SRC} alt="AICTE" crossOrigin="anonymous" style={{ height: 'clamp(30px,4.5cqw,65px)', width: 'auto', objectFit: 'contain' }} />
            <div className="flex flex-col justify-center">
              <p className="font-bold uppercase text-[#173F8A] leading-none" style={{ fontSize: 'clamp(7px,0.9cqw,13px)' }}>
                AICTE APPROVED
              </p>
              <p className="font-semibold uppercase text-slate-600 mt-[0.2cqw] leading-none" style={{ fontSize: 'clamp(5px,0.6cqw,8px)' }}>
                INTERNSHIP PROGRAM
              </p>
              <p className="text-slate-500 mt-[0.3cqw] leading-tight" style={{ fontSize: 'clamp(4px,0.5cqw,7px)' }}>
                All India Council for Technical Education<br />
                (Ministry of Education, Govt. of India)
              </p>
            </div>
          </div>

          {/* Center ASH Logo */}
          <div className="flex flex-col justify-center items-center text-center">
            <img src={brandLogo} alt={orgName} crossOrigin="anonymous" style={{ height: 'clamp(30px,4.5cqw,65px)', width: 'auto', objectFit: 'contain' }} />
            <p className="font-bold uppercase leading-tight mt-[0.45cqw]" style={{ color: navyColor, fontSize: 'clamp(7px,1cqw,14px)', letterSpacing: '0.06em' }}>
              {orgName}
            </p>
            <div className="mt-[0.25cqw] h-[1px] w-[clamp(24px,4cqw,48px)]" style={{ background: hexToRgba(accentColor, 0.7) }} />
            <p className="text-slate-500 uppercase font-medium mt-[0.25cqw]" style={{ fontSize: 'clamp(4.5px,0.55cqw,8px)', letterSpacing: '0.16em' }}>
              Technology · Innovation · Excellence
            </p>
          </div>

          {/* Right Section (MSME + ID) */}
          <div className="flex flex-col items-end gap-[0.55cqw]">
            {/* MSME Box */}
            <div className="flex items-center" style={{
              backgroundColor: '#ffffff',
              border: cardBorder,
              borderRadius: cardRadius,
              padding: 'clamp(4px,0.6cqw,8px) clamp(8px,1cqw,14px)',
              gap: 'clamp(5px,0.8cqw,12px)',
              boxShadow: cardShadow,
            }}>
              <div className="flex flex-col justify-center text-right">
                <p className="font-bold uppercase text-[#167044] leading-none" style={{ fontSize: 'clamp(7px,0.9cqw,13px)' }}>
                  MSME REGISTERED
                </p>
                <p className="font-semibold uppercase text-slate-600 mt-[0.3cqw] leading-none" style={{ fontSize: 'clamp(5px,0.6cqw,8px)' }}>
                  GOVT. OF INDIA
                </p>
              </div>
              <img src={msmeBadge} alt="MSME" crossOrigin="anonymous" style={{ height: 'clamp(30px,4.5cqw,65px)', width: 'auto', objectFit: 'contain' }} />
            </div>

            {/* ID Chip */}
            <div className="text-right mt-[0.2cqw]">
              <p className="font-bold uppercase text-[#173F8A] mb-[0.25cqw]" style={{ fontSize: 'clamp(5px,0.6cqw,9px)', letterSpacing: '0.06em' }}>
                AICTE CERTIFICATE NO.
              </p>
              <div style={{
                border: `1px solid ${hexToRgba(navyColor, 0.28)}`,
                borderRadius: 'clamp(4px,0.6cqw,8px)',
                padding: 'clamp(2px,0.3cqw,5px) clamp(6px,1cqw,12px)',
                background: 'white',
                boxShadow: cardShadow,
              }}>
                <p className="font-bold text-[#173F8A]" style={{ fontSize: 'clamp(6px,0.85cqw,12px)', letterSpacing: '0.02em' }}>
                  {certId}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ TITLE ══ */}
        <div className="mt-[2.1cqw] text-center shrink-0 flex flex-col items-center">
          <div className="flex items-center gap-[0.6cqw] mb-[0.5cqw]">
            <div className="h-[1px] w-[clamp(16px,2.4cqw,34px)]" style={{ background: hexToRgba(accentColor, 0.6) }} />
            <p className="font-bold uppercase tracking-[0.22em]" style={{ color: navyColor, fontSize: 'clamp(7px,0.9cqw,14px)' }}>
              AICTE RECOGNISED INTERNSHIP
            </p>
            <div className="h-[1px] w-[clamp(16px,2.4cqw,34px)]" style={{ background: hexToRgba(accentColor, 0.6) }} />
          </div>
          <h1
            className="font-black uppercase w-full"
            style={{
              color: navyColor,
              fontFamily: '"Cinzel", serif',
              fontSize: 'clamp(20px, 3.2cqw, 48px)',
              letterSpacing: '0.045em',
            }}
          >
            INTERNSHIP COMPLETION CERTIFICATE
          </h1>
          <div className="mt-[0.7cqw] flex items-center gap-[0.4cqw]">
            <div className="rotate-45" style={{ width: 'clamp(3px,0.4cqw,5px)', height: 'clamp(3px,0.4cqw,5px)', backgroundColor: accentColor }} />
            <div className="h-[1.5px]" style={{ width: 'clamp(50px,7.5cqw,110px)', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
            <div className="rotate-45" style={{ width: 'clamp(3px,0.4cqw,5px)', height: 'clamp(3px,0.4cqw,5px)', backgroundColor: accentColor }} />
          </div>
          <p className="italic text-slate-500 mt-[0.9cqw]" style={{ fontSize: 'clamp(10px, 1.4cqw, 20px)' }}>
            This is to certify that
          </p>
        </div>

        {/* ══ HOLDER NAME ══ */}
        <div className="mt-[0.5cqw] flex flex-col items-center text-center shrink-0">
          <h2
            className="font-bold leading-tight"
            style={{
              color: navyColor,
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: nameFontSize,
            }}
          >
            {normalizeDisplayText(holderName)}
          </h2>

          {/* Gold Name Divider with Diamond */}
          <div className="flex items-center justify-center mt-[0.5cqw] w-[clamp(150px,25cqw,350px)]">
            <div className="flex-1 h-[1.5px]" style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }} />
            <div className="mx-[0.5cqw] rotate-45" style={{ width: 'clamp(4px,0.6cqw,8px)', height: 'clamp(4px,0.6cqw,8px)', backgroundColor: accentColor }} />
            <div className="flex-1 h-[1.5px]" style={{ background: `linear-gradient(270deg, transparent, ${accentColor})` }} />
          </div>
        </div>

        {/* ══ PARAGRAPH ══ */}
        <div className="mt-[1.6cqw] flex justify-center shrink-0">
          <div className="text-center" style={{
            color: '#1F2937',
            fontWeight: 500,
            fontSize: 'clamp(10px, 1.6cqw, 18px)',
            lineHeight: '1.8',
            maxWidth: '75%',
          }}>
            {certificate?.certificateText ? (
              certificate.certificateText.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))
            ) : (
              <>
                <p>has successfully completed the <span className="font-bold text-[#173F8A]">AICTE-Approved Internship Program</span></p>
                <p>organized by Amit Solution Hub in association with All India Council for Technical Education (AICTE).</p>
                <p>During the internship period, the student was found sincere, hardworking and</p>
                <p>actively participated in all assigned tasks.</p>
                <p>We wish him/her all the best for future endeavors.</p>
              </>
            )}
          </div>
        </div>

        {/* ══ DETAIL LEDGER STRIP ══ */}
        <div className="flex justify-center mt-[2.1cqw] w-full shrink-0">
          <div
            className="flex items-stretch"
            style={{
              backgroundColor: '#ffffff',
              border: cardBorder,
              borderTop: `2px solid ${accentColor}`,
              borderRadius: 'clamp(8px,1cqw,14px)',
              boxShadow: cardShadow,
              overflow: 'hidden',
            }}
          >
            {detailItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div style={{ width: '1px', alignSelf: 'stretch', background: hexToRgba(navyColor, 0.1) }} />
                )}
                <div
                  className="flex items-center"
                  style={{
                    padding: 'clamp(7px,0.9cqw,14px) clamp(10px,1.4cqw,20px)',
                    gap: 'clamp(6px,0.8cqw,12px)',
                    minWidth: 'clamp(96px,14cqw,190px)',
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 'clamp(24px,3.4cqw,42px)',
                      height: 'clamp(24px,3.4cqw,42px)',
                      borderRadius: '9999px',
                      backgroundColor: hexToRgba(accentColor, 0.14),
                    }}
                  >
                    <item.icon style={{ width: 'clamp(14px, 2cqw, 24px)', height: 'clamp(14px, 2cqw, 24px)', color: navyColor }} />
                  </div>
                  <div className="flex flex-col text-left">
                    <p style={labelStyle}>{item.label}</p>
                    <p style={valueStyle}>{item.value}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="mt-auto flex flex-col w-full shrink-0 relative z-30 pb-[clamp(15px,2.5cqw,30px)]">

          {/* Footer Gold Line */}
          <div className="w-full flex items-center justify-center mb-[1.1cqw]">
            <div className="flex-1 h-[1px] max-w-[32%]" style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }} />
            <div className="mx-[0.6cqw] rotate-45" style={{ width: 'clamp(4px,0.5cqw,7px)', height: 'clamp(4px,0.5cqw,7px)', backgroundColor: accentColor }} />
            <div className="flex-1 h-[1px] max-w-[32%]" style={{ background: `linear-gradient(270deg, transparent, ${accentColor})` }} />
          </div>

          <div className="grid items-end w-full" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1cqw' }}>
            {/* Col 1: Date */}
            <div
              className="flex flex-col items-center justify-end text-center w-full"
              style={{ borderLeft: `1px solid ${hexToRgba(navyColor, 0.08)}`, paddingLeft: '0.6cqw' }}
            >
              <div className="flex items-center gap-[0.4cqw] mb-[0.25cqw]">
                <CalendarIcon size={16} className="text-slate-400" style={{ width: 'clamp(10px,1.4cqw,18px)', height: 'clamp(10px,1.4cqw,18px)' }} />
                <p className="font-bold text-[#1F2937]" style={{ fontSize: 'clamp(7px,1cqw,14px)' }}>{issueDate}</p>
              </div>
              <div className="h-[1px] w-[clamp(50px,8cqw,120px)] bg-slate-300 my-[0.3cqw]" />
              <p style={footerLabelStyle}>Date of Issue</p>
            </div>

            {/* Col 2: Mentor */}
            <div
              className="flex flex-col items-center justify-end text-center w-full"
              style={{ borderLeft: `1px solid ${hexToRgba(navyColor, 0.08)}`, paddingLeft: '0.6cqw' }}
            >
              <div className="flex items-end justify-center" style={{ height: 'clamp(25px, 3.5cqw, 50px)' }}>
                <img src={mentorSignImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: '100%', width: 'auto', maxWidth: 'clamp(40px,6.5cqw,90px)', objectFit: 'contain' }} />
              </div>
              <div className="h-[1px] w-[clamp(70px,10cqw,150px)] bg-slate-300 my-[0.3cqw]" />
              <p style={footerLabelStyle}>{mentorNameResolved}</p>
              <p className="font-medium text-slate-500 uppercase mt-[0.1cqw]" style={{ fontSize: 'clamp(4.5px,0.6cqw,9px)', letterSpacing: '0.06em' }}>
                {certificate?.mentorName ? 'Program Mentor' : 'Technical Lead'}
              </p>
            </div>

            {/* Col 3: Stamp */}
            <div
              className="flex flex-col items-center justify-end text-center w-full relative z-10"
              style={{ borderLeft: `1px solid ${hexToRgba(navyColor, 0.08)}`, paddingLeft: '0.6cqw' }}
            >
              <img src={stampImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: 'clamp(40px, 6cqw, 80px)', width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
              <p style={{ ...footerLabelStyle, marginTop: '0.35cqw' }}>Official Seal</p>
            </div>

            {/* Col 4: CEO */}
            <div
              className="flex flex-col items-center justify-end text-center w-full"
              style={{ borderLeft: `1px solid ${hexToRgba(navyColor, 0.08)}`, paddingLeft: '0.6cqw' }}
            >
              <div className="flex items-end justify-center" style={{ height: 'clamp(25px, 3.5cqw, 50px)' }}>
                <img src={sigImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: '100%', width: 'auto', maxWidth: 'clamp(45px,7cqw,100px)', objectFit: 'contain' }} />
              </div>
              <div className="h-[1px] w-[clamp(70px,10cqw,150px)] bg-slate-300 my-[0.3cqw]" />
              <p style={footerLabelStyle}>{sigName}</p>
              <p className="font-medium text-slate-500 uppercase mt-[0.1cqw]" style={{ fontSize: 'clamp(4.5px,0.6cqw,9px)', letterSpacing: '0.06em' }}>
                Founder &amp; CEO
              </p>
            </div>

            {/* Col 5: QR Code */}
            <div
              className="flex flex-col items-center justify-end text-center w-full"
              style={{ borderLeft: `1px solid ${hexToRgba(navyColor, 0.08)}`, paddingLeft: '0.6cqw' }}
            >
              <div style={{ backgroundColor: '#ffffff', border: `1.5px solid ${navyColor}`, padding: 'clamp(3px, 0.4cqw, 6px)', borderRadius: '4px', boxShadow: cardShadow }}>
                <QRCodeCanvas value={verifyUrl || certId} size={256} fgColor={navyColor} style={{ width: 'clamp(38px, 5.5cqw, 75px)', height: 'auto', display: 'block' }} level="M" includeMargin={false} />
              </div>
              <p style={{ ...footerLabelStyle, marginTop: '0.4cqw', fontSize: 'clamp(5px,0.7cqw,10px)' }}>Scan to Verify</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Very Bottom Navy Bar ── */}
      <div className="absolute bottom-[clamp(4px,0.5cqw,8px)] left-0 w-full z-[60] flex items-center justify-center"
        style={{ background: `linear-gradient(90deg, ${navyColor}, #1d3f78, ${navyColor})`, height: 'clamp(14px, 2cqw, 28px)' }}>
        <p className="text-white flex items-center gap-[0.5cqw] font-medium" style={{ fontSize: 'clamp(5px, 0.7cqw, 11px)' }}>
          This certificate is verifiable at: https://amitsolutionhub.in/verify
          <span style={{ color: accentColor }}>|</span>
          Email: support@amitsolutionhub.in
          <span style={{ color: accentColor }}>|</span>
          Website: www.amitsolutionhub.in
        </p>
      </div>

    </div>
  )
}